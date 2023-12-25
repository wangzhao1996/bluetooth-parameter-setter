import setting from '../../behavior/setting';
import setting_xc from '../../behavior/setting_xc';
import page_navbar from '../../behavior/page_navbar';

Page({
    behaviors: [setting, setting_xc, page_navbar],
    data: {
        dialogShow: false,
        dialogData: null,
        navTitle: ``,
        formData: {},
        rules: [{
            name: 'url',
            rules: {
                required: true,
                message: 'BIN下载地址必填',
                validator: function (rule, value, param, modeels) {
                    const pattern = /^https:\/\/dcdn\.it120\.cc\/.*\.bin$/;
                    if (!pattern.test(value)) {
                        return `地址错误！！！`
                    }
                }
            },
        }]
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

    onHide: function () {
        this.onHideClick();
    },

    onUnload: function () {
        wx.hideLoading();
        this.onUnloadClick();
    },

    formInputChange(e) {
        const {field} = e.currentTarget.dataset
        this.setData({
            [`formData.${field}`]: e.detail.value
        })
    },

    submitForm() {
        this.selectComponent('#form').validate((valid, errors) => {
            console.log('valid', valid, errors)
            if (!valid) {
                const firstError = Object.keys(errors)
                if (firstError.length) {
                    this.onNotify && this.onNotify({ 
                        type: 'danger',
                        message: errors[firstError[0]].message,
                    });
                }
            } else {
                console.log('submit success');
                const {
                    formData: {
                        url
                    }
                } = this.data;
                this.data._downloadUrl = url;
                this.onDialog({
                    title: `提示！`,
                    message: `您的设备即将进行升级,\n请确保升级过程中不会断电以及退出小程序,\n升级完成后请重启设备!`,
                    cancelButtonText: '取消升级',
                    confirmButtonText: '开始升级'
                })
            }
        })
    },

    dialogButtonClick: function (event) {
        const { index } = event.detail;
        if (index === 0) {
            this.setUpgradeCancelClick();
        }
        if (index === 1) {
            this.setUpgradeConfirmClick();
        }
        this.setData({
            dialogShow: false,
            dialogData: null
        })
    },

    onDialog: function (options) {
        this.setData({
            dialogShow: true,
            dialogData: {
                ...options,
                buttons: [{
                    text: options.cancelButtonText
                }, {
                    text: options.confirmButtonText
                }]
            },
        })
    },

    onNotify: function (options) {
        const typeMap = {
            'danger': 'error',
            'warning': 'none',
            'success': 'success',
        }
        wx.showToast({
            icon: typeMap[options.type],
            title: options.message,
            duration: 2000,
            mask: true,
        })
    },
});