/*
 *   All application related constants, provider, interceptors,
 *   error handling and CORS has been wrapped up inside 'appConfig' module
 */

'use strict';

// Default environment variables
var _env = {};

// Importing variable
if (window) {
    _env = angular.copy(window.__env);
}


angular
    .module('appConfig', ['LocalStorageModule', 'ngResource', 'ui.bootstrap', 'ngTable', 'ngAnimate', 'ngSanitize',
        'ngFileUpload', 'angularjs-dropdown-multiselect', 'ngDialog', 'ngToast'
    ])

.config(['$httpProvider', '$logProvider', 'ngDialogProvider', 'ngToastProvider', function ($httpProvider, $logProvider, ngDialogProvider, ngToastProvider) {

    // CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    //Configure http interceptor and application loader
    $httpProvider.interceptors.push('httpInterceptorService');

    //Configure http interceptor for tokenizer
    $httpProvider.interceptors.push(function (userModel) {
        var user = userModel.getUser();
        var sessionInjector = {
            request: function (config) {
                if (user.accountToken) {
                    config.headers.Authorization = 'x-access-token ' + user.accountToken;
                }
                return config;
            }
        };
        return sessionInjector;
    });

    //Configure logging
    $logProvider.debugEnabled(__env.enableDebug);

    //Configure default ngDialog settings
    ngDialogProvider.setDefaults({
        className: 'ngdialog-theme-default',
        showClose: false,
        closeByDocument: false,
        closeByEscape: false,
        overlay: true,
        closeByNavigation: true
    });

    ngToastProvider.configure({
        timeOut: 5000,
        animation: 'fade',
        additionalClasses: 'toast-animation',
        horizontalPosition: 'left',
        maxNumber: 1
    });

}])

.factory('httpInterceptorService', ['$q', '$rootScope', '$log', 'appConstants',
    function ($q, $rootScope, $log, appConstants) {
        return {
            request: function (config) {
                //if (appConstants.HTTP_METHODS.indexOf(config.method) > -1) {
                    $rootScope.$broadcast("loaderShow");
                //}
                return config || $q.when(config);
            },
            response: function (response) {
                $rootScope.$broadcast("loaderHide");
                return response || $q.when(response);
            },
            responseError: function (response) {
                try {
                    $rootScope.hasError = true;
                    if (response && response.data && response.data.errorMsg) {
                        $rootScope.ERROR_MSG = response.data.errorMsg;
                    } else if (appConstants.ACCESS_DENIED_CODE.indexOf(response.status) >= 0) {
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
    }
])

.constant('__ENV', _env)
    .constant('appConstants', {
        SERVICE_ERROR: "Service is temporarily unavailable. Please try after sometime.",
        UNAUTHORIZED_ERROR: "Access denied ! You may not have permission to acccess.",
        FUNCTIONAL_ERR: "Something went wrong here....",
        UPLOAD_ERR: "Error ! Please upload a valid File",
        ROUTE_STATES_CONSTANTS: ['login', 'register', 'landing'],
        HTTP_METHODS: ['GET', 'POST', 'PUT', 'DELETE'],
        ACCESS_DENIED_CODE: [401, 403, 408],
        USER_ROLES: {
            admin: 'ADMIN',
            producer: 'PROD',
            manufacturer: 'MANUFACT',
            retailer: 'RETAIL'
        },
        PROD_REGISTERED: "Product has been registered successfully",
        PROD_DELETED: "Product has been deleted successfully",
        MATERIAL_REGISTERED: "Material has been registered successfully",
        MATERIAL_DELETED: "Material has been deleted successfully",
        //MATERIAL_BATCH_DELETED: "Material has been removed from batched"
        MULTISELECT_SETTINGS: {
            scrollable: true,
            scrollableHeight: '250px',
            className: 'errBox'
        },
        QUANTITY_EXCEEDED: "The Quantity to be shipped cannot exceed the available quantity. Please revalidate!",
        MATERIAL_ADHERED: "The product you are trying to register has not adhered to manufacturing process standards as per the smart contract.",
        PROCURE_CHECKBOX_ERR: 'Please select atleast one record.',
        CARRIER_OPTION_ERR: 'Please select a shipment carrier.',
        MANUFACT_OPTION_ERR: 'Please select atleast one Manufacturer.',
        RETAILER_OPTION_ERR: 'Please select atleast one Distributer/Retailer.',
        MATERIAL_OPTION_ERR: 'Please select a Material',
        UPLOAD_FILE_ERR: 'Please upload an image/video',
        FILE_UPLOAD_LIMIT: 'Alert ! You cannot upload more than 5 files',
        MATERIAL_PROCURED: "All the selected materials have been procured successfully.",
        PRODUCT_PROCURED: "All the selected products have been acknowledge successfully.",

        //Header configuration for posting file data to node server
        HEADER_CONFIG: {
            headers: {
                'Content-Type': undefined,
                enctype: 'multipart/form-data'
            },
            transformRequest: function (data) {
                var formData = new FormData();
                angular.forEach(data, function (value, key) {
                    formData.append(key, value);
                });
                return formData;
            }
        }
    })

.run(['$rootScope', '$window', 'localStorageService', '$log', 'ngTableDefaults', '$templateCache', function ($rootScope, $window, localStorageService, $log, ngTableDefaults, $templateCache) {

    $log.debug('appConfig bootstrapped!');

    $rootScope.isLoggedIn = false;
    $rootScope.activeMenu = '';
    $rootScope.hasError = false;
    $rootScope.ERROR_MSG = "";
    $rootScope.isSuccess = false;
    $rootScope.SUCCESS_MSG = "";
}]);