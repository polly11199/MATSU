# CHANGELOG

## 2026-03-10

### [31f885c] Default date range to today when unfiltered
- 搭乘日期改為未篩選預設「起=迄=當日」。
- 若日期欄位被清空，fallback 改為當日（`defaultDate`），不再回整段區間。

### [1b9725d] Scale down filter panel proportions
- 查詢區欄位、日期框、按鈕比例整體縮小。
- 保留原本功能與欄位順序，只調整尺寸與間距。

### [ba665fb] Hide sidebar and use full-width main layout
- 左側功能欄暫時隱藏。
- 主內容改為全寬版型。

### [c922cca] Tune filter proportions and hide action label text
- 調整查詢區比例與欄位寬度。
- 移除「操作」文字顯示（保留按鈕）。

### [16612f2] Restore route filter row in vertical filter layout
- 在直式查詢區中恢復「路線」欄位。
- 取消先前隱藏路線欄位的樣式設定。

### [423175d] Refactor filter panel to vertical top-down layout
- 查詢條件區改為由上往下排列。
- 日期改為同列「起 / 迄」，姓名/手機/接駁地點分列顯示。

### [3ea4ce9] Rename order number to booking code and update code format
- 「訂單編號」改為「訂位代碼」。
- 訂位代碼格式改為 8 碼英數（例如 `N1NT06IV`）。

### [1e43e2d] Remove ride-time field from detail modal and detail export
- 明細彈窗移除「搭乘時間」欄位。
- 下載名單（Excel）同步移除「搭乘時間」。

### [1ed6501] Force text format for detail Excel phone/order/id fields
- 下載名單中「訂位代碼/手機/身分證」強制文字格式，避免手機 Excel 自動轉數字。

### [bea9712] Change no-show KPI label to percentage and bump app.js cache version
- KPI「未驗票人數」副文案改為「未驗票率 xx.x%」。

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
- 若上線頁面與本機不同，先確認 GitHub Pages 是否已部署最新 commit，並確認瀏覽器快取是否更新。