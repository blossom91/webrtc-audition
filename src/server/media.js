/**
 * @file 媒体相关
 * @author zhaohang12@baidu.com
 * @date 2021-02-18 20:56:14
 */
export const getUserMedia = () => {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
            width: {ideal: 1280, min: 1024, max: 1920},
            height: {ideal: 576, min: 720, max: 1080},
            frameRate: {max: 30},
        },
    });
};
