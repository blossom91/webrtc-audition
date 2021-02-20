一个基于webrtc的面试系统

# feature
1. 实现代码同步
2. 实现聊天
3. 实现视频音频同步
4. 实现用户管理



# use

```
npm i

node server.js

npm run dev
```

# warn
1. 学习用demo,不保证更新
2. server 只是信令交换,整体上不处理信息,保证最小服务器压力
3. 测试环境请使用 localhost chrome不允许http协议使用 webrtc
4. 正式环境需要处理 STUN TURN 服务,保证可以寻址成功