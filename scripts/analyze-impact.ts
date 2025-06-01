#!/usr/bin/env tsx

import { Project, SourceFile, ImportDeclaration, ExportDeclaration } from 'ts-morph';
import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface ImportInfo {
  importPath: string;
  importType: 'default' | 'named' | 'namespace' | 'side-effect';
  importedNames: string[];
  sourceFile: string;
}

interface ExportInfo {
  exportName: string;
  exportType: 'default' | 'named' | 'namespace';
  sourceFile: string;
}

interface ImpactAnalysis {
  changedFiles: string[];
  directDependents: Map<string, Set<string>>;
  indirectDependents: Map<string, Set<string>>;
  exports: Map<string, ExportInfo[]>;
  imports: Map<string, ImportInfo[]>;
}

class ImpactAnalyzer {
  private project: Project;
  private rootDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.project = new Project({
      tsConfigFilePath: path.join(rootDir, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: false,
    });
  }

  /**
   * PRで変更されたファイル一覧を取得
   */
  async getChangedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git diff --name-only HEAD~1');
      return stdout
        .split('\n')
        .filter(file => file.trim() && (file.endsWith('.ts') || file.endsWith('.tsx')))
        .map(file => path.resolve(this.rootDir, file));
    } catch (error) {
      console.error('Git diff取得エラー:', error);
      return [];
    }
  }

  /**
   * ファイルのインポート情報を解析
   */
  private analyzeImports(sourceFile: SourceFile): ImportInfo[] {
    const imports: ImportInfo[] = [];
    
    sourceFile.getImportDeclarations().forEach((importDecl) => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      const importClause = importDecl.getImportClause();
      
      if (!importClause) {
        // side-effect import
        imports.push({
          importPath: moduleSpecifier,
          importType: 'side-effect',
          importedNames: [],
          sourceFile: sourceFile.getFilePath(),
        });
        return;
      }

      const defaultImport = importClause.getDefaultImport();
      const namedImports = importClause.getNamedImports();
      const namespaceImport = importClause.getNamespaceImport();

      if (defaultImport) {
        imports.push({
          importPath: moduleSpecifier,
          importType: 'default',
          importedNames: [defaultImport.getText()],
          sourceFile: sourceFile.getFilePath(),
        });
      }

      if (namedImports) {
        const namedImportNames = namedImports.map((element) => {
          const name = element.getName();
          const alias = element.getAliasNode();
          return alias ? `${name} as ${alias.getText()}` : name;
        });
        
        imports.push({
          importPath: moduleSpecifier,
          importType: 'named',
          importedNames: namedImportNames,
          sourceFile: sourceFile.getFilePath(),
        });
      }

      if (namespaceImport) {
        imports.push({
          importPath: moduleSpecifier,
          importType: 'namespace',
          importedNames: [namespaceImport.getText()],
          sourceFile: sourceFile.getFilePath(),
        });
      }
    });

    return imports;
  }

  /**
   * ファイルのエクスポート情報を解析
   */
  private analyzeExports(sourceFile: SourceFile): ExportInfo[] {
    const exports: ExportInfo[] = [];
    
    // 名前付きエクスポート
    sourceFile.getExportDeclarations().forEach((exportDecl) => {
      const namedExports = exportDecl.getNamedExports();
      namedExports.forEach((namedExport) => {
        exports.push({
          exportName: namedExport.getName(),
          exportType: 'named',
          sourceFile: sourceFile.getFilePath(),
        });
      });
    });

    // 関数・クラス・変数のエクスポート
    sourceFile.getFunctions().forEach((func) => {
      if (func.hasExportKeyword()) {
        exports.push({
          exportName: func.getName() || 'anonymous',
          exportType: func.hasDefaultKeyword() ? 'default' : 'named',
          sourceFile: sourceFile.getFilePath(),
        });
      }
    });

    sourceFile.getClasses().forEach((cls) => {
      if (cls.hasExportKeyword()) {
        exports.push({
          exportName: cls.getName() || 'anonymous',
          exportType: cls.hasDefaultKeyword() ? 'default' : 'named',
          sourceFile: sourceFile.getFilePath(),
        });
      }
    });

    sourceFile.getVariableStatements().forEach((varStatement) => {
      if (varStatement.hasExportKeyword()) {
        varStatement.getDeclarations().forEach((decl) => {
          exports.push({
            exportName: decl.getName(),
            exportType: 'named',
            sourceFile: sourceFile.getFilePath(),
          });
        });
      }
    });

    // デフォルトエクスポート
    const defaultExport = sourceFile.getDefaultExportSymbol();
    if (defaultExport) {
      exports.push({
        exportName: 'default',
        exportType: 'default',
        sourceFile: sourceFile.getFilePath(),
      });
    }

    return exports;
  }

  /**
   * 依存関係を解決してフルパスを取得
   */
  private resolveImportPath(importPath: string, fromFile: string): string | null {
    try {
      // 相対パス
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const resolvedPath = path.resolve(path.dirname(fromFile), importPath);
        
        // .ts, .tsx拡張子を試す
        for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
          const fullPath = resolvedPath + ext;
          if (this.project.getSourceFile(fullPath)) {
            return fullPath;
          }
        }
      }
      
      // 絶対パス（src/から始まる）
      if (importPath.startsWith('src/') || importPath.startsWith('./src/')) {
        const absolutePath = path.resolve(this.rootDir, importPath);
        for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
          const fullPath = absolutePath + ext;
          if (this.project.getSourceFile(fullPath)) {
            return fullPath;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 影響範囲を分析
   */
  async analyzeImpact(): Promise<ImpactAnalysis> {
    const changedFiles = await this.getChangedFiles();
    const directDependents = new Map<string, Set<string>>();
    const indirectDependents = new Map<string, Set<string>>();
    const allExports = new Map<string, ExportInfo[]>();
    const allImports = new Map<string, ImportInfo[]>();

    console.log('📂 プロジェクトファイルを解析中...');
    
    // 全ファイルの依存関係を解析
    this.project.getSourceFiles().forEach(sourceFile => {
      const filePath = sourceFile.getFilePath();
      
      // インポート解析
      const imports = this.analyzeImports(sourceFile);
      allImports.set(filePath, imports);
      
      // エクスポート解析
      const exports = this.analyzeExports(sourceFile);
      allExports.set(filePath, exports);
      
      // 依存関係マップ構築
      imports.forEach(importInfo => {
        const resolvedPath = this.resolveImportPath(importInfo.importPath, filePath);
        if (resolvedPath) {
          if (!directDependents.has(resolvedPath)) {
            directDependents.set(resolvedPath, new Set());
          }
          directDependents.get(resolvedPath)!.add(filePath);
        }
      });
    });

    // 間接的な依存関係を計算
    const visited = new Set<string>();
    
    const findIndirectDependents = (filePath: string, depth: number = 0): Set<string> => {
      if (depth > 10 || visited.has(filePath)) { // 循環参照対策
        return new Set();
      }
      
      visited.add(filePath);
      const result = new Set<string>();
      const direct = directDependents.get(filePath) || new Set();
      
      direct.forEach(dependent => {
        result.add(dependent);
        const indirect = findIndirectDependents(dependent, depth + 1);
        indirect.forEach(indirectDep => result.add(indirectDep));
      });
      
      visited.delete(filePath);
      return result;
    };

    changedFiles.forEach(changedFile => {
      const allDeps = findIndirectDependents(changedFile);
      const directDeps = directDependents.get(changedFile) || new Set();
      const indirectDeps = new Set<string>();
      
      allDeps.forEach(dep => {
        if (!directDeps.has(dep)) {
          indirectDeps.add(dep);
        }
      });
      
      indirectDependents.set(changedFile, indirectDeps);
    });

    return {
      changedFiles,
      directDependents,
      indirectDependents,
      exports: allExports,
      imports: allImports,
    };
  }

  /**
   * 結果をフォーマットして出力
   */
  formatResults(analysis: ImpactAnalysis): string {
    const { changedFiles, directDependents, indirectDependents } = analysis;
    
    let output = '# 📊 PRの影響範囲分析結果\n\n';
    
    output += `## 🔄 変更されたファイル (${changedFiles.length}件)\n\n`;
    changedFiles.forEach(file => {
      const relativePath = path.relative(this.rootDir, file);
      output += `- \`${relativePath}\`\n`;
    });
    
    output += '\n## 📈 影響を受けるファイル\n\n';
    
    changedFiles.forEach(changedFile => {
      const relativePath = path.relative(this.rootDir, changedFile);
      const directDeps = directDependents.get(changedFile) || new Set();
      const indirectDeps = indirectDependents.get(changedFile) || new Set();
      
      output += `### 📁 \`${relativePath}\`\n\n`;
      
      if (directDeps.size > 0) {
        output += `#### 🔗 直接的な依存ファイル (${directDeps.size}件)\n\n`;
        Array.from(directDeps).forEach(dep => {
          const depRelativePath = path.relative(this.rootDir, dep);
          output += `- \`${depRelativePath}\`\n`;
        });
        output += '\n';
      }
      
      if (indirectDeps.size > 0) {
        output += `#### 🔄 間接的な依存ファイル (${indirectDeps.size}件)\n\n`;
        Array.from(indirectDeps).forEach(dep => {
          const depRelativePath = path.relative(this.rootDir, dep);
          output += `- \`${depRelativePath}\`\n`;
        });
        output += '\n';
      }
      
      if (directDeps.size === 0 && indirectDeps.size === 0) {
        output += '✅ このファイルに依存している他のファイルはありません。\n\n';
      }
    });
    
    // 統計情報
    const totalAffected = new Set<string>();
    changedFiles.forEach(changedFile => {
      const directDeps = directDependents.get(changedFile) || new Set();
      const indirectDeps = indirectDependents.get(changedFile) || new Set();
      directDeps.forEach(dep => totalAffected.add(dep));
      indirectDeps.forEach(dep => totalAffected.add(dep));
    });
    
    output += `## 📊 統計情報\n\n`;
    output += `- **変更ファイル数**: ${changedFiles.length}\n`;
    output += `- **影響を受けるファイル数**: ${totalAffected.size}\n`;
    output += `- **総影響ファイル数**: ${changedFiles.length + totalAffected.size}\n\n`;
    
    // 影響を受けるページの一覧
    const affectedPages = this.extractAffectedPages(changedFiles, totalAffected);
    if (affectedPages.length > 0) {
      output += `## 📄 影響を受けるページ (${affectedPages.length}件)\n\n`;
      affectedPages.forEach(pagePath => {
        const relativePath = path.relative(this.rootDir, pagePath);
        const routePath = this.convertFilePathToRoute(relativePath);
        output += `- \`${relativePath}\``;
        if (routePath) {
          output += ` → **${routePath}**`;
        }
        output += '\n';
      });
      output += '\n';
    }
    
    if (totalAffected.size > 0) {
      output += `⚠️ **テスト対象推奨**: 変更されたファイルとその依存ファイルをテストすることを推奨します。\n\n`;
    }
    
    return output;
  }

  /**
   * 影響を受けるページファイルを抽出
   */
  private extractAffectedPages(changedFiles: string[], affectedFiles: Set<string>): string[] {
    const allFiles = new Set([...changedFiles, ...Array.from(affectedFiles)]);
    const pageFiles: string[] = [];

    allFiles.forEach(file => {
      const relativePath = path.relative(this.rootDir, file);
      
      // Next.js App Router のページファイル (page.tsx, page.ts)
      if (relativePath.includes('/page.tsx') || relativePath.includes('/page.ts')) {
        pageFiles.push(file);
      }
      // Next.js Pages Router のページファイル
      else if (relativePath.startsWith('src/pages/') || relativePath.startsWith('pages/')) {
        // index.tsx/ts は除外（これらは通常ディレクトリのデフォルトページ）
        if (!relativePath.endsWith('/index.tsx') && !relativePath.endsWith('/index.ts')) {
          if (relativePath.endsWith('.tsx') || relativePath.endsWith('.ts')) {
            // _app.tsx, _document.tsx, _error.tsx などの特殊ファイルは除外
            if (!path.basename(relativePath).startsWith('_')) {
              pageFiles.push(file);
            }
          }
        } else {
          // index.tsx/ts も含める場合（オプション）
          pageFiles.push(file);
        }
      }
    });

    // 重複を除去してソート
    return Array.from(new Set(pageFiles)).sort();
  }

  /**
   * ファイルパスをルートパスに変換
   */
  private convertFilePathToRoute(filePath: string): string | null {
    // App Router の場合
    if (filePath.includes('/app/') && filePath.includes('/page.')) {
      const match = filePath.match(/\/app\/(.+)\/page\.(tsx?|jsx?)$/);
      if (match) {
        const routePath = match[1];
        return `/${routePath}`;
      }
      // ルートページの場合
      if (filePath.includes('/app/page.')) {
        return '/';
      }
    }

    // Pages Router の場合
    if (filePath.startsWith('src/pages/') || filePath.startsWith('pages/')) {
      const withoutExtension = filePath.replace(/\.(tsx?|jsx?)$/, '');
      const routePart = withoutExtension
        .replace(/^src\/pages\//, '')
        .replace(/^pages\//, '')
        .replace(/\/index$/, ''); // index は除去

      return routePart ? `/${routePart}` : '/';
    }

    return null;
  }
}

// メイン実行
async function main() {
  try {
    console.log('🚀 PRの影響範囲分析を開始します...');
    
    const analyzer = new ImpactAnalyzer();
    const analysis = await analyzer.analyzeImpact();
    
    const result = analyzer.formatResults(analysis);
    console.log(result);
    
    // GitHub Actionsの出力として設定
    if (process.env.GITHUB_ACTIONS) {
      try {
        const core = await import('@actions/core');
        core.setOutput('impact-analysis', result);
      } catch (error) {
        console.warn('GitHub Actions環境ではありませんが、結果を出力しました');
      }
    }
    
  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 