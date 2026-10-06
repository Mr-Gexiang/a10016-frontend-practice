"use strict";

const form = document.querySelector("form");
const status = form.querySelector(".status");
const range = form.querySelector('input[type="range"]');
const rangeValue = form.querySelector("[data-range-value]");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = form.dataset.success;
});

form.addEventListener("reset", () => {
  status.textContent = "";
  if (range) rangeValue.textContent = range.defaultValue;
});

form.addEventListener("input", () => {
  status.textContent = "";
  if (range) rangeValue.textContent = range.value;
});
