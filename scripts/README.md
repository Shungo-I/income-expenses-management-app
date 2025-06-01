# 📊 影響範囲分析ツール

ts-morphを使用してTypeScript/ReactプロジェクトのPRの影響範囲を自動分析するツールです。

## 🚀 機能

- **変更ファイルの検出**: Gitの差分から変更されたTypeScript/TSXファイルを自動検出
- **依存関係の解析**: ts-morphを使用してimport/exportの関係を詳細に分析
- **影響範囲の可視化**: 直接・間接的な依存関係を分かりやすく表示
- **GitHub Actions統合**: PRに自動でコメントを投稿
- **統計情報の提供**: 影響範囲の規模を数値で把握

## 🚀 使用方法

### ローカル実行
```bash
npm run analyze-impact
```

### GitHub Actions
PRを作成すると自動実行され、結果がコメントとして投稿されます。

## 📁 構成ファイル
- `scripts/analyze-impact.ts`: メイン分析スクリプト  
- `.github/workflows/pr-impact-analysis.yml`: GitHub Actionsワークフロー

## ⚙️ 設定
ワークフローファイルでしきい値や対象ブランチを調整可能です。

## 📁 ファイル構成

```
scripts/
├── analyze-impact.ts    # メインの分析スクリプト
└── README.md           # このファイル

.github/workflows/
└── pr-impact-analysis.yml  # GitHub Actionsワークフロー
```

## 🛠 セットアップ

### 1. 依存関係のインストール

```bash
npm install --save-dev ts-morph tsx @actions/core
```

### 2. package.jsonスクリプトの追加

```json
{
  "scripts": {
    "analyze-impact": "tsx scripts/analyze-impact.ts"
  }
}
```

### 3. GitHub Actionsの有効化

`.github/workflows/pr-impact-analysis.yml`がリポジトリに含まれていることを確認してください。

## 📖 使用方法

### ローカル実行

```bash
# プロジェクトルートで実行
npm run analyze-impact
```

### GitHub Actions

PRを作成または更新すると、自動的に影響範囲分析が実行され、結果がPRにコメントとして投稿されます。

## 📊 出力例

```markdown
# 📊 PRの影響範囲分析結果

## 🔄 変更されたファイル (2件)

- `src/components/Button.tsx`
- `src/hooks/useModal.ts`

## 📈 影響を受けるファイル

### 📁 `src/components/Button.tsx`

#### 🔗 直接的な依存ファイル (3件)

- `src/pages/HomePage.tsx`
- `src/components/Modal.tsx`
- `src/components/Form.tsx`

#### 🔄 間接的な依存ファイル (5件)

- `src/app/page.tsx`
- `src/layout/Header.tsx`
- `src/layout/Footer.tsx`
- `src/components/Navigation.tsx`
- `src/components/UserProfile.tsx`

## 📊 統計情報

- **変更ファイル数**: 2
- **影響を受けるファイル数**: 8
- **総影響ファイル数**: 10

⚠️ **テスト対象推奨**: 変更されたファイルとその依存ファイルをテストすることを推奨します。
```

## ⚙️ カスタマイズ

### しきい値の調整

`.github/workflows/pr-impact-analysis.yml`の以下の部分で警告のしきい値を調整できます：

```yaml
# しきい値を設定（調整可能）
const WARNING_THRESHOLD = 20;    # 警告のしきい値
const CRITICAL_THRESHOLD = 50;   # エラーのしきい値
```

### 対象ファイルの変更

`scripts/analyze-impact.ts`の`getChangedFiles()`メソッドで、分析対象のファイル拡張子を変更できます：

```typescript
.filter(file => file.trim() && (file.endsWith('.ts') || file.endsWith('.tsx')))
```

### Git差分の範囲変更

現在は`HEAD~1`との差分を見ていますが、PRのベースブランチとの差分に変更することも可能です。

## 🐛 トラブルシューティング

### よくある問題

1. **ts-morphが見つからない**
   ```bash
   npm install --save-dev ts-morph
   ```

2. **tsconfig.jsonが見つからない**
   - プロジェクトルートにtsconfig.jsonがあることを確認

3. **依存関係が正しく解析されない**
   - import/exportの書き方を確認
   - 相対パスと絶対パスの設定を確認

### デバッグ方法

```bash
# 詳細なログを出力
DEBUG=1 npm run analyze-impact
```

## 🔧 開発者向け情報

### 主要クラス

- `ImpactAnalyzer`: メインの分析クラス
- `ImportInfo`: インポート情報の型定義
- `ExportInfo`: エクスポート情報の型定義
- `ImpactAnalysis`: 分析結果の型定義

### 拡張のヒント

- 新しいファイル形式のサポート追加
- より詳細な依存関係の分析
- 結果の可視化の改善
- Slack通知などの連携機能追加 