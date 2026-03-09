const routes = [
  "北海坑道線(上午東線)",
  "馬祖巨神像線(下午西線)",
  "戰爭和平公園線(上午線)",
  "戰爭和平公園線(下午線)",
  "國之北疆線(上午線)",
  "國之北疆線(下午線)",
  "東犬燈塔線",
  "坤坵沙灘線"
];
const shifts = ["08:30-12:00", "13:30-17:00", "18:00-20:00"];
const months = ["2026-03", "2026-04", "2026-05"];
const familyNames = ["王", "李", "陳", "林", "張", "黃", "吳", "劉", "蔡", "楊", "郭", "周", "徐", "孫", "朱"];
const givenNames = ["小明", "怡君", "雅婷", "志豪", "佳穎", "柏翰", "宇辰", "佩珊", "品妤", "承恩", "建宏", "美玲", "家豪", "子晴", "芷涵"];
const nationalityTypes = ["本國", "外籍", "陸籍"];
const pickupPoints = ["福澳港", "馬港遊客中心", "介壽獅子市場", "北竿白沙港"];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toMinute(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minuteToDisplay(minute) {
  const h = Math.floor(minute / 60);
  const m = String(minute % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function pickNationality() {
  const n = randomBetween(1, 100);
  if (n <= 70) return nationalityTypes[0];
  if (n <= 93) return nationalityTypes[1];
  return nationalityTypes[2];
}

function randomPhone() {
  return `09${String(randomBetween(0, 99999999)).padStart(8, "0")}`;
}

function randomIdNo() {
  const letters = "ABCDEFGHJKLMNPQRSTUVXYWZIO";
  const first = letters[randomBetween(0, letters.length - 1)];
  return `${first}${randomBetween(1, 2)}${String(randomBetween(0, 99999999)).padStart(8, "0")}`;
}

function randomYesNo(yesRate) {
  return Math.random() < yesRate ? "是" : "否";
}

function generatePassengers(row) {
  const [start, end] = row.shift.split("-");
  const startMinute = toMinute(start);
  const endMinute = toMinute(end);
  const latestRideStart = Math.max(startMinute, endMinute - 60);
  const checkedInCount = row.checkedIn;
  const passengers = [];

  for (let i = 0; i < row.booked; i += 1) {
    const checkedIn = i < checkedInCount;
    const rideStart = randomBetween(startMinute, latestRideStart);
    const rideEnd = rideStart + 60;
    const needEnglish = randomYesNo(0.2);
    const disability = randomYesNo(0.08);
    const shuttle = randomYesNo(0.35);
    const pickupPoint = shuttle === "是" ? pickupPoints[randomBetween(0, pickupPoints.length - 1)] : "-";

    passengers.push({
      name: `${familyNames[randomBetween(0, familyNames.length - 1)]}${givenNames[randomBetween(0, givenNames.length - 1)]}`,
      orderNo: `MTS${row.date.replaceAll("/", "")}${String(row.seq).padStart(3, "0")}${String(i + 1).padStart(3, "0")}`,
      rideTime: `${minuteToDisplay(rideStart)}-${minuteToDisplay(rideEnd)}`,
      phone: randomPhone(),
      idNo: randomIdNo(),
      nationality: pickNationality(),
      shuttle,
      pickupPoint,
      needEnglish,
      disability,
      note: i % 12 === 0 ? "長備註範例：旅客攜帶大型行李與嬰兒車，需協助安排靠近出入口座位，並請工作人員於開航前 20 分鐘完成現場報到與動線引導，若遇天候不佳請主動通知改班資訊。" : disability === "是" ? "需協助上下車" : needEnglish === "是" ? "需英文服務" : "-",
      bookedStatus: "已訂票",
      checkedStatus: checkedIn ? "已驗票" : "未驗票",
    });
  }

  return passengers;
}

function generateData() {
  const rows = [];
  let seq = 1;

  months.forEach((month) => {
    const [year, mm] = month.split("-");
    for (let day = 1; day <= 28; day += 1) {
      const date = `${year}/${mm}/${String(day).padStart(2, "0")}`;
      routes.forEach((route) => {
        shifts.forEach((shift) => {
          const capacity = route.includes("國之北疆線") ? 19 : 25;
          const booked = randomBetween(12, capacity);
          const checkedIn = randomBetween(Math.floor(booked * 0.72), booked);

          rows.push({
            id: `ROW-${seq}`,
            month,
            date,
            route,
            shift,
            capacity,
            booked,
            checkedIn,
            passengers: generatePassengers({ date, shift, booked, checkedIn, seq })
          });
          seq += 1;
        });
      });
    }
  });

  return rows;
}

const rawData = generateData();

const startDateFilter = document.getElementById("startDateFilter");
const endDateFilter = document.getElementById("endDateFilter");
const routeFilter = document.getElementById("routeFilter");
const nameFilter = document.getElementById("nameFilter");
const phoneFilter = document.getElementById("phoneFilter");
const pickupFilter = document.getElementById("pickupFilter");
const reportBody = document.getElementById("reportBody");
const kpiGrid = document.getElementById("kpiGrid");
const rowCount = document.getElementById("rowCount");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportDetailBtn = document.getElementById("exportDetailBtn");
const queryBtn = document.getElementById("queryBtn");
const detailModal = document.getElementById("detailModal");
const detailTitle = document.getElementById("detailTitle");
const detailMeta = document.getElementById("detailMeta");
const detailBody = document.getElementById("detailBody");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const mainPrevBtn = document.getElementById("mainPrevBtn");
const mainNextBtn = document.getElementById("mainNextBtn");
const mainPageInfo = document.getElementById("mainPageInfo");
const detailPrevBtn = document.getElementById("detailPrevBtn");
const detailNextBtn = document.getElementById("detailNextBtn");
const detailPageInfo = document.getElementById("detailPageInfo");

const mainPager = {
  page: 1,
  size: 18,
  rows: []
};

const detailPager = {
  page: 1,
  size: 14,
  row: null
};

function setSelectOptions(select, options, allLabel) {
  select.innerHTML = [`<option value="ALL">${allLabel}</option>`]
    .concat(options.map((x) => `<option value="${x}">${x}</option>`))
    .join("");
}

setSelectOptions(routeFilter, routes, "全部路線");

const allIsoDates = [...new Set(rawData.map((r) => r.date.replaceAll("/", "-")))].sort();
const minDate = allIsoDates[0];
const maxDate = allIsoDates[allIsoDates.length - 1];
startDateFilter.min = minDate;
startDateFilter.max = maxDate;
endDateFilter.min = minDate;
endDateFilter.max = maxDate;

startDateFilter.value = minDate;
endDateFilter.value = maxDate;


function getFiltered() {
  const start = startDateFilter.value || minDate;
  const end = endDateFilter.value || maxDate;
  const nameKeyword = nameFilter.value.trim();
  const phoneKeyword = phoneFilter.value.trim();
  const pickupKeyword = pickupFilter.value.trim();
  const hasPassengerKeyword = Boolean(nameKeyword || phoneKeyword || pickupKeyword);

  return rawData.filter((row) => {
    const routeOk = routeFilter.value === "ALL" || row.route === routeFilter.value;
    const rowDate = row.date.replaceAll("/", "-");
    const dateOk = rowDate >= start && rowDate <= end;

    const passengerOk =
      !hasPassengerKeyword ||
      row.passengers.some((p) => {
        const nameOk = !nameKeyword || p.name.includes(nameKeyword);
        const phoneOk = !phoneKeyword || p.phone.includes(phoneKeyword);
        const pickupOk = !pickupKeyword || p.pickupPoint.includes(pickupKeyword);
        return nameOk && phoneOk && pickupOk;
      });

    return routeOk && dateOk && passengerOk;
  });
}

function pct(n) {
  return `${(n * 100).toFixed(1)}%`;
}

function renderKPI(rows) {
  const totalCapacity = rows.reduce((s, r) => s + r.capacity, 0);
  const totalBooked = rows.reduce((s, r) => s + r.booked, 0);
  const totalChecked = rows.reduce((s, r) => s + r.checkedIn, 0);
  const totalNoShow = totalBooked - totalChecked;

  const bookingRate = totalCapacity === 0 ? 0 : totalBooked / totalCapacity;
  const checkRate = totalBooked === 0 ? 0 : totalChecked / totalBooked;
  const noShowRate = totalBooked === 0 ? 0 : totalNoShow / totalBooked;

  const nationalityCount = { 本國: 0, 外籍: 0, 陸籍: 0 };
  rows.forEach((r) => {
    r.passengers.forEach((p) => {
      if (nationalityCount[p.nationality] !== undefined) {
        nationalityCount[p.nationality] += 1;
      }
    });
  });

  const totalNationality = nationalityCount.本國 + nationalityCount.外籍 + nationalityCount.陸籍;
  const nationalityPct = (n) => (totalNationality === 0 ? "0.0%" : pct(n / totalNationality));

  const cards = [
    { name: "總可售座位", value: totalCapacity, sub: "篩選範圍" },
    { name: "總訂票人數", value: totalBooked, sub: `訂票率 ${pct(bookingRate)}` },
    { name: "總驗票人數", value: totalChecked, sub: `驗票率 ${pct(checkRate)}` },
    { name: "未驗票人數", value: totalNoShow, sub: `未驗票率 ${pct(noShowRate)}` },
    {
      name: "國籍比例",
      value: `本國 ${nationalityPct(nationalityCount.本國)}`,
      sub: `外籍 ${nationalityPct(nationalityCount.外籍)}｜陸籍 ${nationalityPct(nationalityCount.陸籍)}`
    }
  ];

  kpiGrid.innerHTML = cards
    .map(
      (c) => `
      <article class="kpi">
        <p class="name">${c.name}</p>
        <p class="value">${c.value}</p>
        <p class="sub">${c.sub}</p>
      </article>
    `
    )
    .join("");
}

function renderTable(rows) {
  mainPager.rows = rows;
  const totalPages = Math.max(1, Math.ceil(rows.length / mainPager.size));
  if (mainPager.page > totalPages) mainPager.page = totalPages;
  const start = (mainPager.page - 1) * mainPager.size;
  const pagedRows = rows.slice(start, start + mainPager.size);

  rowCount.textContent = `共 ${rows.length} 筆`;
  mainPageInfo.textContent = `第 ${mainPager.page} / ${totalPages} 頁`;
  mainPrevBtn.disabled = mainPager.page <= 1;
  mainNextBtn.disabled = mainPager.page >= totalPages;

  reportBody.innerHTML = pagedRows
    .map((r) => {
      const noShow = r.booked - r.checkedIn;
      const bookingRate = r.booked / r.capacity;
      const checkRate = r.booked === 0 ? 0 : r.checkedIn / r.booked;
      const pillClass = checkRate >= 0.85 ? "good" : "warn";

      return `
      <tr>
        <td>${r.date}</td>
        <td><button class="route-link" data-row-id="${r.id}">${r.route}</button></td>
        <td>${r.shift}</td>
        <td>${r.capacity}</td>
        <td>${r.booked}</td>
        <td>${r.checkedIn}</td>
        <td>${noShow}</td>
        <td>${pct(bookingRate)}</td>
        <td><span class="pill ${pillClass}">${pct(checkRate)}</span></td>
      </tr>
    `;
    })
    .join("");
}

function showPassengerDetail(rowId) {
  const row = rawData.find((r) => r.id === rowId);
  if (!row) return;

  detailPager.row = row;
  detailPager.page = 1;

  renderDetailTable();
  detailModal.classList.remove("hidden");
}

function renderDetailTable() {
  const row = detailPager.row;
  if (!row) return;

  detailTitle.textContent = "路線乘客明細";
  const totalPages = Math.max(1, Math.ceil(row.passengers.length / detailPager.size));
  if (detailPager.page > totalPages) detailPager.page = totalPages;
  const start = (detailPager.page - 1) * detailPager.size;
  const paged = row.passengers.slice(start, start + detailPager.size);

  detailMeta.textContent = `${row.route}｜${row.date}｜${row.shift}｜訂票 ${row.booked} 人｜驗票 ${row.checkedIn} 人`;
  detailPageInfo.textContent = `第 ${detailPager.page} / ${totalPages} 頁`;
  detailPrevBtn.disabled = detailPager.page <= 1;
  detailNextBtn.disabled = detailPager.page >= totalPages;

  detailBody.innerHTML = paged
    .map((p) => {
      const checkedClass = p.checkedStatus === "已驗票" ? "good" : "warn";
      return `
      <tr>
        <td>${row.date}</td>
        <td>${row.shift}</td>
        <td>${p.name}</td>
        <td>${p.orderNo}</td>
        <td>${p.rideTime}</td>
        <td>${p.phone}</td>
        <td>${p.nationality}</td>
        <td>${p.idNo}</td>
        <td>${p.shuttle}</td>
        <td>${p.needEnglish}</td>
        <td>${p.disability}</td>
        <td>${p.note}</td>
        <td>${p.bookedStatus}</td>
        <td><span class="pill ${checkedClass}">${p.checkedStatus}</span></td>
      </tr>
    `;
    })
    .join("");
}

function closePassengerDetail() {
  detailModal.classList.add("hidden");
}

function toCsv(rows) {
  const headers = ["日期", "路線", "班次", "可售座位", "訂票人數", "驗票人數", "未驗票", "訂票率", "驗票率"];
  const lines = rows.map((r) => {
    const noShow = r.booked - r.checkedIn;
    const bookingRate = pct(r.booked / r.capacity);
    const checkRate = pct(r.booked === 0 ? 0 : r.checkedIn / r.booked);
    return [r.date, r.route, r.shift, r.capacity, r.booked, r.checkedIn, noShow, bookingRate, checkRate].join(",");
  });
  return [headers.join(","), ...lines].join("\n");
}

function getRangeTag() {
  const start = (startDateFilter.value || minDate).replaceAll("-", "");
  const end = (endDateFilter.value || maxDate).replaceAll("-", "");
  return `${start}_${end}`;
}
function downloadCsv(rows) {
  const csv = "\uFEFF" + toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${getRangeTag()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toExcelHtml(rows) {
  const header = ["日期", "路線", "班次", "可售座位", "訂票人數", "驗票人數", "未驗票", "訂票率", "驗票率"];
  const trs = rows
    .map((r) => {
      const noShow = r.booked - r.checkedIn;
      const bookingRate = pct(r.booked / r.capacity);
      const checkRate = pct(r.booked === 0 ? 0 : r.checkedIn / r.booked);
      const cols = [r.date, r.route, r.shift, r.capacity, r.booked, r.checkedIn, noShow, bookingRate, checkRate];
      return `<tr>${cols.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`;
    })
    .join("");

  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
</head>
<body>
  <table border="1">
    <thead><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${trs}</tbody>
  </table>
</body>
</html>`;
}

function downloadExcel(rows) {
  const html = toExcelHtml(rows);
  const blob = new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${getRangeTag()}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toDetailExcelHtml(rows) {
  const header = [
    "搭乘日期",
    "路線",
    "班次",
    "姓名",
    "訂單編號",
    "搭乘時間",
    "手機",
    "國籍",
    "身分證",
    "是否接駁",
    "是否需要英文",
    "身心障礙人士",
    "備註",
    "訂票狀態",
    "驗票狀態"
  ];

  const detailRows = [];
  rows.forEach((r) => {
    r.passengers.forEach((p) => {
      detailRows.push([
        r.date,
        r.route,
        r.shift,
        p.name,
        p.orderNo,
        p.rideTime,
        p.phone,
        p.nationality,
        p.idNo,
        p.shuttle,
        p.needEnglish,
        p.disability,
        p.note,
        p.bookedStatus,
        p.checkedStatus
      ]);
    });
  });

  const trs = detailRows
    .map((cols) => `<tr>${cols.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");

  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
</head>
<body>
  <table border="1">
    <thead><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${trs}</tbody>
  </table>
</body>
</html>`;
}

function downloadDetailExcel(rows) {
  const html = toDetailExcelHtml(rows);
  const blob = new Blob(["\uFEFF", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `detail_${getRangeTag()}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function render() {
  const rows = getFiltered();
  renderKPI(rows);
  renderTable(rows);
}

[routeFilter, startDateFilter, endDateFilter, nameFilter, phoneFilter, pickupFilter].forEach((el) =>
  el.addEventListener("change", () => {
    if (startDateFilter.value && endDateFilter.value && startDateFilter.value > endDateFilter.value) {
      endDateFilter.value = startDateFilter.value;
    }
    // 篩選條件變更後，等待按下「查詢」才更新結果
  })
);
exportExcelBtn.addEventListener("click", () => downloadExcel(getFiltered()));
exportDetailBtn.addEventListener("click", () => downloadDetailExcel(getFiltered()));
queryBtn.addEventListener("click", () => {
  mainPager.page = 1;
  render();
});
mainPrevBtn.addEventListener("click", () => {
  if (mainPager.page <= 1) return;
  mainPager.page -= 1;
  renderTable(mainPager.rows);
});
mainNextBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(mainPager.rows.length / mainPager.size));
  if (mainPager.page >= totalPages) return;
  mainPager.page += 1;
  renderTable(mainPager.rows);
});
reportBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".route-link");
  if (!btn) return;
  showPassengerDetail(btn.dataset.rowId);
});
closeDetailBtn.addEventListener("click", closePassengerDetail);
detailPrevBtn.addEventListener("click", () => {
  if (detailPager.page <= 1) return;
  detailPager.page -= 1;
  renderDetailTable();
});
detailNextBtn.addEventListener("click", () => {
  if (!detailPager.row) return;
  const totalPages = Math.max(1, Math.ceil(detailPager.row.passengers.length / detailPager.size));
  if (detailPager.page >= totalPages) return;
  detailPager.page += 1;
  renderDetailTable();
});
detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) closePassengerDetail();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePassengerDetail();
});

render();