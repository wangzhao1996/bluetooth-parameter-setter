import ecGBK from "../utils/ecGBK/ecGBK";

const ab2hex = (buffer) => {
    var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
      return ("00" + bit.toString(16)).slice(-2);
    });
    return hexArr.join("");
}

module.exports = Behavior({
    /**
     * 组件的初始数据
     */
    data: {
        __fileContent: null,
        __chunkStart: 'a5',  // 切片起始标志
        __chunkSize: 128,   // 切片大小
        __chunkArrayHexs: [],  // 切片后的数组
        __upadteChunkIndex: 0,  // 当前更新的切片索引
        __observerAC: false, // 是否要监听AC
        // downLinkUrl: '',
        actionSheetshow: false,
        versionList: []
    },

    methods:{
        /**
         * 
         * @param {string} fileName 文件名
         * @param {string} tempFilePath 临时文件路径
         * @param {string} dataLength 文件大小
         * @param {Function} callback 回调函数
         */
        __loadFile: function(fileName, tempFilePath, dataLength, callback) {
            const fm = wx.getFileSystemManager();
            try {
                this.data.__fileContent = fm.readFileSync(tempFilePath);
                const fileNameHex = ab2hex(new Uint8Array(ecGBK.ecStrToGBKBytes(fileName)).buffer);
                const dataLengthHex = ab2hex(new Uint8Array(ecGBK.ecStrToGBKBytes(dataLength)).buffer);
                let arrayBufferHeader = `${fileNameHex}00${dataLengthHex}`;
                // arrayBufferHeader 补 0 至 __chunkSize 字节
                arrayBufferHeader += '0'.repeat(this.data.__chunkSize * 2 - arrayBufferHeader.length);
                const slicedArrayBuffers = this.sliceArrayBuffer(this.data.__fileContent, this.data.__chunkSize);
                this.data.__chunkArrayHexs = [arrayBufferHeader, ...slicedArrayBuffers].map((ele, idx) => {
                    let headHex = this.data.__chunkStart;
                    let idx00 = idx.toString(16).padStart(2, '0');
                    // idxHex 取反
                    let idxFF = idx00.split('').map((ele) => {
                        return (15 - parseInt(ele, 16)).toString(16);
                    }).join('');
                    return `${headHex}${idx00}${idxFF}${ele}0000`;
                });
            } catch (error) {
                console.error(`文件切片失败，请重试！`);
                console.error(error);
            }
            callback && callback();
        },

        /**
         * 文件切片 + 切片转hex
         */
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
            console.log("文件切片总数: " + arrayBuffers.length);

            // 输出最后一个切片文件大小
            const lastChunkSize = uint8Array.length - (offset - chunkSize);
            console.log("最后一个切片文件大小: " + lastChunkSize + " 字节");

            const result = arrayBuffers.map((item, index, items) => {
                let hex = ab2hex(item);
                if (index === items.length - 1 && lastChunkSize < chunkSize) {
                    // 向 hex 后面补 (chunkSize - lastChunkSize) * 2 个 0
                    hex += '0'.repeat((chunkSize - lastChunkSize) * 2);
                }
                return hex;
            })

            return result;
        },

        /**
         * 选择版本点击事件
         */
        selectVersionClick: function(e) {
            this.setData({
                actionSheetShow: true
            });
        },

        onVersionClose: function() {
            this.setData({
                actionSheetShow: false
            });
        },

        onVersionSelect: function(event) {
            const { linkUrl } = event.detail;
            console.log(`linkUrl`, linkUrl);
            this.data._downloadUrl = linkUrl;
            this.onDialog && this.onDialog({
                title: `提示！`,
                message: `您的设备即将进行升级,\n请确保升级过程中不会断电以及退出小程序,\n升级完成后请重启设备!`,
                cancelButtonText: '取消升级',
                confirmButtonText: '开始升级'
            })
        },

        getVersionList: function() {
            getApp().WXAPI.banners({
                type: `b2024`
            }).then(res => {
                if (res.code) {
                    return
                }
                this.setData({
                    versionList: res.data.map(e => {
                        return {
                            name: e.title,
                            linkUrl: e.linkUrl
                        }
                    })
                })
            })
        }
    }
});