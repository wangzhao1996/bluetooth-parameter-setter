import Throttle from "../utils/throttle";
import {
    compareXY
} from "../utils/index";

let __tempData = {
    AltCur: 0, // 交流电流
    AltVol: 0, // 交流电压
    BatSoc: 0, // 充电进度
    CarVol: 0, // 车辆电压
    OutKw: 0, // 输出功率
    OutKwh: 0, // 已放度数
    NowStatus: 0, // 当前放电状态
    SetDevSoc: 0, // 终止SOC
    SetStopDur: 0, // 终止放电时长
    SetStopKwh: 0, // 终止放电度数
    SetStopMode: 0, // 终止模式
    SingleV: 0, // 单体电压
    SoftVer: 'v1.0', // 软件版本
    WorkTime: 0, // 取电时长
};

module.exports = Behavior({

    /**
     * 组件的初始数据
     */
    data: {
        showStopModeActionsheet: false,
        __tempData: JSON.parse(JSON.stringify(__tempData)),
        renderObj: JSON.parse(JSON.stringify(__tempData)),
        currentSetDevSoc: {
            key: `SetDevSoc`,
            label: `终止放电SOC`,
            title: ``,
            subtitle: `%`
        },
        currentSetStopKwh: {
            key: `SetStopKwh`,
            label: `终止放电度数`,
            title: ``,
            subtitle: `°`
        },
        currentSetStopDur: {
            key: `SetStopDur`,
            label: `终止放电时长`,
            title: ``,
            subtitle: `Min`
        },
        renderItems: [{
            key: `SetDevSoc`,
            label: `终止SOC\n`,
            title: `0`,
            subtitle: ``,
        }, {
            key: `SetStopKwh`,
            label: `终止放电度数\n`,
            title: `0`,
            subtitle: ``,
        }, {
            key: `SetStopDur`,
            label: `终止放电时长\n`,
            title: `0`,
            subtitle: ``,
        }, {
            key: `AltCur`,
            label: `交流电流\n`,
            title: `0`,
            subtitle: `A`,
        }, {
            key: `AltVol`,
            label: `交流电压\n`,
            title: `0`,
            subtitle: `V`,
        }, {
            key: `OutKw`,
            label: `输出功率\n`,
            title: `0`,
            subtitle: `Kw`,
        }, {
            key: `SingleV`,
            label: `单体电压\n`,
            title: `0`,
            subtitle: `V`,
        }, {
            key: `OutKwh`,
            label: `已放度数\n`,
            title: `0`,
            subtitle: `度`,
        }, {
            key: `WorkTime`,
            label: `取电时长\n`,
            title: `0`,
            subtitle: `Min`,
        }, {
            key: `CarVol`,
            label: `车辆电压\n`,
            title: `0`,
            subtitle: `V`,
        }, {
            key: `SoftVer`,
            label: `软件版本\n`,
            title: `v1.0`,
            subtitle: ``,
            actionLabelName: `软件版本`,
        }, {
            key: `SetStopMode`,
            label: `停止模式`,
            title: `0`,
            actionList: [
                { text: '设置终止SOC', value: 0 },
                { text: '设置终止放电度数', value: 1 },
                { text: '设置终止放电时长', value: 2 },
            ]
        }]
    },

    methods: {
        /**
         * 点击发送：开始放电
         */
        settingStartClick() {
            wx.showLoading({
                title: '请稍后……'
            })
            this.data.send_data = `DevSetStatus:1`;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击发送：结束放电
         */
        settingEndClick() {
            wx.showLoading({
                title: '请稍后……'
            })
            this.data.send_data = `DevSetStatus:0`;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击设置终止放电SOC-加 1
         */
        setDevSocAddClick() {
            const {
                currentSetDevSoc: {
                    key,
                    title
                }
            } = this.data;
            const value = title ? (title * 1) : 0;
            let sendData = `${key}:${value + 1}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击设置终止放电SOC-减 1
         */
        setDevSocReduceClick() {
            const {
                currentSetDevSoc: {
                    key,
                    title
                }
            } = this.data;
            const value = title ? (title * 1) : 0;
            let sendData = `${key}:${value - 1}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击设置终止放电度数-加 0.2 度
         */
        setStopKwhAddClick() {
            const {
                currentSetStopKwh: {
                    key,
                    title
                }
            } = this.data;
            const value = title ? (title * 1) : 0;
            let sendData = `${key}:${value + 1}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击设置终止放电度数-减 0.2 度
         */
        setStopKwhReduceClick() {
            const {
                currentSetStopKwh: {
                    key,
                    title
                }
            } = this.data;
            const value = title ? (title * 1) : 0;
            let sendData = `${key}:${value - 1}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击设置终止放电时长-加 10 min
         */
        setStopDurAddClick() {
            const {
                currentSetDevSoc: {
                    key,
                    title
                }
            } = this.data;
            const value = title ? (title * 1) : 0;
            let sendData = `${key}:${value + 10}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击设置终止放电时长-减 10 min
         */
        setStopDurReduceClick() {
            const {
                currentSetDevSoc: {
                    key,
                    title
                }
            } = this.data;
            const value = title ? (title * 1) : 0;
            let sendData = `${key}:${value - 10}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击切换终止模式
         */
        handleStopModeActionsheetShow() {
            this.setData({
                showStopModeActionsheet: true
            })
        },
        stopModeChange: function (event) {
            this.setData({
                showStopModeActionsheet: false
            })
            const {
                value
            } = event.detail;
            const currentInfo = this.data.renderItems.find(e => e.key === 'SetStopMode');
            if (currentInfo.title * 1 === value * 1) {
                // 未改变
                return
            }
            let sendData = `${currentInfo.key}:${value}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 拿到 infos 渲染到页面
         */
        handleRenderData(datastr = '') {
            datastr = datastr.replace(/[\r\n]/g, '');
            this.data.__tempData = `${this.data.__tempData}${datastr}`;
            let handleArr = this.data.__tempData.split(`}{`);
            if (handleArr.length < 3) {
                console.log('数据不完整');
                return
            }
            handleArr = handleArr.map((e, i, s) => {
                if (e.indexOf('{') < 0) {
                    e = `{${e}`;
                }
                if (e.indexOf('}') < 0) {
                    e = `${e}}`;
                }
                return e;
            })
            const str = handleArr[handleArr.length - 2];
            const infos = JSON.parse(str);
            this.data.__tempData = {
                ...this.data.__tempData,
                ...infos
            }
            this.renderFunc();
        },

        /**
         * 渲染到页面
         */
        renderFunc: Throttle(function () {
            const {
                renderObj,
                __tempData,
                currentSetDevSoc,
                currentSetStopKwh,
                currentSetStopDur,
                renderItems
            } = this.data;
            if (!compareXY(renderObj, __tempData)) {
                // 内容更新时候，取消 loading
                wx.hideLoading();
            }
            const renderResult = JSON.parse(JSON.stringify(__tempData));
            const resultItems = renderItems.map(e => {
                e.title = renderResult[e.key];
                return e;
            });
            this.setData({
                renderObj: renderResult,
                currentSetDevSoc: {
                    ...currentSetDevSoc,
                    title: renderResult['SetDevSoc']
                },
                currentSetStopKwh: {
                    ...currentSetStopKwh,
                    title: renderResult['SetStopKwh']
                },
                currentSetStopDur: {
                    ...currentSetStopDur,
                    title: renderResult['SetStopDur']
                },
                renderItems: resultItems
            })
        }, 50),
    }
});