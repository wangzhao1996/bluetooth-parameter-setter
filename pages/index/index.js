import {
    checkIsLegalDevice,
    handleDevicePath,
    handleRSSI,
    handleRSSINumber
} from "../../utils/index";
var app = getApp();
Page({
    __loadTimer: null, // 10s 倒计时
    __showLoading: false, // 展示 loading 弹窗
    data: {
        settingButtonShow: false, // 展示跳转授权页按钮
        deviceList: [], // 设备列表
        pageNodata: false, // 页面无数据
        loadingSvgIcon: ``,
    },

    onLoad: function () {
    },

    onReady: function () {
        wx.onBluetoothDeviceFound((devices) => {
            // console.log(`监听搜索到新设备的事件`, devices);
            // wxLog.info(JSON.stringify({
            //     page: `home`,
            //     name: `onBluetoothDeviceFound`,
            //     devices: devices
            // }));
            wx.getBluetoothDevices({
                success: (res) => {
                    // console.log(`获取在蓝牙模块生效期间所有搜索到的蓝牙设备。包括已经和本机处于连接状态的设备。`, res);
                    // wxLog.info(JSON.stringify({
                    //     page: `home`,
                    //     name: `getBluetoothDevices`,
                    //     devices: res.devices
                    // }));
                    // 只展示合法设备
                    const filterDevices = res.devices.filter(e => checkIsLegalDevice(e.name)).map(e => {
                        return {
                            deviceId: e.deviceId,
                            rssi: e.RSSI,
                            name: e.name,
                            num: handleRSSINumber(e.RSSI),
                            img: handleRSSI(e.RSSI),
                            jumpUrl: handleDevicePath(e.deviceId, e.name)
                        }
                    });
                    app.globalData.btDevices = filterDevices;
                    this.setData({
                        deviceList: filterDevices
                    });
                    if (filterDevices.length) {
                        this.hideLoading(); // 去掉 loading
                    }
                }
            })
        })
    },

    onShow: function () {
        if (!this.data.deviceList.length) {
            this.showLoading(); // 展示 loading
        }
        this.searchStart(); // 开始搜索
    },

    onHide: function () {
        this.searchStop(); // 停止搜索设备
    },

    onUnload: function () {
        this.searchStop(); // 停止搜索设备
        if (this.__loadSvgTimer) {
            clearTimeout(this.__loadSvgTimer);
            this.__loadSvgTimer = 0;
        }
    },

    onPullDownRefresh: function () {
        // 下拉清空记录，并重新搜索
        wx.stopPullDownRefresh();
        this.onReLoad();
    },

    onShareAppMessage: function () {
        return {
            path: `/pages/index/index`
        }
    },

    /**
     * 点击重试
     */
    onReLoad: function () {
        this.setData({
            pageNodata: false,
        }, async () => {
            try {
                await this.searchStop(); // 先停止搜索
            } catch (error) {
                console.error(error);
            }
            try {
                await this.closeBluetooth(); // 关闭蓝牙模块
            } catch (error) {
                console.error(error);
            }
            var timer = setTimeout(() => {
                if (!this.data.deviceList.length) {
                    this.showLoading(); // 展示 loading
                }
                this.searchStart(); // 再重新搜索
                clearTimeout(timer);
            }, 500);
        })
    },

    loadSvgIcon(num = 0) {
        if (this.__loadSvgTimer) {
            clearTimeout(this.__loadSvgTimer);
            this.__loadSvgTimer = 0;
        }
        this.setData({
            loadingSvgIcon: `../../imgs/snapshoot/bluetooth${num}.svg`
        })
        this.__loadSvgTimer = setTimeout(() => {
            clearTimeout(this.__loadSvgTimer);
            this.__loadSvgTimer = 0;
            const nextNum = num + 1;
            this.loadSvgIcon(nextNum > 2 ? 0 : nextNum);
        }, 500);
    },

    /**
     * 展示 loading 状态
     */
    showLoading: function () {
        this.loadSvgIcon();
        this.__showLoading = true;
        this.__loadTimer = setTimeout(() => {
            if (this.__showLoading) {
                this.hideLoading(); // 去掉 loading
                this.searchStop(); // 停止搜索
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
        if (this.__loadSvgTimer) {
            clearTimeout(this.__loadSvgTimer);
            this.__loadSvgTimer = 0;
        }
        this.__showLoading = false;
    },

    /**
     * 停止搜索设备
     */
    searchStop: function () {
        return new Promise((resolve) => {
            wx.stopBluetoothDevicesDiscovery({
                success: (res) => {
                    // console.log('停止搜寻附近的蓝牙外围设备', res);
                    // wxLog.info(JSON.stringify({
                    //     page: `home`,
                    //     name: `stopBluetoothDevicesDiscovery`,
                    //     devices: res
                    // }));
                    resolve(true);
                },
                fail: (err) => {
                    console.error(err);
                    resolve(false);
                }
            })
        })
    },

    /**
     * 开始搜索
     */
    async searchStart() {
        const result = await this.initBluetooth();
        console.log('蓝牙初始化成功？', result);
        if (!result) {
            this.hideLoading();
            this.setData({
                pageNodata: true
            })
        }
        if (result) {
            wx.startBluetoothDevicesDiscovery({
                success: (res) => {
                    // console.log('开始搜寻附近的蓝牙外围设备y', res);
                    // wxLog.info(JSON.stringify({
                    //     page: `home`,
                    //     name: `startBluetoothDevicesDiscovery`,
                    //     devices: res
                    // }));
                },
                fail: (err) => {
                    console.log('开始搜寻附近的蓝牙外围设备x', err);
                }
            })
        }
    },

    /**
     * 初始化蓝牙模块
     */
    initBluetooth: function () {
        return new Promise((resolve) => {
            wx.openBluetoothAdapter({
                success: (res) => {
                    // console.log(`初始化蓝牙模块y`, res);
                    // wxLog.info(JSON.stringify({
                    //     page: `home`,
                    //     name: `openBluetoothAdapter`,
                    //     devices: res
                    // }));
                    this.setData({
                        settingButtonShow: false
                    })
                    resolve(true);
                },
                fail: (err) => {
                    console.log(`😭初始化蓝牙模块`);
                    console.error(err);
                    if (err.errMsg === `openBluetoothAdapter:fail already opened`) {
                        // https://developers.weixin.qq.com/community/develop/doc/0006640d92cde050a6ef2e81a56400?highLine=openBluetoothAdapter%253Afail%2520already%2520opened
                        // 当成 success 继续
                        resolve(true);
                        return
                    }
                    if (err.errno === 103 || err.errMsg === `openBluetoothAdapter:fail auth deny`) {
                        console.log(`😭初始化蓝牙模块103`);
                        // 身份验证失败，应当跳转至授权管理页
                        this.setData({
                            settingButtonShow: true
                        })
                    }
                    resolve(false);
                }
            })
        })
    },

    /**
     * 关闭蓝牙模块
     */
    closeBluetooth: function () {
        return new Promise((resolve) => {
            wx.closeBluetoothAdapter({
                success: (res) => {
                    // console.log(`关闭蓝牙模块y`, res);
                    // wxLog.info(JSON.stringify({
                    //     page: `home`,
                    //     name: `closeBluetoothAdapter`,
                    //     devices: res
                    // }));
                    this.setData({
                        btDevices: []
                    })
                    resolve(true);
                },
                fail: (err) => {
                    console.log(`关闭蓝牙模块x`, err);
                    resolve(false);
                }
            })
        })
    }
});