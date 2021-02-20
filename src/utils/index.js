/**
 * @file 工具函数入口
 * @author zhaohang12@baidu.com
 * @date 2021-02-20 11:14:24
 */

/**
 * 获取url上参数
 */
export const getUrlParam = (name) => {
    let reg = new RegExp(`(^|(&|/?))${name}=([^&]*)(&|$)`, 'i');
    let r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return r[3];
    }
    return '';
};
