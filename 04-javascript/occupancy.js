"use strict";

const roomDemo = [
  { room: "图书馆 A101", capacity: 40, occupied: 32 },
  { room: "图书馆 A102", capacity: 36, occupied: 18 },
  { room: "图书馆 B201", capacity: 48, occupied: 45 },
  { room: "图书馆 B202", capacity: 30, occupied: 12 },
  { room: "教学楼 C101", capacity: 60, occupied: 54 },
  { room: "教学楼 C102", capacity: 50, occupied: 25 },
  { room: "教学楼 D201", capacity: 40, occupied: 40 },
  { room: "教学楼 D202", capacity: 32, occupied: 0 }
];

// 接收 JSON 字符串，返回数组；格式错误交给调用方显示。
function parseRoomInput(text) {
  if (!text.trim()) throw new Error("请输入 JSON 数组；没有记录时可以输入 []。");
  let records;
  try { records = JSON.parse(text); } catch { throw new Error("JSON 格式错误，请检查引号、逗号和括号。"); }
  if (!Array.isArray(records)) throw new Error("数据最外层必须是数组，例如 [{\"room\":\"A101\",\"capacity\":40,\"occupied\":20}]。");
  return records;
}

// 检查一条房间对象，返回错误原因；空字符串表示有效。
function roomValidationError(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return "记录必须是对象";
  if (typeof record.room !== "string" || !record.room.trim()) return "房间名称不能为空";
  if (!Number.isSafeInteger(record.capacity) || record.capacity <= 0) return "总座位必须为大于 0 的安全整数";
  if (!Number.isSafeInteger(record.occupied) || record.occupied < 0 || record.occupied > record.capacity) return "已占用必须为 0 至总座位之间的整数";
  return "";
}

// 接收原始数组，使用 filter/map 分离有效对象与非法记录原因。
function cleanRoomData(records) {
  const checked = records.map((record, index) => ({ record, index, error: roomValidationError(record) }));
  return {
    valid: checked.filter(item => !item.error).map(item => ({ ...item.record, room: item.record.room.trim() })),
    invalid: checked.filter(item => item.error).map(item => ({ index: item.index + 1, reason: item.error }))
  };
}

// 接收有效房间数组，返回总座位、占用率、逐房间结果和高占用名单。
function summarizeRooms(records) {
  const totals = records.reduce((sum, room) => ({ capacity: sum.capacity + room.capacity, occupied: sum.occupied + room.occupied }), { capacity: 0, occupied: 0 });
  const rooms = records.map(room => ({ ...room, available: room.capacity - room.occupied, rate: room.occupied / room.capacity * 100 }));
  return {
    rooms,
    totalCapacity: totals.capacity,
    totalOccupied: totals.occupied,
    overallRate: totals.capacity ? totals.occupied / totals.capacity * 100 : null,
    busyRooms: rooms.filter(room => room.rate >= 80).map(room => room.room)
  };
}

function renderRoomSummary(summary, invalid) {
  document.getElementById("room-count").textContent = String(summary.rooms.length);
  document.getElementById("total-capacity").textContent = String(summary.totalCapacity);
  document.getElementById("total-occupied").textContent = String(summary.totalOccupied);
  document.getElementById("overall-rate").textContent = summary.overallRate === null ? "—" : `${summary.overallRate.toFixed(2)}%`;
  document.getElementById("busy-rooms").textContent = summary.busyRooms.length ? `占用率 ≥ 80% 的房间：${summary.busyRooms.join("、")}` : "暂无占用率达到 80% 的房间。";
  const rows = document.getElementById("room-rows");
  rows.replaceChildren();
  summary.rooms.forEach(room => {
    const row = document.createElement("tr");
    [room.room, room.capacity, room.occupied, room.available, `${room.rate.toFixed(2)}%`].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = String(value);
      row.append(cell);
    });
    rows.append(row);
  });
  document.getElementById("result-empty").hidden = summary.rooms.length > 0;
  document.getElementById("invalid-details").hidden = invalid.length === 0;
  const invalidList = document.getElementById("invalid-list");
  invalidList.replaceChildren();
  invalid.forEach(item => {
    const li = document.createElement("li");
    li.className = "invalid";
    li.textContent = `第 ${item.index} 条：${item.reason}`;
    invalidList.append(li);
  });
}

function calculateOccupancy() {
  const status = document.getElementById("input-status");
  try {
    const records = parseRoomInput(document.getElementById("data-input").value);
    const cleaned = cleanRoomData(records);
    const summary = summarizeRooms(cleaned.valid);
    renderRoomSummary(summary, cleaned.invalid);
    status.className = "status";
    status.textContent = `共 ${records.length} 条记录，有效 ${cleaned.valid.length} 条，过滤非法记录 ${cleaned.invalid.length} 条。`;
    console.log("自习室占用率统计", { summary, invalid: cleaned.invalid });
    console.table(summary.rooms);
  } catch (error) {
    renderRoomSummary(summarizeRooms([]), []);
    status.className = "status error";
    status.textContent = error.message;
    console.warn("占用率输入校验：", error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("data-input");
  function useData(records) { input.value = JSON.stringify(records, null, 2); calculateOccupancy(); }
  document.getElementById("occupancy-form").addEventListener("submit", event => { event.preventDefault(); calculateOccupancy(); });
  document.getElementById("demo-button").addEventListener("click", () => useData(roomDemo));
  document.getElementById("invalid-button").addEventListener("click", () => useData([...roomDemo, { room: "非法示例", capacity: 20, occupied: 25 }, { room: "", capacity: -5, occupied: 0 }, null]));
  document.getElementById("empty-button").addEventListener("click", () => useData([]));
  useData(roomDemo);
});
