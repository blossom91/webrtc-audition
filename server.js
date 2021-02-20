const ws = require('ws');

const wsServer = new ws.Server({
    port: 8001,
});

const userMap = {};

const msgHandler = {
    join(data, client) {
        let {user, manage} = data;
        client._user = user;
        client._manage = manage;
        if (!userMap[user]) {
            userMap[user] = {};
        }
        if (manage) {
            userMap[user].manage = client;
        } else {
            userMap[user].attendee = client;
        }
        let list = Object.keys(userMap[user]);

        // 广播
        list.forEach((key) => {
            userMap[user][key].sendData({
                type: 'userList',
                data: list,
            });
        });
    },

    connect(data, client) {
        const {user, manage, status} = data;
        const users = userMap[user];
        if (manage) {
            client._remote = users.attendee;
        } else {
            client._remote = users.manage;
        }
        client._remote.sendData({
            type: 'onCall',
            data: status,
        });
        if (status === 'callend') {
            client.sendData({
                type: 'onCall',
                data: status,
            });
        }
    },

    candidate(data, client) {
        let remote = client._remote;
        remote.sendData({
            type: 'addIceCandidate',
            data: data,
        });
    },

    setRemote(data, client) {
        let remote = client._remote;
        remote.sendData({
            type: 'setRemote',
            data: data,
        });
    },

    offer(data, client) {
        let remote = client._remote;
        remote.sendData({
            type: 'offer',
            data: data,
        });
    },

    success(data, client) {
        client._remote.sendData({
            type: 'success',
        });
        client.sendData({
            type: 'success',
        });
    },
};

wsServer.on('connection', (client, request) => {
    client.sendData = (data) => {
        client.send(JSON.stringify(data));
    };

    client.sendError = (msg) => {
        client.sendData({
            type: 'error',
            data: msg,
        });
    };

    client.on('message', (msg) => {
        let data = null;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            client.sendError('Unresolved data format');
            console.error(e);
            return;
        }
        if (typeof msgHandler[data.type] === 'function') {
            try {
                msgHandler[data.type](data.data, client);
            } catch (e) {
                console.error(e);
            }
        } else {
            client.sendError('Unresolved data type');
        }
    });

    client.on('close', (error) => {
        let user = client._user;
        let manage = client._manage;
        let key = manage ? 'manage' : 'attendee';
        delete userMap[user][key];
        console.log('ws close', error);
    });
});
