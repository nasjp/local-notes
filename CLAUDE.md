# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

LLM用プロンプトをローカルストレージで管理する軽量Webアプリケーション。Next.js 15.5.0（App Router）とTypeScriptで構築。

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

### 警告とエラーの取り扱い

**絶対的ルール**: 
- リント（BiomeJS、ESLint）のエラーと警告は**絶対に放置しない**
- ビルドの警告も**絶対に放置しない**
- すべての警告とエラーを解決してからコミットすること
- 短期的な解決やworkaroundは避け、根本的な解決を行うこと

例:
- 未使用変数の警告 → 変数を削除またはcatchブロックで`} catch {`を使用
- 型エラー → 適切な型定義を追加
- BiomeJSのエラー → ルールに従った修正を実施

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
1. プロンプトのCRUD操作
2. カードタイル形式での一覧表示
3. インタラクティブな検索機能
4. レスポンシブデザイン
5. ローカルストレージでのデータ管理