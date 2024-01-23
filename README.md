# Window / Mac 版本已經更新 3.1.0，請使用更新版本

# notion-zh_TW 是什麼？

notion-zh_TW 是對 notion 的漢化腳本。

## 功能

- 支持 網頁端 ( 油猴腳本 ) + 桌面端 ( win / mac ) + 安卓端 漢化腳本
- （很久沒有維護）提供 cloudflare worker 版本代理 notion.so 域名
  這是一個**平台無關**（IOS 上的 safari 也能直接使用）的漢化方式，只要您自己部署 cloudflare worker，就可以使用。附帶 cf 代理**加速**的能力。
  > 其實這裡應該可以做域名映射到 notion.so 的訪問的。(從而實現全平台漢化)

# 為什麼要做這個項目？

Notion 已經有了中文語料，讓用戶能夠提前使用中文語料

# 如何使用?

## 網頁端

1. ### 安裝油猴插件

   此處提供搜尋到知乎的一篇教學：https://zhuanlan.zhihu.com/p/128453110

2. ### 安裝油猴腳本
   打開連結：https://greasyfork.org/zh-CN/scripts/430116-notion-%E5%AE%8C%E5%85%A8%E4%B8%AD%E6%96%87%E5%8C%96-%E5%9F%BA%E4%BA%8E%E9%9F%A9%E8%AF%AD%E7%89%88%E6%9C%AC-%E4%BD%BF%E7%94%A8%E8%85%BE%E8%AE%AFapi%E6%9C%BA%E7%BF%BB 。然後點擊安裝。
3. ### 體驗漢化效果
   https://www.notion.so

## 桌面端

notion 客戶端迎來了巨大更新，文件結構發生完全不一致的變化（沒有了可以注入的 preload.js 了）

**有問題發 issue，最好是貼錄屏，gif 能直接貼在 issue**

### 預處理版本

[https://github.com/Reamd7/notion-zh_CN/releases/tag/3.0.0](https://github.com/Reamd7/notion-zh_CN/releases/tag/3.1.0)

- `app.win.zip`
- `app.mac.zip`

都已經有了 app 資料夾

打開 `Notion安裝資料夾/resources`
解壓 `預處理壓縮包` 到 `Notion安裝資料夾/resources` 下
刪除 `app.asar` 或 重命名為其他名字

### **（修改原理）：** windows / mac

打開 `Notion安裝資料夾/resources`
解壓 `app.asar` 到相同資料夾的 `app` 資料夾下
找到 `.webpack/main/index.js`

1. 搜尋 `localeHtml`
   看到一個 `localeHtml[r]`
   將 `r` 替換為 `zh-CN` / `zh-TW`

目的是直接使用快取資源文件中 zh-CN 的 html

2. 搜尋 requestReturnedAsIndexV2

看到 const e = l.default.join(i, u.path); 是文件的絕對路徑
在下方直接注入以下程式碼, 目的是修改 renderer 中 localStorage 的 locale 快取值

```js
if (u.path.endsWith('.html')) {
  const fs = require('fs');
  const htmlContent = fs.readFileSync(e, 'utf-8');
  if (
    !htmlContent.includes(
      `{"id":"KeyValueStore2:preferredLocale","value":"zh-CN","timestamp":Date.now(),"important":true}`
    )
  ) {
    (() => {
      fs.writeFileSync(
        e,
        htmlContent.replace(
          '</html>',
          `<script>
            // ==UserScript==
            try {
                const preferredLocaleStr = window.localStorage.getItem(
                    "LRU:KeyValueStore2:preferredLocale"
                );
                const preferredLocale = JSON.parse(preferredLocaleStr) || {"id":"KeyValueStore2:preferredLocale","value":"zh-CN","timestamp":Date.now(),"important":true};
                if (preferredLocale.value) {
                    preferredLocale.value = "zh-CN";
                }
                window.localStorage.setItem(
                    "LRU:KeyValueStore2:preferredLocale",
                    JSON.stringify(preferredLocale)
                );
            } catch (e) {}
            </script>
            </html>`
        )
      );
    })();
  }
}
```

保存

刪除 `app.asar` 或 重新命名為其他名字
打開應用

### More

如果您不想修改軟體原始碼，還有如下方案（之後可能會寫成自動化腳本）

1. 打開 Notion 的資源快取文件

windows: `C:\Users\[使用者名稱]\AppData\Roaming\Notion\notionAssetCache-v2`
mac

2. 找到熱更新資源最新的版本
   基於語義化版本規則可以判斷，或者看 `latestVersion.json` 內部 `version` 欄位

以下以當前最新版本 `23.13.0.23` 舉例子

3. 打開最新版本所在資料夾 `23.13.0.23/assets.json`

搜尋到 `localeHtml` 欄位，
將下級`en-US` 欄位的值改為和 `zh-CN` 或 `zh-TW` 一致
保存
重啟

該方案問題是 Notion 經常熱更新會更新快取，那就要一個自動化的腳本自動做如上的事情解決問題

## cloudflare worker

> 不建議使用。不希望推廣。有風險。您需要知道您在幹什麼。

1. 首頁：https://workers.cloudflare.com

2. 註冊，登陸，`Start building`，取一個子域名，`Create a Worker`。

3. 複製 [worker.js](https://github.com/Reamd7/notion-zh_CN/blob/main/worker.js) 到左側程式碼框，修改

   ```js
   const BaseUrl = 'xxxx.子域名.workers.dev'; // 修改為自己的子域名
   ```

4. `Save and deploy`。如果正常，右側應顯示提示框：
   Mismatch between origin and baseUrl (dev).
   好的（這裡就證明漢化成功了）
5. 以後可直接訪問 `https://xxxx.子域名.workers.dev`。

## 安卓端

- 下載 apk：[https://github.com/Reamd7/notion-zh_CN/blob/main/apk/Notion_0.6.1122.beta(7122)\_zh_cn.apk](<https://github.com/Reamd7/notion-zh_CN/blob/main/apk/Notion_0.6.1122.beta(7122)_zh_cn.apk>)

# 大家可以做什麼？

1. **最佳化漢化語言**。都是機器翻譯，看到不通暢的句子歡迎提 issue/pr 直接改了 （修改 **`json/zh.json`** 文件，了解之前，先找到原有的英文，韓文對照一下再更新翻譯。）

# 呼籲：

提高付費率，支持您所支持的軟讓他發展更好，這樣國內市場才會更受重視，而不是只是白嫖，買淘寶，搞教育帳戶。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Reamd7/notion-zh_CN&type=Date)](https://star-history.com/#Reamd7/notion-zh_CN&Date)

> 風險提示：使用 cloudflare worker 的同學，被官方檢測出來並封號與我無關，希望自己看明白程式碼做了什麼，以及為什麼會被檢測出來。
> 其他方式的，都是使用官方國際化方案進行國際化的，而且在本地進行操作不通過任何伺服器——理論上除非故意釣魚否則不會封您。
> 釣魚：主動收集您是不是用了中文版國際化欄位，而且，對比您並沒有中文版權限。
>
> 如果擔心有問題，可以等待官方中文版，可以稍微學習網頁開發，可以詢問網頁開發朋友，項目都是開源的。究竟做了什麼操作，對 notion 應用本體有什麼影響，沒有理由的擔心只能體現對別人的不信任。
>
> 該項目僅用於學習，如有侵權 24h 內會馬上刪除。

# 更新日誌：

- 2.4.20 補充 window 更新資料夾文件之後的 自動注入軟體 / 手動注入教學
- 2.4.2 **翻譯開始跟隨著官方中文詞條啦!!!!!**
- 2.4.1 支持 ios / macos user script
- 2.3.1 權衡後，安卓版本使用新的 runtime 注入方式，實現全部的（包括鍵盤都能夠漢化的方式）但有首頁白屏事件較長的問題。
- 2.3.0 支持使用 cloudflare worker 進行代理 notion.so 域名進行加速及國際化
- 2.2.0 支持 安卓版本 notion，與官方版共存 的漢化！
- 2.1.0：支持中文版快捷命令！支持拼音輸入的時候顯示快捷命令！
  ![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/205477fc-c9df-48f2-a816-50c8809f244b/%E6%97%A0%E6%A0%87%E9%A2%98.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210821%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210821T053807Z&X-Amz-Expires=86400&X-Amz-Signature=916007db665a09560b8cde53c10480377a1f58eed05a57f99853496dfb6c8729&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E6%2597%25A0%25E6%25A0%2587%25E9%25A2%2598.png%22)
- 2.0.4: 徹底支持無論是默認英文還是韓文都會生效的漢化腳本（2021/08/19 油猴腳本 + win 客戶端 + mac 客戶端測試通過），統一 win mac 網頁端實現。
- 2.0.3：支持切換到韓文之後幫助文件還原到默認英文版本
- 2.0.1：支持 mac 客戶端（英文）
- 2.0.0: 支持 win 客戶端（韓文） + 油猴腳本
