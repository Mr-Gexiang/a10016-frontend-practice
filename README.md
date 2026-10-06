# 信息与数据展示中心 校园自习室

姓名：________　学号：________

9项实践按01至09目录排列，每个课堂作业包含案例复现和自主实践。平时大作业一汇总01—03，二汇总04—05，三汇总06—08；09是期末项目。

## 免费运行

无需付费账户、API或后端数据库。所有第三方库及照片都随源码保存。

安装免费的 Python 3，在本目录运行：
```sh
python -m http.server 8000
```
浏览器打开 [http://localhost:8000/](http://localhost:8000/)。含fetch的页面需要通过HTTP访问，不能直接双击HTML。
也可使用免费 VS Code Live Server。Chrome/Edge支持WebGL时可显示三维场景。

## 作业入口

- [1 Git与HTML](01-html/index.html)
- [2 语义化HTML与表单](02-form/index.html)
- [3 响应式布局](03-responsive/index.html)
- [4 JavaScript基础](04-javascript/index.html)
- [5 DOM与交互](05-dom/index.html)
- [6 异步与数据可视化](06-dashboard/index.html)
- [7 浏览器三维](07-3d/index.html)
- [8 技术整合与验收](08-integration/index.html)
- [9 期末信息与数据展示中心](09-final/index.html)

## 数据与状态

使用自建JSON演示数据。预约/Todo保存在当前浏览器的localStorage。06与09页面提供空数据和实际404加载失败入口；切回正常入口即可恢复。
资源来源见 THIRD_PARTY.md。测试记录见 TEST_RESULTS.md。

如8000端口不可用，将命令中的8000改为空闲端口（如8765），并使用相同端口打开网页。

本仓库的提交按实际交付内容分组，日期为真实提交时间；个人学习体会和同伴审查应由本人补充。
