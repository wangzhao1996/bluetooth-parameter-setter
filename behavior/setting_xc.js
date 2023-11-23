import Throttle from "../utils/throttle";
import {
    compareXY
} from "../utils/index";

/**
 * @typedef {Object} __tempData
 * @property {number} AddKw - 当前功率
 * @property {number} BatSoc - 充电进度
 * @property {number} CCStatus - 状态 - 0:未知 1:已插枪 2:未插枪
 * @property {number} HigTemp - 当前最高温度
 * @property {number} LowTemp - 当前最低温度
 * @property {number} MaxBattAH - 电池容量
 * @property {number} MaxHigVol - 最高电压
 * @property {number} MaxLowVol - 最低电压
 * @property {number} MeasCur - 测量电流
 * @property {number} MeasVol - 测量电压
 * @property {number} MaxTemp - 最高允许温度
 * @property {number} NeedCur - 需求电流
 * @property {number} NeedVol - 需求电压
 * @property {number} NowStatus - 当前放电状态
 * @property {number} OutCur - 输出电流
 * @property {number} OutVol - 输出电压
 * @property {number} RunCode - 故障状态(运行代码)
 * @property {number} SetDevSoc - 终止SOC
 * @property {number} SingleV - 单体电压
 * @property {string} SoftVer - 软件版本
 * @property {number} WorkTime - 取电时长
 */
let __tempData = {
    AddKw: 0,
    BatSoc: 0,
    CCStatus: 0,
    HigTemp: 0,
    LowTemp: 0,
    MaxBattAH: 0,
    MaxHigVol: 0,
    MaxLowVol: 0,
    MeasCur: 0,
    MeasVol: 0,
    MaxTemp: 0,
    NeedCur: 0,
    NeedVol: 0,
    NowStatus: 0,
    OutCur: 0,
    OutVol: 0,
    RunCode: 0,
    SetDevSoc: 0,
    SingleV: 0,
    SoftVer: 'v1.0.0',
    WorkTime: 0,
};

module.exports = Behavior({

    /**
     * 组件的初始数据
     */
    data: {
        __upgradeCode: 'MaxHigVol:999', // 用于升级的代码密语
        __tempData: JSON.parse(JSON.stringify(__tempData)),
        renderObj: JSON.parse(JSON.stringify(__tempData)),
        gradientColor: { // 设置渐变
            '100%': '#ffffff',
            '0%': '#a9c1af',
        },
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
            key: `SoftVer`,
            label: `软件版本\n`,
            title: `v1.0`,
            subtitle: ``,
            isHideItem: true, // 不展示
            isReadyOnly: true, // 只读
            actionLabelName: `软件版本`,
        }, {
            key: `RunCode`, // 字段 key
            label: `运行代码\n`, // 描述
            title: `0`, // 数据
            subtitle: ``, // 单位
            imgName: `daima`, // 图标名称
            isHideItem: true, // 不展示
            isReadyOnly: true, // 只读
            actionLabelName: `运行代码`,
            actionList: {
                80: `通讯中`,
                81: `动力电池组电压高于充电电压`,
                82: `握手阶段接收BMS辨识帧编号错误`,
                83: `开始电压过高或者过低`,
                85: `通讯接收数据超时`,
                86: `到达目标SOC值`,
                87: `最高允许充电电压大于模块最大输出电压`,
                102: `来自软件下发的关机命令`,
                103: `来自手动进行的关机命令`,
                105: `达到所需SOC值`,
                121: `车辆SOC电量过低关机`,
                122: `握手阶段超时`,
                123: `配置阶段超时`,
                124: `充电阶段超时`,
                125: `未知阶段超时`,
                126: `BMS未响应，通讯链接异常`,
                127: `BMS发出了关机请求`,
            }
        }, {
            key: `AddKw`,
            label: `当前功率\n`,
            title: `0`,
            subtitle: `Kw`,
            isHideItem: true, // 不展示
            isReadyOnly: true, // 只读
            actionLabelName: `当前功率`,
        }, {
            key: `CCStatus`, // 字段 key
            label: `插枪状态\n`, // 描述
            title: `0`, // 数据
            subtitle: ``, // 单位
            isHideItem: true, // 不展示
            isReadyOnly: true, // 只读
            actionLabelName: `插枪状态`,
            actionList: {
                0: `未知`,
                1: `已插枪`,
                2: `未插枪`,
            }
        }, {
            key: `SetDevSoc`,
            label: `终止SOC\n`,
            title: `0`,
            subtitle: ``,
            imgName: `daima`,
            isReadyOnly: true, // 只读
        }, {
            key: `LowTemp`,
            label: `最低温度\n`,
            title: `0`,
            subtitle: `℃`,
            imgName: `wendu`,
            isReadyOnly: true, // 只读
        }, {
            key: `HigTemp`,
            label: `最高温度\n`,
            title: `0`,
            subtitle: `℃`,
            imgName: `wendu`,
            isReadyOnly: true, // 只读
        }, {
            key: `MaxTemp`,
            label: `允许温度\n`,
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
            key: `NeedVol`,
            label: `需求电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            isReadyOnly: true, // 只读
        }, {
            key: `OutVol`,
            label: `输出电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            isReadyOnly: true, // 只读
        }, {
            key: `MeasVol`,
            label: `测量电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            isReadyOnly: true, // 只读
        }, {
            key: `MaxLowVol`,
            label: `最小电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            actionType: `input`,
            actionLabelName: `最小电压`,
            actionInputType: `digit`
        }, {
            key: `MaxHigVol`,
            label: `最大电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            actionType: `input`,
            actionLabelName: `最大电压`,
            actionInputType: `digit`
        }, {
            key: `NeedCur`,
            label: `需求电流\n`,
            title: `0`,
            subtitle: `A`,
            imgName: `dianliu`,
            isReadyOnly: true, // 只读
        }, {
            key: `OutCur`,
            label: `输出电流\n`,
            title: `0`,
            subtitle: `A`,
            imgName: `dianliu`,
            isReadyOnly: true, // 只读
        }, {
            key: `MeasCur`,
            label: `测量电流\n`,
            title: `0`,
            subtitle: `A`,
            imgName: `dianliu`,
            isReadyOnly: true, // 只读
        }, {
            key: `WorkTime`,
            label: `取电时长\n`,
            title: `0`,
            subtitle: `Min`,
            imgName: `shijian`,
            isReadyOnly: true, // 只读
        }, {
            key: `MaxBattAH`,
            label: `电池容量\n`,
            title: `0`,
            subtitle: `AH`,
            imgName: `rongliang`,
            isReadyOnly: true, // 只读
        }],
        settingPopupValue: ``, // 预览数据
        settingPopupInfo: null, // 弹窗内容
        settingPopupShow: false, // 弹窗是否展示
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
         * 设置项隐藏
         */
        setItemHide: function () {
            this.setData({
                settingPopupShow: false,
            })
            var timerName = setTimeout(() => {
                clearTimeout(timerName);
                this.setData({
                    settingPopupValue: ``,
                    settingPopupInfo: null
                })
            }, 300);
        },

        /**
         * 点击设置项
         */
        setItemClick: function (event) {
            const {
                dataset: {
                    item
                }
            } = event.currentTarget;
            if (item.isReadyOnly) {
                // 只读
                return false;
            }
            if (item.actionType === `input`) {
                // 弹窗展示输入框
                this.setData({
                    settingPopupValue: item.title,
                    settingPopupInfo: item,
                    settingPopupShow: true
                })
                return
            }
            if (item.actionType === `picker`) {
                // 弹窗展示选择器
                this.setData({
                    settingPickerInfo: item,
                    settingPickerShow: true
                })
            }
        },

        /**
         * 输入内容
         */
        valueChange: function (event) {
            const {
                dataset: {
                    name
                }
            } = event.currentTarget;
            let value = event.detail;
            if (name === `VinCode`) {
                value = value.replace(/[^\w\/]/ig, '').toUpperCase();
            }
            this.setData({
                settingPopupValue: value
            })
        },

        /**
         * 表单提交
         */
        formSubmitClick: function (event) {
            const valueObj = event.detail.value;
            let keyStr = ``,
                valueStr = ``;
            for (let key in valueObj) {
                keyStr = key;
            }
            valueStr = valueObj[keyStr];
            let sendData = `${keyStr}:${valueStr}`;
            this.data.send_data = sendData;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
            this.setItemHide(); // 关闭弹窗
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
                renderItems: resultItems
            })
        }, 50),
    }
});