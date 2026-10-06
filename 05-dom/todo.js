"use strict";

const TODO_STORAGE_KEY = "a10016-todo-v1";
let todos = [];
let todoFilter = "all";

function todoMessage(text, isError = false) {
  const status = document.getElementById("todo-status");
  status.textContent = text;
  status.className = isError ? "status error" : "status";
}

// 将 Todo 数组转换为 JSON 保存，返回是否保存成功。
function saveTodos() {
  try { localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos)); return true; }
  catch { todoMessage("列表已更新，但浏览器不允许本地保存，刷新后可能丢失。", true); return false; }
}

function loadTodos() {
  try {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);
    if (!saved) return [];
    const records = JSON.parse(saved);
    if (!Array.isArray(records)) throw new Error("存储格式错误");
    const valid = records.filter(record => record && typeof record.id === "string" && typeof record.text === "string" && record.text.trim().length > 0 && record.text.trim().length <= 100 && typeof record.completed === "boolean");
    if (valid.length !== records.length) todoMessage("已忽略格式不正确的本地待办记录。", true);
    return valid;
  } catch { todoMessage("本地待办数据无法恢复，当前以空列表启动。", true); return []; }
}

// 接收任务数组和状态，返回全部、未完成或已完成任务。
function filterTodos(records, filter) {
  return records.filter(todo => filter === "all" || (filter === "completed" ? todo.completed : !todo.completed));
}

function toggleTodo(id) {
  todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
  if (saveTodos()) todoMessage("完成状态已更新。");
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  if (saveTodos()) todoMessage("待办已删除。");
  renderTodos();
}

// 数组是数据来源，使用安全的 DOM 节点创建列表。
function renderTodos() {
  const visible = filterTodos(todos, todoFilter);
  const list = document.getElementById("todo-list");
  list.replaceChildren();
  visible.forEach(todo => {
    const item = document.createElement("li"); item.className = todo.completed ? "todo-item completed" : "todo-item";
    const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "secondary";
    toggle.textContent = todo.completed ? "已完成" : "标记完成";
    toggle.setAttribute("aria-pressed", String(todo.completed));
    toggle.setAttribute("aria-label", `${todo.completed ? "撤销完成" : "完成"}：${todo.text}`);
    toggle.addEventListener("click", () => toggleTodo(todo.id));
    const text = document.createElement("span"); text.className = "todo-text"; text.textContent = todo.text;
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "danger"; remove.textContent = "删除";
    remove.setAttribute("aria-label", `删除：${todo.text}`); remove.addEventListener("click", () => deleteTodo(todo.id));
    item.append(toggle, text, remove); list.append(item);
  });
  document.getElementById("todo-count").textContent = `共 ${todos.length} 条，已完成 ${todos.filter(todo => todo.completed).length} 条，当前显示 ${visible.length} 条。`;
  const empty = document.getElementById("todo-empty"); empty.hidden = visible.length > 0;
  empty.textContent = todos.length ? "当前筛选下没有待办。" : "还没有待办，添加一条试试。";
  document.querySelectorAll("[data-filter]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === todoFilter)));
}

function addTodo(event) {
  event.preventDefault();
  const input = document.getElementById("todo-input");
  const text = input.value.trim();
  if (!text || text.length > 100) { todoMessage("待办内容须为 1—100 个字，不能只含空格。", true); input.focus(); return; }
  todos.push({ id: crypto.randomUUID(), text, completed: false });
  input.value = "";
  if (saveTodos()) todoMessage("待办已添加并保存。");
  renderTodos();
  input.focus();
}

document.addEventListener("DOMContentLoaded", () => {
  todos = loadTodos();
  document.getElementById("todo-form").addEventListener("submit", addTodo);
  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => { todoFilter = button.dataset.filter; renderTodos(); }));
  renderTodos();
});
