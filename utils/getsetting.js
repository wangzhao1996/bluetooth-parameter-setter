/**
 * 获取用户授权状态
 * @param {*} key 
 * @returns 
 * -2: key is required
 * -1: 未选择授权状态
 * 0: 授权状态是关闭
 * 1: 授权状态是开启
 */
export default function getLocationAuth(key = '') {
    return new Promise((resolve) => {
        if (!key) {
            console.error('key is required');
            resolve(-2);
        }
        wx.getSetting({
            success: (res) => {
                if (!res.hasOwnProperty(key)) {
                    resolve(-1);
                } else if (!res.authSetting[key]) {
                    resolve(0)
                } else {
                    resolve(1)
                }
            },
            fail: (error) => {
                resolve(-2)
            }
        })
    })
}
