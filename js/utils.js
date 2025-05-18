/* eslint-disable*/
import { isProd, isDev, DEMOKEY } from './config.js';

// Language and localization
const localStorageLangId = 'trtc-v5-quick-demo-js';

export function getLanguage(localStorageLangId = 'trtc-v5-quick-demo-js') {
  let lang = getQueryString('lang') || localStorage.getItem(localStorageLangId) || window.navigator.language?.toLowerCase();
  lang = lang.indexOf('zh') > -1 ? 'zh-cn' : 'en';
  return lang;
}

export function changeLanguageTo(lang) {
  const currentElementList = document.querySelectorAll('.zh-cn, .en');
  for (const item of currentElementList) {
    item.style.display = 'none';
  }
  const nextElementList = document.querySelectorAll(`.${lang}`);
  for (const item of nextElementList) {
    item.style.display = 'block';
  }
  document.title = lang === 'en' ? 'Quick demo js | Tencent RTC' : 'Quick demo js | TRTC 实时音视频';
}

export function handleChangeLanguageClick() {
  const currentLanguage = window.lang_;
  const nextLanguage = currentLanguage === 'en' ? 'zh-cn' : 'en';
  console.log(`language: ${currentLanguage} -> ${nextLanguage}`);

  window.lang_ = nextLanguage;
  localStorage.setItem(localStorageLangId, nextLanguage);

  changeLanguageTo(nextLanguage);
}

// URL utilities
export function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

// UI utilities
export function setButtonDisabled(id, status) {
  const button = document.getElementById(id);
  button.disabled = status;
}

export function setButtonLoading(id, status) {
  const button = document.getElementById(id);
  const loadingElement = button.getElementsByClassName('loading-icon')[0];
  button.disabled = status;
  loadingElement.style.display = status ? 'inline-block' : 'none';
}

// Logging functions
export function addSuccessLog(log) {
  const logContainer = document.getElementById('log');
  const logItem = document.createElement('div');

  const success = document.createElement('span');
  success.setAttribute('class', 'success');
  success.innerText = '🟩 ';

  const logDiv = document.createElement('span');
  logDiv.innerText = log;

  logItem.appendChild(success);
  logItem.appendChild(logDiv);

  logContainer.appendChild(logItem);
  logContainer.scrollTop = logContainer.scrollHeight;
}

export function addFailedLog(log) {
  const logContainer = document.getElementById('log');
  const logItem = document.createElement('div');

  const success = document.createElement('span');
  success.innerText = '🟥 '

  const logDiv = document.createElement('span');
  logDiv.innerText = log;

  logItem.appendChild(success);
  logItem.appendChild(logDiv);

  logContainer.appendChild(logItem);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Analytics reporting
let aegis;

if (isProd || isDev) {
  aegis = new Aegis({
    id: isProd ? AEGIS_ID.prod : AEGIS_ID.dev,
    uin: '',
    reportApiSpeed: false,
    reportAssetSpeed: false
  })
}

export function reportSuccessEvent(name, sdkAppId) {
  aegis?.reportEvent({
    name,
    ext1: `${name}-success${window.isIframe ? '-iframe' : ''}`,
    ext2: DEMOKEY,
    ext3: sdkAppId,
  });
}

export function reportFailedEvent({name, error, type = 'rtc', sdkAppId, roomId}) {
   aegis?.reportEvent({
    name,
    ext1: `${name}-failed#${roomId}*${type}*${error.message}`,
    ext2: DEMOKEY,
    ext3: 0, // 仅 success 事件需要传 sdkAppId，原因是只有成功的 sdkAppId 有意义
  });
}

// Tooltip utilities
export function clearTooltip(e) {
  e.currentTarget.setAttribute('class', 'invite-btn');
  e.currentTarget.removeAttribute('aria-label');
}

export function showTooltip(elem, msg) {
  elem.setAttribute('class', 'invite-btn tooltipped tooltipped-s');
  elem.setAttribute('aria-label', msg);
}

export function fallbackMessage(action) {
  let actionMsg = '';
  const actionKey = action === 'cut' ? 'X' : 'C';
  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    actionMsg = 'No support :(';
  } else if (/Mac/i.test(navigator.userAgent)) {
    actionMsg = `Press ⌘-${actionKey} to ${action}`;
  } else {
    actionMsg = `Press Ctrl-${actionKey} to ${action}`;
  }
  return actionMsg;
} 