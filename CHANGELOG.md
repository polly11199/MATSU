# CHANGELOG

## 2026-03-09

### [9d2833e] Mobile overflow and button responsiveness hotfix
- 新增手機熱修正區塊，強化小螢幕防爆版規則。
- 修正小螢幕按鈕與容器在極小寬度下的可讀性與可點擊性。

### [363895a] Tighten mobile responsive layout and overflow handling
- 手機版再縮小字級、按鈕與輸入框高度。
- 調整主表/明細表在手機的最小寬度與容器內捲動行為。
- 新增 `<=480px` 斷點規則。

### [ac97206] Update filters and mobile RWD fixes
- 調整查詢條件與手機版 RWD（初版）。
- 移除/調整 KPI 顯示並優化版面間距。

### [76826a6] Initial MATSU dashboard
- 建立網站初版（主表、明細彈窗、篩選、分頁、匯出）。
- 建立技術文件 `TECHNICAL_SPEC.md`。

## 備註
- 本專案使用前端模擬資料，重新整理頁面會重新生成資料。
- 若上線頁面與本機不同，先確認 GitHub Pages 是否已部署最新 commit。