# CLAUDE.md

このファイルはClaude Code (claude.ai/code)がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

LLM用ノートをローカルストレージで管理する軽量Webアプリケーション。Next.js 15.5.0（App Router）とTypeScriptで構築。

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
bun run dev

# プロダクションビルド
bun run build

# プロダクションサーバー起動
bun run start

# コードフォーマット・リント（BiomeJS）
bun run lint

# テスト実行
bun run test
```

## コミット前の必須チェック

**重要**: コミットする前に必ず以下のコマンドを実行してください：

```bash
# 1. リント・フォーマット
bun run lint

# 2. ビルドチェック
bun run build

# 3. テスト実行
bun run test
```

すべてのチェックが成功した場合のみコミットを行ってください。

### 警告・エラーへの対処

**絶対ルール**: 
- リントエラー・警告（BiomeJS、ESLint）を**絶対に無視しない**
- ビルド警告を**絶対に無視しない**
- すべての警告・エラーを解決してからコミットする
- 応急処置的な修正を避け、適切な実装を行う

例：
- 未使用変数の警告 → 変数を削除するか、catchブロックで`} catch {`を使用
- 型エラー → 適切な型定義を追加
- BiomeJSのエラー → ルールに従って修正

## アーキテクチャ概要

### 技術スタック
- **フレームワーク**: Next.js 15.5.0 (App Router)
- **言語**: TypeScript (strict mode)
- **ランタイム**: Bun
- **UI**: React 19.1.0 + shadcn/ui
- **スタイリング**: Tailwind CSS 4.x
- **リンター/フォーマッター**: BiomeJS
- **アイコン**: lucide-react

### ディレクトリ構造
- `src/app/`: Next.js App Routerのページとレイアウト
- `src/components/ui/`: shadcn/uiコンポーネント
- `src/lib/`: ユーティリティ関数（utils.ts）
- `docs/spec.md`: 詳細な要件定義書

### 開発規約
- **コードスタイル**: BiomeJS設定に従う（インデント2スペース、ダブルクォート）
- **パスエイリアス**: `@/`を使用（`@/components`など）
- **コンポーネント**: shadcn/uiを優先使用
- **データ永続化**: ローカルストレージを使用（要件定義に基づく）

### TypeScriptコーディング規約
- **型定義**: `interface`ではなく`type`を使用
- **関数**: `class`ではなく`function`（関数コンポーネント、ユーティリティ関数）を使用

```typescript
// ✅ Good
type User = {
  id: string;
  name: string;
};

export function useUser() {
  // ...
}

// ❌ Bad
interface User {
  id: string;
  name: string;
}

export class UserService {
  // ...
}
```

### 主要機能（要件定義より）
1. ノートのCRUD操作
2. カードタイル形式での一覧表示
3. インタラクティブな検索機能
4. レスポンシブデザイン
5. ローカルストレージでのデータ管理
