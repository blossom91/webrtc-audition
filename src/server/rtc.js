import eventemitter3 from 'eventemitter3';
import * as Media from './media';
import WS from './ws';
import {getUrlParam} from '../utils';

class Channel {
    constructor(pc, callback) {
        this.chat = pc.createDataChannel('chat');
        this.chat.onopen = () => {};
        this.chat.onmessage = (event) => {
            let data = JSON.parse(event.data);
            callback(data);
        };
        this.chat.onerror = (e) => {
            console.log(e);
        };

        pc.ondatachannel = (event) => {
            this.channel = event.channel;
            this.channel.onopen = (event) => {};
            this.channel.onmessage = (event) => {
                let data = JSON.parse(event.data);
                if (data.type === 'message') {
                    this.channel.send(event.data);
                }
                callback(data);
            };
        };
    }

    send(data) {
        this.chat.send(JSON.stringify(data));
    }
}
class PC extends eventemitter3 {
    constructor() {
        super();
        this.pc = new RTCPeerConnection();
        this.user = getUrlParam('user');
        this.isManage = +getUrlParam('type') === 0;
        this.isConnect = false;
        this.candidates = [];

        this.chat = new Channel(this.pc, (msg) => {
            this.rtcMessage(msg);
        });

        this.pc.onicecandidate = (e) => {
            if (!e.candidate) {
                return;
            }

            this.ws.sendData({
                type: 'candidate',
                data: e.candidate,
            });
        };

        this.pc.onaddstream = (e) => {
            let v = document.querySelector('#video');
            v.srcObject = e.stream;
            v.onloadedmetadata = () => {
                v.play();
                this.ws.sendData({
                    type: 'success',
                });
            };
        };

        this.ws = new WS((msg) => {
            this.message(msg);
        });

        this.msgHandler = [
            'userList',
            'onCall',
            'addIceCandidate',
            'setRemote',
            'offer',
            'success',
            'error',
            //
        ];
    }
    init() {
        // 简单根据url参数获取用户身份
        // 约定 url 存在 user=zhangsan&type=0/1    0 面试官 1面试人
        if (this.user) {
            this.ws.join(this.user, this.isManage);
        } else {
            console.log('user error');
        }
    }

    sendMsg(data, type = 'message') {
        this.chat.send({
            type,
            data,
        });
    }

    rtcMessage(msg) {
        let {type, data} = msg;
        this.emit(type, data);
        console.log('rtc message', msg);
    }

    message(msg) {
        let {type, data} = msg;
        if (type === 'open') {
            this.init();
        } else {
            if (this.msgHandler.includes(data.type)) {
                this[data.type](data.data);
            } else {
                console.error('Unkown msg type: ' + type);
            }
        }
    }

    success(data) {
        console.log('success---');
        this.isConnect = true;
        this.emit('success');
    }

    userList(data) {
        this.emit('userList', data);
    }

    onCall(data) {
        if (data === 'callend') {
            if (this.isManage) {
                console.log('createOffer-----');
                this._createOffer();
            }
        } else {
            this.emit('onCall', data);
        }
    }

    error(data) {
        console.error(data);
    }

    connect(user, status) {
        this.ws.sendData({
            type: 'connect',
            data: {
                user: this.user,
                manage: this.isManage,
                status: status,
            },
        });
    }

    addIceCandidate(data) {
        console.log('addIceCandidate---');
        this._addIceCandidate(data);
    }

    offer(data) {
        console.log('offer---');
        this._createAnswer(data);
    }

    setRemote(answer) {
        console.log('setRemote---');
        this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    _createAnswer = async (offer) => {
        let stream = await Media.getUserMedia();
        stream.getTracks().forEach((track) => this.pc.addTrack(track, stream));
        let v = document.querySelector('#video');
        v.srcObject = stream;
        v.onloadedmetadata = () => {
            v.play();
        };
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

        let answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(new RTCSessionDescription(answer));
        this.ws.sendData({
            type: 'setRemote',
            data: this.pc.localDescription,
        });
    };

    _createOffer = async () => {
        const offer = await this.pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        });

        await this.pc.setLocalDescription(new RTCSessionDescription(offer));
        this.ws.sendData({
            type: 'offer',
            data: this.pc.localDescription,
        });
    };

    _addIceCandidate = async (candidate) => {
        let candidates = this.candidates;
        candidate && candidates.push(candidate);
        if (this.pc.remoteDescription && this.pc.remoteDescription.type) {
            for (let i = 0; i < candidates.length; i++) {
                await this.pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
            }
        }
    };

    destory() {
        console.log('destory');
    }
}

const pc = new PC();

export default pc;
