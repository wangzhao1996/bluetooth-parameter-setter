import setting from '../../behavior/setting';
import setting_bms from '../../behavior/setting_bms';
import page_navbar from '../../behavior/page_navbar';
import Notify from '@vant/weapp/notify/notify';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
    behaviors: [setting, setting_bms, page_navbar],
    data: {
        _navHeight: 0,
        navTitle: ''
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
    },

    onDialog: function(options) {
        Dialog.confirm(options)
    },

    onNotify: function(options) {
        if (this.data._navHeight) {
            Notify({
                ...options,
                top: this.data._navHeight
            })
            return
        }
        const query = this.createSelectorQuery();
        query.select(`#vanNavBar`).boundingClientRect()
        query.exec((res) => {
            if (!res || !res.length || !res[0]) {
                return
            }
            const data = res[0];
            this.data._navHeight = data.height;
            Notify({
                ...options,
                top: this.data._navHeight
            })
        })
    },
});