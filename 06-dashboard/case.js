let bookChart;

async function loadBooks() {
  const status = document.getElementById('status');
  try {
    if (!window.echarts || !window.Chart) throw new Error('本地图表库未加载');
    const response = await fetch('data/books.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.category.length || !data.months.length) {
      status.textContent = '暂无图书统计数据。';
      return;
    }
    document.getElementById('title').textContent = data.title;
    document.getElementById('category-total').textContent = data.category.length;
    document.getElementById('book-total').textContent = data.counts.reduce((sum, n) => sum + n, 0);
    document.getElementById('borrow-total').textContent = data.series.reduce((sum, n) => sum + n, 0);
    status.hidden = true;
    document.getElementById('content').hidden = false;
    bookChart = echarts.init(document.getElementById('book-chart'));
    bookChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 16, top: 28, bottom: 36 },
      xAxis: { type: 'category', data: data.category },
      yAxis: { type: 'value', name: '册' },
      series: [{ name: '藏书量', type: 'bar', data: data.counts, barMaxWidth: 46, itemStyle: { color: '#388463', borderRadius: [5, 5, 0, 0] } }]
    });
    new Chart(document.getElementById('borrow-chart'), {
      type: 'line',
      data: { labels: data.months, datasets: [{ label: '借阅量（册）', data: data.series, borderColor: '#d6a44b', backgroundColor: 'rgba(214,164,75,0.12)', fill: true, tension: 0.25 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: '册' } }, x: { grid: { display: false } } } }
    });
  } catch (error) {
    status.classList.add('error');
    status.textContent = `加载失败：${error.message}。请通过本地HTTP服务器打开页面并检查数据文件。`;
  }
}

window.addEventListener('resize', () => { if (bookChart) bookChart.resize(); });
loadBooks();
