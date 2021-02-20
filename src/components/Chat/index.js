import React, {useRef, useState, useEffect} from 'react';
import './index.less';
import pc from '../../server/rtc';

const status = {
    connect: '点击链接',
    call: '正在连接...',
    calling: '正在向你发起连接请求',
    callend: '链接成功',
};

const Chat = () => {
    const [chatlist, setChatlist] = useState([]);
    const [userlist, setUserlist] = useState([]);
    const [isManage] = useState(pc.isManage);
    const [roomStats, setRoomStats] = useState(status.connect);

    const inputRef = useRef();
    const clickBtn = () => {
        if (pc.isConnect) {
            let text = inputRef.current.value;
            pc.sendMsg({
                user: pc.isManage ? 'manage' : 'attendee',
                text: text,
            });
            inputRef.current.value = '';
        } else {
            console.log('no connect');
        }
    };

    const onKeyDown = (e) => {
        if (e.which === 13) {
            // enter
            clickBtn();
        }
    };

    useEffect(() => {
        const updateUserList = (data) => {
            let list = data.filter((item) => {
                if (isManage) {
                    return item !== 'manage';
                } else {
                    return item === 'manage';
                }
            });
            if (list.length) {
                setUserlist(() => {
                    return list;
                });
            }
        };
        const onCall = (data) => {
            setRoomStats(() => status[data]);
        };
        const onSuccess = () => {
            setUserlist(() => []);
            setChatlist(() => {
                return [
                    {
                        type: 'notice',
                        data: {text: '连接成功'},
                    },
                ];
            });
        };
        const onMessage = (msg) => {
            setChatlist((list) => {
                return [
                    ...list,
                    {
                        type: 'msg',
                        data: {user: msg.user === 'manage' ? '假装不紧张的面试官' : '很紧张的面试者', text: msg.text},
                    },
                ];
            });
        };
        pc.on('userList', updateUserList);
        pc.on('onCall', onCall);
        pc.on('success', onSuccess);
        pc.on('message', onMessage);
        return () => {
            pc.removeListener('userList', updateUserList);
            pc.removeListener('onCall', onCall);
            pc.removeListener('success', onSuccess);
        };
    }, []);

    const connect = (user) => {
        if (!pc.isConnect && roomStats === status.connect) {
            pc.connect(user, 'calling');
            setRoomStats(() => status.call);
        }
    };

    const agreeConnect = (user) => {
        if (!pc.isConnect && roomStats === status.calling) {
            pc.connect(user, 'callend');
            setRoomStats(() => status.call);
        }
    };
    return (
        <div className="chat-box">
            <div className="msg-list">
                <ul>
                    {userlist.map((item) => (
                        <li key={item}>
                            {`${item === 'manage' ? '面试官' : '面试者'} 当前在线`}
                            <span className="connect-text" onClick={() => connect(item)}>
                                {roomStats}
                            </span>
                            {roomStats === status.calling && (
                                <span className="call-text" onClick={() => agreeConnect(item)}>
                                    点击接受请求
                                </span>
                            )}
                        </li>
                    ))}
                    {chatlist.map((item, index) => {
                        let {type, data} = item;
                        if (type === 'msg') {
                            return (
                                <li key={index}>
                                    <span className="name">{data.user}: </span>
                                    <span className="text">{data.text}</span>
                                </li>
                            );
                        } else {
                            return (
                                <li key={index} className="notice">
                                    {data.text}
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>
            <div className="send-box">
                <input type="text" ref={inputRef} onKeyDown={onKeyDown} />
                <button onClick={clickBtn}>发送</button>
            </div>
        </div>
    );
};

export default Chat;
