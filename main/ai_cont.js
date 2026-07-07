(function () {
    var AI_ORIGIN = "https://ai.icve.com.cn";
    var ICVE_ORIGIN = "https://www.icve.com.cn";
    var PANEL_ID = "hcq-ai-panel";
    var STYLE_ID = "hcq-ai-style";
    var API_BASE = AI_ORIGIN + "/prod-api";
    var isAiOrigin = location.origin === AI_ORIGIN;
    var state = {
        queryStatus: "1",
        courseType: 1,
        pageNum: 1,
        pageSize: 10,
        total: 0,
        courses: []
    };

    if (document.getElementById(PANEL_ID)) {
        alert("脚本面板已存在，请不要重复加载");
        return;
    }

    addStyle();
    addPanel();
    bindEvents();
    log("AI 学习中心适配器已启动");
    log("当前版本支持课程读取和学习页跳转，不自动提交作业、测验或考试");
    if (isAiOrigin) {
        refreshCourses();
    } else {
        renderGateway();
    }

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = [
            "#hcq-ai-panel{position:fixed;right:20px;top:80px;z-index:999999;width:420px;max-height:calc(100vh - 120px);background:#fff;border:1px solid #d8dde8;box-shadow:0 10px 30px rgba(15,23,42,.18);font-family:Arial,'Microsoft YaHei',sans-serif;color:#1f2937;font-size:14px;display:flex;flex-direction:column}",
            "#hcq-ai-panel *{box-sizing:border-box}",
            "#hcq-ai-panel .hcq-ai-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #e5e7eb;background:#f8fafc}",
            "#hcq-ai-panel .hcq-ai-title{font-weight:700}",
            "#hcq-ai-panel .hcq-ai-close{border:0;background:transparent;font-size:20px;line-height:20px;cursor:pointer;color:#64748b}",
            "#hcq-ai-panel .hcq-ai-body{overflow:auto;padding:12px}",
            "#hcq-ai-panel .hcq-ai-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}",
            "#hcq-ai-panel button{border:1px solid #cbd5e1;background:#fff;color:#0f172a;padding:6px 10px;cursor:pointer;border-radius:4px}",
            "#hcq-ai-panel button.active{background:#2563eb;color:#fff;border-color:#2563eb}",
            "#hcq-ai-panel button.primary{background:#16a34a;color:#fff;border-color:#16a34a}",
            "#hcq-ai-panel button.warn{background:#f59e0b;color:#111827;border-color:#f59e0b}",
            "#hcq-ai-panel .hcq-ai-note{padding:8px 10px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;margin-bottom:10px;line-height:1.5}",
            "#hcq-ai-panel .hcq-ai-log{height:90px;overflow:auto;background:#0f172a;color:#d1fae5;padding:8px;font-family:Consolas,monospace;font-size:12px;margin-bottom:10px;white-space:pre-wrap}",
            "#hcq-ai-panel .hcq-ai-list{display:flex;flex-direction:column;gap:8px}",
            "#hcq-ai-panel .hcq-ai-course{border:1px solid #e5e7eb;padding:10px;background:#fff}",
            "#hcq-ai-panel .hcq-ai-course h4{margin:0 0 6px;font-size:14px;color:#111827;line-height:1.4}",
            "#hcq-ai-panel .hcq-ai-meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;color:#64748b;font-size:12px;margin-bottom:8px}",
            "#hcq-ai-panel .hcq-ai-progress{height:8px;background:#e5e7eb;overflow:hidden;margin-bottom:8px}",
            "#hcq-ai-panel .hcq-ai-progress span{display:block;height:100%;background:#2563eb}",
            "#hcq-ai-panel .hcq-ai-empty{padding:20px;text-align:center;color:#64748b;border:1px dashed #cbd5e1}",
            "#hcq-ai-panel .hcq-ai-foot{display:flex;align-items:center;justify-content:space-between;margin-top:10px;color:#64748b;font-size:12px}"
        ].join("");
        document.head.appendChild(style);
    }

    function addPanel() {
        var panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.innerHTML = [
            '<div class="hcq-ai-head">',
            '  <div class="hcq-ai-title">AI 学习中心脚本</div>',
            '  <button class="hcq-ai-close" type="button" title="关闭">×</button>',
            '</div>',
            '<div class="hcq-ai-body">',
            '  <div class="hcq-ai-actions">',
            '    <button type="button" data-status="1" class="active">进行中</button>',
            '    <button type="button" data-status="2">即将开课</button>',
            '    <button type="button" data-status="3">已结束</button>',
            '    <button type="button" data-action="refresh" class="primary">刷新</button>',
            '    <button type="button" data-action="diagnose">诊断</button>',
            '    <button type="button" data-action="open-ai" class="warn">进入AI学习中心</button>',
            '  </div>',
            '  <div class="hcq-ai-note">作业、习题、测验、考试需要手动完成。当前适配器只读取课程并打开学习页，不自动提交答案。</div>',
            '  <div class="hcq-ai-log" id="hcq-ai-log"></div>',
            '  <div class="hcq-ai-list" id="hcq-ai-list"></div>',
            '  <div class="hcq-ai-foot">',
            '    <span id="hcq-ai-page"></span>',
            '    <span><button type="button" data-action="prev">上一页</button> <button type="button" data-action="next">下一页</button></span>',
            '  </div>',
            '</div>'
        ].join("");
        document.body.appendChild(panel);
    }

    function bindEvents() {
        var panel = document.getElementById(PANEL_ID);

        panel.addEventListener("click", function (event) {
            var target = event.target;
            var status = target.getAttribute("data-status");
            var action = target.getAttribute("data-action");

            if (target.className === "hcq-ai-close") {
                panel.remove();
                return;
            }

            if (status) {
                state.queryStatus = status;
                state.pageNum = 1;
                setActiveStatus(status);
                refreshCourses();
                return;
            }

            if (action === "refresh") refreshCourses();
            if (action === "diagnose") diagnose();
            if (action === "open-ai") location.href = AI_ORIGIN + "/app/my-excellent-home";
            if (action === "prev" && state.pageNum > 1) {
                state.pageNum--;
                refreshCourses();
            }
            if (action === "next" && state.pageNum * state.pageSize < state.total) {
                state.pageNum++;
                refreshCourses();
            }
        });
    }

    function setActiveStatus(status) {
        var buttons = document.querySelectorAll("#" + PANEL_ID + " [data-status]");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.toggle("active", buttons[i].getAttribute("data-status") === status);
        }
    }

    async function refreshCourses() {
        try {
            if (!isAiOrigin) {
                renderGateway();
                log("当前在智慧职教+首页，请进入 AI 学习中心后读取课程");
                return;
            }
            requireLogin();
            log("正在读取课程列表...");
            var data = await apiGet("/course/courseInfo/myCourse", {
                queryStatus: state.queryStatus,
                courseType: state.courseType,
                pageNum: state.pageNum,
                pageSize: state.pageSize
            });

            state.courses = data.rows || data.data || data.list || [];
            state.total = Number(data.total || state.courses.length || 0);
            renderCourses();
            log("课程列表读取完成，共 " + state.total + " 门");
        } catch (error) {
            renderEmpty(error.message);
            log("读取失败：" + error.message);
        }
    }

    function renderCourses() {
        var list = document.getElementById("hcq-ai-list");
        var page = document.getElementById("hcq-ai-page");

        page.textContent = "第 " + state.pageNum + " 页 / 共 " + state.total + " 条";

        if (!state.courses.length) {
            renderEmpty("当前分类没有课程");
            return;
        }

        list.innerHTML = "";
        state.courses.forEach(function (course) {
            var item = document.createElement("div");
            var progress = normalizePercent(course.studySpeed || course.progress || course.schedule || 0);
            item.className = "hcq-ai-course";
            item.innerHTML = [
                "<h4>" + escapeHtml(course.courseName || course.title || course.name || "未命名课程") + "</h4>",
                '<div class="hcq-ai-meta">',
                "  <span>课程 ID：" + escapeHtml(course.courseId || "-") + "</span>",
                "  <span>开课 ID：" + escapeHtml(course.id || course.courseInfoId || "-") + "</span>",
                "  <span>开始：" + escapeHtml(course.startTime || "-") + "</span>",
                "  <span>结束：" + escapeHtml(course.endTime || "-") + "</span>",
                "</div>",
                '<div class="hcq-ai-progress"><span style="width:' + progress + '%"></span></div>',
                '<div class="hcq-ai-actions">',
                '  <button type="button" class="primary" data-open-course>进入学习</button>',
                '  <button type="button" data-open-stat>学情统计</button>',
                "</div>"
            ].join("");

            item.querySelector("[data-open-course]").addEventListener("click", function () {
                openCourse(course);
            });
            item.querySelector("[data-open-stat]").addEventListener("click", function () {
                openCoursePage(course, "statistics");
            });
            list.appendChild(item);
        });
    }

    function renderEmpty(message) {
        document.getElementById("hcq-ai-list").innerHTML = '<div class="hcq-ai-empty">' + escapeHtml(message) + "</div>";
        document.getElementById("hcq-ai-page").textContent = "";
    }

    async function openCourse(course) {
        if (String(course.isKczt) === "0") {
            alert("课程未开放，请联系老师");
            return;
        }

        try {
            await apiGet("/course/courseInfoStudent/saveStudentVisitCourseInfo", {
                courseInfoId: course.id || course.courseInfoId
            });
        } catch (error) {
            log("记录访问课程失败，可继续打开学习页：" + error.message);
        }

        openCoursePage(course);
    }

    function openCoursePage(course, subPage) {
        var courseId = course.courseId;
        var courseInfoId = course.id || course.courseInfoId;

        if (!courseId || !courseInfoId) {
            alert("课程数据缺少 courseId 或 courseInfoId，无法打开");
            return;
        }

        var path = subPage === "statistics"
            ? "/app/my-excellent-home/" + encodeURIComponent(courseId) + "/" + encodeURIComponent(courseInfoId) + "/statistics"
            : "/excellent-study/" + encodeURIComponent(courseId) + "/" + encodeURIComponent(courseInfoId);
        window.open(AI_ORIGIN + path, "_blank");
    }

    async function diagnose() {
        var token = getCookie("token");
        log("当前域名：" + location.origin);
        log("运行模式：" + (isAiOrigin ? "AI 学习中心" : "智慧职教+首页引导"));
        log("Token：" + (token ? "已找到" : "未找到"));
        log("API Base：" + API_BASE);

        if (!isAiOrigin) {
            log("当前页面不读取课程，请点击“进入AI学习中心”后登录并重新执行");
            return;
        }

        if (!token) {
            log("请先完成登录，再重新执行脚本");
            return;
        }

        try {
            var data = await apiGet("/course/courseInfo/myCourse", {
                queryStatus: "1",
                courseType: 1,
                pageNum: 1,
                pageSize: 1
            });
            log("课程接口可用，返回字段：" + Object.keys(data).join(", "));
        } catch (error) {
            log("课程接口不可用：" + error.message);
        }
    }

    function requireLogin() {
        if (!getCookie("token")) {
            throw new Error("未检测到登录 token，请先登录 ai.icve.com.cn 后再执行脚本");
        }
    }

    function renderGateway() {
        renderEmpty("当前在智慧职教+首页。点击“进入AI学习中心”，登录后在 AI 学习中心页面重新执行入口脚本。");
        document.getElementById("hcq-ai-page").textContent = "入口页：" + ICVE_ORIGIN + "/index";
    }

    async function apiGet(path, params) {
        var url = API_BASE + path + "?" + new URLSearchParams(params || {}).toString();
        var response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Authorization": "Bearer " + getCookie("token"),
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        var data = await response.json();
        if (data.code && Number(data.code) !== 200) {
            throw new Error(data.msg || data.message || ("接口返回 code=" + data.code));
        }
        return data;
    }

    function getCookie(name) {
        var target = name + "=";
        var parts = document.cookie.split(";");
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i].trim();
            if (part.indexOf(target) === 0) return decodeURIComponent(part.slice(target.length));
        }
        return "";
    }

    function normalizePercent(value) {
        var number = Number(value);
        if (!isFinite(number)) return 0;
        if (number < 0) return 0;
        if (number > 100) return 100;
        return number;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function log(message) {
        var box = document.getElementById("hcq-ai-log");
        if (!box) return;

        var time = new Date().toLocaleTimeString();
        box.textContent += "[" + time + "] " + message + "\n";
        box.scrollTop = box.scrollHeight;
    }
})();
