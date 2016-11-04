/**
 * Configuring environment variables being used for configuring logging and apiUrl
 **/

(function (window) {
  window.__env = window.__env || {};

  // API url
  window.__env.apiUrl = 'http://localhost:4000/';

  // Whether or not to enable debug mode
  window.__env.enableDebug = true;  // make it false in production env
}(this));
  