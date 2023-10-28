import setting from '../../behavior/setting';
import setting_xc from '../../behavior/setting_xc';
import page_navbar from '../../behavior/page_navbar';
import Notify from '@vant/weapp/notify/notify';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
    behaviors: [setting, setting_xc, page_navbar],
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

    // render1(e = 0) {
    //     if (e >= 1000) {
    //         return
    //     }
    //     this.data.scrollIntoView = this.data.scrollIntoView === `scrollViewBottom1` ? `scrollViewBottom2` : `scrollViewBottom1`
    //     this.setData({
    //         renderRunCodes: [...this.data.renderRunCodes, e],
    //         scrollIntoView: this.data.scrollIntoView
    //     }, () => {
    //         setTimeout(() => {
    //             this.render1(e + 1)
    //         }, 100);
    //     })
    // },
    
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