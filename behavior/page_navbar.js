
module.exports = Behavior({

    /**
     * 组件的初始数据
     */
    data: {
        _vanNavBarHeight: 0,
        isUpgradePage: false,
    },

    methods:{

        /**
         * 点击按钮返回上一页
         */
        pageNavBarBackClick: function() {
            if (this.data.hasOwnProperty('isUpdating') && this.data.isUpdating) {
                this.onNotify && this.onNotify({ 
                    type: 'danger',
                    message: '正在更新中，请勿退出！'
                });
                return
            }
            if (this.data.hasOwnProperty('isUpgradePage') && this.data.isUpgradePage) {
                this.onNotify && this.onNotify({
                    type: 'warning',
                    message: '请先退出设置后再返回！'
                });
                return
            }
            wx.navigateBack();
        },

        /**
         * 点击按钮进入设置更新
         */
        pageNavBarSettingClick: function() {
            this.data.isUpgradePage = true;
            this.setData({
                isUpgradePage: true
            })
        },

        /**
         * 点击按钮进入设置更新
         */
        pageNavBarQuitSettingClick: function() {
            this.data.isUpgradePage = false;
            this.setData({
                isUpgradePage: false
            })
        }
    }
});