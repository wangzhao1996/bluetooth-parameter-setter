import ecBLE from "../../utils/ecBLE";
import ecUI from "../../utils/ecUI";
import wxLog from "../../utils/log";

import {
    checkIsLegalDevice,
    handleDevicePath,
    handleRSSI
} from "../../utils/index";
Page({
    __loadTimer: null, // 10s 倒计时
    __showLoading: false, // 展示 loading 弹窗
    data: {
        settingButtonShow: false, // 展示跳转授权页按钮
        __deviceList: [], // 设备列表暂存
        deviceList: [], // 设备列表
        pageNodata: false, // 页面无数据
    },

    onLoad: function () {
    },

    onReady: function () {
        setInterval(() => {
            try {
                const result = this.data.__deviceList.filter((e) => checkIsLegalDevice(e.name));
                const deviceList = result.map(e => {
                    return {
                        deviceId: e.id,
                        rssi: e.rssi,
                        name: e.name,
                        img: handleRSSI(e.rssi),
                        jumpUrl: handleDevicePath(e.id, e.name),
                    }
                })
                if (this.data.deviceList.length) {
                    this.hideLoading();
                }
                this.setData({ deviceList })
            } catch (error) {
                console.error(error);
            }
        }, 400);
    },

    onShow: function () {
        if (!this.data.deviceList.length) {
            this.showLoading(); // 展示 loading
        }
        this.data.__deviceList = [];
        this.setData({
            deviceList: []
        }, () => {
            var timer = setTimeout(() => {
                clearTimeout(timer);
                this.openBluetoothAdapter();
            }, 100);
        })
    },

    onHide: function () {
    },

    onUnload: function () {
    },

    onPullDownRefresh: function () {
        // 下拉清空记录，并重新搜索
        wx.stopPullDownRefresh();
        var timer = setTimeout(() => {
            clearTimeout(timer);
            this.onReLoad();
        }, 500);
    },

    /**
     * 点击重试
     */
    onReLoad: function () {
        this.data.__deviceList = [];
        this.setData({
            deviceList: [],
            pageNodata: false,
        }, async () => {
            var timer = setTimeout(() => {
                clearTimeout(timer);
                if (!this.data.deviceList.length) {
                    this.showLoading(); // 展示 loading
                }
                this.openBluetoothAdapter()
            }, 500);
        })
    },

    /**
     * 点击连接设备
     */
    handleDevTap: function(event) {
        const {
            dataset: {
                id
            }
        } = event.currentTarget;
        const {
            deviceList
        } = this.data;
        const device = deviceList.find(e => e.deviceId === id);
        ecUI.showLoading('设备连接中')
        ecBLE.onBLEConnectionStateChange(res => {
            ecUI.hideLoading()
            if (res.ok) {
                wx.navigateTo({ url: device.jumpUrl })
            } else {
                ecUI.showModal(
                    '提示',
                    '连接失败,errCode=' + res.errCode + ',errMsg=' + res.errMsg
                )  
            }    
        })
        ecBLE.createBLEConnection(device.deviceId);
    },

    /**
     * 展示 loading 状态
     */
    showLoading: function () {
        this.__showLoading = true;
        wx.showLoading({
            title: `请稍后…`
        })
        this.__loadTimer = setTimeout(() => {
            if (this.__showLoading) {
                this.hideLoading(); // 去掉 loading
                this.setData({
                    pageNodata: true
                })
            }
        }, 1000 * 10);
    },

    /**
     * 关闭 loading 弹窗
     */
    hideLoading: function () {
        this.__showLoading = false;
        wx.hideLoading();
    },

    /**
     * 打开蓝牙授权
     */
    openBluetoothAdapter() {
        const _this = this;
        ecBLE.onBluetoothAdapterStateChange(res => {
            // console.log('openBluetoothAdapter: ');
            // console.log(res);
            // wxLog.info(`openBluetoothAdapter: `);
            // wxLog.info(JSON.stringify(res));
            if (res.ok) {
                _this.startBluetoothDevicesDiscovery();
            } else {
                ecUI.showModal(
                    '提示',
                    `Bluetooth adapter error | ${res.errCode} | ${res.errMsg}`,
                    () => {
                        if (res.errCode === 30001) {
                            wx.openSystemBluetoothSetting()
                        }
                        if (res.errCode === 30003) {
                            wx.openAppAuthorizeSetting()
                        }
                        if (res.errCode === 30004) {
                            //跳转到小程序设置界面
                            wx.openSetting()
                        }
                    }
                )
            }
        })
        ecBLE.openBluetoothAdapter()
    },
    
    /**
     * 开售搜索设备
     */
    startBluetoothDevicesDiscovery() {
        const _this = this;
        ecBLE.onBluetoothDeviceFound(res => {
            // console.log('startBluetoothDevicesDiscovery: ');
            // console.log(res);
            // wxLog.info(`startBluetoothDevicesDiscovery: `);
            // wxLog.info(JSON.stringify(res));
            for (const item of _this.data.__deviceList) {
                if (item.id === res.id) {
                    item.name = res.name
                    item.rssi = res.rssi
                    return
                }
            }
            let manufacturer = ''
            if (res.name.length === 11 && res.name.startsWith('@')) {
                manufacturer = 'eciot'
            }
            if (res.name.length === 15 && res.name.startsWith('BT_')) {
                manufacturer = 'eciot'
            }
            _this.data.__deviceList.push({
                id: res.id,
                name: res.name,
                rssi: res.rssi,
                manufacturer,
            })
        })
        ecBLE.startBluetoothDevicesDiscovery()
    },
});