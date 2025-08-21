# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

LLM用プロンプトをローカルストレージで管理する軽量Webアプリケーション。Next.js 15.5.0（App Router）とTypeScriptで構築。

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# コードフォーマット・リント（BiomeJS）
npm run lint

# 型チェック（Biomeが自動実行）
npm run lint
```

## アーキテクチャ概要

### 技術スタック
- **フレームワーク**: Next.js 15.5.0 (App Router)
- **言語**: TypeScript (strict mode)
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

### 主要機能（要件定義より）
1. プロンプトのCRUD操作
2. カードタイル形式での一覧表示
3. インタラクティブな検索機能
4. レスポンシブデザイン
5. ローカルストレージでのデータ管理