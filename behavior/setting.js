import ecBLE from "../utils/ecBLE";
import ecUI from "../utils/ecUI";

import log from '../utils/log';

module.exports = Behavior({

    /**
     * 组件的初始数据
     */
    data: {
        devId: '', // 设备ID
        send_data: '', // 要发送的内容
        services: ['22'],
        notifyServiceId: 'invalid',
        notifyCharacteristicId: 'invalid',
        notifyServiceSearchIndex: 0,
        writeServiceId: 'invalid',
        writeCharacteristicId: 'invalid',
        writeServiceSearchIndex: 0,

        _countDownTimer: null,
        _setUpgradeTimer: null,
        _downloadUrl: ``,       // 下载地址
        isUpdating: false,      // 更新状态中
        upgradeText: `…`,       // 倒计时文案
        upgradeProgress: 0,     // 更新进度
        scrollIntoView: ``
    },

    methods: {
        /**
         * 页面 load
         */
        onLoadClick: function() {
            this.getVersionList && this.getVersionList();
            ecBLE.setChineseType(ecBLE.ECBLEChineseTypeGBK);
            ecBLE.onBLEConnectionStateChange(() => {
                ecUI.showModal('提示', '设备断开连接');
            });
            // 监听收到消息
            ecBLE.onBLECharacteristicValueChange((str, strHex) => {
                console.log(`😂`);
                console.log(str);
                console.log(this.data.__observerAC);
                if (this.data.__observerAC) {
                    // 更新逻辑
                    // 开启监听时候，C 才有效
                    if (str === 'C' && strHex === '43') {
                        // 开始更新
                        if (this.data.__upadteChunkIndex === 0) {
                            console.log(`开始更新固件包`);
                            this.data.__canUpdate = true;
                        }
                        this.updateAction();
                    }
                    if (str === 'A' && strHex === '41') {
                        console.log(`固件确认更新完毕 - 监听 AC 关闭`);
                        this.data.__observerAC = false;
                        wx.showToast({
                            icon: 'success',
                            title: '更新完成'
                        })
                        this.data.isUpdating = false;
                        this.data._downloadUrl = ``;
                        this.pageNavBarQuitSettingClick();
                        this.setData({
                            upgradeText: `…`,
                            upgradeProgress: 0
                        })
                    }
                    return
                }
                // 每次收到的字符串
                this.handleRenderData && this.handleRenderData(str);
            })
        },

        /**
         * 页面显示
         */
        onShowClick: function () {
        },

        /**
         * 页面隐藏
         */
        onHideClick: function () {
        },

        /**
         * 页面卸载
         */
        onUnloadClick: function () {
            ecBLE.onBLEConnectionStateChange(() => {})
            ecBLE.onBLECharacteristicValueChange(() => {})
            ecBLE.closeBLEConnection()
        },

        /**
         * 发送事件
         */
        bingButtonSendData: function () {
            ecBLE.writeBLECharacteristicValue(this.data.send_data, false)
        },

        // /**
        //  * 点击下载
        //  */
        // setUpgradeClick: function (event) {
        //     const {
        //         value: {
        //             url
        //         }
        //     } = event.detail;
        //     const pattern = /^https:\/\/dcdn\.it120\.cc\/.*\.bin$/;
        //     if (!pattern.test(url)) {
        //         this.onNotify && this.onNotify({ 
        //             type: 'danger',
        //             message: '下载地址错误！！！请修改！！！',
        //         });
        //         return
        //     }
        //     this.data._downloadUrl = url;
        //     this.onDialog({
        //         title: `提示！`,
        //         message: `您的设备即将进行升级,\n请确保升级过程中不会断电以及退出小程序,\n升级完成后请重启设备!`,
        //         cancelButtonText: '取消升级',
        //         confirmButtonText: '开始升级'
        //     })
        // },

        /**
         * 点击开始升级
         */
        setUpgradeConfirmClick: function() {
            this.data.isUpdating = true;
            if (!this.data.__upgradeCode) {
                this.onNotify && this.onNotify({ 
                    type: 'danger',
                    message: '升级码错误！！！请修改！！！'
                });
                return
            }
            try {
                const url = this.data._downloadUrl;
                wx.downloadFile({
                    url,
                    success: res => {
                        console.log(`文件下载成功！`);
                        const tempFilePath = res.tempFilePath;
                        const dataLength = res.dataLength.toString();
                        this.__loadFile(url, tempFilePath, dataLength, () => {
                            if (!this.data.__chunkArrayHexs.length) {
                                this.onNotify && this.onNotify({ 
                                    type: 'danger',
                                    message: '没有切片成功，请重试！'
                                });
                                return
                            }
                            // 监听 AC 关闭
                            this.data.__observerAC = false;
                            this._updateSendTap();
                        });
                    },
                    fail: () => {
                        console.error(`文件下载失败，请重试！`);
                        this.data.isUpdating = false;
                        this.onNotify && this.onNotify({
                            type: 'danger',
                            message: '文件下载失败，请重试！'
                        });
                    }
                })
            } catch (error) {
                console.error(`客户端未知错误，请重试！`);
                this.data.isUpdating = false;
                this.onNotify && this.onNotify({ 
                    type: 'danger',
                    message: '客户端未知错误，请重试！'
                });
            }
        },

        /**
         * 取消升级
         */
        setUpgradeCancelClick: function() {
            this.data._downloadUrl = ``;
            this.pageNavBarQuitSettingClick();
        },
        
        /**
         * 更新固件发送确认事件
         */
        async _updateSendTap(index = 0) {
            const result = await ecBLE.writeBLECharacteristicValue(`update\r\n`, false);
            console.log(result);
            console.log(`update 发送完毕 - 监听 AC 开启`);
            this.data.__observerAC = true;
            this.data.__upadteChunkIndex = 0;
        },
        
        /**
         * 开始更新固件包
         */
        async updateAction() {
            try {
                // 当前包索引
                if (!this.data.__chunkArrayHexs.length) {
                    console.error(`没有切片`);
                    return;
                }
                const chunkTotal = this.data.__chunkArrayHexs.length;
                const currentIndex = this.data.__upadteChunkIndex;
                if (!this.data.__canUpdate) {
                    console.log(`正在更新第 ${currentIndex + 1} 包`);
                    return
                }
                if (!this.data.__upadteChunkIndex) {
                    console.log(`共 ${chunkTotal} 包，开始发送`);
                }
                console.log(`获取第 ${currentIndex + 1} 包 hex`);
                const chunkHex = this.data.__chunkArrayHexs[currentIndex]
                this.data.__canUpdate = false;
                console.log(`[可以发送下一包]开关设置为 - 关闭`);
                console.log(`发送第 ${currentIndex + 1} 包 hex`);
                await ecBLE.writeBLECharacteristicValue(chunkHex, true);
                this.setData({
                    upgradeProgress: Math.floor((currentIndex / (chunkTotal - 1)) * 100)
                })
                console.log(`第 ${currentIndex + 1}包发送完毕`);
                console.log(`[可以发送下一包]开关设置为 - 开启`);
                this.data.__canUpdate = true;
                this.data.__upadteChunkIndex = currentIndex + 1;
                if (this.data.__upadteChunkIndex === chunkTotal) {
                    console.log(`最后一包发送完毕 - 索引归0`);
                    this.data.__upadteChunkIndex = 0;
                    this.setData({
                        upgradeProgress: 100
                    })
                }
            } catch (error) {
                console.error(`更新固件包失败，请重试！`);
                console.error(error);
            }
        },
    }
});