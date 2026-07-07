var typeHome = ["https://zjy2.icve.com.cn", "https://mooc.icve.com.cn", "https://www.icve.com.cn"],
    typeIndex = typeHome.indexOf(location.origin);

if (typeIndex === -1) {
    var t = Number(prompt("当前域名无法执行脚本，输入1跳转职教云，输入2跳转智慧职教，输入3跳转资源库，其他取消跳转"));

    if (isNaN(t)) t = 0;

    switch (t) {
        case 1:
        case 2:
        case 3:
            window.location.href = typeHome[t - 1];
            break;
    }
} else {
    loadJQuery(loadCoreScript);
}

function loadScript(src, onload) {
    var script = document.createElement("script");

    script.src = src;
    script.onload = onload;
    script.onerror = function () {
        alert("脚本加载失败：" + src);
    };
    (document.body || document.documentElement).appendChild(script);
}

function loadJQuery(onload) {
    if (window.jQuery) {
        window.$ = window.jQuery;
        onload();
        return;
    }

    loadScript("https://fastly.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js", function () {
        window.$ = window.jQuery;
        onload();
    });
}

function loadCoreScript() {
    loadScript("https://fastly.jsdelivr.net/gh/hsjzhcq/hcqHome@main/main/" + (typeIndex === 2 ? "special_" : "") + "cont.min.js");
}
