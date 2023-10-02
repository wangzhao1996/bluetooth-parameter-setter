import setting from '../../behavior/setting';
import setting_xc from '../../behavior/setting_xc';

Page({
    behaviors: [setting, setting_xc],
    data: {
        navTitle: ``
    },

    onLoad: function (options) {
        const btDevId = options.devId ? decodeURIComponent(options.devId) : '';
        const btName = options.name ? decodeURIComponent(options.name) : '';
        this.data.devId = btDevId;
        btName && this.setData({
            navTitle: btName
        })
        this.createBLEConnection(btDevId);
        this.handleRenderData();
    },

    onShow: function () {
        this.onShowClick();
    },

    onUnload: function () {
        wx.hideLoading();
        this.onUnloadClick();
    },

    onShareAppMessage: function () {
        return {
            path: `/pages/index/index`
        }
    }
});