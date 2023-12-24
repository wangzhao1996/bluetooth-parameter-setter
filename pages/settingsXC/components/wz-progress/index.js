// components/wz-circle/index.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {
        value: {
            type: Number,
            value: 0,
            observer: function (newVal) {
                let progress = newVal;
                this.updateProgress(newVal);
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        renderSize: 0,
    },

    lifetimes: {
        attached: function () {
            const {
                value
            } = this.data;
            this.updateProgress(value);
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        updateProgress(value = 0) {
            let progress = value;
            if (progress < 0) {
                progress = 0;
            }
            if (progress > 100) {
                progress = 100
            }
        }
    }
})