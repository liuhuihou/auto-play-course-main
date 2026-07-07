# 新版智慧职教+ 脚本

> 适配新版智慧职教+ 与 AI 学习中心。脚本用于课程列表读取、学习页跳转和接口诊断，不自动提交作业、测验或考试。

## 支持页面

| 页面 | 地址 | 行为 |
| --- | --- | --- |
| 智慧职教+ 首页 | `https://www.icve.com.cn/index` | 显示启动面板，引导进入 AI 学习中心 |
| AI 学习中心 | `https://ai.icve.com.cn/app/my-excellent-home` | 读取课程列表，打开学习页，进行接口诊断 |

其他旧版平台入口已经移除，不再支持：

- `https://zjy2.icve.com.cn`
- `https://mooc.icve.com.cn`
- 旧版资源库脚本

## 文件结构

```text
main/app.js      新版入口脚本，负责识别页面并加载 AI 适配器
main/ai_cont.js  新版 AI 学习中心适配器
img/             项目图片资源
```

旧版核心脚本已移除：

```text
main/cont.js
main/cont.min.js
main/special_cont.js
main/special_cont.min.js
智慧职教刷课脚本.js
```

## 快速启动

1. 打开新版智慧职教+ 首页：

```text
https://www.icve.com.cn/index
```

或直接打开 AI 学习中心：

```text
https://ai.icve.com.cn/app/my-excellent-home
```

2. 登录账号。
3. 按 `F12` 打开开发者工具。
4. 切换到 `Console` 控制台。
5. 如果浏览器提示禁止粘贴，先输入：

```text
allow pasting
```

6. 粘贴并执行：

```js
var script = document.createElement("script");
script.src = "https://fastly.jsdelivr.net/gh/liuhuihou/auto-play-course-main@main/main/app.js?v=" + Date.now();
document.body.appendChild(script);
```

## 页面差异

### 在 `www.icve.com.cn/index` 启动

脚本会显示一个轻量面板。

可用功能：

- 显示当前处于智慧职教+ 首页。
- 点击“进入AI学习中心”跳转到 `https://ai.icve.com.cn/app/my-excellent-home`。
- 不读取课程，因为课程接口在 `ai.icve.com.cn/prod-api` 下，需要进入 AI 学习中心后使用。

### 在 `ai.icve.com.cn/app/my-excellent-home` 启动

脚本会显示 AI 学习中心面板。

可用功能：

| 功能 | 说明 |
| --- | --- |
| 进行中 | 读取进行中的课程 |
| 即将开课 | 读取即将开课的课程 |
| 已结束 | 读取已结束课程 |
| 刷新 | 重新请求课程列表 |
| 诊断 | 检查 token、API Base 和课程接口可用性 |
| 进入学习 | 打开课程学习页 |
| 学情统计 | 打开该课程的学情统计页 |

## 脚本原理

### 入口加载

`main/app.js` 会判断当前域名：

```text
https://www.icve.com.cn -> 加载 main/ai_cont.js
https://ai.icve.com.cn  -> 加载 main/ai_cont.js
其他域名                -> 提示跳转到新版页面
```

新版适配器使用原生 DOM 和 `fetch`，不再依赖 jQuery。

### 登录识别

AI 学习中心登录后会写入 `token` cookie。

`main/ai_cont.js` 会读取：

```text
document.cookie 中的 token
```

然后请求时带上：

```text
Authorization: Bearer <token>
```

如果没有 token，说明没有登录或登录态不在当前浏览器环境中，脚本会提示先登录。

### 课程列表接口

课程列表来自新版接口：

```text
GET https://ai.icve.com.cn/prod-api/course/course/myCourseList
```

请求参数：

| 参数 | 说明 |
| --- | --- |
| `queryStatus` | `1` 进行中，`2` 即将开课，`3` 已结束 |
| `courseType` | 当前使用 `1` |
| `pageNum` | 页码 |
| `pageSize` | 每页数量 |

脚本会读取返回的：

```text
rows
total
```

并渲染课程列表。

### 打开学习页

点击“进入学习”时，脚本会先尝试记录访问课程：

```text
GET /prod-api/course/courseInfoStudent/saveStudentVisitCourseInfo
```

然后打开：

```text
https://ai.icve.com.cn/excellent-study/<courseId>/<courseInfoId>
```

### 作业、测验、考试

当前版本不会自动提交：

- 作业
- 习题
- 测验
- 考试

这类内容需要在平台页面手动完成。

## 当前能力边界

已经支持：

- 在 `www.icve.com.cn/index` 启动并跳转 AI 学习中心。
- 在 `ai.icve.com.cn/app/my-excellent-home` 启动。
- 检测登录 token。
- 请求新版课程列表接口。
- 展示课程列表和学习进度。
- 打开课程学习页。
- 打开学情统计页。
- 输出诊断日志。

暂未实现：

- 自动提交学习进度。
- 自动处理视频播放进度。
- 自动处理文档学习进度。
- 自动提交作业、测验、考试。

如果要继续实现学习进度自动提交，需要在登录后的课程学习页抓取新版接口的目录、资源详情和进度提交请求，再单独实现新版学习进度适配器。

## 维护验证

修改后至少执行：

```bash
node --check main/app.js
node --check main/ai_cont.js
```

确认 README 代码块闭合：

```bash
node -e "const fs=require('fs');const t=fs.readFileSync('README.md','utf8');const n=[...t.matchAll(/^```/gm)].length;console.log(n%2===0)"
```

## 发布

提交并推送：

```bash
git add README.md main/app.js main/ai_cont.js
git rm main/cont.js main/cont.min.js main/special_cont.js main/special_cont.min.js "智慧职教刷课脚本.js"
git commit -m "Refactor for new ICVE AI learning center"
git push
```

推送后使用带缓存参数的入口：

```js
var script = document.createElement("script");
script.src = "https://fastly.jsdelivr.net/gh/liuhuihou/auto-play-course-main@main/main/app.js?v=" + Date.now();
document.body.appendChild(script);
```
