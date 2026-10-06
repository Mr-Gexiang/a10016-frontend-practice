let roomData;
let barChart;
let lineChart;
const statusNode = document.getElementById('status');
const contentNode = document.getElementById('content');

function showMessage(message, isError = false) {
  statusNode.textContent = message;
  statusNode.classList.toggle('error', isError);
  statusNode.hidden = false;
  contentNode.hidden = true;
}

// floor: "all"、"1"或"2"；更新卡片及两张图表，无返回值。
function updateDashboard(floor) {
  const rooms = roomData.rooms.filter(room => floor === 'all' || String(room.floor) === floor);
  if (rooms.length === 0) {
    showMessage('暂无该楼层的数据，请切换楼层或重新加载。');
    return;
  }
  statusNode.hidden = true;
  contentNode.hidden = false;
  const capacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupied = rooms.reduce((sum, room) => sum + room.occupied, 0);
  document.getElementById('available').textContent = capacity - occupied;
  document.getElementById('occupied').textContent = occupied;
  document.getElementById('rate').textContent = capacity ? (occupied / capacity * 100).toFixed(1) : '0.0';
  document.getElementById('source').textContent = `数据来源：${roomData.source}。楼层筛选同时更新统计卡片和两张图表。`;
  if (!barChart) barChart = echarts.init(document.getElementById('room-chart'));
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 40, right: 14, top: 28, bottom: 40 },
    xAxis: { type: 'category', data: rooms.map(room => room.name), axisLabel: { color: '#60776e', interval: 0 } },
    yAxis: { type: 'value', name: '人', minInterval: 1, splitLine: { lineStyle: { color: '#edf2ed' } } },
    series: [{ name: '使用人数', type: 'bar', data: rooms.map(room => room.occupied), barMaxWidth: 38, itemStyle: { color: '#388463', borderRadius: [5, 5, 0, 0] } }]
  });
  const counts = roomData.trend.map(point => floor === 'all' ? point.floor1 + point.floor2 : point[`floor${floor}`]);
  if (lineChart) {
    lineChart.data.labels = roomData.trend.map(point => point.time);
    lineChart.data.datasets[0].data = counts;
    lineChart.update();
  } else {
    lineChart = new Chart(document.getElementById('trend-chart'), {
      type: 'line',
      data: { labels: roomData.trend.map(point => point.time), datasets: [{ label: '使用人数（人）', data: counts, borderColor: '#d6a44b', backgroundColor: 'rgba(214,164,75,0.12)', fill: true, tension: 0.25, pointRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: '人' }, grid: { color: '#edf2ed' } }, x: { grid: { display: false } } } }
    });
  }
  barChart.resize();
  if (lineChart) lineChart.resize();
}

// 从本地JSON读取数据；返回Promise，成功后渲染，失败显示明确提示。
async function loadData() {
  showMessage('正在加载数据……');
  try {
    if (!window.jQuery || !window.echarts || !window.Chart) throw new Error('本地图表库未加载');
    const state = new URLSearchParams(location.search).get('state');
    const file = state === 'empty' ? 'empty.json' : state === 'error' ? 'missing.json' : 'rooms.json';
    const response = await fetch(`data/${file}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`数据请求失败（HTTP ${response.status}）`);
    roomData = await response.json();
    if (!Array.isArray(roomData.rooms) || !Array.isArray(roomData.trend)) throw new Error('数据格式错误');
    if (roomData.rooms.length === 0 || roomData.trend.length === 0) {
      showMessage('暂无统计数据。请使用“正常数据”链接查看完整看板。');
      return;
    }
    updateDashboard(document.getElementById('floor').value);
  } catch (error) {
    showMessage(`加载失败：${error.message}。请检查文件或使用“正常数据”链接重试。`, true);
  }
}

if (window.jQuery) {
  $('#floor').on('change', function () { if (roomData) updateDashboard(this.value); });
  $('#reload').on('click', loadData);
}
window.addEventListener('resize', () => { if (barChart) barChart.resize(); });
loadData();
