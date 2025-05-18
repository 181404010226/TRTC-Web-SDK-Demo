const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
// 引入腾讯云官方SDK
const TLSSigAPIv2 = require('tls-sig-api-v2');
// 引入配置文件
const config = require('./config');

const app = express();
const port = process.env.PORT || 3000;

// TRTC配置从config.js导入
const SDKAPPID = config.SDKAPPID;
const SECRETKEY = config.SECRETKEY;

// 创建签名实例
const api = new TLSSigAPIv2.Api(SDKAPPID, SECRETKEY);

// 配置应用
app.use(bodyParser.json());

// 处理首页请求 - 注入SDKAPPID和SECRETKEY到HTML页面
app.get('/', (req, res) => {
  // 读取index.html文件
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  
  // 在JavaScript中插入SDKAPPID和SECRETKEY
  const scriptToInject = `
    <script>
      window.AUTO_CONFIG = {
        sdkAppId: ${SDKAPPID},
        sdkSecretKey: "${SECRETKEY}"
      };
    </script>
  `;
  
  // 将脚本插入到head标签结束前
  html = html.replace('</head>', `${scriptToInject}</head>`);
  
  // 发送修改后的HTML
  res.send(html);
});

// 为其他静态资源提供服务
app.use(express.static(path.join(__dirname)));

// 打印请求日志的中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
  console.log(`SDKAPPID: ${SDKAPPID}`);
  console.log(`SECRETKEY: ${SECRETKEY.substring(0, 4)}${'*'.repeat(SECRETKEY.length - 8)}${SECRETKEY.substring(SECRETKEY.length - 4)}`);
}); 