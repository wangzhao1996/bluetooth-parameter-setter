import setting from '../../behavior/setting';
import setting_bms from '../../behavior/setting_bms';
import page_navbar from '../../behavior/page_navbar';

Page({
    behaviors: [setting, setting_bms, page_navbar],
    data: {
    },

    onLoad: function (options) {
        const btDevId = options.devId ? decodeURIComponent(options.devId) : '';
        const btName = options.name ? decodeURIComponent(options.name) : '';
        btName && wx.setNavigationBarTitle({
            title: btName
        })
        btName && this.setData({
            navTitle: btName
        })
        this.data.devId = btDevId;
        this.createBLEConnection(btDevId);
        this.handleRenderData();
    },

    onShow: function () {
        this.onShowClick();
    },

    onHide: function() {
        this.onHideClick();
    },

    onUnload: function () {
        wx.hideLoading();
        this.onUnloadClick();
    }
});