export default function getLocation() {
    return new Promise((resolve) => {
        wx.getLocation({
            type: 'gcj02',
            success(res) {
                console.log(`getLocation`);
                console.table(res);
                resolve(true)
            },
            fail(error) {
                console.error(error);
                resolve(false)
            }
        })
    })
}