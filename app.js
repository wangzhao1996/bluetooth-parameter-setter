App({
    globalData: {
        isIos: false,
        isAndroid: false,
    },
    onLaunch: function () {
        const sys = wx.getSystemInfoSync();
        this.globalData.platform = sys.platform;
        this.globalData.isIos = sys.system.toLowerCase().indexOf(`ios`) >= 0;
        this.globalData.isAndroid = sys.system.toLowerCase().indexOf(`android`) >= 0;
    }
})