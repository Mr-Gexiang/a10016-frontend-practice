# 信息与数据展示中心：校园自习室

入口为 `index.html`。`rooms.html` 按楼层、房间名称与空余座位查询；`statistics.html` 显示柱形图和折线图；`scene.html` 展示可旋转、缩放、暂停和换色的三维自习室。

页面使用本地免费前端库和自建演示JSON；预约入口链接到 `../05-dom/index.html`，记录仅保存在当前浏览器。空数据及HTTP404失败入口位于查询和统计页。

从仓库根目录运行 `python -m http.server 8000`，打开 `http://localhost:8000/09-final/`。包含fetch的页面需通过HTTP访问，三维显示需要支持WebGL的浏览器。

姓名、学号留空待填写。资源来源、实际测试和截图分别见仓库根目录的 `THIRD_PARTY.md`、`TEST_RESULTS.md` 和 `evidence/`。
