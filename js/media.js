/* eslint-disable*/
import { 
  setButtonLoading, 
  setButtonDisabled, 
  addSuccessLog, 
  addFailedLog, 
  reportSuccessEvent, 
  reportFailedEvent 
} from './utils.js';
import { getCameraId, getMicrophoneId } from './device.js';
import { sdkAppId, roomId, userId } from './room.js';

// Audio/video state
let isCamOpened = false;
let isMicOpened = false;
let audio = true;
let video = true;

export async function startLocalAudio(trtc) {
  setButtonLoading('startLocalAudio', true);
  if (trtc) {
    try {
      await trtc.startLocalAudio({ option: { microphoneId: getMicrophoneId() } });
      audio = true;
      isMicOpened = true;
      setButtonLoading('startLocalAudio', false);
      setButtonDisabled('startLocalAudio', true);
      reportSuccessEvent('startLocalAudio', 0);
      addSuccessLog(`${userId ? `[${userId}]` : ''} startLocalAudio.`);
    } catch (error) {
      reportFailedEvent({ name: 'startLocalAudio', sdkAppId, roomId, error });
      setButtonLoading('startLocalAudio', false);
      addFailedLog(`${userId ? `[${userId}]` : ''} startLocalAudio failed.`);
    }
  }
}

export async function startLocalVideo(trtc) {
  setButtonLoading('startLocalVideo', true);
  if (trtc) {
    try {
      await trtc.startLocalVideo({
        view: document.getElementById('local'), // Preview the video on the element with the elementId "localVideo" in the DOM.
        option: { cameraId: getCameraId(), profile: '1080p' }
      });
      video = true;
      isCamOpened = true;
      setButtonLoading('startLocalVideo', false);
      setButtonDisabled('startLocalVideo', true);
      reportSuccessEvent('startLocalVideo', 0);
      addSuccessLog(`${userId ? `[${userId}]` : ''} startLocalVideo.`);
      addLocalControlView(trtc);
    } catch (error) {
      setButtonLoading('startLocalVideo', false);
      reportFailedEvent({ name: 'startLocalVideo', sdkAppId, roomId, error });
      addFailedLog(`${userId ? `[${userId}]` : ''} startLocalVideo failed.`);
    }
  }
}

export async function stopLocalAudio(trtc) {
  if (!isMicOpened) {
    addFailedLog('The audio has not been started');
    return;
  }
  setButtonLoading('stopLocalAudio', true);
  if (trtc) {
    try {
      await trtc.stopLocalAudio();
      isMicOpened = false;
      setButtonLoading('stopLocalAudio', false);
      setButtonDisabled('startLocalAudio', false);
      reportSuccessEvent('stopLocalAudio', 0);
      addSuccessLog(`${userId ? `[${userId}]` : ''} stopLocalAudio.`);
    } catch (error) {
      setButtonLoading('stopLocalAudio', false);
      reportFailedEvent({ name: 'stopLocalAudio', sdkAppId, roomId, error });
      addFailedLog(`${userId ? `[${userId}]` : ''} startLocalAudio failed.`);
    }
  }
}

export async function stopLocalVideo(trtc) {
  if (!isCamOpened) {
    addFailedLog('The video has not been started');
    return;
  }
  setButtonLoading('stopLocalVideo', true);
  if (trtc) {
    try {
      await trtc.stopLocalVideo();
      isCamOpened = false;
      setButtonLoading('stopLocalVideo', false);
      setButtonDisabled('startLocalVideo', false);
      reportSuccessEvent('stopLocalVideo', 0);
      addSuccessLog(`${userId ? `[${userId}]` : ''} stopLocalVideo.`);
      const local = document.getElementById('local');
      local.removeChild(local.children[0]);
    } catch (error) {
      setButtonLoading('stopLocalVideo', false);
      reportFailedEvent({ name: 'stopLocalVideo', sdkAppId, roomId, error });
      addFailedLog(`${userId ? `[${userId}]` : ''} stopLocalVideo failed.`);
    }
  }
}

export function addLocalControlView(trtc) {
  const local = document.getElementById('local');

  const tag = document.createElement('div');
  tag.className = 'tag';
  
  const audioDiv = document.createElement('div');
  audioDiv.setAttribute('id', 'mute-audio');
  if (audio) {
    audioDiv.setAttribute('class', 'unmuteAudio');
  } else {
    audioDiv.setAttribute('class', 'muteAudio');
  }

  const videoDiv = document.createElement('div');
  videoDiv.setAttribute('id', 'mute-video');
  if (video) {
    videoDiv.setAttribute('class', 'unmuteVideo');
  } else {
    videoDiv.setAttribute('class', 'muteVideo');
  }

  tag.appendChild(audioDiv);
  tag.appendChild(videoDiv);
  local.appendChild(tag);

  audioDiv.addEventListener('click', async () => {
    if (audio) {
      try {
        await trtc.updateLocalAudio({ mute: true });
        addSuccessLog('updateLocalAudio muted=true');
        audioDiv.setAttribute('class', 'muteAudio');
        audio = false;
      } catch (e) {
        addFailedLog(`[${userId}] updateLocalAudio failed. Reason: ${e.message}`);
      }
    } else {
      try {
        await trtc.updateLocalAudio({ mute: false });
        addSuccessLog('updateLocalAudio muted=false');
        audioDiv.setAttribute('class', 'unmuteAudio');
        audio = true;
      } catch (e) {
        addFailedLog(`[${userId}] updateLocalAudio failed. Reason: ${e.message}`);
      }
    }
  });

  videoDiv.addEventListener('click', async () => {
    if (video) {
      try {
        await trtc.updateLocalVideo({ mute: true });
        addSuccessLog('updateLocalVideo muted=true');
        videoDiv.setAttribute('class', 'muteVideo');
        video = false;
      } catch (e) {
        addFailedLog(`[${userId}] updateLocalVideo failed. Reason: ${e.message}`);
      }
    } else {
      try {
        await trtc.updateLocalVideo({ mute: false });
        addSuccessLog('updateLocalVideo muted=false');
        videoDiv.setAttribute('class', 'unmuteVideo');
        video = true;
      } catch (e) {
        addFailedLog(`[${userId}] updateLocalVideo failed. Reason: ${e.message}`);
      }
    }
  });
}

export function addStreamView(remoteId) {
  const playerContainer = document.getElementById('remote-container');
  playerContainer.style.minHeight = '100px';
  let remoteDiv = document.getElementById(remoteId);
  if (!remoteDiv) {
    remoteDiv = document.createElement('div');
    remoteDiv.setAttribute('id', remoteId);
    remoteDiv.setAttribute('class', 'remote');
    playerContainer.appendChild(remoteDiv);
  }
}

export function removeStreamView(remoteId) {
  const playerContainer = document.getElementById('remote-container');
  const remoteDiv = document.getElementById(remoteId);
  if (remoteDiv) {
    playerContainer.removeChild(remoteDiv);
  }
}

export { isCamOpened, isMicOpened }; 