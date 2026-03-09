# 乘客名單網站技術文件（MATSU）

## 1. 文件目的
這份文件給工程師快速對照：
- 每個欄位帶什麼資料
- 各指標怎麼算
- 篩選規則是 AND 還是 OR
- 匯出內容與檔名規則

目前系統資料來源是前端 `app.js` 內建「模擬資料生成」，不是串接後端 API。

## 2. 主要檔案
- `index.html`：頁面結構、篩選欄位、主表、明細彈窗
- `styles.css`：樣式
- `app.js`：資料生成、篩選、KPI 計算、表格渲染、匯出、分頁

## 3. 資料模型

### 3.1 主表資料（row）
每一筆代表「某日期 + 某路線 + 某班次」：
- `id`：`ROW-序號`
- `month`：`YYYY-MM`
- `date`：`YYYY/MM/DD`
- `route`：路線名稱
- `shift`：班次時間（例如 `08:30-12:00`）
- `capacity`：可售座位
- `booked`：訂票人數
- `checkedIn`：驗票人數
- `passengers`：此班次的乘客陣列

### 3.2 明細乘客資料（passenger）
- `name`：姓名
- `orderNo`：訂單編號
- `rideTime`：搭乘時間區間（例如 `9:30-10:30`）
- `phone`：手機
- `idNo`：身分證
- `nationality`：`本國 / 外籍 / 陸籍`
- `shuttle`：是否接駁（`是/否`）
- `pickupPoint`：接駁地點（若 `shuttle=否` 則 `-`）
- `needEnglish`：是否需要英文（`是/否`）
- `disability`：身心障礙人士（`是/否`）
- `note`：備註
- `bookedStatus`：固定為 `已訂票`
- `checkedStatus`：`已驗票 / 未驗票`

## 4. 模擬資料生成規則（app.js）

### 4.1 維度
- 月份：`2026-03`, `2026-04`, `2026-05`
- 每月天數：固定 `1~28`
- 路線：8 條（依目前 `routes`）
- 班次：3 段（`shifts`）

總筆數（主表 row）= `3(月) * 28(日) * 8(路線) * 3(班次) = 2016`

### 4.2 主表數值
- `capacity`：班次 index=2 時為 30，其他為 35
- `booked`：`randomBetween(12, capacity)`
- `checkedIn`：`randomBetween(floor(booked*0.72), booked)`

### 4.3 乘客欄位生成
每筆 row 會生成 `booked` 個乘客。
- `checkedStatus`：前 `checkedIn` 位設為 `已驗票`，其餘 `未驗票`
- `rideTime`：從班次區間中抽 60 分鐘
- `nationality` 機率：
  - 本國 70%
  - 外籍 23%
  - 陸籍 7%
- `shuttle`：35% 是
- `pickupPoint`：僅 shuttle=是時，從 4 個地點隨機選
- `needEnglish`：20% 是
- `disability`：8% 是
- `note`：
  - 每 12 筆乘客有 1 筆長備註範例
  - 否則優先規則：`disability=是 -> 需協助上下車`，再來 `needEnglish=是 -> 需英文服務`，否則 `-`

## 5. 篩選規則（重要）

### 5.1 UI 篩選欄位
目前有：
- 起始日期 `startDateFilter`
- 結束日期 `endDateFilter`
- 路線 `routeFilter`
- 訂位人姓名 `nameFilter`
- 手機 `phoneFilter`
- 接駁地點 `pickupFilter`

### 5.2 觸發時機
- 改欄位值時 **不會立即刷新**
- 只有按下 `查詢` 才套用篩選

### 5.3 篩選邏輯（getFiltered）
先做 row 層級：
1. `routeOk`：路線符合（或選全部）
2. `dateOk`：`rowDate` 在起迄日範圍內（含邊界）

再做 passenger 關鍵字層級：
- 若姓名/手機/接駁地點三者都空：`passengerOk=true`
- 否則要求「該 row 中至少有一位乘客」同時滿足：
  - 姓名包含關鍵字（若有填）
  - 手機包含關鍵字（若有填）
  - 接駁地點包含關鍵字（若有填）

最終：`routeOk AND dateOk AND passengerOk`

## 6. KPI 計算規則
`renderKPI(rows)` 使用篩選後 rows：
- 總可售座位 = `sum(capacity)`
- 總訂票人數 = `sum(booked)`
- 總驗票人數 = `sum(checkedIn)`
- 未驗票人數 = `總訂票 - 總驗票`
- 訂票率 = `總訂票 / 總可售`
- 驗票率 = `總驗票 / 總訂票`
- 國籍比例：
  - 先掃過所有 `rows.passengers` 計數（本國/外籍/陸籍）
  - 比例 = `各國籍數 / 三類總數`

百分比格式：`pct(n) => (n*100).toFixed(1) + "%"`

## 7. 主表欄位計算
每列（row）顯示：
- 日期：`row.date`
- 路線：`row.route`
- 班次：`row.shift`
- 可售座位：`row.capacity`
- 訂票人數：`row.booked`
- 驗票人數：`row.checkedIn`
- 未驗票：`row.booked - row.checkedIn`
- 訂票率：`row.booked / row.capacity`
- 驗票率：`row.checkedIn / row.booked`

驗票率顏色：
- `>= 85%`：`pill good`
- `< 85%`：`pill warn`

## 8. 明細彈窗規則
- 點主表「路線」按鈕開啟明細
- 明細資料來源：該 row 的 `passengers`
- 欄位：
  - 搭乘日期、班次、姓名、訂單編號、搭乘時間、手機、國籍、身分證、是否接駁、是否需要英文、身心障礙人士、備註、訂票狀態、驗票狀態
- 驗票狀態同樣用 `pill good/warn` 顏色

## 9. 匯出規則

### 9.1 匯出檔名
- 使用 `getRangeTag()`：`YYYYMMDD_YYYYMMDD`
- 主表：`report_${range}.xls`
- 名單：`detail_${range}.xls`

### 9.2 匯出按鈕
- `匯出 Excel`：匯出主表欄位
- `下載名單`：匯出乘客明細欄位

### 9.3 匯出資料範圍
兩個匯出都使用 `getFiltered()`，也就是「目前查詢條件」的結果。

## 10. 分頁規則
- 主表：每頁 18 筆（`mainPager.size=18`）
- 明細：每頁 14 筆（`detailPager.size=14`）

## 11. 已知注意事項（給工程師）
1. 目前資料是前端隨機生成，重新整理會重算資料。
2. 關鍵字篩選是「包含」比對（`includes`），非完全相等。
3. 姓名/手機/接駁地點若同時輸入，屬於 AND 條件（同一位乘客需同時符合）。
4. 班次目前仍顯示在表格與明細欄位，但已不提供班次篩選欄。
5. 若要串接後端，建議先把 `generateData()` 替換為 API response，保留目前 `getFiltered/render` 流程可最小改動。

---
如需第二份「給 PM/客服看的非技術版文件」，可再從本文件精簡成流程說明版。
## 12. 手機版顯示規則（RWD）

### 12.1 主要斷點
- `<= 1100px`：隱藏左側選單、主內容改單欄容器。
- `<= 900px`：
  - 查詢欄位改單欄排列。
  - 查詢按鈕改直向堆疊且全寬。
  - KPI 卡片改單欄。
  - 主表與明細表保留水平捲動（在表格容器內，不撐破整頁）。
- `<= 700px`：按鈕、輸入欄高度與字級再縮一級。
- `<= 480px`：最小手機規則（更小間距、字級與表格最小寬度）。

### 12.2 防爆版策略
- `body` 設 `overflow-x: hidden`，避免整頁橫向位移。
- `.panel/.table-panel/.table-wrap` 設 `min-width: 0`，避免 grid/flex 子元素撐爆容器。
- 主表與明細表採「容器內可橫向滑動」，不強制壓縮到不可讀。
- 明細彈窗在手機採滿版顯示（`100vw/100vh`），表格在彈窗內容區內捲動。

### 12.3 目前預期行為
- 手機畫面可完整看到查詢按鈕區，不會被橫向擠壓。
- 表格內容過寬時，只有表格區可左右滑；整頁不應左右漂移。
- 若仍爆版，先確認是否為舊快取：手機關分頁重開，或桌面用 `Ctrl+F5`。