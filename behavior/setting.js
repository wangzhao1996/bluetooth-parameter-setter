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
    },

    methods: {
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

        onShowClick: function () {
            wx.onBLECharacteristicValueChange((res) => {
                const values = String.fromCharCode.apply(null, new Uint8Array(res.value))
                this.handleRenderData && this.handleRenderData(values);
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
        }
    }
});