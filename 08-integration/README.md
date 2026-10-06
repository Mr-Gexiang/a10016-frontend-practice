# 技术整合与验收

入口为 `index.html`，案例入口为 `case.html`。导航串联自习室查询、使用统计、三维空间及预约管理。

查询与图表复用 `../09-final/app.js`，统计数据来自 `../06-dashboard/data/rooms.json`。三维页嵌入 `../07-3d/index.html`，预约记录在 `../05-dom/index.html` 中管理并保存在浏览器。

从仓库根目录运行 `python -m http.server 8000`，打开 `http://localhost:8000/08-integration/`。本目录依赖同一仓库中的共享资源，不应单独移动。

验收时检查导航、楼层及关键词筛选、空数据与请求失败提示、小屏幕布局和三维交互。实际测试记录与截图见仓库根目录的 `TEST_RESULTS.md` 和 `evidence/`。
