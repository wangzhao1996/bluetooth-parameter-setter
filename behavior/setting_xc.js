import Throttle from "../utils/throttle";
import {
    compareXY
} from "../utils/index";

let __tempData = {
    BatSoc: 0, // 充电进度
    NowStatus: 0, // 当前放电状态
    RunCode: 0, // 运行代码
    NeedVol: 0, // 需求电压
    NeedCur: 0, // 需求电流
    MeasVol: 0, // 测量电压
    MeasCur: 0, // 测量电流
    MaxTemp: 0, // 最高允许温度
    HigTemp: 0, // 当前最高温度
    LowTemp: 0, // 当前最低温度
    SingleV: 0, // 单体电压
    MaxBattAH: 0, // 电池容量
    WorkTime: 0, // 取电时长
    SoftVer: 'v1.0', // 软件版本
    MaxHigVol: 0, // 最高电压
    MaxLowVol: 0, // 最低电压
};

module.exports = Behavior({

    /**
     * 组件的初始数据
     */
    data: {
        __tempData: JSON.parse(JSON.stringify(__tempData)),
        renderObj: JSON.parse(JSON.stringify(__tempData)),
        currentSOC: { // 当前SOC
            key: `BatSoc`,
            label: `当前SOC`,
            title: `0`,
            subtitle: ``,
            imgName: ``,
            isReadyOnly: true, // 只读
            actionType: `input`,
            actionLabelName: `当前SOC`,
            actionInputType: `number`
        },
        currentSetDevSoc: {
            key: `SetDevSoc`,
            label: `设置终止放电SOC`,
            title: ``,
            subtitle: ``,
            imgName: ``,
            actionType: `input`,
            actionLabelName: `终止放电SOC`,
            actionInputType: `number`
        },
        renderItems: [{
            key: `SetDevSoc`,
            label: `终止SOC\n`,
            title: `0`,
            subtitle: ``,
            imgName: `daima`,
            isReadyOnly: true, // 只读
        }, {
            key: `MeasCur`,
            label: `测量电流\n`,
            title: `0`,
            subtitle: `A`,
            imgName: `dianliu`,
            isReadyOnly: true, // 只读
        }, {
            key: `MeasVol`,
            label: `测量电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            isReadyOnly: true, // 只读
        }, {
            key: `HigTemp`,
            // label: `最高温度\n`,
            label: `电池温度\n`,
            title: `0`,
            subtitle: `℃`,
            imgName: `wendu`,
            isReadyOnly: true, // 只读
        }, {
            key: `SingleV`,
            label: `单体电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            isReadyOnly: true, // 只读
        }, {
            key: `MaxBattAH`,
            label: `电池容量\n`,
            title: `0`,
            subtitle: `AH`,
            imgName: `rongliang`,
            isReadyOnly: true, // 只读
        }, {
            key: `WorkTime`,
            label: `取电时长\n`,
            title: `0`,
            subtitle: `Min`,
            imgName: `shijian`,
            isReadyOnly: true, // 只读
        }, {
            key: `SoftVer`,
            label: `软件版本\n`,
            title: `v1.0`,
            subtitle: ``,
            imgName: `daima`,
            isHideItem: true, // 不展示
            isReadyOnly: true, // 只读
            actionLabelName: `软件版本`,
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
         * 点击设置终止放电SOC-加
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
         * 点击设置终止放电SOC-减
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
                currentSOC,
                currentSetDevSoc,
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
                currentSOC: {
                    ...currentSOC,
                    title: renderResult['BatSoc']
                },
                currentSetDevSoc: {
                    ...currentSetDevSoc,
                    title: renderResult['SetDevSoc']
                },
                renderItems: resultItems
            })
        }, 50),
    }
});