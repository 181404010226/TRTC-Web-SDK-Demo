# TRTC Web 快速演示项目

这是一个基于腾讯云实时音视频(TRTC)的Web演示项目，包含邀请功能，允许互联网上的任何人通过链接加入您的视频会议。

## 功能特点

- 实时音视频通话
- 生成分享链接邀请他人加入
- 屏幕共享
- 文字聊天
- 多语言支持（中文/英文）

## 安装与使用

### 前提条件

1. 注册[腾讯云账号](https://cloud.tencent.com/)
2. 在[腾讯云实时音视频控制台](https://console.cloud.tencent.com/trtc)创建应用并获取 SDKAppID 和 SDKSecretKey
3. 安装 [Node.js](https://nodejs.org/) (版本 10 或更高)

### 安装步骤

1. 克隆或下载本项目
2. 进入项目目录并安装依赖

```bash
npm install
```

3. 创建并配置您的应用信息

复制 `config.js.example` 文件并重命名为 `config.js`，然后编辑该文件，填入您的 SDKAppID 和 SDKSecretKey：

```bash
# 复制示例配置文件
cp config.js.example config.js

# 编辑配置文件，填入您的实际配置
```

在 `config.js` 文件中，找到以下代码并替换为您自己的 SDKAppID 和 SDKSecretKey：

```javascript
// TRTC配置
module.exports = {
  SDKAPPID: 0, // 替换为你的 SDKAppID
  SECRETKEY: '' // 替换为你的密钥
};
```

> 注意: 为了安全起见，config.js 文件已被添加到 .gitignore 中，确保您的密钥信息不会被提交到版本控制系统中。

4. 启动服务器

```bash
npm start
```

服务器默认在 http://localhost:3000 运行

## 使用内网穿透实现外网访问

为了让外网用户能够访问您的TRTC应用并加入会议，您需要使用内网穿透工具：

### 使用内网穿透工具（如花生壳、ngrok等）

1. 下载并安装内网穿透工具（如[花生壳](https://hsk.oray.com/)、[ngrok](https://ngrok.com/)等）
2. 配置内网穿透，将本地的3000端口映射到公网
3. 获取公网访问地址（如 `http://xxx.ngrok.io` 或您的花生壳域名）

### 重要提示

- **务必使用内网穿透生成的URL访问应用**，而不是localhost，这样才能正确自动配置SDK参数
- 当其他人使用您分享的邀请链接时，他们将连接到通过内网穿透暴露的服务
- 内网穿透地址访问时会自动填写SDKAppID和SDKSecretKey
- 确保服务器在会议期间保持运行

### 内网穿透配置示例

**使用ngrok：**
```bash
# 安装ngrok后运行
ngrok http 3000
```

**使用花生壳：**
在花生壳客户端配置映射，本地端口填写3000，然后启用映射

## 使用指南

### 创建会议

1. 使用内网穿透生成的URL（重要！不要使用localhost）访问您的应用
2. 您会看到SDKAppID和SDKSecretKey已自动填写（绿色提示条）
3. 输入用户ID和房间ID
4. 点击「进入房间」按钮
5. 选择是否开启音频/视频
6. 成功进入房间后，您可以：
   - 开启/关闭麦克风
   - 开启/关闭摄像头
   - 共享屏幕
   - 发送聊天消息

### 邀请他人

1. 进入房间后，系统会显示邀请链接
2. 点击复制按钮复制链接
3. 将链接发送给您想邀请的人
4. 对方点击链接即可加入会议

## 注意事项

- 确保使用内网穿透URL访问应用，否则配置可能无法自动填写
- 生产环境中，请务必将 UserSig 生成代码部署在您的服务器上，避免密钥泄露
- 默认配置适用于开发和测试，在正式上线前请注意调整安全配置
- 本项目仅用于演示 TRTC 的基本功能，生产环境请根据实际情况开发更完善的应用

## 问题反馈

如有问题，请参考[腾讯云 TRTC 文档](https://cloud.tencent.com/document/product/647)或[GitHub 项目](https://github.com/LiteAVSDK/TRTC_Web)提交 issue。
