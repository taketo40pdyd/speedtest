# 回線スピードテスト

ブラウザだけで回線速度(ダウンロード・アップロード・Ping・ゆらぎ・パケットロス)を測定する単一ページのアプリです。

公開URL: https://taketo40pdyd.github.io/speedtest/

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | アプリ本体(HTML・CSS・JavaScriptをすべて含む) |
| `sw.js` | Service Worker(オフラインで画面と履歴を開く・PWA用)。`index.html` と同じ場所に置く |
| `sitemap.xml` | 検索エンジン向けのサイトマップ |
| `.nojekyll` | GitHub PagesのJekyll処理を無効にする空ファイル |

## 公開手順(GitHub Pages)

1. GitHubに `speedtest` という名前のリポジトリを作る(公開URLの `/speedtest/` と一致させる)
2. このフォルダの中身をリポジトリのルートにアップロードして `main` ブランチにコミットする
3. リポジトリの Settings → Pages で、Source を「Deploy from a branch」、Branch を `main` / `(root)` にして保存する
4. 1〜2分後に上のURLで公開される

## 更新するとき

- `index.html` を差し替えてコミットする
- 画面が古いままのときは、ページを再読み込みして Service Worker を入れ替える
- `sw.js` を変更したときは、中の `V="speedtest-v2"` の数字を上げるとキャッシュが確実に更新される

## 補足

- 測定データ(履歴・設定)はブラウザの localStorage にのみ保存され、サーバーには送られません
- アップロード測定だけは、Cloudflareの測定用サーバー(`speed.cloudflare.com`)へ小さなダミーデータを送ります。設定でオフにできます
- 検索エンジンへの登録は、Google Search Console にURLプレフィックスで追加し、`sitemap.xml` を送信してください
