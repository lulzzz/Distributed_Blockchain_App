/*
*   All application related constants, provider, interceptors,
*   error handling and CORS has been wrapped up inside 'appConfig' module
*/

'use strict';

// Default environment variables
var _env = {};

// Importing variable
if (window) {
    Object.assign(_env, window.__env);
}


angular
    .module('appConfig', ['LocalStorageModule', 'ngResource', 'ui.bootstrap', 'ngTable', 'ngAnimate', 'ngSanitize',
        'ngFileUpload', 'angularjs-dropdown-multiselect', 'ngDialog'])
    .config(['$httpProvider', '$logProvider', 'ngDialogProvider', function ($httpProvider, $logProvider, ngDialogProvider) {

        // CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        //Configure http interceptor and application loader
        $httpProvider.interceptors.push('httpInterceptorService');

        //Configure logging
        $logProvider.debugEnabled(__env.enableDebug);

        //Configure model dialog options
        ngDialogProvider.setDefaults({
            className: 'ngdialog-theme-default',
            plain: false,
            showClose: true,
            closeByDocument: true,
            closeByEscape: true,
            overlay: true,
            closeByNavigation: true
        });
    }])
    .factory('httpInterceptorService', ['$q', '$rootScope', '$log', 'appConstants',
        function ($q, $rootScope, $log, appConstants) {
            return {
                request: function (config) {
                    // Show loader
                    $rootScope.$broadcast("loaderShow");
                    return config || $q.when(config);
                },
                response: function (response) {
                    // Hide loader
                    $rootScope.$broadcast("loaderHide");
                    return response || $q.when(response);
                },
                responseError: function (response) {
                    try {
                        $rootScope.hasError = true;
                        if (appConstants.ACCESS_DENIED_CODE.indexOf(response.status) >= 0) {
                            $rootScope.ERROR_MSG = appConstants.UNAUTHORIZED_ERROR;
                        } else {
                            $rootScope.ERROR_MSG = appConstants.SERVICE_ERROR;
                        }
                        $rootScope.$broadcast("loaderHide");
                    } catch (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    }
                    return $q.reject(response);
                }
            };
        }])

    .constant('__ENV', _env)
    .constant('appConstants', {
        SERVICE_ERROR: "Service is temporarily unavailable. Please try after sometime.",
        UNAUTHORIZED_ERROR: "Access denied ! You may not have permission to acccess.",
        FUNCTIONAL_ERR: "Something went wrong here....",
        UPLOAD_ERR: "Error ! Please upload a valid File",
        ROUTE_STATES_CONSTANTS: ['login', 'register', 'home', 'home.result'],
        ACCESS_DENIED_CODE: [401, 403, 408],
        USER_ROLES: {
            admin: 'ADMIN',
            producer: 'PROD',
            manufacturer: 'MANUFACT',
            retailer: 'RETAIL'
        },
        PROD_REGISTERED: "Product has been registered successfully",
        MATERIAL_REGISTERED: "Material has been registered successfully"
    })

    .run(['$rootScope', '$window', 'localStorageService', '$log', 'ngTableDefaults', function ($rootScope, $window, localStorageService, $log, ngTableDefaults) {

        $log.debug('appConfig bootstrapped!');

        $rootScope.isLoggedIn = false;
        $rootScope.activeMenu = '';
        $rootScope.hasError = false;
        $rootScope.ERROR_MSG = "";
        $rootScope.isSuccess = false;
        $rootScope.SUCCESS_MSG = "";

    }]);