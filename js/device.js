/* eslint-disable*/
import { addFailedLog, addSuccessLog } from './utils.js';

let cameras = [];
let microphones = [];
let cameraId;
let microphoneId;

// DOM elements
const cameraSelect = document.getElementById('camera-select');
const microphoneSelect = document.getElementById('microphone-select');
const enterBtn = document.getElementById('enter');

export async function initDevice() {
  try {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      stream?.getTracks().forEach(track => track.stop());
      if (!stream) {
        enterBtn.disabled = true;
      }
    } catch (error) {
      if (window.lang_ === 'en') {
        window.alert('If you do not allow the current page to access the microphone and camera permissions, you may fail when publishing a local audio/video.');
      } else {
        window.alert('如果不允许当前页面访问麦克风和摄像头权限，您在发布本地音视频流的时候可能会失败。');
      }
      enterBtn.disabled = true;
    }
    await getDevices();
  } catch (e) {
    console.error('get device failed', e);
  }
}

export const getDevices = async () => {
  await getCamera();
  await getMicrophone();
}

export const getCamera = async () => {
  cameras = await TRTC.getCameraList();
  cameraSelect.innerHTML = '';
  cameras?.forEach(camera => {
    const option = document.createElement('option');
    option.value = camera.deviceId;
    option.text = camera.label;
    cameraSelect.appendChild(option);
  });
}

export const getMicrophone = async () => {
  microphones = await TRTC.getMicrophoneList();
  microphoneSelect.innerHTML = '';
  microphones?.forEach(microphone => {
    const option = document.createElement('option');
    option.value = microphone.deviceId;
    option.text = microphone.label;
    microphoneSelect.appendChild(option);
  });
}

export async function updateCamera(trtc) {
  if (trtc) {
    try {
      await trtc.updateLocalVideo({ option: { cameraId: cameraSelect.value } });
    } catch (error) {
      console.log('updateLocalVideo error', error);
      addFailedLog(`Error updating camera: ${error.message}`);
    }
  }
}

export async function updateMicrophone(trtc) {
  if (trtc) {
    try {
      await trtc.updateLocalAudio({ option: { microphoneId: microphoneSelect.value } });
      addSuccessLog('Microphone updated successfully');
    } catch (error) {
      console.log('updateLocalAudio error', error);
      addFailedLog(`Error updating microphone: ${error.message}`);
    }
  }
}

export function getCameraId() {
  return cameraSelect.value;
}

export function getMicrophoneId() {
  return microphoneSelect.value;
}

export { cameras, microphones }; 