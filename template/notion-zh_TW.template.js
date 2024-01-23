// ==UserScript==
// @name         Notion-zh_TW notion的漢化腳本
// @namespace    http://tampermonkey.net/
// @version      %version%
// @description  notion的100%漢化腳本，基於官方中文+機器翻譯韓文，支持app版本以及網頁油猴，地址：https://github.com/reamd7/notion-zh_CN
// @author       reamd7
// @match        *://www.notion.so/*
// @match        *://*.notion.site/*
// @grant        none
// @run-at       document-start
// @copyright    2021, reamd7
// @license      MIT
// ==/UserScript==
(function () {
  "use strict";
  % zh %;

  var isSafari =
    navigator.userAgent.includes("Safari/") &&
    !navigator.userAgent.includes("Chrome/");
  var isElectron = "undefined" != typeof global || window.__isElectron;

  const scriptList = document.querySelectorAll("script[defer]");
  const scriptSrcList = Array.from(scriptList).map((v) => v.src);
  if (isSafari) {
    scriptList.forEach((v) => v.remove());
    document.getElementById("notion-app").remove();
  }
  const LOCALE_SETUP = window.LOCALE_SETUP;
  var lang = LOCALE_SETUP.locale;
  const call = function () {
    Object.defineProperty(window, "LOCALE_SETUP", {
      get() {
        debugger;
        return LOCALE_SETUP;
      },
      set() { },
    });
  };
  call();

  const script = document.createElement("script");
  if (isElectron) {
    script.id = "messages";
    script.type = "text/javascript";
    script.defer = "defer";
    script.setAttribute("data-locale", lang);
    const translateText = JSON.stringify(LOCALE_SETUP.messages)
    script.text = `
      window.LOCALE_SETUP={locale: "${LOCALE_SETUP.locale}", messages: ${translateText}, routes: {}}
      const LOCALE_SETUP = window.LOCALE_SETUP;
      Object.defineProperty(window, "LOCALE_SETUP", {
        get() {
          debugger;
          return LOCALE_SETUP;
        },
        set() {},
      });
    `
  }

  function insertMoment() {
    try {
      moment.updateLocale(lang.toLowerCase(), {
        longDateFormat: {
          LT: "h:mm A",
          LTS: "h:mm:ss A",
          L: "YYYY/MM/DD",
          LL: "YYYY年M月D日",
          LLL: "YYYY年M月D日Ah點mm分",
          LLLL: "YYYY年M月D日ddddAh點mm分",
          l: "YYYY/M/D",
          ll: "YYYY年M月D日",
          lll: "YYYY年M月D日 HH:mm",
          llll: "YYYY年M月D日dddd HH:mm",
        },
      });
      moment.locale(lang.toLowerCase());
    } catch (e) {
      requestAnimationFrame(() => {
        insertMoment();
      });
    }
  }

  try {
    const preferredLocaleStr = window.localStorage.getItem(
      "LRU:KeyValueStore2:preferredLocale"
    );
    const preferredLocale = JSON.parse(preferredLocaleStr) || { "id": "KeyValueStore2:preferredLocale", "value": "zh-CN", "timestamp": Date.now(), "important": true };
    if (preferredLocale.value) {
      preferredLocale.value = lang;
    }
    window.localStorage.setItem(
      "LRU:KeyValueStore2:preferredLocale",
      JSON.stringify(preferredLocale)
    ); // search window.document.querySelector("#messages") 請閱讀
  } catch (e) { }

  if (isElectron) {
    var observer = new MutationObserver(function (callback) {
      if (
        callback.filter((v) => {
          return v.target === document.head;
        }).length > 0
      ) {
        document.head.insertAdjacentElement("afterbegin", script);
        observer.disconnect();
      }
    });
    observer.observe(document, {
      childList: true, // 觀察目標子節點的變化，是否有添加或者刪除
      attributes: false, // 觀察屬性變動
      subtree: true, // 觀察後代節點，預設為 false
    });
    insertMoment();
  } else {
    function insert() {
      try {
        document.body.appendChild(script);
      } catch (e) {
        requestAnimationFrame(() => {
          insert();
        });
      }
    }
    insert();
    insertMoment();

    // for UserScript
    if (isSafari) {
      const notionRoot = document.createElement("div");
      notionRoot.id = "notion-app";
      notionRoot.setAttribute("data-inject", true);
      document.body.append(notionRoot);
      scriptSrcList.forEach((url) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.defer = "defer";
        script.src = url;
        script.setAttribute("data-inject", true);
        document.head.append(script);
      });
      if (!window.__console || !window.__console.push) {
        window.__console = {
          push: (msg) => { },
        };
      }
    }
  }
})();
