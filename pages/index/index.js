import {
    compareVersion,
    checkIsLegalDevice,
    handleDevicePath,
    handleRSSI
} from "../../utils/index";
import getLocation from "../../utils/location";
import getSetting from "../../utils/getsetting";
var app = getApp();
Page({
    __loadTimer: null, // 10s 倒计时
    __showLoading: false, // 展示 loading 弹窗
    __canISearch: false, // 是否可以搜索
    data: {
        privacySettingShow: false, // 展示授权页弹窗
        settingButtonShow: false, // 展示跳转授权页按钮
        pageNodata: false, // 页面无数据
        deviceList: [], // 设备列表
    },

    onLoad: function () {
        // 基础库版本 >= 2.32.3 查询隐私授权情况
        if (compareVersion(app.globalData.SDKVersion, `2.32.3`) >= 0 && wx.canIUse('getPrivacySetting')) {
            wx.getPrivacySetting({
                success: res => {
                    if (res.needAuthorization) {
                        // 需要授权
                        this.setData({
                            privacySettingShow: true
                        })
                    } else {
                        // 不需要授权
                        console.info(`不需要隐私政策授权！`);
                        this.getLocationSync();
                    }
                },
                fail: () => {
                    // 调用失败
                    console.error(`判断隐私政策授权失败！`);
                },
            })
        } else {
            this.getLocationSync();
        }
    },

    onReady: function () {
    },

    onShow: function () {
        if (this.__canISearch) {
            if (!this.data.deviceList.length) {
                this.showLoading(); // 展示 loading
            }
            this.searchStart(); // 开始搜索
        }
    },

    onHide: function () {
        this.searchStop(); // 停止搜索设备
    },

    onUnload: function () {
        this.searchStop(); // 停止搜索设备
    },

    onPullDownRefresh: function () {
        // 下拉清空记录，并重新搜索
        wx.stopPullDownRefresh();
        this.onReLoad();
    },

    /**
     * 点击重试
     */
    onReLoad: function () {
        this.setData({
            pageNodata: false,
        }, async () => {
            await this.searchStop(); // 先停止搜索
            await this.closeBluetooth(); // 关闭蓝牙模块
            var timer = setTimeout(() => {
                if (!this.data.deviceList.length) {
                    this.showLoading(); // 展示 loading
                }
                this.searchStart(); // 再重新搜索
                clearTimeout(timer);
            }, 500);
        })
    },

    /**
     * 点击打开用户协议
     */
    openPrivacyContract: function () {
        wx.openPrivacyContract()
    },

    /**
     * 点击不同意
     * 1. 退出小程序
     */
    privacySettingCancelClick: function () {
        this.setData({
            privacySettingShow: false
        })
        wx.exitMiniProgram();
    },

    /**
     * 点击同意
     * 1. 开启定位
     * 2. 开启蓝牙执行搜索
     */
    privacySettingConfrimClick: function () {
        // console.log(`点击同意`);
        this.setData({
            privacySettingShow: false
        })
        let timer = setTimeout(() => {
            clearTimeout(timer);
            this.getLocationSync();
        }, 200);
    },

    async getLocationSync() {
        const area = await getLocation();
        console.log(`获取定位权限`, area);
        const scopeBluetooth = await getSetting(`scope.bluetooth`);
        console.log(`获取蓝牙权限`, scopeBluetooth);
        if (!scopeBluetooth) {
            // 拒绝授权了
            this.setData({
                settingButtonShow: true
            })
            return
        }
        if (scopeBluetooth < 0) {
            // 未选择授权状态
            const result = await this.initBluetooth();
            if (!result) {
                // 初始化失败
                return
            }
            this.__canISearch = true;
        }
        this.searchStart(); // 开始搜索
        this.appStart(); // 监听搜索到新设备的事件
    },

    /**
     * 开始搜索了
     */
    appStart: function () {
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
        this.__showLoading = false;
        wx.hideLoading();
    },

    /**
     * 停止搜索设备
     */
    searchStop: function () {
        return new Promise((resolve) => {
            wx.stopBluetoothDevicesDiscovery({
                success: function (res) {
                    // console.log('停止搜寻附近的蓝牙外围设备', res);
                    resolve(true);
                },
                fail: function (err) {
                    // console.log('停止搜寻附近的蓝牙外围设备', err);
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
        console.log('蓝牙初始化成功？');
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
                    this.setData({
                        settingButtonShow: false
                    })
                    resolve(true);
                },
                fail: (err) => {
                    console.log(`初始化蓝牙模块x`, err);
                    if (err.errno === 103 || err.errMsg === `openBluetoothAdapter:fail auth deny`) {
                        console.log(`初始化蓝牙模块x1`);
                        // 身份验证失败，应当跳转至授权管理页
                        this.setData({
                            settingButtonShow: true
                        })
                    }
                    if (err.errno === 112) {
                        this.setData({
                            privacySettingShow: true
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