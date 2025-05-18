const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// 引入腾讯云官方SDK
const TLSSigAPIv2 = require('tls-sig-api-v2');

const app = express();
const port = process.env.PORT || 3000;

// 配置应用
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// 打印请求日志的中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// TRTC配置 - 需要替换成你的实际配置
const SDKAPPID = 1600087213; // 替换为你的 SDKAppID
const SECRETKEY = 'b95c36f2834dc92f8868c365c1061374d01c83fdc2740f4e6cbf65e9749dbe93'; // 替换为你的密钥 - 注意：这个密钥应该保密，生产环境应存储在环境变量中

// 创建签名实例
const api = new TLSSigAPIv2.Api(SDKAPPID, SECRETKEY);

// 生成UserSig的API接口 - 处理两种可能的路径
app.post('/api/generate-usersig', handleGenerateUserSig);
app.post('*/api/generate-usersig', handleGenerateUserSig);

// API处理函数 - 使用官方SDK生成UserSig
function handleGenerateUserSig(req, res) {
  try {
    console.log('Received request for UserSig:', req.body);
    const { roomId, nickname } = req.body;
    
    if (!roomId) {
      console.log('Error: Room ID is required');
      return res.status(400).json({ error: 'Room ID is required' });
    }
    
    // 使用随机生成的userId或用户提供的昵称
    const userId = nickname || `user_${Math.floor(Math.random() * 1000000)}`;
    
    // 设置UserSig有效期，单位秒，默认7天（604800秒）
    const expire = 604800;
    
    // 使用腾讯云官方SDK生成UserSig
    const userSig = api.genUserSig(userId, expire);
    console.log(`Generated official UserSig for ${userId} in room ${roomId}`);
    
    // 返回生成的信息
    res.json({
      sdkAppId: SDKAPPID,
      userId: userId,
      userSig: userSig,
      roomId: roomId
    });
    
  } catch (error) {
    console.error('Error generating UserSig:', error);
    res.status(500).json({ error: 'Failed to generate UserSig', details: error.message });
  }
}

// 启动服务器
app.listen(port, () => {
  console.log(`TRTC server running on port ${port}`);
  console.log(`Server URL: http://localhost:${port}`);
}); 