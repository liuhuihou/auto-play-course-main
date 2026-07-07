var AI_ORIGIN = "https://ai.icve.com.cn";
var ICVE_ORIGIN = "https://www.icve.com.cn";
var CURRENT_SCRIPT_SRC = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
var CDN_BASE = CURRENT_SCRIPT_SRC
    ? CURRENT_SCRIPT_SRC.slice(0, CURRENT_SCRIPT_SRC.lastIndexOf("/") + 1)
    : "https://fastly.jsdelivr.net/gh/liuhuihou/auto-play-course-main@main/main/";

if (location.origin === AI_ORIGIN || location.origin === ICVE_ORIGIN) {
    loadScript(CDN_BASE + "ai_cont.js");
} else {
    var target = Number(prompt("Unsupported page. Enter 1 for ICVE home, 2 for AI learning center, anything else to cancel."));

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
        alert("Script load failed: " + src);
    };
    (document.body || document.documentElement).appendChild(script);
}
