/* eslint-disable*/
import { getLanguage, changeLanguageTo, getQueryString } from './utils.js';
import { initDevice } from './device.js';
import { initRoom } from './room.js';
import { initChatEvents } from './chat.js';
import { initEventListeners } from './events.js';

// Set global language
window.lang_ = getLanguage();
changeLanguageTo(window.lang_);

// Check iframe status
window.isIframe = window.self !== window.top;

// Use configuration from server if available
const useAutoConfig = () => {
  if (window.AUTO_CONFIG) {
    document.getElementById('sdkAppId').value = window.AUTO_CONFIG.sdkAppId;
    document.getElementById('sdkSecretKey').value = window.AUTO_CONFIG.sdkSecretKey;
    
    // Show auto-configuration indicator
    const indicator = document.getElementById('auto-config-indicator');
    if (indicator) {
      indicator.style.display = 'block';
    }
    
    // Disable the input fields to prevent accidental changes
    document.getElementById('sdkAppId').setAttribute('readonly', true);
    document.getElementById('sdkSecretKey').setAttribute('readonly', true);
    
    console.log('Auto-configured with server settings');
    return true;
  }
  return false;
};

// Initialize input values from auto-config, URL parameters, or random values
if (!useAutoConfig()) {
  document.getElementById('sdkAppId').value = getQueryString('sdkAppId');
  document.getElementById('sdkSecretKey').value = getQueryString('sdkSecretKey');
}

// Always set userId and roomId (either from URL or random)
document.getElementById('userId').value = getQueryString('userId') || Math.floor(Math.random() * 1000000);
document.getElementById('roomId').value = getQueryString('roomId') || Math.floor(Math.random() * 1000);

// Clear URL parameters for security
const state = { url:window.location.href.split("?")[0] };
window.history.pushState(state,'', 'index.html');

// Create TRTC instance
let trtc = TRTC.create();

// Initialize devices if not in an iframe
if (!window.isIframe) initDevice();
else {
  document.getElementById('user-sig-doc').querySelector('a').href = 'https://trtc.io/zh/document/35166?platform=web&product=rtcengine&menulabel=sdk';
}

// Initialize room with TRTC instance
initRoom(trtc);

// Setup event listeners
initEventListeners(trtc);

// Initialize chat events
initChatEvents(trtc);

// Check if current environment supports TRTC
TRTC.isSupported().then((checkResult) => {
  console.log('checkResult', checkResult.result, 'checkDetail', checkResult.detail);
  if (!checkResult.result) {
    alert('Your browser does not supported TRTC!');
    window.location.href = 'https://web.sdk.qcloud.com/trtc/webrtc/demo/detect/index.html';
  }
})

export { trtc }; 