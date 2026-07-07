var AI_ORIGIN = "https://ai.icve.com.cn";
var ICVE_ORIGIN = "https://www.icve.com.cn";
var CDN_BASE = "https://fastly.jsdelivr.net/gh/liuhuihou/auto-play-course-main@main/main/";

if (location.origin === AI_ORIGIN || location.origin === ICVE_ORIGIN) {
    loadScript(CDN_BASE + "ai_cont.js");
} else {
    var target = Number(prompt("当前页面不是新版智慧职教+。输入1跳转智慧职教+首页，输入2跳转AI学习中心，其他取消"));

    if (target === 1) {
        location.href = ICVE_ORIGIN + "/index";
    } else if (target === 2) {
        location.href = AI_ORIGIN + "/app/my-excellent-home";
    }
}

function loadScript(src) {
    var script = document.createElement("script");

    script.src = src;
    script.onerror = function () {
        alert("脚本加载失败：" + src);
    };
    (document.body || document.documentElement).appendChild(script);
}
