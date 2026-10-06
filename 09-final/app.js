// 数据读取和筛选在两个整合版本中复用。
let data = {rooms: [], trend: []};
let barChart, lineChart;
const status = document.getElementById('status');
function showStatus(text, error = false) {
 status.textContent = text; status.className = 'status' + (error ? ' error' : '');
}
function filterRooms(rooms, floor, keyword, minimum) {
 return rooms.filter(room => (floor === 'all' || String(room.floor) === floor)
  && room.name.includes(keyword) && room.capacity - room.occupied >= minimum);
}
function summarizeRooms(rooms) {
 const capacity = rooms.reduce((sum,room) => sum + room.capacity,0);
 const occupied = rooms.reduce((sum,room) => sum + room.occupied,0);
 return {capacity, occupied, rate:capacity ? (occupied / capacity * 100).toFixed(2) + '%' : '0.00%'};
}
function renderRooms() {
 if(!data.rooms.length) return;
 const minimumInput = document.getElementById('minimum');
 const minimum = Number(minimumInput.value);
 const container = document.getElementById('room-list'); container.replaceChildren();
 if(minimumInput.value === '' || !Number.isSafeInteger(minimum) || minimum < 0 || minimum > 200) {
  showStatus('空余座位条件必须是0至200之间的整数。',true); return;
 }
 const results = filterRooms(data.rooms,document.getElementById('floor').value,
  document.getElementById('keyword').value.trim(),minimum);
 showStatus(results.length ? `找到 ${results.length} 间自习室。` : '暂无符合条件的自习室。');
 for(const room of results) {
  const article=document.createElement('article'); article.className='panel';
  const title=document.createElement('h2'); title.textContent=room.name+' 自习室'; article.append(title);
  for(const text of [`${room.floor}楼`, `总座位：${room.capacity}`, `占用人数：${room.occupied}`, `空余座位：${room.capacity-room.occupied}`]) {
   const p=document.createElement('p'); p.textContent=text; article.append(p);
  }
  const link=document.createElement('a'); link.href='../05-dom/index.html'; link.textContent='前往预约管理'; article.append(link); container.append(article);
 }
 console.info('查询结果', {count:results.length, minimum});
}
function renderCharts() {
 if(!data.rooms.length) return;
 const floor=document.getElementById('floor').value;
 const rooms=filterRooms(data.rooms,floor,'',0); const summary=summarizeRooms(rooms);
 for(const key of ['capacity','occupied','rate']) document.getElementById(key).textContent=summary[key];
 document.getElementById('verification').textContent=`当前显示 ${rooms.length} 间：总座位 ${summary.capacity}，占用 ${summary.occupied} 人；占用率由占用人数÷总座位计算为 ${summary.rate}。柱状图与房间JSON逐项一致。`;
 if(!barChart) barChart=echarts.init(document.getElementById('bar'));
 barChart.setOption({tooltip:{trigger:'axis'},xAxis:{type:'category',data:rooms.map(r=>r.name)},yAxis:{type:'value',name:'人'},series:[{type:'bar',name:'占用人数',data:rooms.map(r=>r.occupied),itemStyle:{color:'#075985'}}]});
 const values=data.trend.map(point=>floor==='all'?point.floor1+point.floor2:point['floor'+floor]);
 if(lineChart) {lineChart.data.labels=data.trend.map(p=>p.time);lineChart.data.datasets[0].data=values;lineChart.update();}
 else lineChart=new Chart(document.getElementById('line'),{type:'line',data:{labels:data.trend.map(p=>p.time),datasets:[{label:'使用人数（人）',data:values,borderColor:'#075985',backgroundColor:'#bae6fd',tension:0.2}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,title:{display:true,text:'人'}}}}});
 showStatus(`已加载 ${rooms.length} 间房间及 ${data.trend.length} 个时段的数据。`);
 console.info('图表数据核验',summary);
}
async function loadData() {
 showStatus('正在加载数据…');
 const state=new URLSearchParams(location.search).get('state');
 const url=state==='error'?'../09-final/missing.json':state==='empty'?'../09-final/empty.json':'../06-dashboard/data/rooms.json';
 try {
  const response=await fetch(url); if(!response.ok) throw new Error('HTTP '+response.status);
  const json=await response.json();
  if(!Array.isArray(json.rooms)||!Array.isArray(json.trend)) throw new Error('JSON结构不正确');
  data=json;
  if(data.rooms.length===0) {showStatus('暂无自习室数据，请稍后再试。');return;}
  if(document.body.dataset.page==='rooms') renderRooms(); else renderCharts();
 } catch(error) {showStatus('数据加载失败，请检查本地服务器或稍后重试。',true);console.info('已捕获数据加载异常',error.message);}
}
if(document.body.dataset.page==='rooms') {
 $('#filter-form').on('submit',event=>{event.preventDefault();renderRooms();});
 $('#filter-form').on('reset',()=>setTimeout(renderRooms,0));
} else $('#floor').on('change',renderCharts);
window.addEventListener('resize',()=>barChart?.resize());
loadData();
