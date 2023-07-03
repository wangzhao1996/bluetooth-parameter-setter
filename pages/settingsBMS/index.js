import setting from '../../behavior/setting';
import setting_bms from '../../behavior/setting_bms';

Page({
    behaviors: [setting, setting_bms],
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