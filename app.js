const WXAPI = require('apifm-wxapi')
App({
    WXAPI,
    globalData: {
        isIos: false,
        isAndroid: false,
    },
    onLaunch: function () {
        WXAPI.init("first");
        const sys = wx.getSystemInfoSync();
        this.globalData.platform = sys.platform;
        this.globalData.isIos = sys.system.toLowerCase().indexOf(`ios`) >= 0;
        this.globalData.isAndroid = sys.system.toLowerCase().indexOf(`android`) >= 0;
    }
})