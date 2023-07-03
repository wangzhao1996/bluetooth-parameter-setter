import Throttle from "../utils/throttle";
import {
    compareXY
} from "../utils/index";

let __tempData = {
    NwCarSoc: 0, // 当前SOC
    NowStatus: 0, // 当前放电状态
    MaxCharVol: 0, // 最大充电电压
    BattType: 0, // 电池类型
    BtCapAH: 0, // 电池容量
    RatedVol: 0, // 额定总电压
    MaxSinVol: 0, // 单体最大电压
    BtMaxCru: 0, // 最大允许电流
    BtMaxTemp: 0, // 最大允许温度
    CarBtVol: 0, // 当前总电压
    DemandVol: 0, // 需求电压
    DemandCru: 0, // 需求电流
    CharMode: 0, // 充电模式
    NwMaxSiVol: 0, // 当前单体最高电池电压
    EstimTime: 0, // 剩余充电时长
    BatHTemp: 0, // 最高电池温度
    BatLTemp: 0, // 最低电池温度
    VinCode: '', // 车架号VIN码
};

module.exports = Behavior({

    /**
     * 组件的初始数据
     */
    data: {
        __tempData: JSON.parse(JSON.stringify(__tempData)),
        renderObj: JSON.parse(JSON.stringify(__tempData)),
        gradientColor: { // 设置渐变
            '100%': '#ffffff',
            '0%': '#a9c1af',
        },
        currentSOC: { // 当前SOC
            key: `NwCarSoc`,
            label: `当前SOC`,
            title: `0`,
            subtitle: ``,
            imgName: ``,
            actionType: `input`,
            actionLabelName: `当前SOC`,
            actionInputType: `number`
        },
        currentVIN: {
            key: `VinCode`,
            label: `车架号VIN码`,
            title: ``,
            subtitle: ``,
            imgName: ``,
            actionType: `input`,
            actionLabelName: `车架号VIN码`,
            actionInputType: `text`
        },
        renderItems: [{
            key: `MaxCharVol`, // 字段 key
            label: `最大\n充电电压\n`, // 描述
            title: `0`, // 数据
            subtitle: `V`, // 单位
            imgName: `dianya`, // 图标名称
            actionType: `input`, // 弹出输入框更新
            actionLabelName: `最大充电电压`, // 无换行符的label
            actionInputType: `digit` // 弹出的输入框类型
        }, {
            key: `MaxSinVol`,
            label: `单体\n最大电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            actionType: `input`,
            actionLabelName: `单体最大电压`,
            actionInputType: `digit`
        }, {
            key: `CarBtVol`,
            label: `当前\n总电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            // actionType: `input`,
            // actionLabelName: `当前总电压`,
            // actionInputType: `digit`
        }, {
            key: `DemandVol`,
            label: `需求\n电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            actionType: `input`,
            actionLabelName: `需求电压`,
            actionInputType: `digit`
        }, {
            key: `NwMaxSiVol`,
            label: `当前单体最\n高电池电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            actionType: `input`,
            actionLabelName: `当前单体最高电池电压`,
            actionInputType: `digit`
        }, {
            key: `RatedVol`,
            label: `额定\n总电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            actionType: `input`,
            actionLabelName: `额定总电压`,
            actionInputType: `digit`
        }, {
            key: `MeasurVol`,
            label: `测量\n电压\n`,
            title: `0`,
            subtitle: `V`,
            imgName: `dianya`,
            isReadyOnly: true, // 只读
            actionType: `input`,
            actionLabelName: `测量电压`,
            actionInputType: `digit`
        }, {
            key: `BattType`,
            label: `电池\n类型\n`,
            title: `0`,
            subtitle: ``,
            imgName: `dianchi`,
            isHideItem: true, // 不展示
            actionType: `picker`,
            actionLabelName: `电池类型`,
            actionList: [
                `暂未设置`,
                `01H:铅酸电池`,
                `02H:镍氢电池`,
                `03H:磷酸铁锂电池`,
                `04H:锰酸锂电池`,
                `05H:钴酸锂电池`,
                `06H:三元材料电池`,
                `07H:聚合物锂离子电池`,
                `08H:钛酸锂电池`,
                `FFH:其他电池`
            ]
        }, {
            key: `BtCapAH`,
            label: `电池\n容量\n`,
            title: `0`,
            subtitle: `AH`,
            imgName: `rongliang`,
            actionType: `input`,
            actionLabelName: `电池容量`,
            actionInputType: `digit`
        }, {
            key: `BatHTemp`,
            label: `最高\n电池温度\n`,
            title: `0`,
            subtitle: `℃`,
            imgName: `wendu`,
            actionType: `input`,
            actionLabelName: `最高电池温度`,
            actionInputType: `digit`
        }, {
            key: `BatLTemp`,
            label: `最低\n电池温度\n`,
            title: `0`,
            subtitle: `℃`,
            imgName: `wendu`,
            actionType: `input`,
            actionLabelName: `最低电池温度`,
            actionInputType: `digit`
        }, {
            key: `BtMaxTemp`,
            label: `最大\n允许温度\n`,
            title: `0`,
            subtitle: `℃`,
            imgName: `wendu`,
            actionType: `input`,
            actionLabelName: `最大允许温度`,
            actionInputType: `digit`
        }, {
            key: `BtMaxCru`,
            label: `最大\n允许电流\n`,
            title: `0`,
            subtitle: `A`,
            imgName: `dianliu`,
            actionType: `input`,
            actionLabelName: `最大允许电流`,
            actionInputType: `digit`
        }, {
            key: `DemandCru`,
            label: `需求\n电流\n`,
            title: `0`,
            subtitle: `A`,
            imgName: `dianliu`,
            actionType: `input`,
            actionLabelName: `需求电流`,
            actionInputType: `digit`
        }, {
            key: `MeasurCru`,
            label: `测量\n电流\n`,
            title: `0`,
            subtitle: `A`,
            imgName: `dianliu`,
            isReadyOnly: true, // 只读
            actionType: `input`,
            actionLabelName: `测量电流`,
            actionInputType: `digit`
        }, {
            key: `CharMode`,
            label: `充电\n模式\n`,
            title: `0`,
            subtitle: ``,
            imgName: `daima`,
            isHideItem: true, // 不展示
            actionType: `picker`,
            actionLabelName: `充电模式`,
            actionList: [
                `暂未设置`,
                `恒压充电`,
                `恒流充电`
            ]
        }, {
            key: `EstimTime`,
            label: `剩余\n充电时长\n`,
            title: `0`,
            subtitle: `Min`,
            imgName: `shijian`,
            actionType: `input`,
            actionLabelName: `剩余充电时长`,
            actionInputType: `number`
        }],
        settingPopupValue: ``, // 预览数据
        settingPopupInfo: null, // 弹窗内容
        settingPopupShow: false, // 弹窗是否展示
        settingPickerInfo: null, // 选择器内容
        settingPickerShow: false, // 选择器是否展示
    },

    methods: {
        /**
         * 点击选择电池类型
         */
        pickerConfirmClick: function (event) {
            const {
                settingPickerInfo
            } = this.data;
            const {
                index
            } = event.detail;
            this.data.send_data = `${settingPickerInfo.key}:${index}`;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
            this.pickerCancelClick(); // 关闭弹窗
        },

        /**
         * 点击选择器的关闭事件
         */
        pickerCancelClick: function (event) {
            this.setData({
                settingPickerShow: false,
            })
            var timerName = setTimeout(() => {
                clearTimeout(timerName);
                this.setData({
                    settingPickerInfo: null
                })
            }, 300);
        },

        /**
         * 点击发送：开始放电
         */
        settingStartClick() {
            // 不能下发数据
            wx.showToast({
                icon: 'error',
                title: '不能控制'
            })
            return
            wx.showLoading({
                title: '请稍后…',
                mask: true
            })
            this.data.send_data = `SetBmsSta:1`;
            this.bingButtonSendData && this.bingButtonSendData(); // 发送事件
        },

        /**
         * 点击发送：结束放电
         */
        settingEndClick() {
            wx.showLoading({
                title: '请稍后…',
                mask: true
            })
            this.data.send_data = `SetBmsSta:0`;
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
            if (keyStr === `VinCode` && valueStr.length < 17) {
                wx.showToast({
                    icon: `error`,
                    title: `不合法的车架号！`,
                })
                return
            }
            if (keyStr === `VinCode`) {
                sendData = `${keyStr}:"${valueStr}"`;
            }
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
                currentVIN,
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
                    title: renderResult['NwCarSoc']
                },
                currentVIN: {
                    ...currentVIN,
                    title: renderResult['VinCode']
                },
                renderItems: resultItems
            })
        }, 50),
    }
});