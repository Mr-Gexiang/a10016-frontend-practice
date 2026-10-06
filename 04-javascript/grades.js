"use strict";

const gradeDemo = [
  { name: "示例同学甲", score: 92 }, { name: "示例同学乙", score: 45 },
  { name: "示例同学丙", score: 77 }, { name: "示例同学丁", score: 59 },
  { name: "示例同学戊", score: 88 }, { name: "非法示例一", score: 105 },
  { name: "非法示例二", score: -3 }
];

// 接收原始数组，用 filter 清洗范围不合法或格式不合法的成绩。
function cleanGrades(records) {
  return records.filter(record => record && typeof record.name === "string" && record.name.trim() && Number.isFinite(record.score) && record.score >= 0 && record.score <= 100);
}

// 接收有效分数，返回对应等级。
function gradeLevel(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// 接收有效成绩数组，reduce 计算平均与最大值，filter+map 生成不及格名单。
function summarizeGrades(records) {
  const average = records.length ? records.reduce((sum, record) => sum + record.score, 0) / records.length : null;
  return {
    count: records.length,
    average,
    highest: records.length ? records.reduce((max, record) => Math.max(max, record.score), -Infinity) : null,
    averageLevel: average === null ? "—" : gradeLevel(average),
    failedNames: records.filter(record => record.score < 60).map(record => record.name.trim())
  };
}

function renderGrades(records, summary) {
  document.getElementById("student-count").textContent = String(summary.count);
  document.getElementById("average-score").textContent = summary.average === null ? "—" : summary.average.toFixed(2);
  document.getElementById("highest-score").textContent = summary.highest === null ? "—" : String(summary.highest);
  document.getElementById("average-grade").textContent = summary.averageLevel;
  document.getElementById("failed-students").textContent = summary.failedNames.length ? `不及格名单：${summary.failedNames.join("、")}` : "不及格名单：无。";
  const rows = document.getElementById("grade-rows");
  rows.replaceChildren();
  records.forEach(record => {
    const row = document.createElement("tr");
    [record.name.trim(), record.score, gradeLevel(record.score)].forEach(value => {
      const cell = document.createElement("td"); cell.textContent = String(value); row.append(cell);
    });
    rows.append(row);
  });
  document.getElementById("grade-result-empty").hidden = records.length > 0;
}

function calculateGrades() {
  const status = document.getElementById("grade-status");
  try {
    const text = document.getElementById("grade-input").value;
    if (!text.trim()) throw new Error("请输入 JSON 数组；没有成绩时可以输入 []。");
    let records;
    try { records = JSON.parse(text); } catch { throw new Error("JSON 格式错误，请检查引号、逗号和括号。"); }
    if (!Array.isArray(records)) throw new Error("最外层数据必须是数组。");
    const valid = cleanGrades(records);
    const summary = summarizeGrades(valid);
    renderGrades(valid, summary);
    status.className = "status";
    status.textContent = `原始 ${records.length} 条，有效 ${valid.length} 条，过滤非法记录 ${records.length - valid.length} 条。`;
    console.log("班级成绩统计", summary);
    console.table(valid.map(record => ({ ...record, level: gradeLevel(record.score) })));
  } catch (error) {
    renderGrades([], summarizeGrades([]));
    status.className = "status error";
    status.textContent = error.message;
    console.warn("成绩输入校验：", error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("grade-input");
  function useData(records) { input.value = JSON.stringify(records, null, 2); calculateGrades(); }
  document.getElementById("grade-form").addEventListener("submit", event => { event.preventDefault(); calculateGrades(); });
  document.getElementById("grade-demo").addEventListener("click", () => useData(gradeDemo));
  document.getElementById("grade-empty").addEventListener("click", () => useData([]));
  useData(gradeDemo);
});
