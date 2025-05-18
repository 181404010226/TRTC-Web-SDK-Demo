/* eslint-disable*/
import { 
  setButtonLoading, 
  setButtonDisabled, 
  addSuccessLog, 
  addFailedLog, 
  reportSuccessEvent, 
  reportFailedEvent, 
  getQueryString
} from './utils.js';
import { initDevice } from './device.js';
import { setupChatUI } from './chat.js';
import { startLocalAudio, startLocalVideo } from './media.js';
import { stopLocalAudio, stopLocalVideo } from './media.js';
import { stopShare } from './share.js';
import { createShareLink } from './share.js';

// Global variables
let sdkAppId;
let sdkSecretKey;
let roomId;
let userId;
let shareUserId;
let trtc;
let shouldMuteAudioOnJoin = true;
let shouldMuteVideoOnJoin = true;

// DOM elements
const invite = document.getElementById('invite');
const inviteUrl = document.getElementById('inviteUrl');

export function initRoom(trtcInstance) {
  trtc = trtcInstance;

  // Setup mute checkbox listeners
  const muteAudioCheckbox = document.getElementById('muteAudioCheckbox');
  const muteVideoCheckbox = document.getElementById('muteVideoCheckbox');
  
  if (muteAudioCheckbox) {
    muteAudioCheckbox.addEventListener('change', (e) => {
      shouldMuteAudioOnJoin = e.target.checked;
    });
  }
  
  if (muteVideoCheckbox) {
    muteVideoCheckbox.addEventListener('change', (e) => {
      shouldMuteVideoOnJoin = e.target.checked;
    });
  }
}

export function initParams() {
  sdkAppId = parseInt(document.getElementById('sdkAppId').value);
  sdkSecretKey = document.getElementById('sdkSecretKey').value;
  roomId = parseInt(document.getElementById('roomId').value);
  userId = document.getElementById('userId').value;
  shareUserId = 'share_' + userId;

  if (!(sdkAppId && sdkSecretKey && roomId && userId)) {
    if (window.lang_ === 'zh-cn') {
      alert('请检查参数 SDKAppId, SDKSecretKey, userId, roomId 是否输入正确！');
    } else if (window.lang_ === 'en') {
      alert('Please fill in the correct SDKAppId, SDKSecretKey, userId, roomId!');
    }

    throw new Error('Please fill in the correct SDKAppId, SDKSecretKey, userId, roomId');
  }
}

export async function enterRoom() {
  if (window.isIframe) initDevice();
  initParams();
  setButtonLoading('enter', true);
  try {
    const { userSig } = genTestUserSig({ sdkAppId, userId, sdkSecretKey });
    await trtc.enterRoom({ roomId, sdkAppId, userId, userSig });
    reportSuccessEvent('enterRoom', sdkAppId);
    refreshLink();
    invite.style.display = 'flex';
    addSuccessLog(`[${userId}] enterRoom.`);
    setButtonLoading('enter', false);
    setButtonDisabled('enter', true);
    
    // Initialize chat UI
    setupChatUI(trtc);
    
    // Only start audio/video if not muted
    if (!shouldMuteAudioOnJoin) {
      startLocalAudio(trtc);
    }
    if (!shouldMuteVideoOnJoin) {
      startLocalVideo(trtc);
    }
  } catch (error) {
    console.log('enterRoom error', error);
    setButtonLoading('enter', false);
    reportFailedEvent({
      name: 'enterRoom',
      sdkAppId,
      roomId,
      error
    });
    addFailedLog(`[${userId}] enterRoom failed.`);
  }
}

export async function exitRoom() {
  invite.style.display = 'none';
  setButtonLoading('exit', true);
  if (trtc) {
    try {
      await trtc.exitRoom();
      reportSuccessEvent('exitRoom', 0);
      addSuccessLog(`[${userId}] exitRoom.`);
      setButtonLoading('exit', false);
      setButtonDisabled('enter', false);
    } catch (error) {
      reportFailedEvent({
        name: 'exitRoom',
        sdkAppId,
        roomId,
        error,
      });
      setButtonLoading('exit', false);
      addFailedLog(`[${userId}] exitRoom failed.`);
    }
    // Clean up resources
    stopLocalAudio(trtc);
    stopLocalVideo(trtc);
    stopShare(trtc);
  }
}

export function refreshLink() {
  if (trtc) {
    inviteUrl.value = createShareLink();
  }
}

export { 
  sdkAppId, 
  sdkSecretKey, 
  roomId, 
  userId, 
  shareUserId,
  shouldMuteAudioOnJoin,
  shouldMuteVideoOnJoin
}; 