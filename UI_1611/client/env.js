/**
 * Configuring environment variables being used for configuring logging and apiUrl
 **/

(function (window) {
  window.__env = window.__env || {};

  // API url
  window.__env.apiUrl = '';
  
  //Use below hardcode in app for demo instance
  window.profileID = 'PROD';
  window.profile = 'producer';
  window.userName = 'Raw Material Producer';

  // Whether or not to enable debug mode
  window.__env.enableDebug = true;  // make it false in production env
}(this));
  