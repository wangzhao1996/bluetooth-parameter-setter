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
                if (progress < 0) {
                    progress = 0;
                }
                if (progress > 100) {
                    progress = 100
                }
                this.updateProgress(progress);
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
            if (!this.data.renderSize) {
                const sys = wx.getSystemInfoSync();
                this.data.renderSize = Math.floor(sys.windowWidth / 2);
            }
            this.setData({
                renderSize: this.data.renderSize
            })
            const _this = this;
            const query = this.createSelectorQuery();
            query.select('#myCanvas')
                .fields({
                    node: true,
                    size: true
                })
                .exec((res) => {
                    if (!res || !res.length || !res[0]) {
                        return
                    }
                    const canvas = res[0].node;
                    _this.canvas = canvas;
                    _this.ctx = canvas.getContext('2d');
                    // 设置圆环的参数
                    _this.centerX = this.canvas.width / 2;
                    _this.centerY = this.canvas.height / 2;
                    _this.radius = 80; // 半径
                    _this.lineWidth = 10; // 圆环的宽度
                    let progress = this.data.value;
                    if (progress < 0) {
                        progress = 0;
                    }
                    if (progress > 100) {
                        progress = 100
                    }
                    this.drawBackgroundCircle();
                    this.drawProgress(progress);
                })
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        updateProgress() {
            let progress = this.data.value;
            if (progress < 0) {
                progress = 0;
            }
            if (progress > 100) {
                progress = 100
            }
            this.drawBackgroundCircle();
            this.drawProgress(progress);
        },

        drawBackgroundCircle() {
            if (!this.ctx) return
            if (!this.canvas) return
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // 清除画布
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius - this.lineWidth, 0, Math.PI * 2);
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.strokeStyle = 'white'; // 设置圆环的颜色
            this.ctx.stroke();
        },
        
        drawProgress(progress = 0) {
            if (!this.ctx) return
            if (!this.canvas) return
            // 根据进度计算结束角度
            const startAngle = -Math.PI / 2; // 起始角度，从顶部开始
            const endAngle = startAngle + (Math.PI * 2) * (progress / 100); // 根据进度计算结束角度

            // 画黄色进度圆环
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius - this.lineWidth, startAngle, endAngle);
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.strokeStyle = '#F6D68A'; // 设置圆环的颜色
            this.ctx.lineCap = 'round'; // 设置圆环进度两头是圆角
            this.ctx.stroke();
        }
    }
})