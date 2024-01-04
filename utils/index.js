/**
 * 枚举合法的设备名称和对应的页面路径
 */
const DEVIVE_LIST = [{
    deviceFirstName: `XC`,
    deviceSettingPath: `/pages/settingsXC/index`
}, {
    deviceFirstName: `BMS`,
    deviceSettingPath: `/pages/settingsBMS/index`
}];

/**
 * 通过设备名称校验是否是合法的设备
 * @param {string} deviceName 设备名称
 * @returns {Boolean}
 */
export const checkIsLegalDevice = deviceName => {
    return DEVIVE_LIST.map(e => e.deviceFirstName).includes(deviceName.split(`_`)[0]);
}

/**
 * 通过设备名称获取对应类型设备页面路径
 * @param {string} deviceName 设备名称
 * @returns {string}
 */
export const handleDevicePath = (deviceId, deviceName) => {
    const currentIndex = DEVIVE_LIST.map(e => e.deviceFirstName).indexOf(deviceName.split(`_`)[0]);
    if (currentIndex < 0) {
        return '';
    }
    return `${DEVIVE_LIST[currentIndex].deviceSettingPath}?devId=${encodeURIComponent(deviceId)}&name=${encodeURIComponent(deviceName)}`;
}

/**
 * 通过 RSSI 返回对应信号图标
 * @param {number} RSSI 信号强度
 * @returns {string}
 */
export const handleRSSI = RSSI => {
    if (RSSI > -40) {
        return `/imgs/scan/5.png`;
    }
    if (RSSI > -50) {
        return `/imgs/scan/4.png`;
    }
    if (RSSI > -60) {
        return `/imgs/scan/3.png`;
    }
    if (RSSI > -70) {
        return `/imgs/scan/2.png`;
    }
    return `/imgs/scan/1.png`;
}
/**
 * 判断对象x，和对象y是否相等；
 * @param x
 * @param y
 * @returns {boolean}
 */
export const compareXY = function deepCompare(x, y) {
    let i, l, leftChain, rightChain;

    function compare2Objects(x, y) {
        let p;
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }
        if (x === y) {
            return true;
        }
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }
        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }
        if (x.constructor !== y.constructor) {
            return false;
        }
        if (x.prototype !== y.prototype) {
            return false;
        }
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }
        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }
        return true;
    }
    if (arguments.length < 1) {
        return true;
    }
    for (i = 1, l = arguments.length; i < l; i++) {
        leftChain = []; //Todo: this can be cached
        rightChain = [];
        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }
    return true;
}

/**
 * 比较版本号
 * @param {string} v1 版本号
 * @param {string} v2 版本号
 * @returns {number}
 * @example
 * compareVersion('1.11.0', '1.9.9') // 1, v1 > v2
 * compareVersion('1.11.0', '1.11.0') // 0, v1 == v2
 * compareVersion('1.11.0', '1.11.1') // -1, v1 < v2
 */
export const compareVersion = (v1, v2) => {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])
        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}