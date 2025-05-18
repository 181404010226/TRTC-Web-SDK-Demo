/* eslint-disable*/
import { addStreamView, removeStreamView } from './media.js';
import { displayMessage } from './chat.js';
import { userId } from './room.js';
import { stopShare } from './share.js';
import { getCamera, getMicrophone } from './device.js';
import { clearTooltip, showTooltip } from './utils.js';
import { DEMOKEY } from './config.js';

export function initEventListeners(trtc) {
  // TRTC Events
  trtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, ({ userId, streamType }) => {
    // In order to display the video, you need to place an HTMLElement in the DOM, which can be a div tag with an id of `${userId}_${streamType}`.
    const elementId = `${userId}_${streamType}`;
    addStreamView(elementId);
    trtc.startRemoteVideo({ userId, streamType, view: elementId });
  });
  
  trtc.on(TRTC.EVENT.REMOTE_VIDEO_UNAVAILABLE, ({ userId, streamType }) => {
    const elementId = `${userId}_${streamType}`;
    removeStreamView(elementId);
    trtc.stopRemoteVideo({ userId, streamType });
  });
  
  trtc.on(TRTC.EVENT.SCREEN_SHARE_STOPPED, () => {
    console.log('screen sharing was stopped');
    stopShare(trtc);
  });
  
  trtc.on(TRTC.EVENT.DEVICE_CHANGED, async ({ type }) => {
    if (type === 'camera') getCamera();
    if (type === 'microphone') getMicrophone();
  });
  
  // Add event listener for custom messages - use the correct event name
  trtc.on(TRTC.EVENT.CUSTOM_MESSAGE, (event) => {
    console.log('Received custom message event:', event);
    try {
      // Decode ArrayBuffer to string
      const jsonString = new TextDecoder().decode(event.data);
      console.log('Decoded message:', jsonString);
      
      // Parse JSON string to object
      const messageObj = JSON.parse(jsonString);
      console.log('Parsed message object:', messageObj);
      
      if (messageObj.userId !== userId) {
        displayMessage(messageObj, false);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  // Button event listeners
  setupButtonListeners(trtc);
  
  // Clipboard functionality
  setupClipboard();
}

export function setupButtonListeners(trtc) {
  // DOM elements
  const enterBtn = document.getElementById('enter');
  const exitBtn = document.getElementById('exit');
  const startLocalVideoBtn = document.getElementById('startLocalVideo');
  const startLocalAudioBtn = document.getElementById('startLocalAudio');
  const stopLocalAudioBtn = document.getElementById('stopLocalAudio');
  const stopLocalVideoBtn = document.getElementById('stopLocalVideo');
  const startShareBtn = document.getElementById('startShare');
  const stopShareBtn = document.getElementById('stopShare');
  const cameraSelect = document.getElementById('camera-select');
  const microphoneSelect = document.getElementById('microphone-select');
  const consoleBtn = document.getElementById('console');
  const github = document.getElementById('github');
  const appInfoDoc = document.getElementById('app-info-doc');
  
  // Import functions dynamically to avoid circular dependencies
  import('./room.js').then(({ enterRoom, exitRoom }) => {
    enterBtn.addEventListener('click', enterRoom, false);
    exitBtn.addEventListener('click', exitRoom, false);
  });

  import('./media.js').then(({ startLocalVideo, startLocalAudio, stopLocalAudio, stopLocalVideo }) => {
    startLocalVideoBtn.addEventListener('click', () => startLocalVideo(trtc), false);
    startLocalAudioBtn.addEventListener('click', () => startLocalAudio(trtc), false);
    stopLocalAudioBtn.addEventListener('click', () => stopLocalAudio(trtc), false);
    stopLocalVideoBtn.addEventListener('click', () => stopLocalVideo(trtc), false);
  });

  import('./share.js').then(({ startShare, stopShare }) => {
    startShareBtn.addEventListener('click', () => startShare(trtc), false);
    stopShareBtn.addEventListener('click', () => stopShare(trtc), false);
  });

  // Add event listeners for device selection
  microphoneSelect.onchange = async (e) => {
    if (trtc) {
      try {
        await trtc.updateLocalAudio({ option: { microphoneId: microphoneSelect.value } });
      } catch (error) {
        console.log('updateLocalAudio error', error);
      }
    }
  };

  cameraSelect.onchange = async (e) => {
    if (trtc) {
      try {
        await trtc.updateLocalVideo({ option: { cameraId: cameraSelect.value } });
      } catch (error) {
        console.log('updateLocalVideo error', error);
      }
    }
  };

  // Console button
  consoleBtn.addEventListener('click', () => {
    window.vconsole = new VConsole();
  });
  
  // GitHub link analytics
  github.addEventListener('click', () => {
    aegis?.reportEvent({
      name: 'jumpGithub',
      ext1: 'jumpGithub',
      ext2: DEMOKEY,
      ext3: 0,
    });
  });
  
  // Documentation link analytics
  appInfoDoc.addEventListener('click', () => {
    const url = window.lang_ === 'en' ? 'https://trtc.io/document/35607?platform=web&product=rtcengine' : 'https://cloud.tencent.com/document/product/647/32398#.E6.AD.A5.E9.AA.A41.EF.BC.9A.E5.88.9B.E5.BB.BA.E6.96.B0.E7.9A.84.E5.BA.94.E7.94.A8';
    window.open(url, '_blank');
    aegis?.reportEvent({
      name: 'jumpDocInfo',
      ext1: 'jumpDocInfo',
      ext2: DEMOKEY,
      ext3: 0,
    });
  });

  // Language toggle
  const language = document.getElementById('language');
  import('./utils.js').then(({ handleChangeLanguageClick }) => {
    language.addEventListener('click', handleChangeLanguageClick);
  });
}

function setupClipboard() {
  const inviteBtn = document.getElementById('inviteBtn');
  let clipboard = new ClipboardJS('#inviteBtn');
  
  clipboard.on('success', (e) => {
    import('./room.js').then(({ refreshLink }) => {
      refreshLink();
      showTooltip(e.trigger, 'Copied!');
    });
  });
  
  inviteBtn.addEventListener('mouseleave', clearTooltip);
  inviteBtn.addEventListener('blur', clearTooltip);
} 