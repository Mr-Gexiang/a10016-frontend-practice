"use strict";

const BOOKING_STORAGE_KEY = "a10016-study-room-reservations-v1";
const bookingRooms = ["图书馆 A101", "图书馆 A102", "图书馆 B201", "图书馆 B202", "教学楼 C101", "教学楼 C102", "教学楼 D201", "教学楼 D202"];
const bookingSlots = ["08:00—12:00", "14:00—18:00", "19:00—22:00"];
let reservations = [];
let editingId = null;

// 接收预约对象，返回错误文本；空字符串表示四个字段均有效。
function validateReservation(record) {
  if (!record || typeof record !== "object") return "预约数据格式不正确。";
  if (typeof record.nickname !== "string" || !record.nickname.trim() || record.nickname.trim().length > 20) return "预约昵称须为 1—20 个字，不能只含空格。";
  if (!bookingRooms.includes(record.room)) return "请选择有效的自习室。";
  if (typeof record.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) return "请选择有效的预约日期。";
  const date = new Date(`${record.date}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== record.date) return "预约日期无效。";
  if (!bookingSlots.includes(record.slot)) return "请选择有效的预约时段。";
  return "";
}

function bookingMessage(text, isError = false) {
  const status = document.getElementById("booking-status");
  status.textContent = text;
  status.className = isError ? "status error" : "status";
}

// 将当前数组序列化保存，成功返回 true；失败在页面提示。
function saveReservations() {
  try { localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(reservations)); return true; }
  catch { bookingMessage("记录已更新，但浏览器未允许本地保存，刷新后可能丢失。", true); return false; }
}

// 从 JSON 恢复数组，并检查存储记录的结构。
function loadReservations() {
  try {
    const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!saved) return [];
    const records = JSON.parse(saved);
    if (!Array.isArray(records)) throw new Error("存储格式错误");
    const valid = records.filter(record => typeof record?.id === "string" && !validateReservation(record));
    if (valid.length !== records.length) bookingMessage("已忽略格式不正确的本地记录。", true);
    return valid;
  } catch { bookingMessage("无法恢复本地记录，当前以空列表启动。", true); return []; }
}

// 接收数组、搜索词和房间值，返回同时满足两个筛选条件的数组。
function filterReservations(records, query, room) {
  const keyword = query.trim().toLowerCase();
  return records.filter(record => (room === "all" || record.room === room) && [record.nickname, record.room, record.date, record.slot].some(value => value.toLowerCase().includes(keyword)));
}

function resetBookingForm() {
  editingId = null;
  document.getElementById("reservation-form").reset();
  document.getElementById("form-heading").textContent = "新增预约";
  document.getElementById("save-button").textContent = "添加预约";
  document.getElementById("cancel-edit").hidden = true;
}

function editReservation(id) {
  const record = reservations.find(item => item.id === id);
  if (!record) return;
  editingId = id;
  document.getElementById("nickname").value = record.nickname;
  document.getElementById("room").value = record.room;
  document.getElementById("booking-date").value = record.date;
  document.getElementById("time-slot").value = record.slot;
  document.getElementById("form-heading").textContent = "修改预约";
  document.getElementById("save-button").textContent = "保存修改";
  document.getElementById("cancel-edit").hidden = false;
  bookingMessage("正在修改选中的预约。修改后点击保存。");
  document.getElementById("nickname").focus();
}

function deleteReservation(id) {
  reservations = reservations.filter(record => record.id !== id);
  if (editingId === id) resetBookingForm();
  if (saveReservations()) bookingMessage("预约已删除。");
  renderReservations();
}

// 从数组统一生成表格；用户内容只通过 textContent 写入。
function renderReservations() {
  const visible = filterReservations(reservations, document.getElementById("booking-search").value, document.getElementById("room-filter").value);
  const rows = document.getElementById("booking-rows");
  rows.replaceChildren();
  visible.forEach(record => {
    const row = document.createElement("tr");
    [record.nickname, record.room, record.date, record.slot].forEach(value => {
      const cell = document.createElement("td"); cell.textContent = value; row.append(cell);
    });
    const actions = document.createElement("td");
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "secondary"; edit.textContent = "修改";
    edit.setAttribute("aria-label", `修改 ${record.nickname} 的预约`);
    edit.addEventListener("click", () => editReservation(record.id));
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "danger"; remove.textContent = "删除";
    remove.setAttribute("aria-label", `删除 ${record.nickname} 的预约`);
    remove.addEventListener("click", () => deleteReservation(record.id));
    actions.append(edit, remove); row.append(actions); rows.append(row);
  });
  document.getElementById("booking-count").textContent = `共 ${reservations.length} 条预约，当前显示 ${visible.length} 条。`;
  const empty = document.getElementById("booking-empty");
  empty.hidden = visible.length > 0;
  empty.textContent = reservations.length ? "没有符合查询条件的预约。" : "还没有预约记录，请填写表单或添加示例记录。";
}

function submitReservation(event) {
  event.preventDefault();
  const record = {
    id: editingId || crypto.randomUUID(),
    nickname: document.getElementById("nickname").value.trim(),
    room: document.getElementById("room").value,
    date: document.getElementById("booking-date").value,
    slot: document.getElementById("time-slot").value
  };
  const error = validateReservation(record);
  if (error) { bookingMessage(error, true); return; }
  if (reservations.some(item => item.id !== record.id && item.nickname === record.nickname && item.room === record.room && item.date === record.date && item.slot === record.slot)) {
    bookingMessage("该昵称已在同一房间、日期和时段预约，请勿重复添加。", true); return;
  }
  const wasEditing = Boolean(editingId);
  if (editingId) reservations = reservations.map(item => item.id === editingId ? record : item);
  else reservations.push(record);
  resetBookingForm();
  if (saveReservations()) bookingMessage(wasEditing ? "预约已修改并保存。" : "预约已添加并保存。");
  renderReservations();
}

function addBookingSamples() {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const samples = [
    { nickname: "示例用户甲", room: "图书馆 A101", date, slot: bookingSlots[0] },
    { nickname: "示例用户乙", room: "图书馆 B201", date, slot: bookingSlots[1] },
    { nickname: "示例用户丙", room: "教学楼 C101", date, slot: bookingSlots[2] }
  ];
  let count = 0;
  samples.forEach(sample => {
    if (!reservations.some(record => record.nickname === sample.nickname && record.room === sample.room && record.date === sample.date && record.slot === sample.slot)) {
      reservations.push({ id: crypto.randomUUID(), ...sample }); count += 1;
    }
  });
  if (saveReservations()) bookingMessage(`已添加 ${count} 条示例记录；已存在的示例不会重复添加。`);
  renderReservations();
}

document.addEventListener("DOMContentLoaded", () => {
  reservations = loadReservations();
  document.getElementById("reservation-form").addEventListener("submit", submitReservation);
  document.getElementById("cancel-edit").addEventListener("click", () => { resetBookingForm(); bookingMessage("已取消修改。"); });
  document.getElementById("sample-button").addEventListener("click", addBookingSamples);
  document.getElementById("booking-search").addEventListener("input", renderReservations);
  document.getElementById("room-filter").addEventListener("change", renderReservations);
  renderReservations();
});
