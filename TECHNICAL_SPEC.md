# 乘客名單網站技術文件（MATSU）

## 1. 文件目的
給工程師快速對照目前程式邏輯：
- 欄位來源與資料模型
- 篩選條件與預設行為
- KPI 計算方式
- 匯出欄位與格式規則

目前資料來源為前端 `app.js` 模擬生成，非後端 API。

## 2. 主要檔案
- `index.html`：畫面結構（查詢區、主表、明細彈窗）
- `styles.css`：樣式與 RWD
- `app.js`：資料生成、篩選、KPI、分頁、匯出

## 3. 固定維度
- 路線（8 條）：
  - 北海坑道線(上午東線)
  - 馬祖巨神像線(下午西線)
  - 戰爭和平公園線(上午線)
  - 戰爭和平公園線(下午線)
  - 國之北疆線(上午線)
  - 國之北疆線(下午線)
  - 東犬燈塔線
  - 坤坵沙灘線
- 班次（3 段）：`08:30-12:00`、`13:30-17:00`、`18:00-20:00`
- 月份：`2026-03`、`2026-04`、`2026-05`（每月固定 1~28 日）

## 4. 資料模型

### 4.1 主表 row
每筆代表「日期 + 路線 + 班次」：
- `id`：`ROW-序號`
- `month`：`YYYY-MM`
- `date`：`YYYY/MM/DD`
- `route`
- `shift`
- `capacity`
- `booked`
- `checkedIn`
- `passengers`：乘客陣列

### 4.2 乘客 passenger
- `name`
- `seller`：售票員（`旅行社 / 公車處 / 南竿鄉 / 北竿鄉 / 東引鄉 / 莒光鄉`）
- `bookingCode`：訂位代碼（8 碼英數，例如 `N1NT06IV`）
- `rideTime`：內部仍有生成，但目前「明細畫面/下載名單」不顯示
- `phone`
- `idNo`
- `nationality`：`本國 / 外國 / 陸籍`
- `shuttle`：`是/否`
- `pickupPoint`：`shuttle=否` 時為 `-`
- `needEnglish`：`是/否`
- `disability`：`是/否`
- `note`
- `bookedStatus`：固定 `已訂票`
- `checkedStatus`：`已驗票 / 未驗票`

## 5. 模擬資料生成規則

### 5.1 主表數值
- `capacity`：`route.includes("國之北疆線") ? 19 : 25`
- `booked`：`randomBetween(12, capacity)`
- `checkedIn`：`randomBetween(floor(booked * 0.72), booked)`

### 5.2 乘客數值
- `checkedStatus`：前 `checkedIn` 位為 `已驗票`
- `rideTime`：班次內隨機 60 分鐘區間
- `nationality` 機率：本國 70%、外國 23%、陸籍 7%
- `shuttle`：35% 是
- `needEnglish`：20% 是
- `disability`：8% 是
- `seller`：從售票員名單隨機指派
- `note`：每 12 筆 1 筆長備註，其餘依條件帶「需協助上下車 / 需英文服務 / -」

## 6. 篩選規則（查詢條件）

### 6.1 欄位
- 搭乘日期起 `startDateFilter`
- 搭乘日期迄 `endDateFilter`
- 路線 `routeFilter`
- 訂位人姓名 `nameFilter`
- 手機 `phoneFilter`
- 接駁地點 `pickupFilter`

### 6.2 套用時機
- 變更欄位值不立即刷新
- 按下「查詢」才更新結果

### 6.3 日期預設（2026-03-10 更新）
- 頁面初次載入：起迄都預設為「當日日期」
- 若當日不在資料範圍（`minDate~maxDate`），改用 `minDate`
- 若使用者清空日期欄位，程式 fallback 也是當日起迄（`defaultDate`）

### 6.4 邏輯
`getFiltered()` 採：
- `routeOk AND dateOk AND passengerOk`
- `passengerOk` 規則：
  - 姓名/手機/接駁地點都空 => true
  - 否則需「同一位乘客」同時符合已輸入的關鍵字（AND）

## 7. KPI 計算
- 總可售座位 = `sum(capacity)`
- 總訂票人數 = `sum(booked)`
- 總驗票人數 = `sum(checkedIn)`
- 未驗票人數 = `總訂票 - 總驗票`
- 訂票率 = `總訂票 / 總可售`
- 驗票率 = `總驗票 / 總訂票`
- 未驗票卡片副文案：`未驗票率 xx.x%`
- 國籍比例：掃 `rows.passengers` 後計算本國/外國/陸籍占比

## 8. 主表欄位
- 日期
- 路線（可點擊開明細）
- 班次
- 可售座位
- 訂票人數
- 驗票人數
- 未驗票
- 訂票率
- 驗票率（顏色 pill）

## 9. 明細彈窗欄位
目前顯示：
- 搭乘日期
- 班次
- 姓名
- 售票員
- 訂位代碼
- 手機
- 國籍
- 身分證
- 是否接駁
- 是否需要英文
- 身心障礙人士
- 備註
- 訂票狀態
- 驗票狀態（顏色 pill）

說明：`搭乘時間` 已從明細畫面移除。

## 10. 匯出規則

### 10.1 檔名
- 主表：`report_YYYYMMDD_YYYYMMDD.xls`
- 名單：`detail_YYYYMMDD_YYYYMMDD.xls`

### 10.2 匯出範圍
- 兩種匯出都使用目前 `getFiltered()` 結果

### 10.3 欄位
- 主表匯出：與主表顯示欄位一致
- 下載名單：與明細欄位一致（不含搭乘時間）

### 10.4 Excel 文字格式保護
下載名單中這三欄強制文字格式（避免前導 0 消失）：
- 訂位代碼
- 手機
- 身分證

## 11. 分頁
- 主表：每頁 18 筆
- 明細：每頁 14 筆

## 12. 版面與 RWD（現況）
- 左側功能欄目前已隱藏，主內容全寬顯示
- 查詢區採由上往下排列
- 手機版保留表格容器內橫向捲動，避免整頁爆版

## 13. 工程注意事項
1. 目前資料為前端隨機生成，重新整理會重算。
2. 關鍵字比對為 `includes`（部分包含）。
3. 姓名/手機/接駁地點同時輸入時，是同一位乘客的 AND 條件。
4. 若改串後端 API，建議保留 `getFiltered/render` 流程，先替換 `generateData()`。
