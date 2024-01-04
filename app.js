App({
    globalData: {
        isIos: false,       // 是否是 iOS
        isAndroid: false,   // 是否是安卓
        SDKVersion: ``,     // 基础库版本号
        version: ``,        // 微信版本号
        system: ``,         // 操作系统版本
    },
    onLaunch: function () {
        const sys = wx.getSystemInfoSync();
        this.globalData.isIos = sys.system.toLowerCase().indexOf(`ios`) >= 0;
        this.globalData.isAndroid = sys.system.toLowerCase().indexOf(`android`) >= 0;
        this.globalData.platform = sys.platform;
        this.globalData.SDKVersion = sys.SDKVersion;
        this.globalData.system = sys.system;
        this.globalData.version = sys.version;
    }
})