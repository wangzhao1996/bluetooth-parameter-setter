import setting from '../../behavior/setting';
import setting_xc from '../../behavior/setting_xc';

Page({
    behaviors: [setting, setting_xc],
    data: {
    },

    onLoad: function (options) {
        const btDevId = options.devId ? decodeURIComponent(options.devId) : '';
        const btName = options.name ? decodeURIComponent(options.name) : '';
        btName && wx.setNavigationBarTitle({
            title: btName
        })
        this.data.devId = btDevId;
        this.createBLEConnection(btDevId);
        this.handleRenderData();
    },

    onShow: function () {
        this.onShowClick();
    },

    onUnload: function () {
        wx.hideLoading();
        this.onUnloadClick();
    }
});