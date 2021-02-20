/**
 * @file 主要通过ws服务处理登录认证和信令认证服务
 * @author zhaohang12@baidu.com
 * @date 2021-02-20 11:09:22
 */

const wsStatus = {
    close: 'close',
    open: 'open',
};

class WS {
    constructor(callback) {
        this.ws = new WebSocket('ws://localhost:8001');
        this.status = wsStatus.close;

        this.ws.onopen = () => {
            console.log('connected successfully');
            this.status = wsStatus.open;
            callback({
                type: 'open',
                data: {},
            });
        };

        this.ws.onmessage = (event) => {
            let data = JSON.parse(event.data);
            callback({
                type: 'message',
                data: data,
            });
        };

        this.ws.onclose = () => {
            console.log('connected close');
            this.status = wsStatus.close;
        };

        this.ws.onerror = (error) => {
            console.error('connected error', error);
        };
    }

    sendData(data) {
        if (this.status === wsStatus.open) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('ws status error');
        }
    }

    join(user, manage) {
        this.sendData({
            type: 'join',
            data: {
                user,
                manage,
            },
        });
    }
}
export default WS;
