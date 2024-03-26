import setting from '../../behavior/setting';
import download from '../../behavior/download';
import setting_xc from '../../behavior/setting_xc';
import page_navbar from '../../behavior/page_navbar';
import Notify from '@vant/weapp/notify/notify';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
    behaviors: [setting, download, setting_xc, page_navbar],
    data: {
        _navHeight: 0,
        navTitle: ''
    },

    onLoad: function (options) {
        try {
            const btName = options.name ? decodeURIComponent(options.name) : '';
            btName && wx.setNavigationBarTitle({ title: btName })
            btName && this.setData({ navTitle: btName })
        } catch (error) {
            // 
        }
        this.onLoadClick && this.onLoadClick();
    },
    
    onShow: function () {
        this.onShowClick && this.onShowClick();
    },

    onHide: function() {
        this.onHideClick && this.onHideClick();
    },
    
    onUnload: function () {
        this.onUnloadClick && this.onUnloadClick();
    },

    onDialog: function(options) {
        Dialog.confirm(options)
    },

    onNotify: function(options) {
        if (this.data._navHeight) {
            Notify({
                ...options,
                zIndex: 9999,
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