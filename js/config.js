/* eslint-disable*/

// Global variables
const isProd = location.origin === 'https://web.sdk.qcloud.com';
const isDev = location.origin.includes('localhost') || location.origin.includes('127.0.0.1');
const DEMOKEY = isProd ? 'v5QuickDemoJs' : 'v5QuickDemoJsDev';
const AEGIS_ID = {
  dev: 'iHWefAYqBEHVFrSxnV',
  prod: 'iHWefAYqVGQzlNLveU',
};

// Log level setting
TRTC.setLogLevel(1);

export {
  isProd,
  isDev,
  DEMOKEY,
  AEGIS_ID
}; 