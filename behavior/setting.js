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
         * 页面显示
         */
        onShowClick: function () {
            wx.onBLECharacteristicValueChange((res) => {
                const values = String.fromCharCode.apply(null, new Uint8Array(res.value))
                this.handleRenderData && this.handleRenderData(values);
            })
            wx.setKeepScreenOn({
                keepScreenOn: true
            })
        },

        /**
         * 页面隐藏
         */
        onHideClick: function () {
            
        },

        seekFirstNotifyCharacteristic: function () {
            var that = this;
            if (that.data.notifyServiceSearchIndex < that.data.services.length && that.data.notifyCharacteristicId == 'invalid') {
                that.data.notifyServiceId = that.data.services[that.data.notifyServiceSearchIndex].uuid
                    ++that.data.notifyServiceSearchIndex;
                wx.getBLEDeviceCharacteristics({
                    // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                    deviceId: that.data.devId,
                    // 这里的 notifyServiceId 需要在 getBLEDeviceServices 接口中获取
                    serviceId: that.data.notifyServiceId,
                    complete: function () {
                        //递归调用自身直到找到notify特征或遍历完所有特征
                        that.seekFirstNotifyCharacteristic()
                    },
                    success: function (res) {
                        for (var n = 0; n < res.characteristics.length && that.data.notifyCharacteristicId == 'invalid'; ++n) {
                            if (res.characteristics[n].properties.notify == true) {
                                that.data.notifyCharacteristicId = res.characteristics[n].uuid;
                                wx.notifyBLECharacteristicValueChanged({
                                    state: true, // 启用 notify 功能
                                    // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                                    deviceId: that.data.devId,
                                    // 这里的 notifyServiceId 需要在 getBLEDeviceServices 接口中获取
                                    serviceId: that.data.notifyServiceId,
                                    // 这里的 notifyCharacteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
                                    characteristicId: that.data.notifyCharacteristicId,
                                    success: function (resp) {
                                        wx.showToast({
                                            title: '连接成功',
                                            icon: 'success',
                                            duration: 2000
                                        })
                                        // 寻找第一个write特征
                                        that.data.writeServiceSearchIndex = 0
                                        that.data.writeCharacteristicId = 'invalid'
                                        that.seekFirstWriteCharacteristic()
                                    }
                                })
                            }
                        }
                    }
                })
            }
        },

        seekFirstWriteCharacteristic: function () {
            var that = this;
            if (that.data.writeServiceSearchIndex < that.data.services.length && that.data.writeCharacteristicId == 'invalid') {
                that.data.writeServiceId = that.data.services[that.data.writeServiceSearchIndex].uuid;
                ++that.data.writeServiceSearchIndex;
                wx.getBLEDeviceCharacteristics({
                    // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                    deviceId: that.data.devId,
                    // 这里的 writeServiceId 需要在 getBLEDeviceServices 接口中获取
                    serviceId: that.data.writeServiceId,
                    complete: function () {
                        //递归调用自身直到找到write特征或遍历完所有特征
                        that.seekFirstWriteCharacteristic()
                    },
                    success: function (res) {
                        for (var n = 0; n < res.characteristics.length && that.data.writeCharacteristicId == 'invalid'; ++n) {
                            if (res.characteristics[n].properties.write == true) {
                                that.data.writeCharacteristicId = res.characteristics[n].uuid;
                            }
                        }
                    }
                })
            }
        },

        createBLEConnection: function (btDevId) {
            wx.createBLEConnection({
                // 这里的 btDevId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                deviceId: btDevId,
                success: (resp) => {
                    wx.getBLEDeviceServices({
                        // 这里的 devId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                        deviceId: btDevId,
                        success: (res) => {
                            // 保存已连接设备的服务
                            for (var j = 0; j < res.services.length; ++j) {
                                var newService = [
                                    res.services[j],
                                ]
                                this.data.services = this.data.services.concat(newService);
                            }
                            // 寻找第一个Notify特征
                            this.data.notifyServiceSearchIndex = 0
                            this.data.notifyCharacteristicId = 'invalid'
                            this.seekFirstNotifyCharacteristic()
                        }
                    })
                }
            })
        },

        onUnloadClick: function () {
            wx.closeBLEConnection({
                deviceId: this.data.devId,
                success: function (res) {
                    console.log(res)
                }
            })
        },

        encode_utf8: function (s) {
            return unescape(encodeURIComponent(s));
        },

        str2ab: function (str) {
            var that = this;
            var s = that.encode_utf8(str)
            var buf = new ArrayBuffer(s.length);
            var bufView = new Uint8Array(buf);
            for (var i = 0, strLen = s.length; i < strLen; i++) {
                bufView[i] = s.charCodeAt(i);
            }
            return bufView;
        },

        /**
         * 发送事件
         */
        bingButtonSendData: function () {
            const that = this;
            const uint8Buf = that.str2ab(that.data.send_data);
            function split_array(arr, len) {
                var a_len = arr.length;
                var result = []
                for (var i = 0; i < a_len; i += len) {
                    result.push(arr.slice(i, i + len))
                }
                return result;
            }
            //拆分数组 每20个元素组成一个新数组 
            const sendloop = split_array(uint8Buf, 20);
            function realWriteData(sendloop, i) {
                if (i >= sendloop.length) {
                    return
                }
                var newsenddata = sendloop[i]
                let buffer = new ArrayBuffer(newsenddata.length)
                let dataView = new DataView(buffer)
                for (var j = 0; j < newsenddata.length; j++) {
                    dataView.setUint8(j, newsenddata[j])
                }
                wx.writeBLECharacteristicValue({
                    deviceId: that.data.devId,
                    serviceId: that.data.writeServiceId,
                    characteristicId: that.data.writeCharacteristicId,
                    // 这里的value是ArrayBuffer类型
                    value: buffer,
                    success: function (res) {
                        realWriteData(sendloop, i + 1);
                    }
                })
            }
            realWriteData(sendloop, 0);
        },

        sliceArrayBuffer: function(arrayBuffer, chunkSize) {
            const arrayBuffers = [];
            const uint8Array = new Uint8Array(arrayBuffer);
            let offset = 0;
            let totalSize = 0;

            while (offset < uint8Array.length) {
                const chunk = uint8Array.slice(offset, offset + chunkSize);
                const chunkArrayBuffer = chunk.buffer;
                arrayBuffers.push(chunkArrayBuffer);
                offset += chunkSize;
                totalSize += chunk.byteLength;
            }

            // 输出文件总大小
            console.log("文件总大小: " + totalSize + " 字节");

            // 输出最后一个切片文件大小
            const lastChunkSize = uint8Array.length - (offset - chunkSize);
            console.log("最后一个切片文件大小: " + lastChunkSize + " 字节");

            return arrayBuffers;
        },

        setUpgradeClick: function (event) {
            const {
                value: {
                    url
                }
            } = event.detail;
            const pattern = /^https:\/\/dcdn\.it120\.cc\/.*\.bin$/;
            if (!pattern.test(url)) {
                this.onNotify && this.onNotify({ 
                    type: 'danger',
                    message: '下载地址错误！！！请修改！！！',
                });
                return
            }
            this.data._downloadUrl = url;
            this.onDialog({
                title: `提示！`,
                message: `您的设备即将进行升级,\n请确保升级过程中不会断电以及退出小程序,\n升级完成后请重启设备!`,
                cancelButtonText: '取消升级',
                confirmButtonText: '开始升级'
            })
        },

        /**
         * 点击开始升级
         */
        setUpgradeConfirmClick: function() {
            this.data.isUpdating = true;
            const _this = this;
            if (!this.data.__upgradeCode) {
                this.onNotify && this.onNotify({ 
                    type: 'danger',
                    message: '升级码错误！！！请修改！！！'
                });
                return
            }
            try {
                const fm = wx.getFileSystemManager();
                wx.downloadFile({
                    url: _this.data._downloadUrl,
                    success: res => {
                        const tempFilePath = res.tempFilePath;
                        try {
                            const content = fm.readFileSync(tempFilePath);
                            const chunkSize = 20; // 你想要的切片大小，这里设置为 500 字节
                            const slicedArrayBuffers = this.sliceArrayBuffer(content, chunkSize);
                            log.info(`切片数量：${slicedArrayBuffers.length}`);
                            wx.showLoading({
                                title: '请稍后……'
                            })
                            _this.data.send_data = _this.data.__upgradeCode;
                            // 发送密语事件
                            _this.bingButtonSendData();
                            // 3 秒后开始更新
                            _this.timeCallBack(() => {
                                function realWriteData(i) {
                                    if (i >= slicedArrayBuffers.length) {
                                        log.info(`切片--${i}`);
                                        _this.onNotify({
                                            type: 'success',
                                            message: '升级成功！'
                                        })
                                        _this.data.isUpdating = false;
                                        _this.data._downloadUrl = ``;
                                        _this.pageNavBarQuitSettingClick();
                                        _this.setData({
                                            upgradeText: `…`,
                                            upgradeProgress: 0
                                        })
                                        return
                                    }
                                    // 开始写入时间戳
                                    const startTime = new Date().getTime();
                                    wx.writeBLECharacteristicValue({
                                        deviceId: _this.data.devId,
                                        serviceId: _this.data.writeServiceId,
                                        characteristicId: _this.data.writeCharacteristicId,
                                        // 这里的value是ArrayBuffer类型
                                        value: slicedArrayBuffers[i],
                                        writeType: `write`,
                                        success: (r) => {
                                            // 写入结束时间戳
                                            const endTime = new Date().getTime();
                                            log.info(`${JSON.stringify({
                                                name: `写入第${i}`,
                                                startTime,
                                                endTime,
                                                timer: endTime - startTime
                                            })}`);
                                            _this.setData({
                                                upgradeProgress: Math.floor((i / slicedArrayBuffers.length) * 100)
                                            })
                                            // i 从 0 开始，每 100 毫秒写入一次
                                            // _this.data._setUpgradeTimer = setTimeout(() => {
                                            //     clearTimeout(_this.data._setUpgradeTimer);
                                            //     realWriteData(i + 1);
                                            // }, 100);
                                            // 优化上述逻辑：i 从 0 开始，每写入 50 次，延迟 300 毫秒后再写入
                                            if (i && i % 50 === 0) {
                                                _this.data._setUpgradeTimer = setTimeout(() => {
                                                    clearTimeout(_this.data._setUpgradeTimer);
                                                    realWriteData(i + 1);
                                                }, 300);
                                            } else {
                                                realWriteData(i + 1);
                                            }
                                        },
                                        fail: () => {
                                            this.onNotify && this.onNotify({ 
                                                type: 'danger',
                                                message: '升级失败，返厂重修！！！'
                                            });
                                        }
                                    })
                                }
                                realWriteData(0);
                            });
                        } catch (er) {
                            this.data.isUpdating = false;
                            this.onNotify && this.onNotify({ 
                                type: 'danger',
                                message: '文件切片失败，请重试！'
                            });
                        }
                    },
                    fail: () => {
                        this.data.isUpdating = false;
                        this.onNotify && this.onNotify({
                            type: 'danger',
                            message: '文件下载失败，请重试！'
                        });
                    }
                })
            } catch (error) {
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

        timeCallBack(callback = null, timer = 3) {
            clearTimeout(this.data._countDownTimer);
            this.data._countDownTimer = null;
            if (timer === 0) {
                callback && callback();
                return
            }
            this.data._countDownTimer = setTimeout(() => {
                this.setData({
                    upgradeText: timer
                })
                this.timeCallBack(callback, timer - 1);
            }, 1000);
        }
    }
});