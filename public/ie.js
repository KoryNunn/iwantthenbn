var notSupportedBrowsers = [{os: "Any",browser: "MSIE",version: 8}], displayPoweredBy = !1, noticeLang = "professional", noticeLangCustom = null, supportedBrowsers = [], BrowserDetection = {init: function() {
        var t, n;
        if ((notSupportedBrowsers == null || notSupportedBrowsers.length < 1) && (notSupportedBrowsers = this.defaultNotSupportedBrowsers), this.detectBrowser(), this.detectOS(), this.browser != "" && this.browser != "Unknown" && this.os != "" && this.os != "Unknown" && this.browserVersion != "" && this.browserVersion != 0) {
            for (t = !1, n = 0; n < notSupportedBrowsers.length; n++)
                if ((notSupportedBrowsers[n].os == "Any" || notSupportedBrowsers[n].os == this.os) && (notSupportedBrowsers[n].browser == "Any" || notSupportedBrowsers[n].browser == this.browser) && (notSupportedBrowsers[n].version == "Any" || this.browserVersion <= parseFloat(notSupportedBrowsers[n].version))) {
                    t = !0;
                    break
                }
            t && this.displayNotice()
        }
    },getEl: function(n) {
        return window.document.getElementById(n)
    },getElSize: function(n) {
        var t = this.getEl(n);
        return t == null ? null : {width: parseInt(t.offsetWidth),height: parseInt(t.offsetHeight)}
    },getWindowSize: function() {
        return typeof window.innerWidth != "undefined" ? {width: parseInt(window.innerWidth),height: parseInt(window.innerHeight)} : window.document.documentElement.clientWidth != 0 ? {width: parseInt(window.document.documentElement.clientWidth),height: parseInt(window.document.documentElement.clientHeight)} : {width: parseInt(window.document.body.clientWidth),height: parseInt(window.document.body.clientHeight)}
    },positionNotice: function() {
        var t = this.getElSize("browser-detection"), n = this.getWindowSize(), i = this.getEl("browser-detection"), r;
        i != null && t != null && n != null && n.width && n.height && (i.style.left = (n.width - t.width) / 2 + "px", r = this.browser == "MSIE" && this.browserVersion < 7 ? window.document.documentElement.scrollTop != 0 ? window.document.documentElement.scrollTop : window.document.body.scrollTop : 0, i.style.top = n.height / 2 - t.height / 2 - 20 + "px", this.noticeHeight = t.height)
    },displayNotice: function() {
        if (this.readCookie("bdnotice") != 1) {
            this.writeNoticeCode(), this.positionNotice();
            var n = this;
            window.onresize = function() {
                n.positionNotice()
            }, this.browser == "MSIE" && this.browserVersion < 7 && (window.onscroll = function() {
                n.positionNotice()
            })
        }
    },remindMe: function(n) {
        this.writeCookie("bdnotice", 1, n == !0 ? 365 : 7), this.getEl("browser-detection").style.display = "none", this.getEl("black_overlay").style.display = "none"
    },writeCookie: function(n, t, i) {
        var u = "", r;
        parseInt(i) > 0 && (r = new Date, r.setTime(r.getTime() + parseInt(i) * 864e5), u = "; expires=" + r.toGMTString()), document.cookie = n + "=" + t + u + "; path=/"
    },readCookie: function(n) {
        var r, i, t;
        if (!document.cookie)
            return "";
        for (r = n + "=", i = document.cookie.split(";"), t = 0; t < i.length; t++) {
            while (i[t].charAt(0) == " ")
                i[t] = i[t].substring(1, i[t].length);
            if (i[t].indexOf(r) == 0)
                return i[t].substring(r.length, i[t].length)
        }
        return ""
    },writeNoticeCode: function() {
        var title = "", notice = "", selectBrowser = "", remindMeLater = "", neverRemindAgain = "", browsersList = null, code = '<div id="black_overlay"></div><div id="browser-detection">', noticeTextObj, i;
        for (noticeLang == "custom" && noticeLangCustom != null ? (title = noticeLangCustom.title, notice = noticeLangCustom.notice, selectBrowser = noticeLangCustom.selectBrowser) : (noticeTextObj = null, eval("noticeTextObj = this.noticeText." + noticeLang + ";"), noticeTextObj || (noticeTextObj = this.noticeText.professional), title = noticeTextObj.title, notice = noticeTextObj.notice, selectBrowser = noticeTextObj.selectBrowser), notice = notice.replace("\n", '</p><p class="bd-notice">'), notice = notice.replace("{browser_name}", this.browser + " " + this.browserVersion), code += '<p class="bd-title">' + title + '</p><p class="bd-notice">' + notice + '</p><p class="bd-notice"><b>' + selectBrowser + "</b></p>", browsersList = supportedBrowsers.length > 0 ? supportedBrowsers : this.supportedBrowsers, code += '<ul class="bd-browsers-list">', i = 0; i < browsersList.length; i++)
            code += '<li class="' + browsersList[i].cssClass + '"><a href="' + browsersList[i].downloadUrl + '" target="_blank">' + browsersList[i].name + "</a></li>";
        code += "</ul>", displayPoweredBy && (code += '<div class="bd-poweredby">Powered by <a href="http://www.devslide.com/labs/browser-detection" target="_blank">DevSlide Labs</a></div>'), code += "</div>", window.document.body.innerHTML += code
    },detectBrowser: function() {
        this.browser = "", this.browserVersion = 0, /Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? this.browser = "Opera" : /MSIE (\d+\.\d+);/.test(navigator.userAgent) ? this.browser = "MSIE" : /Navigator[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? this.browser = "Netscape" : /Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? this.browser = "Chrome" : /Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent) ? (this.browser = "Safari", /Version[\/\s](\d+\.\d+)/.test(navigator.userAgent), this.browserVersion = new Number(RegExp.$1)) : /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && (this.browser = "Firefox"), this.browser == "" ? this.browser = "Unknown" : this.browserVersion == 0 && (this.browserVersion = parseFloat(new Number(RegExp.$1)))
    },detectOS: function() {
        for (var n = 0; n < this.operatingSystems.length; n++)
            if (this.operatingSystems[n].searchString.indexOf(this.operatingSystems[n].subStr) != -1) {
                this.os = this.operatingSystems[n].name;
                return
            }
        this.os = "Unknown"
    },noticeHeight: 0,browser: "",os: "",browserVersion: "",supportedBrowsers: [
        {cssClass: "chrome",name: "Google Chrome",downloadUrl: "http://www.google.com/chrome/"},
        {cssClass: "firefox",name: "Mozilla Firefox",downloadUrl: "http://www.mozilla.org/en-US/firefox/new/"}
    ],operatingSystems: [{searchString: navigator.platform,name: "Windows",subStr: "Win"}, 
    {searchString: navigator.platform,name: "Mac",subStr: "Mac"},
    {searchString: navigator.platform,name: "Linux",subStr: "Linux"},
    {searchString: navigator.userAgent,name: "iPhone",subStr: "iPhone/iPod"}],
    defaultNotSupportedBrowsers: [{os: "Any",browser: "MSIE",version: 6}],
    noticeText: {professional: {title: "Unsupported Browser Detected",notice: "Our website has detected that you are using an outdated browser. Using your current browser will prevent you from accessing features on our website. An upgrade is not required, but is strongly recommend to improve your browsing experience on our website.",selectBrowser: "Use the link below to upgrade your browser.",remindMeLater: "Remind me later",neverRemindAgain: "No, don't remind me again"}}
};
window.onload = function() {
    BrowserDetection.init()
}