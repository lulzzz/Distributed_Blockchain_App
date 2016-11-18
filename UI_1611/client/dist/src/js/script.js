/*
*	app.js for initializing angular module container.
*   Defining routes, value and rootscope.
*/

'use strict';


// All application related routing and authentication has been wrapped up inside 'appRoute' module
// All application related constants, provider, interceptors, error handling and CORS has been wrapped up inside 'appConfig' module
angular.module('bverifyApp', ['appRoute', 'appConfig', 'searchModule', 'productModule', 'userModule']);
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
        'ngFileUpload', 'angularjs-dropdown-multiselect', 'ngDialog'])

    .config(['$httpProvider', '$logProvider', 'ngDialogProvider', function ($httpProvider, $logProvider, ngDialogProvider) {

        // CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        //Configure http interceptor and application loader
        $httpProvider.interceptors.push('httpInterceptorService');

        //Configure logging
        $logProvider.debugEnabled(__env.enableDebug);

        ngDialogProvider.setDefaults({
            className: 'ngdialog-theme-default',
            showClose: false,
            closeByDocument: false,
            closeByEscape: true,
            overlay: true,
            closeByNavigation: true
        });

    }])

    .factory('httpInterceptorService', ['$q', '$rootScope', '$log', 'appConstants',
        function ($q, $rootScope, $log, appConstants) {
            return {
                request: function (config) {
                    return config || $q.when(config);
                },
                response: function (response) {
                    return response || $q.when(response);
                },
                responseError: function (response) {
                    try {
                        $rootScope.hasError = true;
                        if (response.errorMsg) {
                            $rootScope.ERROR_MSG = response.errorMsg;
                        }
                        else if (appConstants.ACCESS_DENIED_CODE.indexOf(response.status) >= 0) {
                            $rootScope.ERROR_MSG = appConstants.UNAUTHORIZED_ERROR;
                        } else {
                            $rootScope.ERROR_MSG = appConstants.SERVICE_ERROR;
                        }
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
        PROD_DELETED: "Product has been deleted successfully",
        MATERIAL_REGISTERED: "Material has been registered successfully",
        MATERIAL_DELETED: "Material has been deleted successfully",
        MULTISELECT_SETTINGS: {
            scrollable: true,
            scrollableHeight: '250px'
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
        console.log($templateCache.get('views/material.confirmation.html'));
    }]);
/*
*   All application related routing and authentication has been wrapped up inside 'appRoute' module
*/
'use strict';

var _self = this;

angular
    .module('appRoute', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {

            $urlRouterProvider.otherwise('/home');

            $stateProvider
                // HOME STATES AND NESTED VIEWS 
                .state('home', {
                    url: '/home',
                    // Only for demo instance
                    views: {
                        // the main template will be placed here (relatively named)
                        '': {
                            templateUrl: '../modules/search/search.tpl.html',
                            controllerAs: 'vm',
                            controller: 'searchController',

                        },

                        // the child views will be defined here (absolutely named)
                        'shipmentList@home': {
                            templateProvider: function (userModel, $templateFactory) {
                                if (userModel.isManufacturer() || userModel.isProducer()) {
                                    return $templateFactory.fromUrl('../modules/search/searchList.tpl.html');
                                }
                            },
                            //templateUrl: '../modules/search/searchList.tpl.html',
                            controllerAs: 'vm',
                            controller: 'searchController'
                        }
                    },
                    params: {
                        role: window.profile
                    },
                    /****** below needs to be change. This has to be justify more when service gets ready */
                    resolve: {
                        userInfo: function ($stateParams, userServiceAPI, searchServiceAPI, userModel) {
                            return $stateParams.role ? userServiceAPI.login({ id: $stateParams.role }) : "";
                        },
                        shipmentList: function ($stateParams, searchServiceAPI, userModel, userInfo) {
                            userModel.setUser(userInfo.user);
                            if (userModel.isRetailer() || userModel.isAdmin()) {
                                return null;
                            }
                            if (userModel.isProducer()) {
                                return searchServiceAPI.getMaterialShipmentList({
                                    userName: userInfo.user.userName,
                                    userProfile: userInfo.user.userProfile
                                });
                            }
                            if (userModel.isManufacturer()) {
                                return searchServiceAPI.getProductShipmentList({
                                    userName: userInfo.user.userName,
                                    userProfile: userInfo.user.userProfile
                                });
                            }
                            else {
                                return null;
                            }
                        }
                    }
                    /***************************************************************************************** */
                })
                .state("home.result", {
                    url: '/result',
                    templateUrl: '../modules/search/searchResult.tpl.html',
                    params: {
                        id: '',
                        trackInfo: null
                    },
                    //Resolve added to retreive shipmentDetails before loading serachResultController
                    resolve: {
                        shipmentDetails: function ($stateParams, searchServiceAPI, appConstants) {
                            return searchServiceAPI.search($stateParams.trackInfo ? $stateParams.trackInfo : $stateParams.id);
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'searchResultController'
                })
                // USER LOGIN/REGISTER/DASHBOARD STATES 
                .state('register', {
                    url: '/register',
                    templateUrl: '../modules/user/register.tpl.html',
                    controllerAs: 'vm',
                    controller: 'userController'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: '../modules/user/login.tpl.html',
                    // Only for demo instance
                    params: {
                        id: window.profile // default value
                    },
                    /*************************************** */
                    controllerAs: 'vm',
                    controller: 'userController'
                })
                .state('logout', {
                    url: '/home',
                    controllerAs: 'vm',
                    controller: 'logoutController'
                })
                .state('dashboard', {
                    url: '/dashboard',
                    templateUrl: '../modules/product/dashboard.tpl.html',
                    controllerAs: 'vm',
                    controller: 'dashboardController'
                })

                // PRODUCT REGISTER/SHIPMENT/ACKNOWLEDGMENT STATES
                .state('product', {
                    url: '/product/register',
                    templateProvider: function (userModel, $templateFactory) {
                        /*
                        **  Load templates based on user roles. Route URL will be same for every user role.
                        */
                        if (userModel.isProducer()) {
                            return $templateFactory.fromUrl('../modules/product/material.register.tpl.html');
                        }
                        if (userModel.isManufacturer() || userModel.isRetailer()) {
                            return $templateFactory.fromUrl('../modules/product/product.register.tpl.html');
                        }
                    },
                    //Resolve added to retreive productList before loading product register screen
                    resolve: {
                        productList: function (userModel, productServiceAPI) {
                            var user = userModel.getUser();

                            /****** below needs to be change. Hardcoded for demo */
                            if (userModel.isProducer()) {
                                return productServiceAPI.getMaterialList({
                                    userName: user.userName,
                                    userProfile: user.userProfile
                                });
                            }
                            if (userModel.isManufacturer()) {
                                return productServiceAPI.getProductList({
                                    userName: user.userName,
                                    userProfile: user.userProfile
                                });
                            }
                            /****************************************************** */



                            /*return productServiceAPI.getProductList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });*/
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'productRegisterController'
                })
                .state('shipment', {
                    url: '/product/ship',
                    templateProvider: function (userModel, $templateFactory) {
                        /*
                        **  Load templates based on user roles. Route URL will be same for every user role.
                        */
                        if (userModel.isProducer()) {
                            return $templateFactory.fromUrl('../modules/product/material.ship.tpl.html');
                        }
                        if (userModel.isManufacturer() || userModel.isRetailer() || userModel.isAdmin()) {
                            return $templateFactory.fromUrl('../modules/product/product.ship.tpl.html');
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'productShipController'
                })
                .state('acknowledge', {
                    url: '/product/acknowledge',
                    templateUrl: '../modules/product/product.ack.tpl.html',
                    //Resolve added to retreive productList before loading product acknowledgment screen
                    resolve: {
                        productList: function (userModel, productServiceAPI) {
                            var user = userModel.getUser();

                            /****** below needs to be change. Hardcoded for demo */
                            if (userModel.isManufacturer()) {
                                return productServiceAPI.getMaterialList({
                                    userName: user.userName,
                                    userProfile: user.userProfile
                                });
                            }
                            if (userModel.isRetailer()) {
                                return productServiceAPI.getProductList({
                                    userName: user.userName,
                                    userProfile: user.userProfile
                                });
                            }
                            /****************************************************** */


                            /*return productServiceAPI.getProductList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });*/
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'productAckController'
                });


            // use the HTML5 History API
            $locationProvider.html5Mode(true);
        }])


    .run(['$rootScope', 'userModel', '$state', 'appConstants', '$log',
        function ($rootScope, userModel, $state, appConstants, $log) {

            $log.debug('appRoute bootstrapped!');

            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    try {
                        $rootScope.activeMenu = toState.url;
                        $rootScope.hasError = false;
                        $rootScope.isSuccess = false;
                        // Authenticating user. Maintaining session on each route
                        var user = userModel.getUser();
                        if (!(appConstants.ROUTE_STATES_CONSTANTS.indexOf(toState.name) >= 0)) {
                            if (user === null || !user.isAuthenticatedUser) {
                                $rootScope.isLoggedIn = false;
                                event.preventDefault();
                                $state.go('home');
                            }
                        }
                        if (angular.equals(toState.name, 'home') && angular.equals(fromState.name, '')) {
                            userModel.resetUser();
                        }
                    } catch (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    }
                });

            $rootScope.reset = function () {
                $rootScope.hasError = false;
                $rootScope.isSuccess = false;
            };
        }]);

'use strict';

angular.module('bverifyApp')

    //Directive for rendering header section
    .directive('appHeader',['userModel', '$rootScope', function (userModel, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: '../views/header.tpl.html',
            scope: {
                isLoggedIn: '@',
                user: '='
            },
            link: function (scope, element, attrs) {
                scope.appName = "B-VERIFY";
                scope.appDesc = "Retail Blockchain Application";
                scope.userProfile = populateUserProfile(userModel);
                scope.activeMenu = populateActiveMenu($rootScope.activeMenu);
            }
        }
    }])

    //Directive for rendering footer section
    .directive('appFooter', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '../views/footer.tpl.html',
            link: function (scope, element, attrs) {
            }
        }
    })

    //Directive for rendering module section
    .directive('appLegend', function () {
        return {
            restrict: 'E',
            template: '<legend class="legendHead" ng-bind-html="header"></legend>',
            scope: {
                header: '@'
            },
            link: function (scope, element, attrs) {

            }
        }
    })
    
    //Directive for QR code uploader/reader. Login screen
    .directive('qrCodeReader', ['$rootScope', 'userModel', 'appConstants', '$log',
        function ($rootScope, userModel, appConstants, $log) {

            return {
                restrict: 'E',
                template: '<div class="qrSearch" ngf-select="uploadFile($file, $event)"><img src="asset/images/qr_search.png"/></div> ',
                link: function (scope, element, attrs) {
                    try {
                       
                        var qr = new QrCode();
                        //QR callback function gets called once uploaded qr decoded
                        qr.callback = function (result, err) {
                            if (result) {
                                //Broadcasting event and data user info after successfull reading of QR code
                                $rootScope.$broadcast('readQR', result);
                            }
                            else {
                                $rootScope.$broadcast('QRError');
                                console.log(appConstants.FUNCTIONAL_ERR, err);
                            }
                        };
                        scope.uploadFile = function (file, event) {
                            event.preventDefault();
                            if (file) {
                                var imageType = /^image\//;

                                if (!imageType.test(file.type)) {
                                    throw new Error('File type not valid');
                                }
                                // Read file
                                var reader = new FileReader();
                                reader.addEventListener('load', function () {
                                    // Analyse code
                                    qr.decode(this.result);
                                }.bind(reader), false);
                                reader.readAsDataURL(file);
                            }
                        };
                    } catch (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    }
                }
            }
        }]);


function populateUserProfile(userModel) {
    return {
        isAdmin: userModel.isAdmin(),
        isProducer: userModel.isProducer(),
        isManufacturer: userModel.isManufacturer(),
        isRetailer: userModel.isRetailer()
    }
};

function populateActiveMenu(menu) {
    return {
        dashboard: menu === '/dashboard' ? true : false,
        userRegister: menu === '/register' ? true : false,
        prodRegister: menu === '/product/register' ? true : false,
        prodShip: menu === '/product/ship' ? true : false,
        trackShip: menu === '/home' ? true : false,
        prodAck: menu === '/product/acknowledge' ? true : false,
    }
};
'use strict';

angular.module('bverifyApp')

    //Directive for rendering module section
    .directive('appDatepicker', function () {
        return {
            restrict: 'E',
            templateUrl: '../views/datepicker.tpl.html',
            link: function (scope, element, attrs) {
                try {
                    scope.vm.datepickerObj = {
                        dateFormat: 'MM/dd/yyyy',
                        dateOptions: {
                            startingDay: 1,
                            showWeeks: false
                        },
                        popup: {
                            opened: false
                        }
                    };
                } catch (e) {
                    console.log(appConstants.FUNCTIONAL_ERR, e);
                }
            }
        }
    })

    .directive('appFileuploader', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'E',
            templateUrl: '../views/fileUpload.tpl.html',
            link: function (scope, element, attrs) {
                scope.file = {
                    name: 'Upload File'
                };
                scope.uploadFile = function (file, event) {
                    event.preventDefault();
                    if (file) {
                        scope.file = file;
                        scope.vm.product.file = file;
                    }
                    $rootScope.$broadcast('fileUpload', scope.file);
                }
            }
        }
    }])

    .directive("appTopMenu", ['userModel', '$state', '$rootScope', function (userModel, $state, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: '../views/topmenu.tpl.html',
            link: function (scope, element, attrs) {
                var id = "";
                id = userModel.isManufacturer() ? "manufacturer" : userModel.isProducer() ? "producer"
                    : userModel.isRetailer() ? "retailer" : "producer";

                scope.userProfile = populateUserProfile(userModel);
                scope.onSelect = function (event) {
                    id = event.srcElement.id;
                    // For demo instance
                    $state.go("home", { role: id });
                }
            }
        }
    }])

    //Directive for Side Menu Section
    .directive('sideMenu', ['$rootScope', 'userModel', 'appConstants', '$log',
        function ($rootScope, userModel, appConstants, $log) {

            return {
                restrict: 'E',
                templateUrl: '../views/sideMenu.tpl.html',
                scope: {
                    user: '='
                },
                link: function (scope, element, attrs) {
                    try {
                        scope.userProfile = populateUserProfile(userModel);
                        scope.activeMenu = populateActiveMenu($rootScope.activeMenu);
                        scope.a = false;
                        scope.openNav = function () {
                            if (scope.a == true) {
                                $('#mySidenav').animate({ marginRight: '-165px' }, 500);//for sliding animation
                                scope.a = false;
                            }
                            else {
                                $('#mySidenav').animate({ marginRight: '0px' }, 500);//for sliding animation
                                scope.a = true;
                            }
                        }
                    } catch (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    }
                }
            }
        }]);


angular.module('productModule')
    //Directive for table section for product/material list
    .directive('appProductlist', function () {
        return {
            restrict: 'E',
            templateUrl: '../views/productList.tpl.html',
            scope: {
                list: '=',
                title: '@',
                isRegisterScreen: '@',
                isProcureScreen: '@'
            },
            link: function (scope, element, attrs) {
            },
            controller: function ($scope, $element, $attrs, $transclude, NgTableParams, userModel, $rootScope, ngDialog) {
                var self = this;
                self.userProfile = populateUserProfile(userModel);
                self.customConfigParams = createUsingFullOptions();

                /** Only used for Register product/material screen */
                self.editProduct = function (d) {
                    $rootScope.$broadcast('edit/view', { data: d, isEdit: true });
                }
                self.viewProduct = function (d) {
                    $rootScope.$broadcast('edit/view', { data: d, isEdit: false });
                }
                self.showProductLineage = function (d) {
                    $rootScope.$broadcast('productLineage', { data: d });
                }
                self.procureProducts = function(){
                    $rootScope.$broadcast('procureEvent', {data: $scope.list});
                }

                self.deleteProduct = function (d) {
                    $scope.d = d;
                    $scope.confirmDelete = function () {
                        ngDialog.close();
                        $rootScope.$broadcast('delete', d);
                    }
                    ngDialog.open({
                        scope: $scope,
                        template: '\
                            <legend class="legendHead">DELETE REGISTRATION\
                            </legend>\
                            <p>Are you sure you want to delete <span ng-if="d.materialName">material {{d.materialName}} </span><span ng-if="d.productName">product {{d.productName}}</span>?</p>\
                            <div class="ngdialog-buttons">\
                                <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                                <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirmDelete()">Yes</button>\
                            </div>',
                        plain: true
                    });

                };
                /************************************************** */

                $scope.$watchCollection('list', function (newNames, oldNames) {
                    self.customConfigParams = createUsingFullOptions();
                });
               

                function createUsingFullOptions() {
                    var initialParams = {
                        count: 3 // initial page size
                    };
                    var initialSettings = {
                        // page size buttons (right set of buttons in demo)
                        counts: [],
                        // determines the pager buttons (left set of buttons in demo)
                        paginationMaxBlocks: 13,
                        paginationMinBlocks: 2,
                        dataset: $scope.list
                    };
                    return new NgTableParams(initialParams, initialSettings);
                };
            },
            controllerAs: 'vm'
        }
    });






angular.module('searchModule')
    //Directive for table section for product/material list
    .directive('appShipmentlist', function () {
        return {
            restrict: 'E',
            templateUrl: '../views/shipmentList.tpl.html',
            scope: {
                list: '=',
                title: '@'
            },
            link: function (scope, element, attrs) {
            },
            controller: function ($scope, $element, $attrs, $transclude, NgTableParams, userModel) {
                var self = this;
                self.userProfile = populateUserProfile(userModel);
                self.customConfigParams = createUsingFullOptions();
                $scope.$watchCollection('list', function (newNames, oldNames) {
                    self.customConfigParams = createUsingFullOptions();
                });
 
                function createUsingFullOptions() {
                    var initialParams = {
                        count: 6 // initial page size
                    };
                    var initialSettings = {
                        // page size buttons (right set of buttons in demo)
                        counts: [],
                        // determines the pager buttons (left set of buttons in demo)
                        paginationMaxBlocks: 13,
                        paginationMinBlocks: 2,
                        // initial filter
                        filter: { name: "" }, 
                        dataset: $scope.list
                    };
                    return new NgTableParams(initialParams, initialSettings);
                };
            },
            controllerAs: 'vm'
        }
    });






function populateUserProfile(userModel) {
    return {
        isAdmin: userModel.isAdmin(),
        isProducer: userModel.isProducer(),
        isManufacturer: userModel.isManufacturer(),
        isRetailer: userModel.isRetailer()
    }
};

function populateActiveMenu(menu) {
    return {
        dashboard: menu === '/dashboard' ? true : false,
        userRegister: menu === '/register' ? true : false,
        prodRegister: menu === '/product/register' ? true : false,
        prodShip: menu === '/product/ship' ? true : false,
        trackShip: menu === '/home' ? true : false,
        prodAck: menu === '/product/acknowledge' ? true : false,
    }
};

'use strict';

angular.module('bverifyApp')

    //filter for display '-' symbol in shipment details list table when input is null/empty
    .filter('emptyfy', function () {
        return function (input, optional1, optional2) {
            if(input && input !== ''){
                return input;
            }else{
                return '-';
            }
        }

    });
/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under the MIT license
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1||b[0]>3)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){if(a(b.target).is(this))return b.handleObj.handler.apply(this,arguments)}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.7",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a("#"===f?[]:f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.7",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c).prop(c,!0)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c).prop(c,!1))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")?(c.prop("checked")&&(a=!1),b.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==c.prop("type")&&(c.prop("checked")!==this.$element.hasClass("active")&&(a=!1),this.$element.toggleClass("active")),c.prop("checked",this.$element.hasClass("active")),a&&c.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target).closest(".btn");b.call(d,"toggle"),a(c.target).is('input[type="radio"], input[type="checkbox"]')||(c.preventDefault(),d.is("input,button")?d.trigger("focus"):d.find("input:visible,button:visible").first().trigger("focus"))}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));if(!(a>this.$items.length-1||a<0))return this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){if(!this.sliding)return this.slide("next")},c.prototype.prev=function(){if(!this.sliding)return this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.7",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function c(c){c&&3===c.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=b(d),f={relatedTarget:this};e.hasClass("open")&&(c&&"click"==c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(e[0],c.target)||(e.trigger(c=a.Event("hide.bs.dropdown",f)),c.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger(a.Event("hidden.bs.dropdown",f)))))}))}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.7",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=b(e),g=f.hasClass("open");if(c(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click",c);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger(a.Event("shown.bs.dropdown",h))}return!1}},g.prototype.keydown=function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)){var d=a(this);if(c.preventDefault(),c.stopPropagation(),!d.is(".disabled, :disabled")){var e=b(d),g=e.hasClass("open");if(!g&&27!=c.which||g&&27==c.which)return 27==c.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find(".dropdown-menu"+h);if(i.length){var j=i.index(c.target);38==c.which&&j>0&&j--,40==c.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",c).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.7",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in"),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){document===a.target||this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a(document.createElement("div")).addClass("modal-backdrop "+e).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",a,b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(a.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusin"==b.type?"focus":"hover"]=!0),c.tip().hasClass("in")||"in"==c.hoverState?void(c.hoverState="in"):(clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.isInStateTrue=function(){for(var a in this.inState)if(this.inState[a])return!0;return!1},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);if(c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusout"==b.type?"focus":"hover"]=!1),!c.isInStateTrue())return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.getPosition(this.$viewport);h="bottom"==h&&k.bottom+m>o.bottom?"top":"top"==h&&k.top-m<o.top?"bottom":"right"==h&&k.right+l>o.width?"left":"left"==h&&k.left-l<o.left?"right":h,f.removeClass(n).addClass(h)}var p=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(p,h);var q=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",q).emulateTransitionEnd(c.TRANSITION_DURATION):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top+=g,b.left+=h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element&&e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);if(this.$element.trigger(g),!g.isDefaultPrevented())return f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=window.SVGElement&&c instanceof window.SVGElement,g=d?{top:0,left:0}:f?null:b.offset(),h={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},i=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,h,i,g)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.right&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){if(!this.$tip&&(this.$tip=a(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),b?(c.inState.click=!c.inState.click,c.isInStateTrue()?c.enter(c):c.leave(c)):c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type),a.$tip&&a.$tip.detach(),a.$tip=null,a.$arrow=null,a.$viewport=null,a.$element=null})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;!e&&/destroy|hide/.test(b)||(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.7",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.7",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){
this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.7",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.7",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return e<c&&"top";if("bottom"==this.affixed)return null!=c?!(e+this.unpin<=f.top)&&"bottom":!(e+g<=a-d)&&"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&e<=c?"top":null!=d&&i+j>=a-d&&"bottom"},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=Math.max(a(document).height(),a(document.body).height());"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.QrCode = factory());
}(this, (function () { 'use strict';

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function ErrorCorrectionLevel(ordinal,  bits, name) {
  this.ordinal_Renamed_Field = ordinal;
  this.bits = bits;
  this.name = name;
}

ErrorCorrectionLevel.prototype.ordinal = function() {
  return this.ordinal_Renamed_Field;
};

ErrorCorrectionLevel.forBits = function(bits) {
  if (bits < 0 || bits >= FOR_BITS.length) {
    throw "ArgumentException";
  }
  return FOR_BITS[bits];
};

var FOR_BITS = [
  new ErrorCorrectionLevel(1, 0x00, "M"),
  new ErrorCorrectionLevel(0, 0x01, "L"),
  new ErrorCorrectionLevel(3, 0x02, "H"),
  new ErrorCorrectionLevel(2, 0x03, "Q"),
];

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var FORMAT_INFO_MASK_QR = 0x5412;
var FORMAT_INFO_DECODE_LOOKUP = [
  [0x5412, 0x00],
  [0x5125, 0x01],
  [0x5E7C, 0x02],
  [0x5B4B, 0x03],
  [0x45F9, 0x04],
  [0x40CE, 0x05],
  [0x4F97, 0x06],
  [0x4AA0, 0x07],
  [0x77C4, 0x08],
  [0x72F3, 0x09],
  [0x7DAA, 0x0A],
  [0x789D, 0x0B],
  [0x662F, 0x0C],
  [0x6318, 0x0D],
  [0x6C41, 0x0E],
  [0x6976, 0x0F],
  [0x1689, 0x10],
  [0x13BE, 0x11],
  [0x1CE7, 0x12],
  [0x19D0, 0x13],
  [0x0762, 0x14],
  [0x0255, 0x15],
  [0x0D0C, 0x16],
  [0x083B, 0x17],
  [0x355F, 0x18],
  [0x3068, 0x19],
  [0x3F31, 0x1A],
  [0x3A06, 0x1B],
  [0x24B4, 0x1C],
  [0x2183, 0x1D],
  [0x2EDA, 0x1E],
  [0x2BED, 0x1F],
];
var BITS_SET_IN_HALF_BYTE = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];


function FormatInformation(formatInfo) {
  this.errorCorrectionLevel = ErrorCorrectionLevel.forBits((formatInfo >> 3) & 0x03);
  this.dataMask =  (formatInfo & 0x07);
}

FormatInformation.prototype.GetHashCode = function() {
  return (this.errorCorrectionLevel.ordinal() << 3) |  this.dataMask;
};

FormatInformation.prototype.Equals = function(o) {
  var other =  o;
  return this.errorCorrectionLevel == other.errorCorrectionLevel && this.dataMask == other.dataMask;
};

FormatInformation.numBitsDiffering = function(a,  b) {
  a ^= b; // a now has a 1 bit exactly where its bit differs with b's
  // Count bits set quickly with a series of lookups:
  return BITS_SET_IN_HALF_BYTE[a & 0x0F] + BITS_SET_IN_HALF_BYTE[(URShift(a, 4) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 8) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 12) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 16) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 20) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 24) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(URShift(a, 28) & 0x0F)];
};

FormatInformation.decodeFormatInformation = function(maskedFormatInfo) {
  var formatInfo = FormatInformation.doDecodeFormatInformation(maskedFormatInfo);
  if (formatInfo != null) {
    return formatInfo;
  }
  // Should return null, but, some QR codes apparently
  // do not mask this info. Try again by actually masking the pattern
  // first
  return FormatInformation.doDecodeFormatInformation(maskedFormatInfo ^ FORMAT_INFO_MASK_QR);
};
FormatInformation.doDecodeFormatInformation = function(maskedFormatInfo) {
  // Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
  var bestDifference = 0xffffffff;
  var bestFormatInfo = 0;
  for (var i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++) {
    var decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i];
    var targetInfo = decodeInfo[0];
    if (targetInfo == maskedFormatInfo) {
      // Found an exact match
      return new FormatInformation(decodeInfo[1]);
    }
    var bitsDifference = this.numBitsDiffering(maskedFormatInfo, targetInfo);
    if (bitsDifference < bestDifference) {
      bestFormatInfo = decodeInfo[1];
      bestDifference = bitsDifference;
    }
  }
  // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
  // differing means we found a match
  if (bestDifference <= 3) {
    return new FormatInformation(bestFormatInfo);
  }
  return null;
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function BitMatrix(width,  height) {
  if (!height)
    height = width;
  if (width < 1 || height < 1) {
    throw "Both dimensions must be greater than 0";
  }
  this.width = width;
  this.height = height;
  var rowSize = width >> 5;
  if ((width & 0x1f) != 0) {
    rowSize++;
  }
  this.rowSize = rowSize;
  this.bits = new Array(rowSize * height);
  for (var i = 0; i < this.bits.length; i++)
    this.bits[i] = 0;
}

Object.defineProperty(BitMatrix.prototype, "Dimension", {
  get: function() {
    if (this.width != this.height) {
      throw "Can't call getDimension() on a non-square matrix";
    }
    return this.width;
  }
});

BitMatrix.prototype.get_Renamed = function(x, y) {
  var offset = y * this.rowSize + (x >> 5);
  return ((URShift(this.bits[offset], (x & 0x1f))) & 1) != 0;
};

BitMatrix.prototype.set_Renamed = function(x, y) {
  var offset = y * this.rowSize + (x >> 5);
  this.bits[offset] |= 1 << (x & 0x1f);
};

BitMatrix.prototype.flip = function(x, y) {
  var offset = y * this.rowSize + (x >> 5);
  this.bits[offset] ^= 1 << (x & 0x1f);
};

BitMatrix.prototype.clear = function() {
  var max = this.bits.length;
  for (var i = 0; i < max; i++) {
    this.bits[i] = 0;
  }
};

BitMatrix.prototype.setRegion = function(left, top, width, height) {
  if (top < 0 || left < 0) {
    throw "Left and top must be nonnegative";
  }
  if (height < 1 || width < 1) {
    throw "Height and width must be at least 1";
  }
  var right = left + width;
  var bottom = top + height;
  if (bottom > this.height || right > this.width) {
    throw "The region must fit inside the matrix";
  }
  for (var y = top; y < bottom; y++) {
    var offset = y * this.rowSize;
    for (var x = left; x < right; x++) {
      this.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
    }
  }
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function ECB(count,  dataCodewords) {
  this.count = count;
  this.dataCodewords = dataCodewords;
}

function ECBlocks(ecCodewordsPerBlock,  ecBlocks1,  ecBlocks2) {
  this.ecCodewordsPerBlock = ecCodewordsPerBlock;
  if (ecBlocks2)
    this.ecBlocks = [ecBlocks1, ecBlocks2];
  else
    this.ecBlocks = [ecBlocks1];
}

Object.defineProperty(ECBlocks.prototype, "TotalECCodewords", {
  get: function() {
    return  this.ecCodewordsPerBlock * this.NumBlocks;
  }
});

Object.defineProperty(ECBlocks.prototype, "NumBlocks", {
  get: function() {
    var total = 0;
    for (var i = 0; i < this.ecBlocks.length; i++) {
      total += this.ecBlocks[i].length;
    }
    return total;
  }
});

ECBlocks.prototype.getECBlocks = function() {
  return this.ecBlocks;
};

function Version(versionNumber,  alignmentPatternCenters,  ecBlocks1,  ecBlocks2,  ecBlocks3,  ecBlocks4) {
  this.versionNumber = versionNumber;
  this.alignmentPatternCenters = alignmentPatternCenters;
  this.ecBlocks = [ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4];

  var total = 0;
  var ecCodewords = ecBlocks1.ecCodewordsPerBlock;
  var ecbArray = ecBlocks1.getECBlocks();
  for (var i = 0; i < ecbArray.length; i++) {
    var ecBlock = ecbArray[i];
    total += ecBlock.count * (ecBlock.dataCodewords + ecCodewords);
  }
  this.totalCodewords = total;
}

Object.defineProperty(Version.prototype, "DimensionForVersion", {
  get: function() {
    return  17 + 4 * this.versionNumber;
  }
});

Version.prototype.buildFunctionPattern = function() {
  var dimension = this.DimensionForVersion;
  var bitMatrix = new BitMatrix(dimension);

  // Top left finder pattern + separator + format
  bitMatrix.setRegion(0, 0, 9, 9);
  // Top right finder pattern + separator + format
  bitMatrix.setRegion(dimension - 8, 0, 8, 9);
  // Bottom left finder pattern + separator + format
  bitMatrix.setRegion(0, dimension - 8, 9, 8);

  // Alignment patterns
  var max = this.alignmentPatternCenters.length;
  for (var x = 0; x < max; x++) {
    var i = this.alignmentPatternCenters[x] - 2;
    for (var y = 0; y < max; y++) {
      if ((x == 0 && (y == 0 || y == max - 1)) || (x == max - 1 && y == 0)) {
        // No alignment patterns near the three finder paterns
        continue;
      }
      bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
    }
  }

  // Vertical timing pattern
  bitMatrix.setRegion(6, 9, 1, dimension - 17);
  // Horizontal timing pattern
  bitMatrix.setRegion(9, 6, dimension - 17, 1);

  if (this.versionNumber > 6) {
    // Version info, top right
    bitMatrix.setRegion(dimension - 11, 0, 3, 6);
    // Version info, bottom left
    bitMatrix.setRegion(0, dimension - 11, 6, 3);
  }

  return bitMatrix;
};

Version.prototype.getECBlocksForLevel = function(ecLevel) {
  return this.ecBlocks[ecLevel.ordinal()];
};

Version.VERSION_DECODE_INFO = [
  0x07C94,
  0x085BC,
  0x09A99,
  0x0A4D3,
  0x0BBF6,
  0x0C762,
  0x0D847,
  0x0E60D,
  0x0F928,
  0x10B78,
  0x1145D,
  0x12A17,
  0x13532,
  0x149A6,
  0x15683,
  0x168C9,
  0x177EC,
  0x18EC4,
  0x191E1,
  0x1AFAB,
  0x1B08E,
  0x1CC1A,
  0x1D33F,
  0x1ED75,
  0x1F250,
  0x209D5,
  0x216F0,
  0x228BA,
  0x2379F,
  0x24B0B,
  0x2542E,
  0x26A64,
  0x27541,
  0x28C69
];

Version.VERSIONS = buildVersions();

Version.getVersionForNumber = function(versionNumber) {
  if (versionNumber < 1 || versionNumber > 40) {
    throw "ArgumentException";
  }
  return Version.VERSIONS[versionNumber - 1];
};

Version.getProvisionalVersionForDimension = function(dimension) {
  if (dimension % 4 != 1) {
    throw "Error getProvisionalVersionForDimension";
  }
  try {
    return Version.getVersionForNumber((dimension - 17) >> 2);
  } catch (iae) {
    throw "Error getVersionForNumber";
  }
};

Version.decodeVersionInformation = function(versionBits) {
  var bestDifference = 0xffffffff;
  var bestVersion = 0;
  for (var i = 0; i < Version.VERSION_DECODE_INFO.length; i++) {
    var targetVersion = Version.VERSION_DECODE_INFO[i];
    // Do the version info bits match exactly? done.
    if (targetVersion == versionBits) {
      return this.getVersionForNumber(i + 7);
    }
    // Otherwise see if this is the closest to a real version info bit string
    // we have seen so far
    var bitsDifference = FormatInformation.numBitsDiffering(versionBits, targetVersion);
    if (bitsDifference < bestDifference) {
      bestVersion = i + 7;
      bestDifference = bitsDifference;
    }
  }
  // We can tolerate up to 3 bits of error since no two version info codewords will
  // differ in less than 4 bits.
  if (bestDifference <= 3) {
    return this.getVersionForNumber(bestVersion);
  }
  // If we didn't find a close enough match, fail
  return null;
};

function buildVersions() {
  return [
    new Version(1, [], new ECBlocks(7, new ECB(1, 19)), new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)), new ECBlocks(17, new ECB(1, 9))),
    new Version(2, [6, 18], new ECBlocks(10, new ECB(1, 34)), new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)), new ECBlocks(28, new ECB(1, 16))),
    new Version(3, [6, 22], new ECBlocks(15, new ECB(1, 55)), new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)), new ECBlocks(22, new ECB(2, 13))),
    new Version(4, [6, 26], new ECBlocks(20, new ECB(1, 80)), new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)), new ECBlocks(16, new ECB(4, 9))),
    new Version(5, [6, 30], new ECBlocks(26, new ECB(1, 108)), new ECBlocks(24, new ECB(2, 43)), new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)), new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))),
    new Version(6, [6, 34], new ECBlocks(18, new ECB(2, 68)), new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)), new ECBlocks(28, new ECB(4, 15))),
    new Version(7, [6, 22, 38], new ECBlocks(20, new ECB(2, 78)), new ECBlocks(18, new ECB(4, 31)), new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)), new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))),
    new Version(8, [6, 24, 42], new ECBlocks(24, new ECB(2, 97)), new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)), new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)), new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))),
    new Version(9, [6, 26, 46], new ECBlocks(30, new ECB(2, 116)), new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)), new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)), new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))),
    new Version(10, [6, 28, 50], new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)), new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)), new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)), new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))),
    new Version(11, [6, 30, 54], new ECBlocks(20, new ECB(4, 81)), new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)), new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)), new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))),
    new Version(12, [6, 32, 58], new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)), new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)), new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)), new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))),
    new Version(13, [6, 34, 62], new ECBlocks(26, new ECB(4, 107)), new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)), new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)), new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))),
    new Version(14, [6, 26, 46, 66], new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)), new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)), new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)), new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))),
    new Version(15, [6, 26, 48, 70], new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)), new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)), new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)), new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))),
    new Version(16, [6, 26, 50, 74], new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)), new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)), new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)), new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))),
    new Version(17, [6, 30, 54, 78], new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)), new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)), new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))),
    new Version(18, [6, 30, 56, 82], new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)), new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)), new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))),
    new Version(19, [6, 30, 58, 86], new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)), new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)), new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)), new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))),
    new Version(20, [6, 34, 62, 90], new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)), new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)), new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)), new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))),
    new Version(21, [6, 28, 50, 72, 94], new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)), new ECBlocks(26, new ECB(17, 42)), new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))),
    new Version(22, [6, 26, 50, 74, 98], new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)), new ECBlocks(28, new ECB(17, 46)), new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)), new ECBlocks(24, new ECB(34, 13))),
    new Version(23, [6, 30, 54, 74, 102], new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)), new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)), new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))),
    new Version(24, [6, 28, 54, 80, 106], new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)), new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)), new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))),
    new Version(25, [6, 32, 58, 84, 110], new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)), new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)), new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))),
    new Version(26, [6, 30, 58, 86, 114], new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)), new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)), new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))),
    new Version(27, [6, 34, 62, 90, 118], new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)), new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)), new ECBlocks(30, new ECB(12, 15),     new ECB(28, 16))),
    new Version(28, [6, 26, 50, 74, 98, 122], new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)), new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)), new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))),
    new Version(29, [6, 30, 54, 78, 102, 126], new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)), new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)), new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)), new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))),
    new Version(30, [6, 26, 52, 78, 104, 130], new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)), new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)), new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))),
    new Version(31, [6, 30, 56, 82, 108, 134], new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)), new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)), new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))),
    new Version(32, [6, 34, 60, 86, 112, 138], new ECBlocks(30, new ECB(17, 115)), new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)), new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))),
    new Version(33, [6, 30, 58, 86, 114, 142], new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)), new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))),
    new Version(34, [6, 34, 62, 90, 118, 146], new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)), new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))),
    new Version(35, [6, 30, 54, 78, 102, 126, 150], new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)), new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)), new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))),
    new Version(36, [6, 24, 50, 76, 102, 128, 154], new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)), new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)), new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))),
    new Version(37, [6, 28, 54, 80, 106, 132, 158], new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)), new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))),
    new Version(38, [6, 32, 58, 84, 110, 136, 162], new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)), new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)), new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))),
    new Version(39, [6, 26, 54, 82, 110, 138, 166], new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)), new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))),
    new Version(40, [6, 30, 58, 86, 114, 142, 170], new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)), new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)), new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)), new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))),
  ];
}

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function AlignmentPattern(posX, posY,  estimatedModuleSize) {
  this.x = posX;
  this.y = posY;
  this.count = 1;
  this.estimatedModuleSize = estimatedModuleSize;
}

Object.defineProperty(AlignmentPattern.prototype, "X", {
  get: function() {
    return Math.floor(this.x);
  }
});

Object.defineProperty(AlignmentPattern.prototype, "Y", {
  get: function() {
    return Math.floor(this.y);
  }
});

AlignmentPattern.prototype.incrementCount = function() {
  this.count++;
};

AlignmentPattern.prototype.aboutEquals = function(moduleSize,  i,  j) {
  if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
    var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
    return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
  }
  return false;
};

function AlignmentPatternFinder(image,  startX,  startY,  width,  height,  moduleSize,  resultPointCallback) {
  this.image = image;
  this.possibleCenters = [];
  this.startX = startX;
  this.startY = startY;
  this.width = width;
  this.height = height;
  this.moduleSize = moduleSize;
  this.crossCheckStateCount = [0, 0, 0];
  this.resultPointCallback = resultPointCallback;
}

AlignmentPatternFinder.prototype.centerFromEnd = function(stateCount,  end) {
  return  (end - stateCount[2]) - stateCount[1] / 2.0;
};

AlignmentPatternFinder.prototype.foundPatternCross = function(stateCount) {
  var moduleSize = this.moduleSize;
  var maxVariance = moduleSize / 2.0;
  for (var i = 0; i < 3; i++) {
    if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
      return false;
    }
  }
  return true;
};

AlignmentPatternFinder.prototype.crossCheckVertical = function(startI,  centerJ,  maxCount,  originalStateCountTotal) {
  var image = this.image;

  var maxI = image.height;
  var stateCount = this.crossCheckStateCount;
  stateCount[0] = 0;
  stateCount[1] = 0;
  stateCount[2] = 0;

  // Start counting up from center
  var i = startI;
  while (i >= 0 && image.data[centerJ + i * image.width] && stateCount[1] <= maxCount) {
    stateCount[1]++;
    i--;
  }
  // If already too many modules in this state or ran off the edge:
  if (i < 0 || stateCount[1] > maxCount) {
    return NaN;
  }
  while (i >= 0 && !image.data[centerJ + i * image.width] && stateCount[0] <= maxCount) {
    stateCount[0]++;
    i--;
  }
  if (stateCount[0] > maxCount) {
    return NaN;
  }

  // Now also count down from center
  i = startI + 1;
  while (i < maxI && image.data[centerJ + i * image.width] && stateCount[1] <= maxCount) {
    stateCount[1]++;
    i++;
  }
  if (i == maxI || stateCount[1] > maxCount) {
    return NaN;
  }
  while (i < maxI && !image.data[centerJ + i * image.width] && stateCount[2] <= maxCount) {
    stateCount[2]++;
    i++;
  }
  if (stateCount[2] > maxCount) {
    return NaN;
  }

  var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
  if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
    return NaN;
  }

  return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
};

AlignmentPatternFinder.prototype.handlePossibleCenter = function(stateCount,  i,  j) {
  var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
  var centerJ = this.centerFromEnd(stateCount, j);
  var centerI = this.crossCheckVertical(i, Math.floor(centerJ), 2 * stateCount[1], stateCountTotal);
  if (!isNaN(centerI)) {
    var estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
    var max = this.possibleCenters.length;
    for (var index = 0; index < max; index++) {
      var center =  this.possibleCenters[index];
      // Look for about the same center and module size:
      if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
        return new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
      }
    }
    // Hadn't found this before; save it
    var point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
    this.possibleCenters.push(point);
    if (this.resultPointCallback != null) {
      this.resultPointCallback.foundPossibleResultPoint(point);
    }
  }
  return null;
};

AlignmentPatternFinder.prototype.find = function() {
  var image = this.image;
  var startX = this.startX;
  var height = this.height;
  var maxJ = startX + this.width;
  var middleI = this.startY + (height >> 1);
  // We are looking for black/white/black modules in 1:1:1 ratio;
  // this tracks the number of black/white/black modules seen so far
  var stateCount = [0, 0, 0];
  for (var iGen = 0; iGen < height; iGen++) {
    // Search from middle outwards
    var i = middleI + ((iGen & 0x01) == 0 ? ((iGen + 1) >> 1) : -((iGen + 1) >> 1));
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;
    var j = startX;
    // Burn off leading white pixels before anything else; if we start in the middle of
    // a white run, it doesn't make sense to count its length, since we don't know if the
    // white run continued to the left of the start point
    while (j < maxJ && !image.data[j + image.width * i]) {
      j++;
    }
    var currentState = 0;
    while (j < maxJ) {
      if (image.data[j + i * image.width]) {
        // Black pixel
        if (currentState == 1) {
          // Counting black pixels
          stateCount[currentState]++;
        } else {
          // Counting white pixels
          if (currentState == 2) {
            // A winner?
            if (this.foundPatternCross(stateCount)) {
              // Yes
              var confirmed = this.handlePossibleCenter(stateCount, i, j);
              if (confirmed != null) {
                return confirmed;
              }
            }
            stateCount[0] = stateCount[2];
            stateCount[1] = 1;
            stateCount[2] = 0;
            currentState = 1;
          } else {
            stateCount[++currentState]++;
          }
        }
      } else {
        // White pixel
        if (currentState == 1) {
          // Counting black pixels
          currentState++;
        }
        stateCount[currentState]++;
      }
      j++;
    }
    if (this.foundPatternCross(stateCount)) {
      var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
      if (confirmed != null) {
        return confirmed;
      }
    }
  }

  // Hmm, nothing we saw was observed and confirmed twice. If we had
  // any guess at all, return it.
  if (!(this.possibleCenters.length == 0)) {
    return  this.possibleCenters[0];
  }

  throw "Couldn't find enough alignment patterns";
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var GridSampler = {};

GridSampler.checkAndNudgePoints = function(image,  points) {
  var width = image.width;
  var height = image.height;
  // Check and nudge points from start until we see some that are OK:
  var nudged = true;
  for (var offset = 0; offset < points.length && nudged; offset += 2) {
    var x = Math.floor(points[offset]);
    var y = Math.floor(points[offset + 1]);
    if (x < -1 || x > width || y < -1 || y > height) {
      throw "Error.checkAndNudgePoints ";
    }
    nudged = false;
    if (x == -1) {
      points[offset] = 0.0;
      nudged = true;
    } else if (x == width) {
      points[offset] = width - 1;
      nudged = true;
    }
    if (y == -1) {
      points[offset + 1] = 0.0;
      nudged = true;
    } else if (y == height) {
      points[offset + 1] = height - 1;
      nudged = true;
    }
  }
  // Check and nudge points from end:
  nudged = true;
  for (var offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
    var x = Math.floor(points[offset]);
    var y = Math.floor(points[offset + 1]);
    if (x < -1 || x > width || y < -1 || y > height) {
      throw "Error.checkAndNudgePoints ";
    }
    nudged = false;
    if (x == -1) {
      points[offset] = 0.0;
      nudged = true;
    } else if (x == width) {
      points[offset] = width - 1;
      nudged = true;
    }
    if (y == -1) {
      points[offset + 1] = 0.0;
      nudged = true;
    } else if (y == height) {
      points[offset + 1] = height - 1;
      nudged = true;
    }
  }
};



GridSampler.sampleGrid3 = function(image,  dimension,  transform) {
  var bits = new BitMatrix(dimension);
  var points = new Array(dimension << 1);
  for (var y = 0; y < dimension; y++) {
    var max = points.length;
    var iValue =  y + 0.5;
    for (var x = 0; x < max; x += 2) {
      points[x] =  (x >> 1) + 0.5;
      points[x + 1] = iValue;
    }
    transform.transformPoints1(points);
    // Quick check to see if points transformed to something inside the image
    // sufficient to check the endpoints
    GridSampler.checkAndNudgePoints(image, points);
    try {
      for (var x = 0; x < max; x += 2) {
        var bit = image.data[Math.floor(points[x]) + image.width * Math.floor(points[x + 1])];
        if (bit)
          bits.set_Renamed(x >> 1, y);
      }
    } catch (aioobe) {
      // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
      // transform gets "twisted" such that it maps a straight line of points to a set of points
      // whose endpoints are in bounds, but others are not. There is probably some mathematical
      // way to detect this about the transformation that I don't know yet.
      // This results in an ugly runtime exception despite our clever checks above -- can't have
      // that. We could check each point's coordinates but that feels duplicative. We settle for
      // catching and wrapping ArrayIndexOutOfBoundsException.
      throw "Error.checkAndNudgePoints";
    }
  }
  return bits;
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var MIN_SKIP = 3;
var MAX_MODULES = 57;
var INTEGER_MATH_SHIFT = 8;
var CENTER_QUORUM = 2;

function orderBestPatterns(patterns) {

  function distance(pattern1,  pattern2) {
    var xDiff = pattern1.X - pattern2.X;
    var yDiff = pattern1.Y - pattern2.Y;
    return  Math.sqrt((xDiff * xDiff + yDiff * yDiff));
  }

  /// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>
  function crossProductZ(pointA,  pointB,  pointC) {
    var bX = pointB.x;
    var bY = pointB.y;
    return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
  }


  // Find distances between pattern centers
  var zeroOneDistance = distance(patterns[0], patterns[1]);
  var oneTwoDistance = distance(patterns[1], patterns[2]);
  var zeroTwoDistance = distance(patterns[0], patterns[2]);

  var pointA, pointB, pointC;
  // Assume one closest to other two is B; A and C will just be guesses at first
  if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
    pointB = patterns[0];
    pointA = patterns[1];
    pointC = patterns[2];
  } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
    pointB = patterns[1];
    pointA = patterns[0];
    pointC = patterns[2];
  } else {
    pointB = patterns[2];
    pointA = patterns[0];
    pointC = patterns[1];
  }

  // Use cross product to figure out whether A and C are correct or flipped.
  // This asks whether BC x BA has a positive z component, which is the arrangement
  // we want for A, B, C. If it's negative, then we've got it flipped around and
  // should swap A and C.
  if (crossProductZ(pointA, pointB, pointC) < 0.0) {
    var temp = pointA;
    pointA = pointC;
    pointC = temp;
  }

  patterns[0] = pointA;
  patterns[1] = pointB;
  patterns[2] = pointC;
}


function FinderPattern(posX, posY,  estimatedModuleSize) {
  this.x = posX;
  this.y = posY;
  this.count = 1;
  this.estimatedModuleSize = estimatedModuleSize;
}

Object.defineProperty(FinderPattern.prototype, "X", {
  get: function() {
    return this.x;
  }
});

Object.defineProperty(FinderPattern.prototype, "Y", {
  get: function() {
    return this.y;
  }
});

FinderPattern.prototype.incrementCount = function() {
  this.count++;
};

FinderPattern.prototype.aboutEquals = function(moduleSize, i, j) {
  if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
    var moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
    return moduleSizeDiff <= 1.0 || moduleSizeDiff / this.estimatedModuleSize <= 1.0;
  }
  return false;
};

function FinderPatternInfo(patternCenters) {
  this.bottomLeft = patternCenters[0];
  this.topLeft = patternCenters[1];
  this.topRight = patternCenters[2];
}

function FinderPatternFinder() {
  this.image = null;
  this.possibleCenters = [];
  this.hasSkipped = false;
  this.crossCheckStateCount = [0, 0, 0, 0, 0];
  this.resultPointCallback = null;
}

Object.defineProperty(FinderPatternFinder.prototype, "CrossCheckStateCount", {
  get: function() {
    this.crossCheckStateCount[0] = 0;
    this.crossCheckStateCount[1] = 0;
    this.crossCheckStateCount[2] = 0;
    this.crossCheckStateCount[3] = 0;
    this.crossCheckStateCount[4] = 0;
    return this.crossCheckStateCount;
  }
});

FinderPatternFinder.prototype.foundPatternCross = function(stateCount) {
  var totalModuleSize = 0;
  for (var i = 0; i < 5; i++) {
    var count = stateCount[i];
    if (count == 0) {
      return false;
    }
    totalModuleSize += count;
  }
  if (totalModuleSize < 7) {
    return false;
  }
  var moduleSize = Math.floor((totalModuleSize << INTEGER_MATH_SHIFT) / 7);
  var maxVariance = Math.floor(moduleSize / 2);
  // Allow less than 50% variance from 1-1-3-1-1 proportions
  return Math.abs(moduleSize - (stateCount[0] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[1] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(3 * moduleSize - (stateCount[2] << INTEGER_MATH_SHIFT)) < 3 * maxVariance && Math.abs(moduleSize - (stateCount[3] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[4] << INTEGER_MATH_SHIFT)) < maxVariance;
};

FinderPatternFinder.prototype.centerFromEnd = function(stateCount,  end) {
  return  (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
};

FinderPatternFinder.prototype.crossCheckVertical = function(startI,  centerJ,  maxCount,  originalStateCountTotal) {
  var image = this.image;

  var maxI = image.height;
  var stateCount = this.CrossCheckStateCount;

  // Start counting up from center
  var i = startI;
  while (i >= 0 && image.data[centerJ + i * image.width]) {
    stateCount[2]++;
    i--;
  }
  if (i < 0) {
    return NaN;
  }
  while (i >= 0 && !image.data[centerJ + i * image.width] && stateCount[1] <= maxCount) {
    stateCount[1]++;
    i--;
  }
  // If already too many modules in this state or ran off the edge:
  if (i < 0 || stateCount[1] > maxCount) {
    return NaN;
  }
  while (i >= 0 && image.data[centerJ + i * image.width] && stateCount[0] <= maxCount) {
    stateCount[0]++;
    i--;
  }
  if (stateCount[0] > maxCount) {
    return NaN;
  }

  // Now also count down from center
  i = startI + 1;
  while (i < maxI && image.data[centerJ + i * image.width]) {
    stateCount[2]++;
    i++;
  }
  if (i == maxI) {
    return NaN;
  }
  while (i < maxI && !image.data[centerJ + i * image.width] && stateCount[3] < maxCount) {
    stateCount[3]++;
    i++;
  }
  if (i == maxI || stateCount[3] >= maxCount) {
    return NaN;
  }
  while (i < maxI && image.data[centerJ + i * image.width] && stateCount[4] < maxCount) {
    stateCount[4]++;
    i++;
  }
  if (stateCount[4] >= maxCount) {
    return NaN;
  }

  // If we found a finder-pattern-like section, but its size is more than 40% different than
  // the original, assume it's a false positive
  var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
  if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
    return NaN;
  }

  return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
};

FinderPatternFinder.prototype.crossCheckHorizontal = function(startJ,  centerI,  maxCount, originalStateCountTotal) {
  var image = this.image;

  var maxJ = image.width;
  var stateCount = this.CrossCheckStateCount;

  var j = startJ;
  while (j >= 0 && image.data[j + centerI * image.width]) {
    stateCount[2]++;
    j--;
  }
  if (j < 0) {
    return NaN;
  }
  while (j >= 0 && !image.data[j + centerI * image.width] && stateCount[1] <= maxCount) {
    stateCount[1]++;
    j--;
  }
  if (j < 0 || stateCount[1] > maxCount) {
    return NaN;
  }
  while (j >= 0 && image.data[j + centerI * image.width] && stateCount[0] <= maxCount) {
    stateCount[0]++;
    j--;
  }
  if (stateCount[0] > maxCount) {
    return NaN;
  }

  j = startJ + 1;
  while (j < maxJ && image.data[j + centerI * image.width]) {
    stateCount[2]++;
    j++;
  }
  if (j == maxJ) {
    return NaN;
  }
  while (j < maxJ && !image.data[j + centerI * image.width] && stateCount[3] < maxCount) {
    stateCount[3]++;
    j++;
  }
  if (j == maxJ || stateCount[3] >= maxCount) {
    return NaN;
  }
  while (j < maxJ && image.data[j + centerI * image.width] && stateCount[4] < maxCount) {
    stateCount[4]++;
    j++;
  }
  if (stateCount[4] >= maxCount) {
    return NaN;
  }

  // If we found a finder-pattern-like section, but its size is significantly different than
  // the original, assume it's a false positive
  var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
  if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
    return NaN;
  }

  return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, j) : NaN;
};

FinderPatternFinder.prototype.handlePossibleCenter = function(stateCount,  i,  j) {
  var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
  var centerJ = this.centerFromEnd(stateCount, j); //float
  var centerI = this.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal); //float
  if (!isNaN(centerI)) {
    // Re-cross check
    centerJ = this.crossCheckHorizontal(Math.floor(centerJ), Math.floor(centerI), stateCount[2], stateCountTotal);
    if (!isNaN(centerJ)) {
      var estimatedModuleSize =   stateCountTotal / 7.0;
      var found = false;
      var max = this.possibleCenters.length;
      for (var index = 0; index < max; index++) {
        var center = this.possibleCenters[index];
        // Look for about the same center and module size:
        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
          center.incrementCount();
          found = true;
          break;
        }
      }
      if (!found) {
        var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
        this.possibleCenters.push(point);
        if (this.resultPointCallback != null) {
          this.resultPointCallback.foundPossibleResultPoint(point);
        }
      }
      return true;
    }
  }
  return false;
};

FinderPatternFinder.prototype.selectBestPatterns = function() {

  var startSize = this.possibleCenters.length;
  if (startSize < 3) {
    // Couldn't find enough finder patterns
    throw "Couldn't find enough finder patterns:" + startSize + " patterns found";
  }

  // Filter outlier possibilities whose module size is too different
  if (startSize > 3) {
    // But we can only afford to do so if we have at least 4 possibilities to choose from
    var totalModuleSize = 0.0;
    var square = 0.0;
    for (var i = 0; i < startSize; i++) {
      var  centerValue = this.possibleCenters[i].estimatedModuleSize;
      totalModuleSize += centerValue;
      square += (centerValue * centerValue);
    }
    var average = totalModuleSize /  startSize;
    this.possibleCenters.sort(function(center1, center2) {
      var dA = Math.abs(center2.estimatedModuleSize - average);
      var dB = Math.abs(center1.estimatedModuleSize - average);
      if (dA < dB) {
        return (-1);
      } else if (dA == dB) {
        return 0;
      } else {
        return 1;
      }
    });

    var stdDev = Math.sqrt(square / startSize - average * average);
    var limit = Math.max(0.2 * average, stdDev);
    for (var i = this.possibleCenters - 1; i >= 0; i--) {
      var pattern =  this.possibleCenters[i];
      if (Math.abs(pattern.estimatedModuleSize - average) > limit) {
        this.possibleCenters.splice(i, 1);
      }
    }
  }

  if (this.possibleCenters.length > 3) {
    // Throw away all but those first size candidate points we found.
    this.possibleCenters.sort(function(a, b) {
      if (a.count > b.count) return -1;
      if (a.count < b.count) return 1;
      return 0;
    });
  }

  return [this.possibleCenters[0],  this.possibleCenters[1],  this.possibleCenters[2]];
};

FinderPatternFinder.prototype.findRowSkip = function() {
  var max = this.possibleCenters.length;
  if (max <= 1) {
    return 0;
  }
  var firstConfirmedCenter = null;
  for (var i = 0; i < max; i++) {
    var center =  this.possibleCenters[i];
    if (center.count >= CENTER_QUORUM) {
      if (firstConfirmedCenter == null) {
        firstConfirmedCenter = center;
      } else {
        // We have two confirmed centers
        // How far down can we skip before resuming looking for the next
        // pattern? In the worst case, only the difference between the
        // difference in the x / y coordinates of the two centers.
        // This is the case where you find top left last.
        this.hasSkipped = true;
        return Math.floor((Math.abs(firstConfirmedCenter.X - center.X) - Math.abs(firstConfirmedCenter.Y - center.Y)) / 2);
      }
    }
  }
  return 0;
};

FinderPatternFinder.prototype.haveMultiplyConfirmedCenters = function() {
  var confirmedCount = 0;
  var totalModuleSize = 0.0;
  var max = this.possibleCenters.length;
  for (var i = 0; i < max; i++) {
    var pattern =  this.possibleCenters[i];
    if (pattern.count >= CENTER_QUORUM) {
      confirmedCount++;
      totalModuleSize += pattern.estimatedModuleSize;
    }
  }
  if (confirmedCount < 3) {
    return false;
  }
  // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
  // and that we need to keep looking. We detect this by asking if the estimated module sizes
  // vary too much. We arbitrarily say that when the total deviation from average exceeds
  // 5% of the total module size estimates, it's too much.
  var average = totalModuleSize / max;
  var totalDeviation = 0.0;
  for (var i = 0; i < max; i++) {
    pattern = this.possibleCenters[i];
    totalDeviation += Math.abs(pattern.estimatedModuleSize - average);
  }
  return totalDeviation <= 0.05 * totalModuleSize;
};

FinderPatternFinder.prototype.findFinderPattern = function(image) {
  var tryHarder = false;
  this.image = image;
  var maxI = image.height;
  var maxJ = image.width;
  var iSkip = Math.floor((3 * maxI) / (4 * MAX_MODULES));
  if (iSkip < MIN_SKIP || tryHarder) {
    iSkip = MIN_SKIP;
  }

  var done = false;
  var stateCount = new Array(5);
  for (var i = iSkip - 1; i < maxI && !done; i += iSkip) {
    // Get a row of black/white values
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;
    stateCount[3] = 0;
    stateCount[4] = 0;
    var currentState = 0;
    for (var j = 0; j < maxJ; j++) {
      if (image.data[j + i * image.width]) {
        // Black pixel
        if ((currentState & 1) == 1) {
          // Counting white pixels
          currentState++;
        }
        stateCount[currentState]++;
      } else {
        // White pixel
        if ((currentState & 1) == 0) {
          // Counting black pixels
          if (currentState == 4) {
            // A winner?
            if (this.foundPatternCross(stateCount)) {
              // Yes
              var confirmed = this.handlePossibleCenter(stateCount, i, j);
              if (confirmed) {
                // Start examining every other line. Checking each line turned out to be too
                // expensive and didn't improve performance.
                iSkip = 2;
                if (this.hasSkipped) {
                  done = this.haveMultiplyConfirmedCenters();
                } else {
                  var rowSkip = this.findRowSkip();
                  if (rowSkip > stateCount[2]) {
                    // Skip rows between row of lower confirmed center
                    // and top of presumed third confirmed center
                    // but back up a bit to get a full chance of detecting
                    // it, entire width of center of finder pattern

                    // Skip by rowSkip, but back off by stateCount[2] (size of last center
                    // of pattern we saw) to be conservative, and also back off by iSkip which
                    // is about to be re-added
                    i += rowSkip - stateCount[2] - iSkip;
                    j = maxJ - 1;
                  }
                }
              } else {
                // Advance to next black pixel
                do {
                  j++;
                } while (j < maxJ && !image.data[j + i * image.width]);
                j--; // back up to that last white pixel
              }
              // Clear state to start looking again
              currentState = 0;
              stateCount[0] = 0;
              stateCount[1] = 0;
              stateCount[2] = 0;
              stateCount[3] = 0;
              stateCount[4] = 0;
            } else {
              // No, shift counts back by two
              stateCount[0] = stateCount[2];
              stateCount[1] = stateCount[3];
              stateCount[2] = stateCount[4];
              stateCount[3] = 1;
              stateCount[4] = 0;
              currentState = 3;
            }
          } else {
            stateCount[++currentState]++;
          }
        } else {
          // Counting white pixels
          stateCount[currentState]++;
        }
      }
    }
    if (this.foundPatternCross(stateCount)) {
      var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
      if (confirmed) {
        iSkip = stateCount[0];
        if (this.hasSkipped) {
          // Found a third one
          done = this.haveMultiplyConfirmedCenters();
        }
      }
    }
  }

  var patternInfo = this.selectBestPatterns();
  orderBestPatterns(patternInfo);

  return new FinderPatternInfo(patternInfo);
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function PerspectiveTransform(a11,  a21,  a31,  a12,  a22,  a32,  a13,  a23,  a33) {
  this.a11 = a11;
  this.a12 = a12;
  this.a13 = a13;
  this.a21 = a21;
  this.a22 = a22;
  this.a23 = a23;
  this.a31 = a31;
  this.a32 = a32;
  this.a33 = a33;
}

PerspectiveTransform.prototype.transformPoints1 = function(points) {
  var max = points.length;
  var a11 = this.a11;
  var a12 = this.a12;
  var a13 = this.a13;
  var a21 = this.a21;
  var a22 = this.a22;
  var a23 = this.a23;
  var a31 = this.a31;
  var a32 = this.a32;
  var a33 = this.a33;
  for (var i = 0; i < max; i += 2) {
    var x = points[i];
    var y = points[i + 1];
    var denominator = a13 * x + a23 * y + a33;
    points[i] = (a11 * x + a21 * y + a31) / denominator;
    points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
  }
};

PerspectiveTransform.prototype.transformPoints2 = function(xValues, yValues) {
  var n = xValues.length;
  for (var i = 0; i < n; i++) {
    var x = xValues[i];
    var y = yValues[i];
    var denominator = this.a13 * x + this.a23 * y + this.a33;
    xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
    yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
  }
};

PerspectiveTransform.prototype.buildAdjoint = function() {
  // Adjoint is the transpose of the cofactor matrix:
  return new PerspectiveTransform(this.a22 * this.a33 - this.a23 * this.a32, this.a23 * this.a31 - this.a21 * this.a33, this.a21 * this.a32 - this.a22 * this.a31, this.a13 * this.a32 - this.a12 * this.a33, this.a11 * this.a33 - this.a13 * this.a31, this.a12 * this.a31 - this.a11 * this.a32, this.a12 * this.a23 - this.a13 * this.a22, this.a13 * this.a21 - this.a11 * this.a23, this.a11 * this.a22 - this.a12 * this.a21);
};

PerspectiveTransform.prototype.times = function(other) {
  return new PerspectiveTransform(this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13, this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23, this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33, this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13, this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23, this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33, this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13, this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23, this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
};

PerspectiveTransform.quadrilateralToQuadrilateral = function(x0,  y0,  x1,  y1,  x2,  y2,  x3,  y3,  x0p,  y0p,  x1p,  y1p,  x2p,  y2p,  x3p,  y3p) {

  var qToS = this.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
  var sToQ = this.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
  return sToQ.times(qToS);
};

PerspectiveTransform.squareToQuadrilateral = function(x0,  y0,  x1,  y1,  x2,  y2,  x3,  y3) {
  var dy2 = y3 - y2;
  var dy3 = y0 - y1 + y2 - y3;
  if (dy2 == 0.0 && dy3 == 0.0) {
    return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0.0, 0.0, 1.0);
  } else {
    var dx1 = x1 - x2;
    var dx2 = x3 - x2;
    var dx3 = x0 - x1 + x2 - x3;
    var dy1 = y1 - y2;
    var denominator = dx1 * dy2 - dx2 * dy1;
    var a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
    var a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
    return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1.0);
  }
};

PerspectiveTransform.quadrilateralToSquare = function(x0,  y0,  x1,  y1,  x2,  y2,  x3,  y3) {
  // Here, the adjoint serves as the inverse:
  return this.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
};

function DetectorResult(bits,  points) {
  this.bits = bits;
  this.points = points;
}

function Detector(image) {
  this.image = image;
  this.resultPointCallback = null;
}

Detector.prototype.sizeOfBlackWhiteBlackRun = function(fromX,  fromY,  toX,  toY) {
  // Mild variant of Bresenham's algorithm;
  // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
  var steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
  if (steep) {
    var temp = fromX;
    fromX = fromY;
    fromY = temp;
    temp = toX;
    toX = toY;
    toY = temp;
  }

  var dx = Math.abs(toX - fromX);
  var dy = Math.abs(toY - fromY);
  var error = -dx >> 1;
  var ystep = fromY < toY ? 1 : -1;
  var xstep = fromX < toX ? 1 : -1;
  var state = 0; // In black pixels, looking for white, first or second time
  for (var x = fromX, y = fromY; x != toX; x += xstep) {

    var realX = steep ? y : x;
    var realY = steep ? x : y;
    if (state == 1) {
      // In white pixels, looking for black
      if (this.image.data[realX + realY * this.image.width]) {
        state++;
      }
    } else {
      if (!this.image.data[realX + realY * this.image.width]) {
        state++;
      }
    }

    if (state == 3) {
      // Found black, white, black, and stumbled back onto white; done
      var diffX = x - fromX;
      var diffY = y - fromY;
      return  Math.sqrt((diffX * diffX + diffY * diffY));
    }
    error += dy;
    if (error > 0) {
      if (y == toY) {
        break;
      }
      y += ystep;
      error -= dx;
    }
  }
  var diffX2 = toX - fromX;
  var diffY2 = toY - fromY;
  return  Math.sqrt((diffX2 * diffX2 + diffY2 * diffY2));
};

Detector.prototype.sizeOfBlackWhiteBlackRunBothWays = function(fromX,  fromY,  toX,  toY) {

  var result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

  // Now count other way -- don't run off image though of course
  var scale = 1.0;
  var otherToX = fromX - (toX - fromX);
  if (otherToX < 0) {
    scale =  fromX /  (fromX - otherToX);
    otherToX = 0;
  } else if (otherToX >= this.image.width) {
    scale =  (this.image.width - 1 - fromX) /  (otherToX - fromX);
    otherToX = this.image.width - 1;
  }
  var otherToY = Math.floor(fromY - (toY - fromY) * scale);

  scale = 1.0;
  if (otherToY < 0) {
    scale =  fromY /  (fromY - otherToY);
    otherToY = 0;
  } else if (otherToY >= this.image.height) {
    scale =  (this.image.height - 1 - fromY) /  (otherToY - fromY);
    otherToY = this.image.height - 1;
  }
  otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

  result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
  return result - 1.0; // -1 because we counted the middle pixel twice
};

Detector.prototype.calculateModuleSizeOneWay = function(pattern,  otherPattern) {
  var moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(pattern.X), Math.floor(pattern.Y), Math.floor(otherPattern.X), Math.floor(otherPattern.Y));
  var moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(otherPattern.X), Math.floor(otherPattern.Y), Math.floor(pattern.X), Math.floor(pattern.Y));
  if (isNaN(moduleSizeEst1)) {
    return moduleSizeEst2 / 7.0;
  }
  if (isNaN(moduleSizeEst2)) {
    return moduleSizeEst1 / 7.0;
  }
  // Average them, and divide by 7 since we've counted the width of 3 black modules,
  // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
  return (moduleSizeEst1 + moduleSizeEst2) / 14.0;
};

Detector.prototype.calculateModuleSize = function(topLeft,  topRight,  bottomLeft) {
  // Take the average
  return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
};

Detector.prototype.distance = function(pattern1,  pattern2) {
  var xDiff = pattern1.X - pattern2.X;
  var yDiff = pattern1.Y - pattern2.Y;
  return  Math.sqrt((xDiff * xDiff + yDiff * yDiff));
};

Detector.prototype.computeDimension = function(topLeft,  topRight,  bottomLeft,  moduleSize) {
  var tltrCentersDimension = Math.round(this.distance(topLeft, topRight) / moduleSize);
  var tlblCentersDimension = Math.round(this.distance(topLeft, bottomLeft) / moduleSize);
  var dimension = ((tltrCentersDimension + tlblCentersDimension) >> 1) + 7;
  switch (dimension & 0x03) {
  // mod 4
  case 0:
    dimension++;
    break;
  // 1? do nothing

  case 2:
    dimension--;
    break;

  case 3:
    throw "Error";
  }
  return dimension;
};

Detector.prototype.findAlignmentInRegion = function(overallEstModuleSize,  estAlignmentX,  estAlignmentY,  allowanceFactor) {
  // Look for an alignment pattern (3 modules in size) around where it
  // should be
  var allowance = Math.floor(allowanceFactor * overallEstModuleSize);
  var alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
  var alignmentAreaRightX = Math.min(this.image.width - 1, estAlignmentX + allowance);
  if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
    throw "Error";
  }

  var alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
  var alignmentAreaBottomY = Math.min(this.image.height - 1, estAlignmentY + allowance);

  var alignmentFinder = new AlignmentPatternFinder(this.image, alignmentAreaLeftX, alignmentAreaTopY, alignmentAreaRightX - alignmentAreaLeftX, alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize, this.resultPointCallback);
  return alignmentFinder.find();
};

Detector.prototype.createTransform = function(topLeft,  topRight,  bottomLeft, alignmentPattern, dimension) {
  var dimMinusThree =  dimension - 3.5;
  var bottomRightX;
  var bottomRightY;
  var sourceBottomRightX;
  var sourceBottomRightY;
  if (alignmentPattern != null) {
    bottomRightX = alignmentPattern.X;
    bottomRightY = alignmentPattern.Y;
    sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3.0;
  } else {
    // Don't have an alignment pattern, just make up the bottom-right point
    bottomRightX = (topRight.X - topLeft.X) + bottomLeft.X;
    bottomRightY = (topRight.Y - topLeft.Y) + bottomLeft.Y;
    sourceBottomRightX = sourceBottomRightY = dimMinusThree;
  }

  var transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5, dimMinusThree, topLeft.X, topLeft.Y, topRight.X, topRight.Y, bottomRightX, bottomRightY, bottomLeft.X, bottomLeft.Y);

  return transform;
};

Detector.prototype.sampleGrid = function(image,  transform,  dimension) {

  var sampler = GridSampler;
  return sampler.sampleGrid3(image, dimension, transform);
};

Detector.prototype.processFinderPatternInfo = function(info) {

  var topLeft = info.topLeft;
  var topRight = info.topRight;
  var bottomLeft = info.bottomLeft;

  var moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
  if (moduleSize < 1.0) {
    throw "Error";
  }
  var dimension = this.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
  var provisionalVersion = Version.getProvisionalVersionForDimension(dimension);
  var modulesBetweenFPCenters = provisionalVersion.DimensionForVersion - 7;

  var alignmentPattern = null;
  // Anything above version 1 has an alignment pattern
  if (provisionalVersion.alignmentPatternCenters.length > 0) {

    // Guess where a "bottom right" finder pattern would have been
    var bottomRightX = topRight.X - topLeft.X + bottomLeft.X;
    var bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y;

    // Estimate that alignment pattern is closer by 3 modules
    // from "bottom right" to known top left location
    var correctionToTopLeft = 1.0 - 3.0 /  modulesBetweenFPCenters;
    var estAlignmentX = Math.floor(topLeft.X + correctionToTopLeft * (bottomRightX - topLeft.X));
    var estAlignmentY = Math.floor(topLeft.Y + correctionToTopLeft * (bottomRightY - topLeft.Y));

    // Kind of arbitrary -- expand search radius before giving up
    for (var i = 4; i <= 16; i <<= 1) {
      //try
      //{
      alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY,  i);
      break;
      //}
      //catch (re)
      //{
      // try next round
      //}
    }
    // If we didn't find alignment pattern... well try anyway without it
  }

  var transform = this.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);

  var bits = this.sampleGrid(this.image, transform, dimension);

  var points;
  if (alignmentPattern == null) {
    points = [bottomLeft, topLeft, topRight];
  } else {
    points = [bottomLeft, topLeft, topRight, alignmentPattern];
  }
  return new DetectorResult(bits, points);
};

Detector.prototype.detect = function() {
  var info =  new FinderPatternFinder().findFinderPattern(this.image);

  return this.processFinderPatternInfo(info);
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function GF256Poly(field,  coefficients) {
  if (coefficients == null || coefficients.length == 0) {
    throw "System.ArgumentException";
  }
  this.field = field;
  var coefficientsLength = coefficients.length;
  if (coefficientsLength > 1 && coefficients[0] == 0) {
    // Leading term must be non-zero for anything except the constant polynomial "0"
    var firstNonZero = 1;
    while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0) {
      firstNonZero++;
    }
    if (firstNonZero == coefficientsLength) {
      this.coefficients = field.Zero.coefficients;
    } else {
      this.coefficients = new Array(coefficientsLength - firstNonZero);
      for (var i = 0; i < this.coefficients.length; i++) this.coefficients[i] = 0;
      for (var ci = 0; ci < this.coefficients.length; ci++) this.coefficients[ci] = coefficients[firstNonZero + ci];
    }
  } else {
    this.coefficients = coefficients;
  }
}

Object.defineProperty(GF256Poly.prototype, "Zero", {
  get: function() {
    return this.coefficients[0] == 0;
  }
});

Object.defineProperty(GF256Poly.prototype, "Degree", {
  get: function() {
    return this.coefficients.length - 1;
  }
});

GF256Poly.prototype.getCoefficient = function(degree) {
  return this.coefficients[this.coefficients.length - 1 - degree];
};

GF256Poly.prototype.evaluateAt = function(a) {
  if (a == 0) {
    // Just return the x^0 coefficient
    return this.getCoefficient(0);
  }
  var size = this.coefficients.length;
  if (a == 1) {
    // Just the sum of the coefficients
    var result = 0;
    for (var i = 0; i < size; i++) {
      result = GF256.addOrSubtract(result, this.coefficients[i]);
    }
    return result;
  }
  var result2 = this.coefficients[0];
  for (var i = 1; i < size; i++) {
    result2 = GF256.addOrSubtract(this.field.multiply(a, result2), this.coefficients[i]);
  }
  return result2;
};

GF256Poly.prototype.addOrSubtract = function(other) {
  if (this.field != other.field) {
    throw "GF256Polys do not have same GF256 field";
  }
  if (this.Zero) {
    return other;
  }
  if (other.Zero) {
    return this;
  }

  var smallerCoefficients = this.coefficients;
  var largerCoefficients = other.coefficients;
  if (smallerCoefficients.length > largerCoefficients.length) {
    var temp = smallerCoefficients;
    smallerCoefficients = largerCoefficients;
    largerCoefficients = temp;
  }
  var sumDiff = new Array(largerCoefficients.length);
  var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
  // Copy high-order terms only found in higher-degree polynomial's coefficients
  for (var ci = 0; ci < lengthDiff; ci++)sumDiff[ci] = largerCoefficients[ci];

  for (var i = lengthDiff; i < largerCoefficients.length; i++) {
    sumDiff[i] = GF256.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
  }

  return new GF256Poly(this.field, sumDiff);
};

GF256Poly.prototype.multiply1 = function(other) {
  if (this.field != other.field) {
    throw "GF256Polys do not have same GF256 field";
  }
  if (this.Zero || other.Zero) {
    return this.field.Zero;
  }
  var aCoefficients = this.coefficients;
  var aLength = aCoefficients.length;
  var bCoefficients = other.coefficients;
  var bLength = bCoefficients.length;
  var product = new Array(aLength + bLength - 1);
  for (var i = 0; i < aLength; i++) {
    var aCoeff = aCoefficients[i];
    for (var j = 0; j < bLength; j++) {
      product[i + j] = GF256.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
    }
  }
  return new GF256Poly(this.field, product);
};

GF256Poly.prototype.multiply2 = function(scalar) {
  if (scalar == 0) {
    return this.field.Zero;
  }
  if (scalar == 1) {
    return this;
  }
  var size = this.coefficients.length;
  var product = new Array(size);
  for (var i = 0; i < size; i++) {
    product[i] = this.field.multiply(this.coefficients[i], scalar);
  }
  return new GF256Poly(this.field, product);
};

GF256Poly.prototype.multiplyByMonomial = function(degree,  coefficient) {
  if (degree < 0) {
    throw "System.ArgumentException";
  }
  if (coefficient == 0) {
    return this.field.Zero;
  }
  var size = this.coefficients.length;
  var product = new Array(size + degree);
  for (var i = 0; i < product.length; i++)product[i] = 0;
  for (var i = 0; i < size; i++) {
    product[i] = this.field.multiply(this.coefficients[i], coefficient);
  }
  return new GF256Poly(this.field, product);
};

GF256Poly.prototype.divide = function(other) {
  if (this.field != other.field) {
    throw "GF256Polys do not have same GF256 field";
  }
  if (other.Zero) {
    throw "Divide by 0";
  }

  var quotient = this.field.Zero;
  var remainder = this;

  var denominatorLeadingTerm = other.getCoefficient(other.Degree);
  var inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);

  while (remainder.Degree >= other.Degree && !remainder.Zero) {
    var degreeDifference = remainder.Degree - other.Degree;
    var scale = this.field.multiply(remainder.getCoefficient(remainder.Degree), inverseDenominatorLeadingTerm);
    var term = other.multiplyByMonomial(degreeDifference, scale);
    var iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
    quotient = quotient.addOrSubtract(iterationQuotient);
    remainder = remainder.addOrSubtract(term);
  }

  return [quotient, remainder];
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function GF256(primitive) {
  this.expTable = new Array(256);
  this.logTable = new Array(256);
  var x = 1;
  for (var i = 0; i < 256; i++) {
    this.expTable[i] = x;
    x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
    if (x >= 0x100) {
      x ^= primitive;
    }
  }
  for (var i = 0; i < 255; i++) {
    this.logTable[this.expTable[i]] = i;
  }
  // logTable[0] == 0 but this should never be used
  var at0 = new Array(1); at0[0] = 0;
  this.zero = new GF256Poly(this, new Array(at0));
  var at1 = new Array(1); at1[0] = 1;
  this.one = new GF256Poly(this, new Array(at1));
}

Object.defineProperty(GF256.prototype, "Zero", {
  get: function() {
    return this.zero;
  }
});

Object.defineProperty(GF256.prototype, "One", {
  get: function() {
    return this.one;
  }
});

GF256.prototype.buildMonomial = function(degree,  coefficient) {
  if (degree < 0) {
    throw "System.ArgumentException";
  }
  if (coefficient == 0) {
    return this.zero;
  }
  var coefficients = new Array(degree + 1);
  for (var i = 0; i < coefficients.length; i++)coefficients[i] = 0;
  coefficients[0] = coefficient;
  return new GF256Poly(this, coefficients);
};

GF256.prototype.exp = function(a) {
  return this.expTable[a];
};

GF256.prototype.log = function(a) {
  if (a == 0) {
    throw "System.ArgumentException";
  }
  return this.logTable[a];
};

GF256.prototype.inverse = function(a) {
  if (a == 0) {
    throw "System.ArithmeticException";
  }
  return this.expTable[255 - this.logTable[a]];
};

GF256.prototype.multiply = function(a,  b) {
  if (a == 0 || b == 0) {
    return 0;
  }
  if (a == 1) {
    return b;
  }
  if (b == 1) {
    return a;
  }
  return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
};

GF256.QR_CODE_FIELD = new GF256(0x011D);
GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

GF256.addOrSubtract = function(a,  b) {
  return a ^ b;
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function ReedSolomonDecoder(field) {
  this.field = field;
}

ReedSolomonDecoder.prototype.decode = function(received, twoS) {
  var poly = new GF256Poly(this.field, received);
  var syndromeCoefficients = new Array(twoS);
  for (var i = 0; i < syndromeCoefficients.length; i++)syndromeCoefficients[i] = 0;
  var dataMatrix = false;//this.field.Equals(GF256.DATA_MATRIX_FIELD);
  var noError = true;
  for (var i = 0; i < twoS; i++) {
    // Thanks to sanfordsquires for this fix:
    var _eval = poly.evaluateAt(this.field.exp(dataMatrix ? i + 1 : i));
    syndromeCoefficients[syndromeCoefficients.length - 1 - i] = _eval;
    if (_eval != 0) {
      noError = false;
    }
  }
  if (noError) {
    return;
  }
  var syndrome = new GF256Poly(this.field, syndromeCoefficients);
  var sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS);
  var sigma = sigmaOmega[0];
  var omega = sigmaOmega[1];
  var errorLocations = this.findErrorLocations(sigma);
  var errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations, dataMatrix);
  for (var i = 0; i < errorLocations.length; i++) {
    var position = received.length - 1 - this.field.log(errorLocations[i]);
    if (position < 0) {
      throw "ReedSolomonException Bad error location";
    }
    received[position] = GF256.addOrSubtract(received[position], errorMagnitudes[i]);
  }
};

ReedSolomonDecoder.prototype.runEuclideanAlgorithm = function(a,  b,  R) {
  // Assume a's degree is >= b's
  if (a.Degree < b.Degree) {
    var temp = a;
    a = b;
    b = temp;
  }

  var rLast = a;
  var r = b;
  var sLast = this.field.One;
  var s = this.field.Zero;
  var tLast = this.field.Zero;
  var t = this.field.One;

  // Run Euclidean algorithm until r's degree is less than R/2
  while (r.Degree >= Math.floor(R / 2)) {
    var rLastLast = rLast;
    var sLastLast = sLast;
    var tLastLast = tLast;
    rLast = r;
    sLast = s;
    tLast = t;

    // Divide rLastLast by rLast, with quotient in q and remainder in r
    if (rLast.Zero) {
      // Oops, Euclidean algorithm already terminated?
      throw "r_{i-1} was zero";
    }
    r = rLastLast;
    var q = this.field.Zero;
    var denominatorLeadingTerm = rLast.getCoefficient(rLast.Degree);
    var dltInverse = this.field.inverse(denominatorLeadingTerm);
    while (r.Degree >= rLast.Degree && !r.Zero) {
      var degreeDiff = r.Degree - rLast.Degree;
      var scale = this.field.multiply(r.getCoefficient(r.Degree), dltInverse);
      q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
      r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
    }

    s = q.multiply1(sLast).addOrSubtract(sLastLast);
    t = q.multiply1(tLast).addOrSubtract(tLastLast);
  }

  var sigmaTildeAtZero = t.getCoefficient(0);
  if (sigmaTildeAtZero == 0) {
    throw "ReedSolomonException sigmaTilde(0) was zero";
  }

  var inverse = this.field.inverse(sigmaTildeAtZero);
  var sigma = t.multiply2(inverse);
  var omega = r.multiply2(inverse);
  return [sigma, omega];
};

ReedSolomonDecoder.prototype.findErrorLocations = function(errorLocator) {
  // This is a direct application of Chien's search
  var numErrors = errorLocator.Degree;
  if (numErrors == 1) {
    // shortcut
    return new Array(errorLocator.getCoefficient(1));
  }
  var result = new Array(numErrors);
  var e = 0;
  for (var i = 1; i < 256 && e < numErrors; i++) {
    if (errorLocator.evaluateAt(i) == 0) {
      result[e] = this.field.inverse(i);
      e++;
    }
  }
  if (e != numErrors) {
    throw "Error locator degree does not match number of roots";
  }
  return result;
};

ReedSolomonDecoder.prototype.findErrorMagnitudes = function(errorEvaluator, errorLocations, dataMatrix) {
  // This is directly applying Forney's Formula
  var s = errorLocations.length;
  var result = new Array(s);
  for (var i = 0; i < s; i++) {
    var xiInverse = this.field.inverse(errorLocations[i]);
    var denominator = 1;
    for (var j = 0; j < s; j++) {
      if (i != j) {
        denominator = this.field.multiply(denominator, GF256.addOrSubtract(1, this.field.multiply(errorLocations[j], xiInverse)));
      }
    }
    result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator));
    // Thanks to sanfordsquires for this fix:
    if (dataMatrix) {
      result[i] = this.field.multiply(result[i], xiInverse);
    }
  }
  return result;
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var DataMask = {};

DataMask.forReference = function(reference) {
  if (reference < 0 || reference > 7) {
    throw "System.ArgumentException";
  }
  return DataMask.DATA_MASKS[reference];
};

function DataMask000() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    return ((i + j) & 0x01) == 0;
  };
}

function DataMask001() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    return (i & 0x01) == 0;
  };
}

function DataMask010() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    return j % 3 == 0;
  };
}

function DataMask011() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    return (i + j) % 3 == 0;
  };
}

function DataMask100() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    return (((URShift(i, 1)) + (j / 3)) & 0x01) == 0;
  };
}

function DataMask101() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    var temp = i * j;
    return (temp & 0x01) + (temp % 3) == 0;
  };
}

function DataMask110() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    var temp = i * j;
    return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
  };
}
function DataMask111() {
  this.unmaskBitMatrix = function(bits,  dimension) {
    for (var i = 0; i < dimension; i++) {
      for (var j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  };
  this.isMasked = function(i,  j) {
    return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
  };
}

DataMask.DATA_MASKS = [new DataMask000(), new DataMask001(), new DataMask010(), new DataMask011(), new DataMask100(), new DataMask101(), new DataMask110(), new DataMask111()];

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function BitMatrixParser(bitMatrix) {
  var dimension = bitMatrix.Dimension;
  if (dimension < 21 || (dimension & 0x03) != 1) {
    throw "Error BitMatrixParser";
  }
  this.bitMatrix = bitMatrix;
  this.parsedVersion = null;
  this.parsedFormatInfo = null;
}

BitMatrixParser.prototype.copyBit = function(i,  j,  versionBits) {
  return this.bitMatrix.get_Renamed(i, j) ? (versionBits << 1) | 0x1 : versionBits << 1;
};

BitMatrixParser.prototype.readFormatInformation = function() {
  if (this.parsedFormatInfo != null) {
    return this.parsedFormatInfo;
  }

  // Read top-left format info bits
  var formatInfoBits = 0;
  for (var i = 0; i < 6; i++) {
    formatInfoBits = this.copyBit(i, 8, formatInfoBits);
  }
  // .. and skip a bit in the timing pattern ...
  formatInfoBits = this.copyBit(7, 8, formatInfoBits);
  formatInfoBits = this.copyBit(8, 8, formatInfoBits);
  formatInfoBits = this.copyBit(8, 7, formatInfoBits);
  // .. and skip a bit in the timing pattern ...
  for (var j = 5; j >= 0; j--) {
    formatInfoBits = this.copyBit(8, j, formatInfoBits);
  }

  this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
  if (this.parsedFormatInfo != null) {
    return this.parsedFormatInfo;
  }

  // Hmm, failed. Try the top-right/bottom-left pattern
  var dimension = this.bitMatrix.Dimension;
  formatInfoBits = 0;
  var iMin = dimension - 8;
  for (var i = dimension - 1; i >= iMin; i--) {
    formatInfoBits = this.copyBit(i, 8, formatInfoBits);
  }
  for (var j = dimension - 7; j < dimension; j++) {
    formatInfoBits = this.copyBit(8, j, formatInfoBits);
  }

  this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
  if (this.parsedFormatInfo != null) {
    return this.parsedFormatInfo;
  }
  throw "Error readFormatInformation";
};

BitMatrixParser.prototype.readVersion = function() {
  if (this.parsedVersion != null) {
    return this.parsedVersion;
  }

  var dimension = this.bitMatrix.Dimension;

  var provisionalVersion = (dimension - 17) >> 2;
  if (provisionalVersion <= 6) {
    return Version.getVersionForNumber(provisionalVersion);
  }

  // Read top-right version info: 3 wide by 6 tall
  var versionBits = 0;
  var ijMin = dimension - 11;
  for (var j = 5; j >= 0; j--) {
    for (var i = dimension - 9; i >= ijMin; i--) {
      versionBits = this.copyBit(i, j, versionBits);
    }
  }

  this.parsedVersion = Version.decodeVersionInformation(versionBits);
  if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
    return this.parsedVersion;
  }

  // Hmm, failed. Try bottom left: 6 wide by 3 tall
  versionBits = 0;
  for (var i = 5; i >= 0; i--) {
    for (var j = dimension - 9; j >= ijMin; j--) {
      versionBits = this.copyBit(i, j, versionBits);
    }
  }

  this.parsedVersion = Version.decodeVersionInformation(versionBits);
  if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
    return this.parsedVersion;
  }
  throw "Error readVersion";
};

BitMatrixParser.prototype.readCodewords = function() {
  var formatInfo = this.readFormatInformation();
  var version = this.readVersion();

  // Get the data mask for the format used in this QR Code. This will exclude
  // some bits from reading as we wind through the bit matrix.
  var dataMask = DataMask.forReference(formatInfo.dataMask);
  var dimension = this.bitMatrix.Dimension;
  dataMask.unmaskBitMatrix(this.bitMatrix, dimension);

  var functionPattern = version.buildFunctionPattern();

  var readingUp = true;
  var result = new Array(version.totalCodewords);
  var resultOffset = 0;
  var currentByte = 0;
  var bitsRead = 0;
  // Read columns in pairs, from right to left
  for (var j = dimension - 1; j > 0; j -= 2) {
    if (j == 6) {
      // Skip whole column with vertical alignment pattern;
      // saves time and makes the other code proceed more cleanly
      j--;
    }
    // Read alternatingly from bottom to top then top to bottom
    for (var count = 0; count < dimension; count++) {
      var i = readingUp ? dimension - 1 - count : count;
      for (var col = 0; col < 2; col++) {
        // Ignore bits covered by the function pattern
        if (!functionPattern.get_Renamed(j - col, i)) {
          // Read a bit
          bitsRead++;
          currentByte <<= 1;
          if (this.bitMatrix.get_Renamed(j - col, i)) {
            currentByte |= 1;
          }
          // If we've made a whole byte, save it off
          if (bitsRead == 8) {
            result[resultOffset++] =  currentByte;
            bitsRead = 0;
            currentByte = 0;
          }
        }
      }
    }
    readingUp ^= true; // readingUp = !readingUp; // switch directions
  }
  if (resultOffset != version.totalCodewords) {
    throw "Error readCodewords";
  }
  return result;
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


function DataBlock(numDataCodewords,  codewords) {
  this.numDataCodewords = numDataCodewords;
  this.codewords = codewords;
}

DataBlock.getDataBlocks = function(rawCodewords,  version,  ecLevel) {

  if (rawCodewords.length != version.totalCodewords) {
    throw "ArgumentException";
  }

  // Figure out the number and size of data blocks used by this version and
  // error correction level
  var ecBlocks = version.getECBlocksForLevel(ecLevel);

  // First count the total number of data blocks
  var totalBlocks = 0;
  var ecBlockArray = ecBlocks.getECBlocks();
  for (var i = 0; i < ecBlockArray.length; i++) {
    totalBlocks += ecBlockArray[i].count;
  }

  // Now establish DataBlocks of the appropriate size and number of data codewords
  var result = new Array(totalBlocks);
  var numResultBlocks = 0;
  for (var j = 0; j < ecBlockArray.length; j++) {
    var ecBlock = ecBlockArray[j];
    for (var i = 0; i < ecBlock.count; i++) {
      var numDataCodewords = ecBlock.dataCodewords;
      var numBlockCodewords = ecBlocks.ecCodewordsPerBlock + numDataCodewords;
      result[numResultBlocks++] = new DataBlock(numDataCodewords, new Array(numBlockCodewords));
    }
  }

  // All blocks have the same amount of data, except that the last n
  // (where n may be 0) have 1 more byte. Figure out where these start.
  var shorterBlocksTotalCodewords = result[0].codewords.length;
  var longerBlocksStartAt = result.length - 1;
  while (longerBlocksStartAt >= 0) {
    var numCodewords = result[longerBlocksStartAt].codewords.length;
    if (numCodewords == shorterBlocksTotalCodewords) {
      break;
    }
    longerBlocksStartAt--;
  }
  longerBlocksStartAt++;

  var shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.ecCodewordsPerBlock;
  // The last elements of result may be 1 element longer;
  // first fill out as many elements as all of them have
  var rawCodewordsOffset = 0;
  for (var i = 0; i < shorterBlocksNumDataCodewords; i++) {
    for (var j = 0; j < numResultBlocks; j++) {
      result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
    }
  }
  // Fill out the last data block in the longer ones
  for (var j = longerBlocksStartAt; j < numResultBlocks; j++) {
    result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
  }
  // Now add in error correction blocks
  var max = result[0].codewords.length;
  for (var i = shorterBlocksNumDataCodewords; i < max; i++) {
    for (var j = 0; j < numResultBlocks; j++) {
      var iOffset = j < longerBlocksStartAt ? i : i + 1;
      result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
    }
  }
  return result;
};

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

function QRCodeDataBlockReader(blocks,  version,  numErrorCorrectionCode) {
  this.blockPointer = 0;
  this.bitPointer = 7;
  this.dataLength = 0;
  this.blocks = blocks;
  this.numErrorCorrectionCode = numErrorCorrectionCode;
  if (version <= 9)
    this.dataLengthMode = 0;
  else if (version >= 10 && version <= 26)
    this.dataLengthMode = 1;
  else if (version >= 27 && version <= 40)
    this.dataLengthMode = 2;
}

QRCodeDataBlockReader.prototype.getNextBits = function(numBits) {
  var bits = 0;
  if (numBits < this.bitPointer + 1) {
    // next word fits into current data block
    var mask = 0;
    for (var i = 0; i < numBits; i++) {
      mask += (1 << i);
    }
    mask <<= (this.bitPointer - numBits + 1);

    bits = (this.blocks[this.blockPointer] & mask) >> (this.bitPointer - numBits + 1);
    this.bitPointer -= numBits;
    return bits;
  } else if (numBits < this.bitPointer + 1 + 8) {
    // next word crosses 2 data blocks
    var mask1 = 0;
    for (var i = 0; i < this.bitPointer + 1; i++) {
      mask1 += (1 << i);
    }
    bits = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
    this.blockPointer++;
    bits += ((this.blocks[this.blockPointer]) >> (8 - (numBits - (this.bitPointer + 1))));

    this.bitPointer = this.bitPointer - numBits % 8;
    if (this.bitPointer < 0) {
      this.bitPointer = 8 + this.bitPointer;
    }
    return bits;
  } else if (numBits < this.bitPointer + 1 + 16) {
    // next word crosses 3 data blocks
    var mask1 = 0; // mask of first block
    var mask3 = 0; // mask of 3rd block
    //bitPointer + 1 : number of bits of the 1st block
    //8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
    //numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block
    for (var i = 0; i < this.bitPointer + 1; i++) {
      mask1 += (1 << i);
    }
    var bitsFirstBlock = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
    this.blockPointer++;

    var bitsSecondBlock = this.blocks[this.blockPointer] << (numBits - (this.bitPointer + 1 + 8));
    this.blockPointer++;

    for (var i = 0; i < numBits - (this.bitPointer + 1 + 8); i++) {
      mask3 += (1 << i);
    }
    mask3 <<= 8 - (numBits - (this.bitPointer + 1 + 8));
    var bitsThirdBlock = (this.blocks[this.blockPointer] & mask3) >> (8 - (numBits - (this.bitPointer + 1 + 8)));

    bits = bitsFirstBlock + bitsSecondBlock + bitsThirdBlock;
    this.bitPointer = this.bitPointer - (numBits - 8) % 8;
    if (this.bitPointer < 0) {
      this.bitPointer = 8 + this.bitPointer;
    }
    return bits;
  } else {
    return 0;
  }
};

QRCodeDataBlockReader.prototype.NextMode = function() {
  if ((this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2))
    return 0;
  else
    return this.getNextBits(4);
};

QRCodeDataBlockReader.prototype.getDataLength = function(modeIndicator) {
  var index = 0;
  while (true) {
    if ((modeIndicator >> index) == 1)
      break;
    index++;
  }

  return this.getNextBits(qrcode.sizeOfDataLengthInfo[this.dataLengthMode][index]);
};

QRCodeDataBlockReader.prototype.getRomanAndFigureString = function(dataLength) {
  var length = dataLength;
  var intData = 0;
  var strData = "";
  var tableRomanAndFigure = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '$', '%', '*', '+', '-', '.', '/', ':'];
  do {
    if (length > 1) {
      intData = this.getNextBits(11);
      var firstLetter = Math.floor(intData / 45);
      var secondLetter = intData % 45;
      strData += tableRomanAndFigure[firstLetter];
      strData += tableRomanAndFigure[secondLetter];
      length -= 2;
    } else if (length == 1) {
      intData = this.getNextBits(6);
      strData += tableRomanAndFigure[intData];
      length -= 1;
    }
  }
  while (length > 0);

  return strData;
};

QRCodeDataBlockReader.prototype.getFigureString = function(dataLength) {
  var length = dataLength;
  var intData = 0;
  var strData = "";
  do {
    if (length >= 3) {
      intData = this.getNextBits(10);
      if (intData < 100)
        strData += "0";
      if (intData < 10)
        strData += "0";
      length -= 3;
    } else if (length == 2) {
      intData = this.getNextBits(7);
      if (intData < 10)
        strData += "0";
      length -= 2;
    } else if (length == 1) {
      intData = this.getNextBits(4);
      length -= 1;
    }
    strData += intData;
  }
  while (length > 0);

  return strData;
};

QRCodeDataBlockReader.prototype.get8bitByteArray = function(dataLength) {
  var length = dataLength;
  var intData = 0;
  var output = [];

  do {
    intData = this.getNextBits(8);
    output.push(intData);
    length--;
  }
  while (length > 0);
  return output;
};

QRCodeDataBlockReader.prototype.getKanjiString = function(dataLength) {
  var length = dataLength;
  var intData = 0;
  var unicodeString = "";
  do {
    intData = this.getNextBits(13);
    var lowerByte = intData % 0xC0;
    var higherByte = intData / 0xC0;

    var tempWord = (higherByte << 8) + lowerByte;
    var shiftjisWord = 0;
    if (tempWord + 0x8140 <= 0x9FFC) {
      // between 8140 - 9FFC on Shift_JIS character set
      shiftjisWord = tempWord + 0x8140;
    } else {
      // between E040 - EBBF on Shift_JIS character set
      shiftjisWord = tempWord + 0xC140;
    }

    unicodeString += String.fromCharCode(shiftjisWord);
    length--;
  }
  while (length > 0);


  return unicodeString;
};

Object.defineProperty(QRCodeDataBlockReader.prototype, "DataByte", {
  get: function() {
    var output = [];
    var MODE_NUMBER = 1;
    var MODE_ROMAN_AND_NUMBER = 2;
    var MODE_8BIT_BYTE = 4;
    var MODE_KANJI = 8;
    do {
      var mode = this.NextMode();
      if (mode == 0) {
        if (output.length > 0)
          break;
        else
          throw "Empty data block";
      }
      //if (mode != 1 && mode != 2 && mode != 4 && mode != 8)
      //}
      if (mode != MODE_NUMBER && mode != MODE_ROMAN_AND_NUMBER && mode != MODE_8BIT_BYTE && mode != MODE_KANJI) {
        /*          canvas.println("Invalid mode: " + mode);
         mode = guessMode(mode);
         canvas.println("Guessed mode: " + mode); */
        throw "Invalid mode: " + mode + " in (block:" + this.blockPointer + " bit:" + this.bitPointer + ")";
      }
      var dataLength = this.getDataLength(mode);
      if (dataLength < 1)
        throw "Invalid data length: " + dataLength;
      switch (mode) {

      case MODE_NUMBER:
        var temp_str = this.getFigureString(dataLength);
        var ta = new Array(temp_str.length);
        for (var j = 0; j < temp_str.length; j++)
          ta[j] = temp_str.charCodeAt(j);
        output.push(ta);
        break;

      case MODE_ROMAN_AND_NUMBER:
        var temp_str = this.getRomanAndFigureString(dataLength);
        var ta = new Array(temp_str.length);
        for (var j = 0; j < temp_str.length; j++)
          ta[j] = temp_str.charCodeAt(j);
        output.push(ta);
        break;

      case MODE_8BIT_BYTE:
        var temp_sbyteArray3 = this.get8bitByteArray(dataLength);
        output.push(temp_sbyteArray3);
        break;

      case MODE_KANJI:
        var temp_str = this.getKanjiString(dataLength);
        output.push(temp_str);
        break;
      }
      //
    }
    while (true);
    return output;
  }
});

/*
  Ported to JavaScript by Lazar Laszlo 2011

  lazarsoft@gmail.com, www.lazarsoft.info

*/

/*
*
* Copyright 2007 ZXing authors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var Decoder = {};
Decoder.rsDecoder = new ReedSolomonDecoder(GF256.QR_CODE_FIELD);

Decoder.correctErrors = function(codewordBytes,  numDataCodewords) {
  var numCodewords = codewordBytes.length;
  // First read into an array of ints
  var codewordsInts = new Array(numCodewords);
  for (var i = 0; i < numCodewords; i++) {
    codewordsInts[i] = codewordBytes[i] & 0xFF;
  }
  var numECCodewords = codewordBytes.length - numDataCodewords;
  try {
    Decoder.rsDecoder.decode(codewordsInts, numECCodewords);
  } catch (rse) {
    throw rse;
  }
  // Copy back into array of bytes -- only need to worry about the bytes that were data
  // We don't care about errors in the error-correction codewords
  for (var i = 0; i < numDataCodewords; i++) {
    codewordBytes[i] =  codewordsInts[i];
  }
};

Decoder.decode = function(bits) {
  var parser = new BitMatrixParser(bits);
  var version = parser.readVersion();
  var ecLevel = parser.readFormatInformation().errorCorrectionLevel;

  // Read codewords
  var codewords = parser.readCodewords();

  // Separate into data blocks
  var dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel);

  // Count total number of data bytes
  var totalBytes = 0;
  for (var i = 0; i < dataBlocks.length; i++) {
    totalBytes += dataBlocks[i].numDataCodewords;
  }
  var resultBytes = new Array(totalBytes);
  var resultOffset = 0;

  // Error-correct and copy data blocks together into a stream of bytes
  for (var j = 0; j < dataBlocks.length; j++) {
    var dataBlock = dataBlocks[j];
    var codewordBytes = dataBlock.codewords;
    var numDataCodewords = dataBlock.numDataCodewords;
    Decoder.correctErrors(codewordBytes, numDataCodewords);
    for (var i = 0; i < numDataCodewords; i++) {
      resultBytes[resultOffset++] = codewordBytes[i];
    }
  }

  // Decode the contents of that stream of bytes
  var reader = new QRCodeDataBlockReader(resultBytes, version.versionNumber, ecLevel.bits);
  return reader;
};

/*
   Copyright 2011 Lazar Laszlo (lazarsoft@gmail.com, www.lazarsoft.info)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var qrcode = {};
qrcode.sizeOfDataLengthInfo =  [[10, 9, 8, 8], [12, 11, 16, 10], [14, 13, 16, 12]];

function QrCode() {

  this.imagedata = null;
  this.width = 0;
  this.height = 0;
  this.qrCodeSymbol = null;
  this.debug = false;

  this.callback = null;
}


QrCode.prototype.decode = function(src, data) {

  var decode = (function() {

    try {
      this.error = undefined;
      this.result = this.process(this.imagedata);
    } catch (e) {
      this.error = e;
      this.result = undefined;
    }

    if (this.callback != null) {
      this.callback(this.result, this.error);
    }

    return this.result;

  }).bind(this);

  if (src == undefined) {
    /* decode from canvas #qr-canvas */

    var canvas_qr = document.getElementById("qr-canvas");
    var context = canvas_qr.getContext('2d');

    this.width = canvas_qr.width;
    this.height = canvas_qr.height;
    this.imagedata = context.getImageData(0, 0, this.width, this.height);

    decode();
  } else if (src.width != undefined) {
    /* decode from canvas canvas.context.getImageData */

    this.width = src.width;
    this.height = src.height;
    this.imagedata = {"data": data || src.data};
    this.imagedata.width = src.width;
    this.imagedata.height = src.height;

    decode();
  } else {
    /* decode from URL */

    var image = new Image();
    image.crossOrigin = "Anonymous";

    image.onload = (function() {

      var canvas_qr = document.createElement('canvas');
      var context = canvas_qr.getContext('2d');
      var canvas_out = document.getElementById("out-canvas");

      if (canvas_out != null) {

        var outctx = canvas_out.getContext('2d');
        outctx.clearRect(0, 0, 320, 240);
        outctx.drawImage(image, 0, 0, 320, 240);
      }

      canvas_qr.width = image.width;
      canvas_qr.height = image.height;
      context.drawImage(image, 0, 0);
      this.width = image.width;
      this.height = image.height;

      try {
        this.imagedata = context.getImageData(0, 0, image.width, image.height);
      } catch (e) {
        this.result = "Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!";
        if (this.callback != null) return this.callback(this.result);
      }

      decode();

    }).bind(this);

    image.src = src;
  }
};

QrCode.prototype.decode_utf8 = function(s) {

  return decodeURIComponent(escape(s));
};

QrCode.prototype.process = function(imageData) {

  var start = new Date().getTime();

  var image = this.grayScaleToBitmap(this.grayscale(imageData));

  var detector = new Detector(image);

  var qRCodeMatrix = detector.detect();

  /*for (var y = 0; y < qRCodeMatrix.bits.height; y++)
   {
   for (var x = 0; x < qRCodeMatrix.bits.width; x++)
   {
   var point = (x * 4*2) + (y*2 * imageData.width * 4);
   imageData.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
   imageData.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
   imageData.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
   }
   }*/

  var reader = Decoder.decode(qRCodeMatrix.bits);
  var data = reader.DataByte;
  var str = "";
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++)
      str += String.fromCharCode(data[i][j]);
  }

  var end = new Date().getTime();
  var time = end - start;
  if (this.debug) {
    console.log('QR Code processing time (ms): ' + time);
  }

  return this.decode_utf8(str);
};

QrCode.prototype.getPixel = function(imageData, x, y) {
  if (imageData.width < x) {
    throw "point error";
  }
  if (imageData.height < y) {
    throw "point error";
  }
  var point = (x * 4) + (y * imageData.width * 4);
  return (imageData.data[point] * 33 + imageData.data[point + 1] * 34 + imageData.data[point + 2] * 33) / 100;
};

QrCode.prototype.binarize = function(th) {
  var ret = new Array(this.width * this.height);
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var gray = this.getPixel(x, y);

      ret[x + y * this.width] = gray <= th;
    }
  }
  return ret;
};

QrCode.prototype.getMiddleBrightnessPerArea = function(imageData) {
  var numSqrtArea = 4;
  //obtain middle brightness((min + max) / 2) per area
  var areaWidth = Math.floor(imageData.width / numSqrtArea);
  var areaHeight = Math.floor(imageData.height / numSqrtArea);
  var minmax = new Array(numSqrtArea);
  for (var i = 0; i < numSqrtArea; i++) {
    minmax[i] = new Array(numSqrtArea);
    for (var i2 = 0; i2 < numSqrtArea; i2++) {
      minmax[i][i2] = [0, 0];
    }
  }
  for (var ay = 0; ay < numSqrtArea; ay++) {
    for (var ax = 0; ax < numSqrtArea; ax++) {
      minmax[ax][ay][0] = 0xFF;
      for (var dy = 0; dy < areaHeight; dy++) {
        for (var dx = 0; dx < areaWidth; dx++) {
          var target = imageData.data[areaWidth * ax + dx + (areaHeight * ay + dy) * imageData.width];
          if (target < minmax[ax][ay][0])
            minmax[ax][ay][0] = target;
          if (target > minmax[ax][ay][1])
            minmax[ax][ay][1] = target;
        }
      }
    }
  }
  var middle = new Array(numSqrtArea);
  for (var i3 = 0; i3 < numSqrtArea; i3++) {
    middle[i3] = new Array(numSqrtArea);
  }
  for (var ay = 0; ay < numSqrtArea; ay++) {
    for (var ax = 0; ax < numSqrtArea; ax++) {
      middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
    }
  }

  return middle;
};

QrCode.prototype.grayScaleToBitmap = function(grayScaleImageData) {
  var middle = this.getMiddleBrightnessPerArea(grayScaleImageData);
  var sqrtNumArea = middle.length;
  var areaWidth = Math.floor(grayScaleImageData.width / sqrtNumArea);
  var areaHeight = Math.floor(grayScaleImageData.height / sqrtNumArea);

  for (var ay = 0; ay < sqrtNumArea; ay++) {
    for (var ax = 0; ax < sqrtNumArea; ax++) {
      for (var dy = 0; dy < areaHeight; dy++) {
        for (var dx = 0; dx < areaWidth; dx++) {
          grayScaleImageData.data[areaWidth * ax + dx + (areaHeight * ay + dy) * grayScaleImageData.width] = (grayScaleImageData.data[areaWidth * ax + dx + (areaHeight * ay + dy) * grayScaleImageData.width] < middle[ax][ay]);
        }
      }
    }
  }
  return grayScaleImageData;
};

QrCode.prototype.grayscale = function(imageData) {
  var ret = new Array(imageData.width * imageData.height);

  for (var y = 0; y < imageData.height; y++) {
    for (var x = 0; x < imageData.width; x++) {
      var gray = this.getPixel(imageData, x, y);

      ret[x + y * imageData.width] = gray;
    }
  }

  return {
    height: imageData.height,
    width: imageData.width,
    data: ret
  };
};

function URShift(number,  bits) {
  if (number >= 0)
    return number >> bits;
  else
    return (number >> bits) + (2 << ~bits);
}

return QrCode;

})));
//# sourceMappingURL=index.js.map

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.QrCode=e()}(this,function(){"use strict";function t(t,e,n){this.ordinal_Renamed_Field=t,this.bits=e,this.name=n}function e(e){this.errorCorrectionLevel=t.forBits(e>>3&3),this.dataMask=7&e}function n(t,e){if(e||(e=t),t<1||e<1)throw"Both dimensions must be greater than 0";this.width=t,this.height=e;var n=t>>5;0!=(31&t)&&n++,this.rowSize=n,this.bits=new Array(n*e);for(var i=0;i<this.bits.length;i++)this.bits[i]=0}function i(t,e){this.count=t,this.dataCodewords=e}function r(t,e,n){this.ecCodewordsPerBlock=t,n?this.ecBlocks=[e,n]:this.ecBlocks=[e]}function o(t,e,n,i,r,o){this.versionNumber=t,this.alignmentPatternCenters=e,this.ecBlocks=[n,i,r,o];for(var s=0,a=n.ecCodewordsPerBlock,h=n.getECBlocks(),w=0;w<h.length;w++){var f=h[w];s+=f.count*(f.dataCodewords+a)}this.totalCodewords=s}function s(){return[new o(1,[],new r(7,new i(1,19)),new r(10,new i(1,16)),new r(13,new i(1,13)),new r(17,new i(1,9))),new o(2,[6,18],new r(10,new i(1,34)),new r(16,new i(1,28)),new r(22,new i(1,22)),new r(28,new i(1,16))),new o(3,[6,22],new r(15,new i(1,55)),new r(26,new i(1,44)),new r(18,new i(2,17)),new r(22,new i(2,13))),new o(4,[6,26],new r(20,new i(1,80)),new r(18,new i(2,32)),new r(26,new i(2,24)),new r(16,new i(4,9))),new o(5,[6,30],new r(26,new i(1,108)),new r(24,new i(2,43)),new r(18,new i(2,15),new i(2,16)),new r(22,new i(2,11),new i(2,12))),new o(6,[6,34],new r(18,new i(2,68)),new r(16,new i(4,27)),new r(24,new i(4,19)),new r(28,new i(4,15))),new o(7,[6,22,38],new r(20,new i(2,78)),new r(18,new i(4,31)),new r(18,new i(2,14),new i(4,15)),new r(26,new i(4,13),new i(1,14))),new o(8,[6,24,42],new r(24,new i(2,97)),new r(22,new i(2,38),new i(2,39)),new r(22,new i(4,18),new i(2,19)),new r(26,new i(4,14),new i(2,15))),new o(9,[6,26,46],new r(30,new i(2,116)),new r(22,new i(3,36),new i(2,37)),new r(20,new i(4,16),new i(4,17)),new r(24,new i(4,12),new i(4,13))),new o(10,[6,28,50],new r(18,new i(2,68),new i(2,69)),new r(26,new i(4,43),new i(1,44)),new r(24,new i(6,19),new i(2,20)),new r(28,new i(6,15),new i(2,16))),new o(11,[6,30,54],new r(20,new i(4,81)),new r(30,new i(1,50),new i(4,51)),new r(28,new i(4,22),new i(4,23)),new r(24,new i(3,12),new i(8,13))),new o(12,[6,32,58],new r(24,new i(2,92),new i(2,93)),new r(22,new i(6,36),new i(2,37)),new r(26,new i(4,20),new i(6,21)),new r(28,new i(7,14),new i(4,15))),new o(13,[6,34,62],new r(26,new i(4,107)),new r(22,new i(8,37),new i(1,38)),new r(24,new i(8,20),new i(4,21)),new r(22,new i(12,11),new i(4,12))),new o(14,[6,26,46,66],new r(30,new i(3,115),new i(1,116)),new r(24,new i(4,40),new i(5,41)),new r(20,new i(11,16),new i(5,17)),new r(24,new i(11,12),new i(5,13))),new o(15,[6,26,48,70],new r(22,new i(5,87),new i(1,88)),new r(24,new i(5,41),new i(5,42)),new r(30,new i(5,24),new i(7,25)),new r(24,new i(11,12),new i(7,13))),new o(16,[6,26,50,74],new r(24,new i(5,98),new i(1,99)),new r(28,new i(7,45),new i(3,46)),new r(24,new i(15,19),new i(2,20)),new r(30,new i(3,15),new i(13,16))),new o(17,[6,30,54,78],new r(28,new i(1,107),new i(5,108)),new r(28,new i(10,46),new i(1,47)),new r(28,new i(1,22),new i(15,23)),new r(28,new i(2,14),new i(17,15))),new o(18,[6,30,56,82],new r(30,new i(5,120),new i(1,121)),new r(26,new i(9,43),new i(4,44)),new r(28,new i(17,22),new i(1,23)),new r(28,new i(2,14),new i(19,15))),new o(19,[6,30,58,86],new r(28,new i(3,113),new i(4,114)),new r(26,new i(3,44),new i(11,45)),new r(26,new i(17,21),new i(4,22)),new r(26,new i(9,13),new i(16,14))),new o(20,[6,34,62,90],new r(28,new i(3,107),new i(5,108)),new r(26,new i(3,41),new i(13,42)),new r(30,new i(15,24),new i(5,25)),new r(28,new i(15,15),new i(10,16))),new o(21,[6,28,50,72,94],new r(28,new i(4,116),new i(4,117)),new r(26,new i(17,42)),new r(28,new i(17,22),new i(6,23)),new r(30,new i(19,16),new i(6,17))),new o(22,[6,26,50,74,98],new r(28,new i(2,111),new i(7,112)),new r(28,new i(17,46)),new r(30,new i(7,24),new i(16,25)),new r(24,new i(34,13))),new o(23,[6,30,54,74,102],new r(30,new i(4,121),new i(5,122)),new r(28,new i(4,47),new i(14,48)),new r(30,new i(11,24),new i(14,25)),new r(30,new i(16,15),new i(14,16))),new o(24,[6,28,54,80,106],new r(30,new i(6,117),new i(4,118)),new r(28,new i(6,45),new i(14,46)),new r(30,new i(11,24),new i(16,25)),new r(30,new i(30,16),new i(2,17))),new o(25,[6,32,58,84,110],new r(26,new i(8,106),new i(4,107)),new r(28,new i(8,47),new i(13,48)),new r(30,new i(7,24),new i(22,25)),new r(30,new i(22,15),new i(13,16))),new o(26,[6,30,58,86,114],new r(28,new i(10,114),new i(2,115)),new r(28,new i(19,46),new i(4,47)),new r(28,new i(28,22),new i(6,23)),new r(30,new i(33,16),new i(4,17))),new o(27,[6,34,62,90,118],new r(30,new i(8,122),new i(4,123)),new r(28,new i(22,45),new i(3,46)),new r(30,new i(8,23),new i(26,24)),new r(30,new i(12,15),new i(28,16))),new o(28,[6,26,50,74,98,122],new r(30,new i(3,117),new i(10,118)),new r(28,new i(3,45),new i(23,46)),new r(30,new i(4,24),new i(31,25)),new r(30,new i(11,15),new i(31,16))),new o(29,[6,30,54,78,102,126],new r(30,new i(7,116),new i(7,117)),new r(28,new i(21,45),new i(7,46)),new r(30,new i(1,23),new i(37,24)),new r(30,new i(19,15),new i(26,16))),new o(30,[6,26,52,78,104,130],new r(30,new i(5,115),new i(10,116)),new r(28,new i(19,47),new i(10,48)),new r(30,new i(15,24),new i(25,25)),new r(30,new i(23,15),new i(25,16))),new o(31,[6,30,56,82,108,134],new r(30,new i(13,115),new i(3,116)),new r(28,new i(2,46),new i(29,47)),new r(30,new i(42,24),new i(1,25)),new r(30,new i(23,15),new i(28,16))),new o(32,[6,34,60,86,112,138],new r(30,new i(17,115)),new r(28,new i(10,46),new i(23,47)),new r(30,new i(10,24),new i(35,25)),new r(30,new i(19,15),new i(35,16))),new o(33,[6,30,58,86,114,142],new r(30,new i(17,115),new i(1,116)),new r(28,new i(14,46),new i(21,47)),new r(30,new i(29,24),new i(19,25)),new r(30,new i(11,15),new i(46,16))),new o(34,[6,34,62,90,118,146],new r(30,new i(13,115),new i(6,116)),new r(28,new i(14,46),new i(23,47)),new r(30,new i(44,24),new i(7,25)),new r(30,new i(59,16),new i(1,17))),new o(35,[6,30,54,78,102,126,150],new r(30,new i(12,121),new i(7,122)),new r(28,new i(12,47),new i(26,48)),new r(30,new i(39,24),new i(14,25)),new r(30,new i(22,15),new i(41,16))),new o(36,[6,24,50,76,102,128,154],new r(30,new i(6,121),new i(14,122)),new r(28,new i(6,47),new i(34,48)),new r(30,new i(46,24),new i(10,25)),new r(30,new i(2,15),new i(64,16))),new o(37,[6,28,54,80,106,132,158],new r(30,new i(17,122),new i(4,123)),new r(28,new i(29,46),new i(14,47)),new r(30,new i(49,24),new i(10,25)),new r(30,new i(24,15),new i(46,16))),new o(38,[6,32,58,84,110,136,162],new r(30,new i(4,122),new i(18,123)),new r(28,new i(13,46),new i(32,47)),new r(30,new i(48,24),new i(14,25)),new r(30,new i(42,15),new i(32,16))),new o(39,[6,26,54,82,110,138,166],new r(30,new i(20,117),new i(4,118)),new r(28,new i(40,47),new i(7,48)),new r(30,new i(43,24),new i(22,25)),new r(30,new i(10,15),new i(67,16))),new o(40,[6,30,58,86,114,142,170],new r(30,new i(19,118),new i(6,119)),new r(28,new i(18,47),new i(31,48)),new r(30,new i(34,24),new i(34,25)),new r(30,new i(20,15),new i(61,16)))]}function a(t,e,n){this.x=t,this.y=e,this.count=1,this.estimatedModuleSize=n}function h(t,e,n,i,r,o,s){this.image=t,this.possibleCenters=[],this.startX=e,this.startY=n,this.width=i,this.height=r,this.moduleSize=o,this.crossCheckStateCount=[0,0,0],this.resultPointCallback=s}function w(t){function e(t,e){var n=t.X-e.X,i=t.Y-e.Y;return Math.sqrt(n*n+i*i)}function n(t,e,n){var i=e.x,r=e.y;return(n.x-i)*(t.y-r)-(n.y-r)*(t.x-i)}var i,r,o,s=e(t[0],t[1]),a=e(t[1],t[2]),h=e(t[0],t[2]);if(a>=s&&a>=h?(r=t[0],i=t[1],o=t[2]):h>=a&&h>=s?(r=t[1],i=t[0],o=t[2]):(r=t[2],i=t[0],o=t[1]),n(i,r,o)<0){var w=i;i=o,o=w}t[0]=i,t[1]=r,t[2]=o}function f(t,e,n){this.x=t,this.y=e,this.count=1,this.estimatedModuleSize=n}function u(t){this.bottomLeft=t[0],this.topLeft=t[1],this.topRight=t[2]}function l(){this.image=null,this.possibleCenters=[],this.hasSkipped=!1,this.crossCheckStateCount=[0,0,0,0,0],this.resultPointCallback=null}function d(t,e,n,i,r,o,s,a,h){this.a11=t,this.a12=i,this.a13=s,this.a21=e,this.a22=r,this.a23=a,this.a31=n,this.a32=o,this.a33=h}function c(t,e){this.bits=t,this.points=e}function p(t){this.image=t,this.resultPointCallback=null}function g(t,e){if(null==e||0==e.length)throw"System.ArgumentException";this.field=t;var n=e.length;if(n>1&&0==e[0]){for(var i=1;i<n&&0==e[i];)i++;if(i==n)this.coefficients=t.Zero.coefficients;else{this.coefficients=new Array(n-i);for(var r=0;r<this.coefficients.length;r++)this.coefficients[r]=0;for(var o=0;o<this.coefficients.length;o++)this.coefficients[o]=e[i+o]}}else this.coefficients=e}function v(t){this.expTable=new Array(256),this.logTable=new Array(256);for(var e=1,n=0;n<256;n++)this.expTable[n]=e,e<<=1,e>=256&&(e^=t);for(var n=0;n<255;n++)this.logTable[this.expTable[n]]=n;var i=new Array(1);i[0]=0,this.zero=new g(this,new Array(i));var r=new Array(1);r[0]=1,this.one=new g(this,new Array(r))}function m(t){this.field=t}function b(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){return 0==(t+e&1)}}function y(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){return 0==(1&t)}}function C(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){return e%3==0}}function M(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){return(t+e)%3==0}}function k(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){return 0==(x(t,1)+e/3&1)}}function P(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){var n=t*e;return(1&n)+n%3==0}}function N(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){var n=t*e;return 0==((1&n)+n%3&1)}}function S(){this.unmaskBitMatrix=function(t,e){for(var n=0;n<e;n++)for(var i=0;i<e;i++)this.isMasked(n,i)&&t.flip(i,n)},this.isMasked=function(t,e){return 0==((t+e&1)+t*e%3&1)}}function B(t){var e=t.Dimension;if(e<21||1!=(3&e))throw"Error BitMatrixParser";this.bitMatrix=t,this.parsedVersion=null,this.parsedFormatInfo=null}function A(t,e){this.numDataCodewords=t,this.codewords=e}function E(t,e,n){this.blockPointer=0,this.bitPointer=7,this.dataLength=0,this.blocks=t,this.numErrorCorrectionCode=n,e<=9?this.dataLengthMode=0:e>=10&&e<=26?this.dataLengthMode=1:e>=27&&e<=40&&(this.dataLengthMode=2)}function D(){this.imagedata=null,this.width=0,this.height=0,this.qrCodeSymbol=null,this.debug=!1,this.callback=null}function x(t,e){return t>=0?t>>e:(t>>e)+(2<<~e)}t.prototype.ordinal=function(){return this.ordinal_Renamed_Field},t.forBits=function(t){if(t<0||t>=F.length)throw"ArgumentException";return F[t]};var F=[new t(1,0,"M"),new t(0,1,"L"),new t(3,2,"H"),new t(2,3,"Q")],O=21522,I=[[21522,0],[20773,1],[24188,2],[23371,3],[17913,4],[16590,5],[20375,6],[19104,7],[30660,8],[29427,9],[32170,10],[30877,11],[26159,12],[25368,13],[27713,14],[26998,15],[5769,16],[5054,17],[7399,18],[6608,19],[1890,20],[597,21],[3340,22],[2107,23],[13663,24],[12392,25],[16177,26],[14854,27],[9396,28],[8579,29],[11994,30],[11245,31]],R=[0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4];e.prototype.GetHashCode=function(){return this.errorCorrectionLevel.ordinal()<<3|this.dataMask},e.prototype.Equals=function(t){var e=t;return this.errorCorrectionLevel==e.errorCorrectionLevel&&this.dataMask==e.dataMask},e.numBitsDiffering=function(t,e){return t^=e,R[15&t]+R[15&x(t,4)]+R[15&x(t,8)]+R[15&x(t,12)]+R[15&x(t,16)]+R[15&x(t,20)]+R[15&x(t,24)]+R[15&x(t,28)]},e.decodeFormatInformation=function(t){var n=e.doDecodeFormatInformation(t);return null!=n?n:e.doDecodeFormatInformation(t^O)},e.doDecodeFormatInformation=function(t){for(var n=4294967295,i=0,r=0;r<I.length;r++){var o=I[r],s=o[0];if(s==t)return new e(o[1]);var a=this.numBitsDiffering(t,s);a<n&&(i=o[1],n=a)}return n<=3?new e(i):null},Object.defineProperty(n.prototype,"Dimension",{get:function(){if(this.width!=this.height)throw"Can't call getDimension() on a non-square matrix";return this.width}}),n.prototype.get_Renamed=function(t,e){var n=e*this.rowSize+(t>>5);return 0!=(1&x(this.bits[n],31&t))},n.prototype.set_Renamed=function(t,e){var n=e*this.rowSize+(t>>5);this.bits[n]|=1<<(31&t)},n.prototype.flip=function(t,e){var n=e*this.rowSize+(t>>5);this.bits[n]^=1<<(31&t)},n.prototype.clear=function(){for(var t=this.bits.length,e=0;e<t;e++)this.bits[e]=0},n.prototype.setRegion=function(t,e,n,i){if(e<0||t<0)throw"Left and top must be nonnegative";if(i<1||n<1)throw"Height and width must be at least 1";var r=t+n,o=e+i;if(o>this.height||r>this.width)throw"The region must fit inside the matrix";for(var s=e;s<o;s++)for(var a=s*this.rowSize,h=t;h<r;h++)this.bits[a+(h>>5)]|=1<<(31&h)},Object.defineProperty(r.prototype,"TotalECCodewords",{get:function(){return this.ecCodewordsPerBlock*this.NumBlocks}}),Object.defineProperty(r.prototype,"NumBlocks",{get:function(){for(var t=0,e=0;e<this.ecBlocks.length;e++)t+=this.ecBlocks[e].length;return t}}),r.prototype.getECBlocks=function(){return this.ecBlocks},Object.defineProperty(o.prototype,"DimensionForVersion",{get:function(){return 17+4*this.versionNumber}}),o.prototype.buildFunctionPattern=function(){var t=this.DimensionForVersion,e=new n(t);e.setRegion(0,0,9,9),e.setRegion(t-8,0,8,9),e.setRegion(0,t-8,9,8);for(var i=this.alignmentPatternCenters.length,r=0;r<i;r++)for(var o=this.alignmentPatternCenters[r]-2,s=0;s<i;s++)0==r&&(0==s||s==i-1)||r==i-1&&0==s||e.setRegion(this.alignmentPatternCenters[s]-2,o,5,5);return e.setRegion(6,9,1,t-17),e.setRegion(9,6,t-17,1),this.versionNumber>6&&(e.setRegion(t-11,0,3,6),e.setRegion(0,t-11,6,3)),e},o.prototype.getECBlocksForLevel=function(t){return this.ecBlocks[t.ordinal()]},o.VERSION_DECODE_INFO=[31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017],o.VERSIONS=s(),o.getVersionForNumber=function(t){if(t<1||t>40)throw"ArgumentException";return o.VERSIONS[t-1]},o.getProvisionalVersionForDimension=function(t){if(t%4!=1)throw"Error getProvisionalVersionForDimension";try{return o.getVersionForNumber(t-17>>2)}catch(t){throw"Error getVersionForNumber"}},o.decodeVersionInformation=function(t){for(var n=4294967295,i=0,r=0;r<o.VERSION_DECODE_INFO.length;r++){var s=o.VERSION_DECODE_INFO[r];if(s==t)return this.getVersionForNumber(r+7);var a=e.numBitsDiffering(t,s);a<n&&(i=r+7,n=a)}return n<=3?this.getVersionForNumber(i):null},Object.defineProperty(a.prototype,"X",{get:function(){return Math.floor(this.x)}}),Object.defineProperty(a.prototype,"Y",{get:function(){return Math.floor(this.y)}}),a.prototype.incrementCount=function(){this.count++},a.prototype.aboutEquals=function(t,e,n){if(Math.abs(e-this.y)<=t&&Math.abs(n-this.x)<=t){var i=Math.abs(t-this.estimatedModuleSize);return i<=1||i/this.estimatedModuleSize<=1}return!1},h.prototype.centerFromEnd=function(t,e){return e-t[2]-t[1]/2},h.prototype.foundPatternCross=function(t){for(var e=this.moduleSize,n=e/2,i=0;i<3;i++)if(Math.abs(e-t[i])>=n)return!1;return!0},h.prototype.crossCheckVertical=function(t,e,n,i){var r=this.image,o=r.height,s=this.crossCheckStateCount;s[0]=0,s[1]=0,s[2]=0;for(var a=t;a>=0&&r.data[e+a*r.width]&&s[1]<=n;)s[1]++,a--;if(a<0||s[1]>n)return NaN;for(;a>=0&&!r.data[e+a*r.width]&&s[0]<=n;)s[0]++,a--;if(s[0]>n)return NaN;for(a=t+1;a<o&&r.data[e+a*r.width]&&s[1]<=n;)s[1]++,a++;if(a==o||s[1]>n)return NaN;for(;a<o&&!r.data[e+a*r.width]&&s[2]<=n;)s[2]++,a++;if(s[2]>n)return NaN;var h=s[0]+s[1]+s[2];return 5*Math.abs(h-i)>=2*i?NaN:this.foundPatternCross(s)?this.centerFromEnd(s,a):NaN},h.prototype.handlePossibleCenter=function(t,e,n){var i=t[0]+t[1]+t[2],r=this.centerFromEnd(t,n),o=this.crossCheckVertical(e,Math.floor(r),2*t[1],i);if(!isNaN(o)){for(var s=(t[0]+t[1]+t[2])/3,h=this.possibleCenters.length,w=0;w<h;w++){var f=this.possibleCenters[w];if(f.aboutEquals(s,o,r))return new a(r,o,s)}var u=new a(r,o,s);this.possibleCenters.push(u),null!=this.resultPointCallback&&this.resultPointCallback.foundPossibleResultPoint(u)}return null},h.prototype.find=function(){for(var t=this.image,e=this.startX,n=this.height,i=e+this.width,r=this.startY+(n>>1),o=[0,0,0],s=0;s<n;s++){var a=r+(0==(1&s)?s+1>>1:-(s+1>>1));o[0]=0,o[1]=0,o[2]=0;for(var h=e;h<i&&!t.data[h+t.width*a];)h++;for(var w=0;h<i;){if(t.data[h+a*t.width])if(1==w)o[w]++;else if(2==w){if(this.foundPatternCross(o)){var f=this.handlePossibleCenter(o,a,h);if(null!=f)return f}o[0]=o[2],o[1]=1,o[2]=0,w=1}else o[++w]++;else 1==w&&w++,o[w]++;h++}if(this.foundPatternCross(o)){var f=this.handlePossibleCenter(o,a,i);if(null!=f)return f}}if(0!=this.possibleCenters.length)return this.possibleCenters[0];throw"Couldn't find enough alignment patterns"};var V={};V.checkAndNudgePoints=function(t,e){for(var n=t.width,i=t.height,r=!0,o=0;o<e.length&&r;o+=2){var s=Math.floor(e[o]),a=Math.floor(e[o+1]);if(s<-1||s>n||a<-1||a>i)throw"Error.checkAndNudgePoints ";r=!1,s==-1?(e[o]=0,r=!0):s==n&&(e[o]=n-1,r=!0),a==-1?(e[o+1]=0,r=!0):a==i&&(e[o+1]=i-1,r=!0)}r=!0;for(var o=e.length-2;o>=0&&r;o-=2){var s=Math.floor(e[o]),a=Math.floor(e[o+1]);if(s<-1||s>n||a<-1||a>i)throw"Error.checkAndNudgePoints ";r=!1,s==-1?(e[o]=0,r=!0):s==n&&(e[o]=n-1,r=!0),a==-1?(e[o+1]=0,r=!0):a==i&&(e[o+1]=i-1,r=!0)}},V.sampleGrid3=function(t,e,i){for(var r=new n(e),o=new Array(e<<1),s=0;s<e;s++){for(var a=o.length,h=s+.5,w=0;w<a;w+=2)o[w]=(w>>1)+.5,o[w+1]=h;i.transformPoints1(o),V.checkAndNudgePoints(t,o);try{for(var w=0;w<a;w+=2){var f=t.data[Math.floor(o[w])+t.width*Math.floor(o[w+1])];f&&r.set_Renamed(w>>1,s)}}catch(t){throw"Error.checkAndNudgePoints"}}return r};var z=3,T=57,L=8,X=2;Object.defineProperty(f.prototype,"X",{get:function(){return this.x}}),Object.defineProperty(f.prototype,"Y",{get:function(){return this.y}}),f.prototype.incrementCount=function(){this.count++},f.prototype.aboutEquals=function(t,e,n){if(Math.abs(e-this.y)<=t&&Math.abs(n-this.x)<=t){var i=Math.abs(t-this.estimatedModuleSize);return i<=1||i/this.estimatedModuleSize<=1}return!1},Object.defineProperty(l.prototype,"CrossCheckStateCount",{get:function(){return this.crossCheckStateCount[0]=0,this.crossCheckStateCount[1]=0,this.crossCheckStateCount[2]=0,this.crossCheckStateCount[3]=0,this.crossCheckStateCount[4]=0,this.crossCheckStateCount}}),l.prototype.foundPatternCross=function(t){for(var e=0,n=0;n<5;n++){var i=t[n];if(0==i)return!1;e+=i}if(e<7)return!1;var r=Math.floor((e<<L)/7),o=Math.floor(r/2);return Math.abs(r-(t[0]<<L))<o&&Math.abs(r-(t[1]<<L))<o&&Math.abs(3*r-(t[2]<<L))<3*o&&Math.abs(r-(t[3]<<L))<o&&Math.abs(r-(t[4]<<L))<o},l.prototype.centerFromEnd=function(t,e){return e-t[4]-t[3]-t[2]/2},l.prototype.crossCheckVertical=function(t,e,n,i){for(var r=this.image,o=r.height,s=this.CrossCheckStateCount,a=t;a>=0&&r.data[e+a*r.width];)s[2]++,a--;if(a<0)return NaN;for(;a>=0&&!r.data[e+a*r.width]&&s[1]<=n;)s[1]++,a--;if(a<0||s[1]>n)return NaN;for(;a>=0&&r.data[e+a*r.width]&&s[0]<=n;)s[0]++,a--;if(s[0]>n)return NaN;for(a=t+1;a<o&&r.data[e+a*r.width];)s[2]++,a++;if(a==o)return NaN;for(;a<o&&!r.data[e+a*r.width]&&s[3]<n;)s[3]++,a++;if(a==o||s[3]>=n)return NaN;for(;a<o&&r.data[e+a*r.width]&&s[4]<n;)s[4]++,a++;if(s[4]>=n)return NaN;var h=s[0]+s[1]+s[2]+s[3]+s[4];return 5*Math.abs(h-i)>=2*i?NaN:this.foundPatternCross(s)?this.centerFromEnd(s,a):NaN},l.prototype.crossCheckHorizontal=function(t,e,n,i){for(var r=this.image,o=r.width,s=this.CrossCheckStateCount,a=t;a>=0&&r.data[a+e*r.width];)s[2]++,a--;if(a<0)return NaN;for(;a>=0&&!r.data[a+e*r.width]&&s[1]<=n;)s[1]++,a--;if(a<0||s[1]>n)return NaN;for(;a>=0&&r.data[a+e*r.width]&&s[0]<=n;)s[0]++,a--;if(s[0]>n)return NaN;for(a=t+1;a<o&&r.data[a+e*r.width];)s[2]++,a++;if(a==o)return NaN;for(;a<o&&!r.data[a+e*r.width]&&s[3]<n;)s[3]++,a++;if(a==o||s[3]>=n)return NaN;for(;a<o&&r.data[a+e*r.width]&&s[4]<n;)s[4]++,a++;if(s[4]>=n)return NaN;var h=s[0]+s[1]+s[2]+s[3]+s[4];return 5*Math.abs(h-i)>=i?NaN:this.foundPatternCross(s)?this.centerFromEnd(s,a):NaN},l.prototype.handlePossibleCenter=function(t,e,n){var i=t[0]+t[1]+t[2]+t[3]+t[4],r=this.centerFromEnd(t,n),o=this.crossCheckVertical(e,Math.floor(r),t[2],i);if(!isNaN(o)&&(r=this.crossCheckHorizontal(Math.floor(r),Math.floor(o),t[2],i),!isNaN(r))){for(var s=i/7,a=!1,h=this.possibleCenters.length,w=0;w<h;w++){var u=this.possibleCenters[w];if(u.aboutEquals(s,o,r)){u.incrementCount(),a=!0;break}}if(!a){var l=new f(r,o,s);this.possibleCenters.push(l),null!=this.resultPointCallback&&this.resultPointCallback.foundPossibleResultPoint(l)}return!0}return!1},l.prototype.selectBestPatterns=function(){var t=this.possibleCenters.length;if(t<3)throw"Couldn't find enough finder patterns:"+t+" patterns found";if(t>3){for(var e=0,n=0,i=0;i<t;i++){var r=this.possibleCenters[i].estimatedModuleSize;e+=r,n+=r*r}var o=e/t;this.possibleCenters.sort(function(t,e){var n=Math.abs(e.estimatedModuleSize-o),i=Math.abs(t.estimatedModuleSize-o);return n<i?-1:n==i?0:1});for(var s=Math.sqrt(n/t-o*o),a=Math.max(.2*o,s),i=this.possibleCenters-1;i>=0;i--){var h=this.possibleCenters[i];Math.abs(h.estimatedModuleSize-o)>a&&this.possibleCenters.splice(i,1)}}return this.possibleCenters.length>3&&this.possibleCenters.sort(function(t,e){return t.count>e.count?-1:t.count<e.count?1:0}),[this.possibleCenters[0],this.possibleCenters[1],this.possibleCenters[2]]},l.prototype.findRowSkip=function(){var t=this.possibleCenters.length;if(t<=1)return 0;for(var e=null,n=0;n<t;n++){var i=this.possibleCenters[n];if(i.count>=X){if(null!=e)return this.hasSkipped=!0,Math.floor((Math.abs(e.X-i.X)-Math.abs(e.Y-i.Y))/2);e=i}}return 0},l.prototype.haveMultiplyConfirmedCenters=function(){for(var t=0,e=0,n=this.possibleCenters.length,i=0;i<n;i++){var r=this.possibleCenters[i];r.count>=X&&(t++,e+=r.estimatedModuleSize)}if(t<3)return!1;for(var o=e/n,s=0,i=0;i<n;i++)r=this.possibleCenters[i],s+=Math.abs(r.estimatedModuleSize-o);return s<=.05*e},l.prototype.findFinderPattern=function(t){var e=!1;this.image=t;var n=t.height,i=t.width,r=Math.floor(3*n/(4*T));(r<z||e)&&(r=z);for(var o=!1,s=new Array(5),a=r-1;a<n&&!o;a+=r){s[0]=0,s[1]=0,s[2]=0,s[3]=0,s[4]=0;for(var h=0,f=0;f<i;f++)if(t.data[f+a*t.width])1==(1&h)&&h++,s[h]++;else if(0==(1&h))if(4==h)if(this.foundPatternCross(s)){var l=this.handlePossibleCenter(s,a,f);if(l)if(r=2,this.hasSkipped)o=this.haveMultiplyConfirmedCenters();else{var d=this.findRowSkip();d>s[2]&&(a+=d-s[2]-r,f=i-1)}else{do f++;while(f<i&&!t.data[f+a*t.width]);f--}h=0,s[0]=0,s[1]=0,s[2]=0,s[3]=0,s[4]=0}else s[0]=s[2],s[1]=s[3],s[2]=s[4],s[3]=1,s[4]=0,h=3;else s[++h]++;else s[h]++;if(this.foundPatternCross(s)){var l=this.handlePossibleCenter(s,a,i);l&&(r=s[0],this.hasSkipped&&(o=this.haveMultiplyConfirmedCenters()))}}var c=this.selectBestPatterns();return w(c),new u(c)},d.prototype.transformPoints1=function(t){for(var e=t.length,n=this.a11,i=this.a12,r=this.a13,o=this.a21,s=this.a22,a=this.a23,h=this.a31,w=this.a32,f=this.a33,u=0;u<e;u+=2){var l=t[u],d=t[u+1],c=r*l+a*d+f;t[u]=(n*l+o*d+h)/c,t[u+1]=(i*l+s*d+w)/c}},d.prototype.transformPoints2=function(t,e){for(var n=t.length,i=0;i<n;i++){var r=t[i],o=e[i],s=this.a13*r+this.a23*o+this.a33;t[i]=(this.a11*r+this.a21*o+this.a31)/s,e[i]=(this.a12*r+this.a22*o+this.a32)/s}},d.prototype.buildAdjoint=function(){return new d(this.a22*this.a33-this.a23*this.a32,this.a23*this.a31-this.a21*this.a33,this.a21*this.a32-this.a22*this.a31,this.a13*this.a32-this.a12*this.a33,this.a11*this.a33-this.a13*this.a31,this.a12*this.a31-this.a11*this.a32,this.a12*this.a23-this.a13*this.a22,this.a13*this.a21-this.a11*this.a23,this.a11*this.a22-this.a12*this.a21)},d.prototype.times=function(t){return new d(this.a11*t.a11+this.a21*t.a12+this.a31*t.a13,this.a11*t.a21+this.a21*t.a22+this.a31*t.a23,this.a11*t.a31+this.a21*t.a32+this.a31*t.a33,this.a12*t.a11+this.a22*t.a12+this.a32*t.a13,this.a12*t.a21+this.a22*t.a22+this.a32*t.a23,this.a12*t.a31+this.a22*t.a32+this.a32*t.a33,this.a13*t.a11+this.a23*t.a12+this.a33*t.a13,this.a13*t.a21+this.a23*t.a22+this.a33*t.a23,this.a13*t.a31+this.a23*t.a32+this.a33*t.a33)},d.quadrilateralToQuadrilateral=function(t,e,n,i,r,o,s,a,h,w,f,u,l,d,c,p){var g=this.quadrilateralToSquare(t,e,n,i,r,o,s,a),v=this.squareToQuadrilateral(h,w,f,u,l,d,c,p);return v.times(g)},d.squareToQuadrilateral=function(t,e,n,i,r,o,s,a){var h=a-o,w=e-i+o-a;if(0==h&&0==w)return new d(n-t,r-n,t,i-e,o-i,e,0,0,1);var f=n-r,u=s-r,l=t-n+r-s,c=i-o,p=f*h-u*c,g=(l*h-u*w)/p,v=(f*w-l*c)/p;return new d(n-t+g*n,s-t+v*s,t,i-e+g*i,a-e+v*a,e,g,v,1)},d.quadrilateralToSquare=function(t,e,n,i,r,o,s,a){return this.squareToQuadrilateral(t,e,n,i,r,o,s,a).buildAdjoint()},p.prototype.sizeOfBlackWhiteBlackRun=function(t,e,n,i){var r=Math.abs(i-e)>Math.abs(n-t);if(r){var o=t;t=e,e=o,o=n,n=i,i=o}for(var s=Math.abs(n-t),a=Math.abs(i-e),h=-s>>1,w=e<i?1:-1,f=t<n?1:-1,u=0,l=t,d=e;l!=n;l+=f){var c=r?d:l,p=r?l:d;if(1==u?this.image.data[c+p*this.image.width]&&u++:this.image.data[c+p*this.image.width]||u++,3==u){var g=l-t,v=d-e;return Math.sqrt(g*g+v*v)}if(h+=a,h>0){if(d==i)break;d+=w,h-=s}}var m=n-t,b=i-e;return Math.sqrt(m*m+b*b)},p.prototype.sizeOfBlackWhiteBlackRunBothWays=function(t,e,n,i){var r=this.sizeOfBlackWhiteBlackRun(t,e,n,i),o=1,s=t-(n-t);s<0?(o=t/(t-s),s=0):s>=this.image.width&&(o=(this.image.width-1-t)/(s-t),s=this.image.width-1);var a=Math.floor(e-(i-e)*o);return o=1,a<0?(o=e/(e-a),a=0):a>=this.image.height&&(o=(this.image.height-1-e)/(a-e),a=this.image.height-1),s=Math.floor(t+(s-t)*o),r+=this.sizeOfBlackWhiteBlackRun(t,e,s,a),r-1},p.prototype.calculateModuleSizeOneWay=function(t,e){var n=this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(t.X),Math.floor(t.Y),Math.floor(e.X),Math.floor(e.Y)),i=this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(e.X),Math.floor(e.Y),Math.floor(t.X),Math.floor(t.Y));return isNaN(n)?i/7:isNaN(i)?n/7:(n+i)/14},p.prototype.calculateModuleSize=function(t,e,n){return(this.calculateModuleSizeOneWay(t,e)+this.calculateModuleSizeOneWay(t,n))/2},p.prototype.distance=function(t,e){var n=t.X-e.X,i=t.Y-e.Y;return Math.sqrt(n*n+i*i)},p.prototype.computeDimension=function(t,e,n,i){var r=Math.round(this.distance(t,e)/i),o=Math.round(this.distance(t,n)/i),s=(r+o>>1)+7;switch(3&s){case 0:s++;break;case 2:s--;break;case 3:throw"Error"}return s},p.prototype.findAlignmentInRegion=function(t,e,n,i){var r=Math.floor(i*t),o=Math.max(0,e-r),s=Math.min(this.image.width-1,e+r);if(s-o<3*t)throw"Error";var a=Math.max(0,n-r),w=Math.min(this.image.height-1,n+r),f=new h(this.image,o,a,s-o,w-a,t,this.resultPointCallback);return f.find()},p.prototype.createTransform=function(t,e,n,i,r){var o,s,a,h,w=r-3.5;null!=i?(o=i.X,s=i.Y,a=h=w-3):(o=e.X-t.X+n.X,s=e.Y-t.Y+n.Y,a=h=w);var f=d.quadrilateralToQuadrilateral(3.5,3.5,w,3.5,a,h,3.5,w,t.X,t.Y,e.X,e.Y,o,s,n.X,n.Y);return f},p.prototype.sampleGrid=function(t,e,n){var i=V;return i.sampleGrid3(t,n,e)},p.prototype.processFinderPatternInfo=function(t){var e=t.topLeft,n=t.topRight,i=t.bottomLeft,r=this.calculateModuleSize(e,n,i);if(r<1)throw"Error";var s=this.computeDimension(e,n,i,r),a=o.getProvisionalVersionForDimension(s),h=a.DimensionForVersion-7,w=null;if(a.alignmentPatternCenters.length>0)for(var f=n.X-e.X+i.X,u=n.Y-e.Y+i.Y,l=1-3/h,d=Math.floor(e.X+l*(f-e.X)),p=Math.floor(e.Y+l*(u-e.Y)),g=4;g<=16;g<<=1){w=this.findAlignmentInRegion(r,d,p,g);break}var v,m=this.createTransform(e,n,i,w,s),b=this.sampleGrid(this.image,m,s);return v=null==w?[i,e,n]:[i,e,n,w],new c(b,v)},p.prototype.detect=function(){var t=(new l).findFinderPattern(this.image);return this.processFinderPatternInfo(t)},Object.defineProperty(g.prototype,"Zero",{get:function(){return 0==this.coefficients[0]}}),Object.defineProperty(g.prototype,"Degree",{get:function(){return this.coefficients.length-1}}),g.prototype.getCoefficient=function(t){return this.coefficients[this.coefficients.length-1-t]},g.prototype.evaluateAt=function(t){if(0==t)return this.getCoefficient(0);var e=this.coefficients.length;if(1==t){for(var n=0,i=0;i<e;i++)n=v.addOrSubtract(n,this.coefficients[i]);return n}for(var r=this.coefficients[0],i=1;i<e;i++)r=v.addOrSubtract(this.field.multiply(t,r),this.coefficients[i]);return r},g.prototype.addOrSubtract=function(t){if(this.field!=t.field)throw"GF256Polys do not have same GF256 field";if(this.Zero)return t;if(t.Zero)return this;var e=this.coefficients,n=t.coefficients;if(e.length>n.length){var i=e;e=n,n=i}for(var r=new Array(n.length),o=n.length-e.length,s=0;s<o;s++)r[s]=n[s];for(var a=o;a<n.length;a++)r[a]=v.addOrSubtract(e[a-o],n[a]);return new g(this.field,r)},g.prototype.multiply1=function(t){if(this.field!=t.field)throw"GF256Polys do not have same GF256 field";if(this.Zero||t.Zero)return this.field.Zero;for(var e=this.coefficients,n=e.length,i=t.coefficients,r=i.length,o=new Array(n+r-1),s=0;s<n;s++)for(var a=e[s],h=0;h<r;h++)o[s+h]=v.addOrSubtract(o[s+h],this.field.multiply(a,i[h]));return new g(this.field,o)},g.prototype.multiply2=function(t){if(0==t)return this.field.Zero;if(1==t)return this;for(var e=this.coefficients.length,n=new Array(e),i=0;i<e;i++)n[i]=this.field.multiply(this.coefficients[i],t);return new g(this.field,n)},g.prototype.multiplyByMonomial=function(t,e){if(t<0)throw"System.ArgumentException";if(0==e)return this.field.Zero;for(var n=this.coefficients.length,i=new Array(n+t),r=0;r<i.length;r++)i[r]=0;for(var r=0;r<n;r++)i[r]=this.field.multiply(this.coefficients[r],e);return new g(this.field,i)},g.prototype.divide=function(t){if(this.field!=t.field)throw"GF256Polys do not have same GF256 field";if(t.Zero)throw"Divide by 0";for(var e=this.field.Zero,n=this,i=t.getCoefficient(t.Degree),r=this.field.inverse(i);n.Degree>=t.Degree&&!n.Zero;){var o=n.Degree-t.Degree,s=this.field.multiply(n.getCoefficient(n.Degree),r),a=t.multiplyByMonomial(o,s),h=this.field.buildMonomial(o,s);e=e.addOrSubtract(h),n=n.addOrSubtract(a)}return[e,n]},Object.defineProperty(v.prototype,"Zero",{get:function(){return this.zero}}),Object.defineProperty(v.prototype,"One",{get:function(){return this.one}}),v.prototype.buildMonomial=function(t,e){if(t<0)throw"System.ArgumentException";if(0==e)return this.zero;for(var n=new Array(t+1),i=0;i<n.length;i++)n[i]=0;return n[0]=e,new g(this,n)},v.prototype.exp=function(t){return this.expTable[t]},v.prototype.log=function(t){if(0==t)throw"System.ArgumentException";return this.logTable[t]},v.prototype.inverse=function(t){if(0==t)throw"System.ArithmeticException";return this.expTable[255-this.logTable[t]]},v.prototype.multiply=function(t,e){return 0==t||0==e?0:1==t?e:1==e?t:this.expTable[(this.logTable[t]+this.logTable[e])%255]},v.QR_CODE_FIELD=new v(285),v.DATA_MATRIX_FIELD=new v(301),v.addOrSubtract=function(t,e){return t^e},m.prototype.decode=function(t,e){for(var n=new g(this.field,t),i=new Array(e),r=0;r<i.length;r++)i[r]=0;for(var o=!1,s=!0,r=0;r<e;r++){var a=n.evaluateAt(this.field.exp(o?r+1:r));i[i.length-1-r]=a,0!=a&&(s=!1)}if(!s)for(var h=new g(this.field,i),w=this.runEuclideanAlgorithm(this.field.buildMonomial(e,1),h,e),f=w[0],u=w[1],l=this.findErrorLocations(f),d=this.findErrorMagnitudes(u,l,o),r=0;r<l.length;r++){var c=t.length-1-this.field.log(l[r]);if(c<0)throw"ReedSolomonException Bad error location";t[c]=v.addOrSubtract(t[c],d[r])}},m.prototype.runEuclideanAlgorithm=function(t,e,n){if(t.Degree<e.Degree){var i=t;t=e,e=i}for(var r=t,o=e,s=this.field.One,a=this.field.Zero,h=this.field.Zero,w=this.field.One;o.Degree>=Math.floor(n/2);){var f=r,u=s,l=h;if(r=o,s=a,h=w,r.Zero)throw"r_{i-1} was zero";o=f;for(var d=this.field.Zero,c=r.getCoefficient(r.Degree),p=this.field.inverse(c);o.Degree>=r.Degree&&!o.Zero;){
var g=o.Degree-r.Degree,v=this.field.multiply(o.getCoefficient(o.Degree),p);d=d.addOrSubtract(this.field.buildMonomial(g,v)),o=o.addOrSubtract(r.multiplyByMonomial(g,v))}a=d.multiply1(s).addOrSubtract(u),w=d.multiply1(h).addOrSubtract(l)}var m=w.getCoefficient(0);if(0==m)throw"ReedSolomonException sigmaTilde(0) was zero";var b=this.field.inverse(m),y=w.multiply2(b),C=o.multiply2(b);return[y,C]},m.prototype.findErrorLocations=function(t){var e=t.Degree;if(1==e)return new Array(t.getCoefficient(1));for(var n=new Array(e),i=0,r=1;r<256&&i<e;r++)0==t.evaluateAt(r)&&(n[i]=this.field.inverse(r),i++);if(i!=e)throw"Error locator degree does not match number of roots";return n},m.prototype.findErrorMagnitudes=function(t,e,n){for(var i=e.length,r=new Array(i),o=0;o<i;o++){for(var s=this.field.inverse(e[o]),a=1,h=0;h<i;h++)o!=h&&(a=this.field.multiply(a,v.addOrSubtract(1,this.field.multiply(e[h],s))));r[o]=this.field.multiply(t.evaluateAt(s),this.field.inverse(a)),n&&(r[o]=this.field.multiply(r[o],s))}return r};var Y={};Y.forReference=function(t){if(t<0||t>7)throw"System.ArgumentException";return Y.DATA_MASKS[t]},Y.DATA_MASKS=[new b,new y,new C,new M,new k,new P,new N,new S],B.prototype.copyBit=function(t,e,n){return this.bitMatrix.get_Renamed(t,e)?n<<1|1:n<<1},B.prototype.readFormatInformation=function(){if(null!=this.parsedFormatInfo)return this.parsedFormatInfo;for(var t=0,n=0;n<6;n++)t=this.copyBit(n,8,t);t=this.copyBit(7,8,t),t=this.copyBit(8,8,t),t=this.copyBit(8,7,t);for(var i=5;i>=0;i--)t=this.copyBit(8,i,t);if(this.parsedFormatInfo=e.decodeFormatInformation(t),null!=this.parsedFormatInfo)return this.parsedFormatInfo;var r=this.bitMatrix.Dimension;t=0;for(var o=r-8,n=r-1;n>=o;n--)t=this.copyBit(n,8,t);for(var i=r-7;i<r;i++)t=this.copyBit(8,i,t);if(this.parsedFormatInfo=e.decodeFormatInformation(t),null!=this.parsedFormatInfo)return this.parsedFormatInfo;throw"Error readFormatInformation"},B.prototype.readVersion=function(){if(null!=this.parsedVersion)return this.parsedVersion;var t=this.bitMatrix.Dimension,e=t-17>>2;if(e<=6)return o.getVersionForNumber(e);for(var n=0,i=t-11,r=5;r>=0;r--)for(var s=t-9;s>=i;s--)n=this.copyBit(s,r,n);if(this.parsedVersion=o.decodeVersionInformation(n),null!=this.parsedVersion&&this.parsedVersion.DimensionForVersion==t)return this.parsedVersion;n=0;for(var s=5;s>=0;s--)for(var r=t-9;r>=i;r--)n=this.copyBit(s,r,n);if(this.parsedVersion=o.decodeVersionInformation(n),null!=this.parsedVersion&&this.parsedVersion.DimensionForVersion==t)return this.parsedVersion;throw"Error readVersion"},B.prototype.readCodewords=function(){var t=this.readFormatInformation(),e=this.readVersion(),n=Y.forReference(t.dataMask),i=this.bitMatrix.Dimension;n.unmaskBitMatrix(this.bitMatrix,i);for(var r=e.buildFunctionPattern(),o=!0,s=new Array(e.totalCodewords),a=0,h=0,w=0,f=i-1;f>0;f-=2){6==f&&f--;for(var u=0;u<i;u++)for(var l=o?i-1-u:u,d=0;d<2;d++)r.get_Renamed(f-d,l)||(w++,h<<=1,this.bitMatrix.get_Renamed(f-d,l)&&(h|=1),8==w&&(s[a++]=h,w=0,h=0));o^=!0}if(a!=e.totalCodewords)throw"Error readCodewords";return s},A.getDataBlocks=function(t,e,n){if(t.length!=e.totalCodewords)throw"ArgumentException";for(var i=e.getECBlocksForLevel(n),r=0,o=i.getECBlocks(),s=0;s<o.length;s++)r+=o[s].count;for(var a=new Array(r),h=0,w=0;w<o.length;w++)for(var f=o[w],s=0;s<f.count;s++){var u=f.dataCodewords,l=i.ecCodewordsPerBlock+u;a[h++]=new A(u,new Array(l))}for(var d=a[0].codewords.length,c=a.length-1;c>=0;){var p=a[c].codewords.length;if(p==d)break;c--}c++;for(var g=d-i.ecCodewordsPerBlock,v=0,s=0;s<g;s++)for(var w=0;w<h;w++)a[w].codewords[s]=t[v++];for(var w=c;w<h;w++)a[w].codewords[g]=t[v++];for(var m=a[0].codewords.length,s=g;s<m;s++)for(var w=0;w<h;w++){var b=w<c?s:s+1;a[w].codewords[b]=t[v++]}return a},E.prototype.getNextBits=function(t){var e=0;if(t<this.bitPointer+1){for(var n=0,i=0;i<t;i++)n+=1<<i;return n<<=this.bitPointer-t+1,e=(this.blocks[this.blockPointer]&n)>>this.bitPointer-t+1,this.bitPointer-=t,e}if(t<this.bitPointer+1+8){for(var r=0,i=0;i<this.bitPointer+1;i++)r+=1<<i;return e=(this.blocks[this.blockPointer]&r)<<t-(this.bitPointer+1),this.blockPointer++,e+=this.blocks[this.blockPointer]>>8-(t-(this.bitPointer+1)),this.bitPointer=this.bitPointer-t%8,this.bitPointer<0&&(this.bitPointer=8+this.bitPointer),e}if(t<this.bitPointer+1+16){for(var r=0,o=0,i=0;i<this.bitPointer+1;i++)r+=1<<i;var s=(this.blocks[this.blockPointer]&r)<<t-(this.bitPointer+1);this.blockPointer++;var a=this.blocks[this.blockPointer]<<t-(this.bitPointer+1+8);this.blockPointer++;for(var i=0;i<t-(this.bitPointer+1+8);i++)o+=1<<i;o<<=8-(t-(this.bitPointer+1+8));var h=(this.blocks[this.blockPointer]&o)>>8-(t-(this.bitPointer+1+8));return e=s+a+h,this.bitPointer=this.bitPointer-(t-8)%8,this.bitPointer<0&&(this.bitPointer=8+this.bitPointer),e}return 0},E.prototype.NextMode=function(){return this.blockPointer>this.blocks.length-this.numErrorCorrectionCode-2?0:this.getNextBits(4)},E.prototype.getDataLength=function(t){for(var e=0;;){if(t>>e==1)break;e++}return this.getNextBits(q.sizeOfDataLengthInfo[this.dataLengthMode][e])},E.prototype.getRomanAndFigureString=function(t){var e=t,n=0,i="",r=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];do if(e>1){n=this.getNextBits(11);var o=Math.floor(n/45),s=n%45;i+=r[o],i+=r[s],e-=2}else 1==e&&(n=this.getNextBits(6),i+=r[n],e-=1);while(e>0);return i},E.prototype.getFigureString=function(t){var e=t,n=0,i="";do e>=3?(n=this.getNextBits(10),n<100&&(i+="0"),n<10&&(i+="0"),e-=3):2==e?(n=this.getNextBits(7),n<10&&(i+="0"),e-=2):1==e&&(n=this.getNextBits(4),e-=1),i+=n;while(e>0);return i},E.prototype.get8bitByteArray=function(t){var e=t,n=0,i=[];do n=this.getNextBits(8),i.push(n),e--;while(e>0);return i},E.prototype.getKanjiString=function(t){var e=t,n=0,i="";do{n=this.getNextBits(13);var r=n%192,o=n/192,s=(o<<8)+r,a=0;a=s+33088<=40956?s+33088:s+49472,i+=String.fromCharCode(a),e--}while(e>0);return i},Object.defineProperty(E.prototype,"DataByte",{get:function(){for(var t=[],e=1,n=2,i=4,r=8;;){var o=this.NextMode();if(0==o){if(t.length>0)break;throw"Empty data block"}if(o!=e&&o!=n&&o!=i&&o!=r)throw"Invalid mode: "+o+" in (block:"+this.blockPointer+" bit:"+this.bitPointer+")";var s=this.getDataLength(o);if(s<1)throw"Invalid data length: "+s;switch(o){case e:for(var a=this.getFigureString(s),h=new Array(a.length),w=0;w<a.length;w++)h[w]=a.charCodeAt(w);t.push(h);break;case n:for(var a=this.getRomanAndFigureString(s),h=new Array(a.length),w=0;w<a.length;w++)h[w]=a.charCodeAt(w);t.push(h);break;case i:var f=this.get8bitByteArray(s);t.push(f);break;case r:var a=this.getKanjiString(s);t.push(a)}}return t}});var _={};_.rsDecoder=new m(v.QR_CODE_FIELD),_.correctErrors=function(t,e){for(var n=t.length,i=new Array(n),r=0;r<n;r++)i[r]=255&t[r];var o=t.length-e;try{_.rsDecoder.decode(i,o)}catch(t){throw t}for(var r=0;r<e;r++)t[r]=i[r]},_.decode=function(t){for(var e=new B(t),n=e.readVersion(),i=e.readFormatInformation().errorCorrectionLevel,r=e.readCodewords(),o=A.getDataBlocks(r,n,i),s=0,a=0;a<o.length;a++)s+=o[a].numDataCodewords;for(var h=new Array(s),w=0,f=0;f<o.length;f++){var u=o[f],l=u.codewords,d=u.numDataCodewords;_.correctErrors(l,d);for(var a=0;a<d;a++)h[w++]=l[a]}var c=new E(h,n.versionNumber,i.bits);return c};var q={};return q.sizeOfDataLengthInfo=[[10,9,8,8],[12,11,16,10],[14,13,16,12]],D.prototype.decode=function(t,e){var n=function(){try{this.error=void 0,this.result=this.process(this.imagedata)}catch(t){this.error=t,this.result=void 0}return null!=this.callback&&this.callback(this.result,this.error),this.result}.bind(this);if(void 0==t){var i=document.getElementById("qr-canvas"),r=i.getContext("2d");this.width=i.width,this.height=i.height,this.imagedata=r.getImageData(0,0,this.width,this.height),n()}else if(void 0!=t.width)this.width=t.width,this.height=t.height,this.imagedata={data:e||t.data},this.imagedata.width=t.width,this.imagedata.height=t.height,n();else{var o=new Image;o.crossOrigin="Anonymous",o.onload=function(){var t=document.createElement("canvas"),e=t.getContext("2d"),i=document.getElementById("out-canvas");if(null!=i){var r=i.getContext("2d");r.clearRect(0,0,320,240),r.drawImage(o,0,0,320,240)}t.width=o.width,t.height=o.height,e.drawImage(o,0,0),this.width=o.width,this.height=o.height;try{this.imagedata=e.getImageData(0,0,o.width,o.height)}catch(t){if(this.result="Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!",null!=this.callback)return this.callback(this.result)}n()}.bind(this),o.src=t}},D.prototype.decode_utf8=function(t){return decodeURIComponent(escape(t))},D.prototype.process=function(t){for(var e=(new Date).getTime(),n=this.grayScaleToBitmap(this.grayscale(t)),i=new p(n),r=i.detect(),o=_.decode(r.bits),s=o.DataByte,a="",h=0;h<s.length;h++)for(var w=0;w<s[h].length;w++)a+=String.fromCharCode(s[h][w]);var f=(new Date).getTime(),u=f-e;return this.debug&&console.log("QR Code processing time (ms): "+u),this.decode_utf8(a)},D.prototype.getPixel=function(t,e,n){if(t.width<e)throw"point error";if(t.height<n)throw"point error";var i=4*e+n*t.width*4;return(33*t.data[i]+34*t.data[i+1]+33*t.data[i+2])/100},D.prototype.binarize=function(t){for(var e=new Array(this.width*this.height),n=0;n<this.height;n++)for(var i=0;i<this.width;i++){var r=this.getPixel(i,n);e[i+n*this.width]=r<=t}return e},D.prototype.getMiddleBrightnessPerArea=function(t){for(var e=4,n=Math.floor(t.width/e),i=Math.floor(t.height/e),r=new Array(e),o=0;o<e;o++){r[o]=new Array(e);for(var s=0;s<e;s++)r[o][s]=[0,0]}for(var a=0;a<e;a++)for(var h=0;h<e;h++){r[h][a][0]=255;for(var w=0;w<i;w++)for(var f=0;f<n;f++){var u=t.data[n*h+f+(i*a+w)*t.width];u<r[h][a][0]&&(r[h][a][0]=u),u>r[h][a][1]&&(r[h][a][1]=u)}}for(var l=new Array(e),d=0;d<e;d++)l[d]=new Array(e);for(var a=0;a<e;a++)for(var h=0;h<e;h++)l[h][a]=Math.floor((r[h][a][0]+r[h][a][1])/2);return l},D.prototype.grayScaleToBitmap=function(t){for(var e=this.getMiddleBrightnessPerArea(t),n=e.length,i=Math.floor(t.width/n),r=Math.floor(t.height/n),o=0;o<n;o++)for(var s=0;s<n;s++)for(var a=0;a<r;a++)for(var h=0;h<i;h++)t.data[i*s+h+(r*o+a)*t.width]=t.data[i*s+h+(r*o+a)*t.width]<e[s][o];return t},D.prototype.grayscale=function(t){for(var e=new Array(t.width*t.height),n=0;n<t.height;n++)for(var i=0;i<t.width;i++){var r=this.getPixel(t,i,n);e[i+n*t.width]=r}return{height:t.height,width:t.width,data:e}},D});
/*
 * angular-qrcode v6.2.1
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

angular.module('bverifyApp')
  .directive('qrcode', ['$window', function($window) {

    var canvas2D = !!$window.CanvasRenderingContext2D,
        levels = {
          'L': 'Low',
          'M': 'Medium',
          'Q': 'Quartile',
          'H': 'High'
        },
        draw = function(context, qr, modules, tile) {
          for (var row = 0; row < modules; row++) {
            for (var col = 0; col < modules; col++) {
              var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
                  h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));

              context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
              context.fillRect(Math.round(col * tile),
                               Math.round(row * tile), w, h);
            }
          }
        };

    return {
      restrict: 'E',
      template: '<canvas class="qrcode"></canvas>',
      link: function(scope, element, attrs) {
        var domElement = element[0],
            $canvas = element.find('canvas'),
            canvas = $canvas[0],
            context = canvas2D ? canvas.getContext('2d') : null,
            download = 'download' in attrs,
            href = attrs.href,
            link = download || href ? document.createElement('a') : '',
            trim = /^\s+|\s+$/g,
            error,
            version,
            errorCorrectionLevel,
            data,
            size,
            modules,
            tile,
            qr,
            $img,
            setVersion = function(value) {
              version = Math.max(1, Math.min(parseInt(value, 10), 40)) || 5;
            },
            setErrorCorrectionLevel = function(value) {
              errorCorrectionLevel = value in levels ? value : 'M';
            },
            setData = function(value) {
              if (!value) {
                return;
              }

              data = value.replace(trim, '');
              qr = qrcode(version, errorCorrectionLevel);
              qr.addData(data);

              try {
                qr.make();
              } catch(e) {
                error = e.message;
                return;
              }

              error = false;
              modules = qr.getModuleCount();
            },
            setSize = function(value) {
              size = parseInt(value, 10) || modules * 2;
              tile = size / modules;
              canvas.width = canvas.height = size;
            },
            render = function() {
              if (!qr) {
                return;
              }

              if (error) {
                if (link) {
                  link.removeAttribute('download');
                  link.title = '';
                  link.href = '#_';
                }
                if (!canvas2D) {
                  domElement.innerHTML = '<img src width="' + size + '"' +
                                         'height="' + size + '"' +
                                         'class="qrcode">';
                }
                scope.$emit('qrcode:error', error);
                return;
              }

              if (download) {
                domElement.download = 'qrcode.png';
                domElement.title = 'Download QR code';
              }

              if (canvas2D) {
                draw(context, qr, modules, tile);

                if (download) {
                  domElement.href = canvas.toDataURL('image/png');
                  return;
                }
              } else {
                domElement.innerHTML = qr.createImgTag(tile, 0);
                $img = element.find('img');
                $img.addClass('qrcode');

                if (download) {
                  domElement.href = $img[0].src;
                  return;
                }
              }

              if (href) {
                domElement.href = href;
              }
            };

        if (link) {
          link.className = 'qrcode-link';
          $canvas.wrap(link);
          domElement = domElement.firstChild;
        }

        setVersion(attrs.version);
        setErrorCorrectionLevel(attrs.errorCorrectionLevel);
        setSize(attrs.size);

        attrs.$observe('version', function(value) {
          if (!value) {
            return;
          }

          setVersion(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('errorCorrectionLevel', function(value) {
          if (!value) {
            return;
          }

          setErrorCorrectionLevel(value);
          setData(data);
          setSize(size);
          render();
        });

        attrs.$observe('data', function(value) {
          if (!value) {
            return;
          }

          setData(value);
          setSize(size);
          render();
        });

        attrs.$observe('size', function(value) {
          if (!value) {
            return;
          }

          setSize(value);
          render();
        });

        attrs.$observe('href', function(value) {
          if (!value) {
            return;
          }

          href = value;
          render();
        });
      }
    };
  }]);

//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = new Array();

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw new Error('code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')');
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data) {
      var newData = qr8BitByte(data);
      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw new Error(row + ',' + col);
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;
      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg';
      qrSvg += ' width="' + size + 'px"';
      qrSvg += ' height="' + size + 'px"';
      qrSvg += ' xmlns="http://www.w3.org/2000/svg"';
      qrSvg += '>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createImgTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createImgTag(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytes = function(s) {
    var bytes = new Array();
    for (var i = 0; i < s.length; i += 1) {
      var c = s.charCodeAt(i);
      bytes.push(c & 0xff);
    }
    return bytes;
  };

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw new Error();
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw new Error(count + ' != ' + numChars);
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = new Array();
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw new Error('bad maskPattern:' + maskPattern);
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw new Error('mode:' + mode);
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw new Error('mode:' + mode);
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw new Error('mode:' + mode);
        }

      } else {
        throw new Error('type:' + type);
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw new Error('glog(' + n + ')');
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw new Error(num.length + '/' + shift);
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectLevel) {

      switch(errorCorrectLevel) {
      case QRErrorCorrectLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);

      if (typeof rsBlock == 'undefined') {
        throw new Error('bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectLevel:' + errorCorrectLevel);
      }

      var length = rsBlock.length / 3;

      var list = new Array();

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = new Array();
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = new Array();

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw new Error('n:' + n);
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw new Error('unexpected end of file./' + _buflen);
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw new Error('c:' + c);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw new Error('length over');
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw new Error('dup key:' + key);
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createImgTag = function(width, height, getPixel, alt) {

    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    var img = '';
    img += '<img';
    img += '\u0020src="';
    img += 'data:image/gif;base64,';
    img += base64;
    img += '"';
    img += '\u0020width="';
    img += width;
    img += '"';
    img += '\u0020height="';
    img += height;
    img += '"';
    if (alt) {
      img += '\u0020alt="';
      img += alt;
      img += '"';
    }
    img += '/>';

    return img;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));


/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('productModule')

    //For acknowledging received product
    .controller('productAckController', ['userModel', 'appConstants', '$state', '$rootScope',
        'productServiceAPI', '$log', 'productList', 'productModel', 'ngDialog', '$scope',
        function (userModel, appConstants, $state, $rootScope, 
            productServiceAPI, $log, productList, productModel, ngDialog, $scope) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.isProducer = userModel.isProducer();
                vm.header = vm.isManufacturer ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
                vm.product = productModel.getProduct();
                vm.list = [];

                //Populating list of Products on load based on productList resolve
                productList
                    .$promise
                    .then(function (response) {
                        productModel.setProductList(response);
                        vm.list = productModel.getProductList();
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                 /*    TO-DO need to test with actual data and implementation */ 
                                // do Product/material shipment

                                $scope.$on('procureEvent', function(event, msg){
                                    console.log(msg);
                                productServiceAPI
                                    .ackProduct(vm.product)
                                    .then(function (response) {
                                         $rootScope.isSuccess = true;
                                         $rootScope.SUCCESS_MSG = "Selected Products has been acknowledged successfully";
                                        //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                                        if(vm.isManufacturer){
                                            $state.go('product');
                                        }if(vm.isRetailer){
                                            return;
                                        }
                                    }, function (err) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                                    })
                                    .catch(function (e) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                                    });
                                });



                 /***** Product Lineage functionality */
                 // isShipped value will be 'yes' for retailer
                //Hardcoded. Need to remove
                $scope.serviceData = {data:{product:{isShipped:'yes',name:'Handbag',mfgDate:'1/1/2016',receivedDate:'1/1/2016',items:[{name:'Leather',mfgDate:'3/1/2016',shipmentDate:'4/1/2016',receivedDate:'7/1/2016'},{name:'Buckel',mfgDate:'3/1/2016',shipmentDate:'4/1/2016',receivedDate:'7/1/2016'}]}}};
				$scope.lineageData = $scope.serviceData.data;
				$scope.lineageSubData = $scope.lineageData.product.items[0];
				$scope.lineageSubMaterialData = $scope.lineageData.product.items;


                $scope.$on('productLineage', function (event, msg) {
                     if($scope.lineageData.product.isShipped === 'yes'){
						$scope.isShipped = true;
						$scope.isShippedToRetailer = true;
					} else if($scope.lineageData.product.isShipped === 'no') {
						 $scope.isShipped = false;
						 $scope.isShippedToRetailer = false;
					}
					else {
						$scope.isShipped = true;
						$scope.isShippedToRetailer = false;
					}

                    var dialog = ngDialog.open({
                            scope : $scope,
                            width: '70%',
                            showClose: true,
                            className: 'ngdialog-theme-default lineage-box',
                            template: 'externalTemplate.html'
					});
                });

                /*************************************************************** */

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);
/*
**  Product Object pojo model for capturing Product/shipment details
*/

"use strict";

angular.module('productModule')
    .factory('productModel', ['appConstants', '$log',
        function (appConstants, $log) {

            // Only for demo instance.
            var _init = {
                tokenId: '',
                materialName: 'Leather',
                productName: 'Handheld Bag',
                quantity: '50',
                batchNumber: 'B00RWSC2MW',
                quality: 'Full Grain',
                color: 'Brown',
                weight: '100 kg',
                manufactureDate: '10/17/2016',
                registeredDate: new Date(),
                modelNumber: 'BG463A',
                shippedFrom: '',
                shippedOn: new Date(),
                trackDetails: {
                    currentlyAt: 'FedEx',
                    trackRecords: []
                },
                file: {
                    name: ''
                },
                exitPort: {
                    location: "",
                    isAvailable: false
                },
                entryPort: {
                    location: "",
                    isAvailable: false
                },
                manufacturerDetail: {
                 name: '',
                 isAvailable: false   
                },
                retailerDetail: {
                    name: '',
                    isAvailable: false
                },
                productList: []
            };

            var _product = {};

            //Reset user object on logout
            var _reset = function () {
                try {
                    this._product = angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._product;
            };

            var _clearAll = function(){
                 try {
                    this._product = {};
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._product;
            }

            //Set user object
            var _setProduct = function (obj) {
                try {
                    this._product = obj;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get user object
            var _getProduct = function () {
                try {
                    return this._product;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            var _getProductList = function () {
                return _product.productList;
            };
            var _clearProductList = function () {
                _product.productList = [];
            };

            var _setProductList = function (list) {
                _clearProductList();
                angular.forEach(list, function (obj, key) {
                    _product.productList.push({
                        "tokenId": obj.tokenId || "",
                        "materialName": obj.materialName || "",
                        "productName": obj.productName || "",
                        "batchNumber": obj.batchNumber || "",
                        "weight": obj.weight || "",
                        "quantity": obj.quantity || "",
                        "manufactureDate": obj.manufactureDate || "",
                        "registeredDate": obj.registeredDate || "",
                        "color": obj.color || "",
                        "modelNumber": obj.modelNumber || "",
                        "shippedFrom": obj.shippedFrom || "",
                        "shippedOn": obj.shippedOn || "",
                        "quality": obj.quality || "",
                        "trackDetails": obj.trackDetails,
                        "entryPort": obj.entryPort,
                        "exitPort": obj.exitPort,
                        "manufacturerDetail": obj.manufacturerDetail,
                        "retailerDetail": obj.retailerDetail
                    });
                });
            };


            return {
                'getProduct': _getProduct,
                'setProduct': _setProduct,
                'getProductList': _getProductList,
                'setProductList': _setProductList,
                'resetProduct': _reset,
                'clearAll': _clearAll
            }
        }]);

            /*function Product(productData) {
                if (productData) {
                    this.setData(productData)
                }

                this.productList = [];
            };
            Product.prototype = {
                setData: function(productData) {
                    angular.extend(this, productData);
                },
                getData: function() {
                    return this;
                },
                setProductList: function(list) {
                    this.clearProductList();
                    var _self = this;
                    angular.forEach(list, function(obj, key) {
                        _self.productList.push({
                            "id": obj.id || Math.floor(Math.random()*90000) + 10000,
                            "materialName": obj.materialName || "",
                            "productName": obj.productName || "",
                            "batchNumber": obj.batchNumber || "",
                            "weight": obj.weight || "",
                            "quantity": obj.quantity || "",
                            "manufactureDate": obj.manufactureDate || "",
                            "registeredDate": obj.registeredDate || "",
                            "color": obj.color || "",
                            "modelNumber": obj.modelNumber || "",
                            "shippedFrom": obj.shippedFrom || "",
                            "shippedOn": obj.shippedOn || "",
                            "quality": obj.quality || "",
                            "trackDetails": obj.trackDetails
                        });
                    });
                },
                getProductList: function() {
                    return this.productList;
                },
                clearProductList: function() {
                    this.productList = [];
                }
            };
            return Product;*/

/*
            "use strict";

            angular.module('productModule')
                .factory('productModel', ['appConstants', '$log',
                    function (appConstants, $log) {

                        // Only for demo instance.
                        var _init = {
                            // Shipment specific QR code
                            "qr": "",

                            // Product object which will be used to register/ship/acknowledge
                            "product": {
                                // Product specific QR code
                                "qr": "",
                                "productName": "",

                                // Material object nested inside product
                                "material": {
                                    // Material specific QR code
                                    "qr": "",
                                    "materialName": "",
                                    "batchNumber": "",
                                    "manufacturingDate": "",
                                    "quantity": "",
                                    "quality": "",
                                    "colour_dimensions": "",
                                    "weight": "",
                                    "img_vid_path": ""
                                },
                                "quantity": "",
                                "quality": "",
                                "manufacturingDate": "",
                                "dimensions": "",
                                "weight": "",
                                "modelNumber": "",
                                "img_vid_path": ""
                            },
                            "shippedFrom": "",
                            "trackDetails": {
                                "currentlyAt": "",
                                "trackRecords": []
                            },
                            "shippedOn": "",
                            "quality": ""
                        }


                        var _product = {};

                        //Reset product object
                        var _reset = function () {
                            try {
                                this._product = angular.copy(_init);
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                            return this._product;
                        };
                        //Set product object
                        var _setProduct = function (obj) {
                            try {
                                this._product = angular.copy(obj);
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };
                        //Get product object
                        var _getProduct = function () {
                            try {
                               return this._product;
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };
                        //Set material object
                        var _setMaterial = function (obj) {
                            try {
                               this._product.material['qr'] = obj['qr'] || '';
                               this._product.material['materialName'] = obj['materialName'] || '';
                               this._product.material['batchNumber'] = obj['batchNumber'] || '';
                               this._product.material['manufacturingDate'] = obj['manufacturingDate'] || '';
                               this._product.material['quantity'] = obj['quantity'] || '';
                               this._product.material['quality'] = obj['quality'] || '';
                               this._product.material['colour_dimensionsqr'] = obj['colour_dimensions'] || '';
                               this._product.material['weight'] = obj['weight'] || '';
                               this._product.material['img_vid_path'] = obj['img_vid_path'] || '';
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };
                        //Get material object
                        var _getMaterial = function () {
                            try {
                               return this._product.material;
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };

                        return {
                            'getProduct': _getProduct,
                            'setProduct': _setProduct,
                            'setMaterial': _setMaterial,
                            'getMaterial': _getMaterial,
                            'resetProduct': _reset
                        }
                    }]);
*/

/*
*	JS for initializing angular module container.
*   Defining controller, model, service for Product functionality.
*/

'use strict';


//All Product screen functionality has been wrapped up inside 'productModule' module
angular.module('productModule', ['ngDialog']);
/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('productModule')

    // Registering/Retreiving/shipping/acknowledging product
    .value('productUrl', {
        'register': 'asset/data/register.json',  // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'products': 'asset/data/productList.json', // TO-DO need to change against WEB API URL
        'materials': 'asset/data/materialList.json', // TO-DO need to change against WEB API URL
        'ship': 'asset/data/register.json',  // TO-DO need to change against WEB API URL
        'acknowledge': 'asset/data/register.json',   // TO-DO need to change against WEB API URL
        /****** below needs to be change. Hardcoded for demo */
        'deleteProd': 'asset/data/deleteProduct.json',   // TO-DO need to change against WEB API URL
        'deleteMat': 'asset/data/deleteMaterial.json'   // TO-DO need to change against WEB API URL
    })

    //Configuring resource for making service call
    .service('productResource', ['$resource', 'productUrl', '__ENV', function ($resource, productUrl, __ENV) {
        return $resource('', {_id: '@productId'}, {
            /****** below needs to be change. Hardcoded for demo */
            productList: { url: __ENV.apiUrl + productUrl.products, method: "GET", isArray: "true" },
            materialList: { url: __ENV.apiUrl + productUrl.materials, method: "GET", isArray: "true" },
            /**************************************************************** */
            registerProduct: { url: __ENV.apiUrl + productUrl.register, method: "GET" },  //  // TO-DO need to change POST
            shipProduct: { url: __ENV.apiUrl + productUrl.ship, method: "GET" },   // TO-DO need to change POST
            ackProduct: { url: __ENV.apiUrl + productUrl.acknowledge, method: "GET" },  // TO-DO need to change POST
            /****** below needs to be change. Hardcoded for demo */
            productDelete: { url: __ENV.apiUrl + productUrl.deleteProd, method: "GET", isArray: "true" }, // TO-DO need to change DELETE
            matDelete: { url: __ENV.apiUrl + productUrl.deleteMat, method: "GET", isArray: "true" } // TO-DO need to change DELETE
        });
    }])

    //Making service call 
    .service('productServiceAPI', ['productResource', 'appConstants', '$q', '$log', function (productResource, appConstants, $q, $log) {
        
        this.registerProduct = function (product) {
            var deferred = $q.defer();
            try{
                productResource
                    .registerProduct(product)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        /****** below needs to be change. Hardcoded for demo */
        this.getProductList = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .productList(data)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        /****** below needs to be change. Hardcoded for demo */
        this.getMaterialList = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .materialList(data)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        /********************************************************** */
         this.shipProduct = function (list) {
            var deferred = $q.defer();
            try{
                productResource
                    .shipProduct(list)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        this.ackProduct = function (list) {
            var deferred = $q.defer();
            try{
                productResource
                    .ackProduct(list)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        /****** below needs to be change. Hardcoded for demo */
        this.productDelete = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .productDelete(data)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        /****** below needs to be change. Hardcoded for demo */
        this.materialDelete = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .matDelete(data)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
    }]);
/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('productModule')

    //For dashboard of logged in user
    .controller('dashboardController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For new product/material resgistration
    .controller('productRegisterController', ['userModel', 'appConstants', '$state', '$rootScope',
        'productServiceAPI', '$log', 'productModel', 'productList', '$scope', 'ngDialog',
        function (userModel, appConstants, $state, $rootScope,
            productServiceAPI, $log, productModel, productList, $scope, ngDialog) {
            try {
                var vm = this;
                productModel.resetProduct();
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                vm.isManufacturer = userModel.isManufacturer();
                vm.isProducer = userModel.isProducer();
                vm.isRetailer = userModel.isRetailer();
                vm.isAdmin = userModel.isAdmin();
                vm.header = vm.isManufacturer ? 'REGISTER NEW PRODUCT' : 'REGISTER NEW MATERIAL';
                $scope.entity = vm.isManufacturer ? 'product' : 'material';
                vm.product = productModel.getProduct();
                vm.list = [];

                //For demo
                vm.userMaterial = vm.product.materialName;

                //Populating list of Products on load based on productList resolve
                productList
                    .$promise
                    .then(function (response) {
                        productModel.setProductList(response);
                        vm.list = productModel.getProductList();
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };
                $scope.redirectUser = function (flag) {
                    ngDialog.close();
                    if (flag) {
                        $state.reload();
                    }
                    else {
                        $state.go('shipment', { tokenId: $scope.randomToken });
                    }
                };
                // Register new Product/material
                vm.registerNewProduct = function () {

                    /*******For Demo instance. Needs to refactor */
                     if (vm.isManufacturer && (vm.userMaterial !== vm.product.materialName)) {
                            showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box');
                            return;
                    }else {
                        vm.product.materialName = vm.userMaterial;
                    }

                    var req = angular.copy(productModel.getProduct());
                    delete req['productList'];

                    productServiceAPI
                        .registerProduct(req)
                        .then(function (response) {
                            //vm.product.setData(response);
                            $rootScope.hasError = false;
                            $scope.randomToken = 'LFG' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.name = vm.isManufacturer ? response.productName : response.materialName;
                            var templateID = vm.isManufacturer ? 'productConfirmation' : 'materialConfirmation';
                            renderProductLineage(ngDialog, $scope, templateID, 600, false, 'ngdialog-theme-default confirmation-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                //Capturing broadcasted event from appProductList directive to implement edit/view
                $scope.$on('edit/view', function (event, msg) {
                    productModel.setProduct(msg.data);
                    vm.product = productModel.getProduct();
                    vm.isReadonly = msg.isEdit ? false : true;
                });

                //Capturing broadcasted event from appProductList directive to implement delete
                $scope.$on('delete', function (event, data) {







                    /****** below needs to be change. Hardcoded for demo */
                    if (vm.isManufacturer) {
                        //Making delete service call
                        productServiceAPI
                            .productDelete({ productId: data.id })
                            .then(function (response) {
                                productModel.setProductList(response);
                                vm.list = productModel.getProductList();
                                $rootScope.hasError = false;
                                $rootScope.isSuccess = true;
                                $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_DELETED : appConstants.MATERIAL_DELETED;
                            }, function (err) {
                                $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            });
                    }


                    /****** below needs to be change. Hardcoded for demo */
                    if (vm.isProducer) {
                        //Making delete service call
                        productServiceAPI
                            .materialDelete({ productId: data.id })
                            .then(function (response) {
                                productModel.setProductList(response);
                                vm.list = productModel.getProductList();
                                $rootScope.hasError = false;
                                $rootScope.isSuccess = true;
                                $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_DELETED : appConstants.MATERIAL_DELETED;
                            }, function (err) {
                                $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            });
                    }
                });
                /********************************************************************** */



                /************** Product Lineage functionality *********************/
                // isShipped value will be 'no'  for manufacturer
                $scope.serviceData = { data: { product: { isShipped: 'no', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }, { name: 'Buckel', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }] } } };
                $scope.lineageData = $scope.serviceData.data;
                $scope.lineageSubData = $scope.lineageData.product.items[0];
                $scope.lineageSubMaterialData = $scope.lineageData.product.items;

                vm.showProductLineage = function () {
                    /****************Retailer************************/
                    if ($scope.lineageData.product.isShipped == 'yes') {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = true;

                        /****************Manufacturer************************/
                    } else if ($scope.lineageData.product.isShipped == 'no') {
                        $scope.isShipped = false;
                        $scope.isShippedToRetailer = false;
                    }
                    else {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = false;
                    }
                    renderProductLineage(ngDialog, $scope, 'externalTemplate.html', '60%', true, 'ngdialog-theme-default lineage-box');
                };


                //For material list
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.materialList = [];
                if (vm.isManufacturer) {
                    vm.dataList = [{ id: 1, label: "Leather - Full Grain" },{ id: 2, label: "Leather - Top Grain" }];
                }

                /*************************************************************** */

            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);

function displayModelDialog(ngDialog, $scope, templateID) {
    ngDialog.open({
        scope: $scope,
        width: 600,
        template: templateID,
        closeByDocument: false
    });

};

function renderProductLineage(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};
/*
**  product Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('productModule')

    //For shipment of registered products
    .controller('productShipController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI',
        '$log', 'productModel', 'ngDialog', '$scope', 'userServiceAPI',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI,
            $log, productModel, ngDialog, $scope, userServiceAPI) {
            try {
                var vm = this;
                productModel.resetProduct();
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isProducer = userModel.isProducer();
                vm.isRetailer = userModel.isRetailer();
                vm.isAdmin = userModel.isAdmin();
                vm.product = productModel.getProduct();
                vm.userQuantity = "";
                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.exampleModel = [];
                if (vm.isManufacturer) {
                    vm.data = [{ id: 1, label: "Retailer1" }, { id: 2, label: "Retailer2" },{ id: 5, label: "Retailer3" }, { id: 6, label: "Distributer1" }, { id: 7, label: "Distributer2" }];
                }
                if (vm.isProducer) {
                    vm.data = [{ id: 1, label: "Manufacturer1" }, { id: 2, label: "Manufacturer2" }, { id: 3, label: "Manufacturer3" },
                        { id: 4, label: "Manufacturer4" }];
                }

                $scope.redirectUser = function (flag) {
                    ngDialog.close();
                    var userReq = {
                        id: vm.isManufacturer ? 'retailer' : vm.isProducer ? 'manufacturer' : ''
                    }
                    userServiceAPI
                        .login(userReq)
                        .then(function (response) {
                            userModel.setUser(response.user);
                            $state.go('acknowledge');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        });
                };

                vm.doProductShipment = function () {

                    if (!(isNaN(parseInt(vm.userQuantity, 10)))) {
                        if (parseInt(vm.userQuantity) > parseInt(vm.product.quantity)) {
                            showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box');
                            return;
                        }
                    } else {
                        showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box');
                        return;
                    }
                    vm.product.quantity = vm.userQuantity;
                    // do Product/material shipment
                    productServiceAPI
                        .shipProduct(vm.product)
                        .then(function (response) {
                            //productModel.setProduct(response.shipmentDetails);
                            //vm.product = productModel.getProduct();
                            $rootScope.hasError = false;
                            /*$rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = "Product has been shipped successfully";
                            */
                            //displayModelDialog(ngDialog, $scope, '');
                            //Hardcoded. Need to remove
                            $scope.randomToken = 'LFG' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.name = vm.isManufacturer ? response.productName : response.materialName;
                            $scope.quality = response.quality;
                            var templateID = vm.isManufacturer ? 'productShipConfirmation' : 'materialShipConfirmation';
                            ngDialog.open({
                                scope: $scope,
                                width: 600,
                                showClose: true,
                                template: templateID
                            });
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };




                /***** Product Lineage functionality */
                // isShipped value will be 'pending' for manufacturer
                //Hardcoded. Need to remove
                $scope.serviceData = { data: { product: { isShipped: 'pending', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }, { name: 'Buckel', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }] } } };
                $scope.lineageData = $scope.serviceData.data;
                $scope.lineageSubData = $scope.lineageData.product.items[0];
                $scope.lineageSubMaterialData = $scope.lineageData.product.items;

                vm.showProductLineage = function () {
                    if ($scope.lineageData.product.isShipped === 'yes') {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = true;
                    } else if ($scope.lineageData.product.isShipped === 'no') {
                        $scope.isShipped = false;
                        $scope.isShippedToRetailer = false;
                    }
                    else {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = false;
                    }

                    var dialog = ngDialog.open({
                        scope: $scope,
                        width: '60%',
                        showClose: true,
                        template: 'externalTemplate.html',
                        className: 'ngdialog-theme-default lineage-box'
                    });
                };

                /*************************************************************** */



            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);

function showWarning(ngDialog, templateID, width, showClose, className) {
    ngDialog.open({
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};


function displayModelDialog(ngDialog, scope, templateID) {
    ngDialog.open({
        scope: scope,
        width: 400,
        template: '',
        plain: true
    });
}
/*
**  controller for tracking shipment details and displaying result
*/

"use strict";

angular.module('searchModule')
    // searchController for tracking shipment details
    .controller('searchController', ['$state', 'appConstants', 'userModel', '$log', '$rootScope',
        '$scope', '$stateParams', 'userInfo', 'shipmentList', 'productModel',
        function ($state, appConstants, userModel, $log, $rootScope,
            $scope, $stateParams, userInfo, shipmentList, productModel) {
            try {
                var vm = this;
                vm.searchQuery = '';
                vm.user = userModel.getUser();

                // Only for demo instance
                if (userInfo.user) {
                    vm.user = userInfo.user;
                    userModel.setUser(userInfo.user);
                }

                vm.isManufacturer = userModel.isManufacturer();
                vm.isProducer = userModel.isProducer();
                vm.isRetailer = userModel.isRetailer();
                vm.isAdmin = userModel.isAdmin();
                //Capturing broadcasted event from qrCodeReader directive to retreive User info read from uploaded QR img.
                $scope.$on('readQR', function (event, trackInfo) {
                    $rootScope.hasError = false;
                    $rootScope.ERROR_MSG = appConstants.UPLOAD_ERR;
                    if (trackInfo) {
                        $state.go('home.result', { id: "", trackInfo: trackInfo });
                    }
                });
                //Capturing broadcasted event from qrCodeReader directive to display error.
                $scope.$on('QRError', function (event) {
                    $rootScope.hasError = true;
                });

                vm.searchTrackID = function () {
                    $state.go('home.result', { id: vm.searchQuery, trackInfo: null });
                };
                /******************************* */



                productModel.resetProduct();
                vm.product = productModel.getProduct();
                //Populating shipment details on load based on shipmentDetails resolve
                //shipmentList will be 'null' for other than producer/manufacturer
                if(shipmentList){
                    shipmentList
                        .$promise
                        .then(function (response) {
                            productModel.setProductList(response);
                            vm.list = productModel.getProductList();
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }






            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    // searchResultController for rendering shipment details
    .controller('searchResultController', ['$state', 'appConstants', '$log', 'shipmentDetails', 'productModel', '$stateParams',
        function ($state, appConstants, $log, shipmentDetails, productModel, $stateParams) {
            try {
                var vm = this;
                productModel.resetProduct();
                vm.product = productModel.getProduct();
                vm.tokenID = ($stateParams.id && $stateParams.id !== '') ? $stateParams.id : '';

                //Populating shipment details on load based on shipmentDetails resolve
                shipmentDetails
                    .$promise
                    .then(function (response) {
                        productModel.setProduct(response);
                        vm.product = productModel.getProduct();
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);        
/*
*	JS for initializing angular module container.
*   Defining controller, model, service for Search/Home functionality.
*/

'use strict';


// Home/Screen screen has been wrapped up inside 'searchModule' module
angular.module('searchModule', []);
/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('searchModule')

    //Registering shipment track url
    .value('shipmentUrl', {
        'track': 'asset/data/track.json', // TO-DO replace with WEB API URL
        'productShipments': 'asset/data/productShipmentList.json', // TO-DO replace with WEB API URL
        'materialShipments': 'asset/data/materialShipmentList.json' // TO-DO replace with WEB API URL
    })

    //Configuring resource for making service call
    .service('trackResource', ['$resource', 'shipmentUrl', '__ENV', function ($resource, shipmentUrl, __ENV) {
        return $resource('', {}, {
            trackShipment: { url: __ENV.apiUrl + shipmentUrl.track, method: "GET" },
            /****** below needs to be change. Hardcoded for demo */
            productShipmentRecords: { url: __ENV.apiUrl + shipmentUrl.productShipments, method: "GET", isArray: true },
            materialShipmentRecords: { url: __ENV.apiUrl + shipmentUrl.materialShipments, method: "GET", isArray: true }  
        });
    }])

    //Making service call for searching shipment details
    .service('searchServiceAPI', ['trackResource', '$q', 'appConstants', '$log', function (trackResource, $q, appConstants, $log) {
        this.search = function (searchObj) {
            var deferred = $q.defer();
            try {
                trackResource
                    .trackShipment({ id: searchObj.id })
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        /****** below needs to be change. Hardcoded for demo */
        this.getProductShipmentList = function (user) {
            var deferred = $q.defer();
            try {
                trackResource
                    .productShipmentRecords(user)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

        /****** below needs to be change. Hardcoded for demo */
        this.getMaterialShipmentList = function (user) {
            var deferred = $q.defer();
            try {
                trackResource
                    .materialShipmentRecords(user)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };

    }]);
/*
**  userController for handling user login/registration business logic 
*/

"use strict";

angular.module('userModule')
    .controller('userController', ['userModel', 'userServiceAPI', 'appConstants', '$state',
        '$log', '$rootScope', '$scope', '$stateParams', '$sce',
        function (userModel, userServiceAPI, appConstants, $state,
            $log, $rootScope, $scope, $stateParams, $sce) {

            var vm = this;
            if (!userModel.isLoggedIn) {
                userModel.resetUser();
            }
            vm.newUserObject = {};

            //Only for Demo instance
            vm.header = 'LOGIN';
            vm.user = {};
            vm.file = {
                name: "Upload QR"
            }
            vm.displayBtn = false;
            vm.uploadFile = function (file, event) {
                if (file) {
                    vm.displayBtn = true;
                    var imageType = /^image\//;
                    if (!imageType.test(file.type)) {
                        vm.uploadErr = true;
                        $rootScope.ERROR_MSG = appConstants.UPLOAD_ERR;
                        return;
                    }
                    vm.uploadErr = false;
                    vm.file = file;
                }
            }
            vm.doLogin = function () {
                $state.go('home', { role: window.profile });
            };
            /***************************************** */

        }])
    .controller('logoutController', ['userModel', 'appConstants', '$state', '$rootScope', '$log',
        function (userModel, appConstants, $state, $rootScope, $log) {
            try {
                var vm = this;
                userModel.resetUser();
                $rootScope.isLoggedIn = false;
                $state.go('home');
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);
/*
**  User Object pojo model for capturing user details
*/

"use strict";

angular.module('userModule')
    .factory('userModel', ['localStorageService', 'appConstants', '$log',
        function (localStorageService, appConstants, $log) {

            // Only for demo instance.
            var _init = {
                userName: '',
                certification: '',
                consortium: {
                    id: '',
                    name: ''
                },
                userProfile: {
                    id: '',
                    profile: ''
                },
                isAuthenticatedUser: false,
                password: '' // TO-DO added for implementing login functionality. needs to replace with actual.

            };

            var _user = {};

            //Reset user object on logout
            var _reset = function () {
                try {
                    this._user = angular.copy(_init);
                    localStorageService.remove('User');
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._user;
            };
            //Set user object
            var _setUserDetails = function (obj) {
                try {
                    this._user = obj;
                    localStorageService.set('User', angular.toJson(this._user));
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get user object
            var _getUserDetails = function () {
                try {
                    this._user = angular.fromJson(localStorageService.get('User')) || angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._user;
            };

            //Verify user logged in or not
            var _isUserLoggedIn = function () {
                return this._user.isAuthenticatedUser;
            };

            //Utility methods to check user role
            var _isAdmin = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.admin ? true : false);
            };
            var _isProducer = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.producer ? true : false);
            };
            var _isManufacturer = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.manufacturer ? true : false);
            };
            var _isRetailer = function () {
                return (this._user.isAuthenticatedUser && this._user.userProfile.id === appConstants.USER_ROLES.retailer ? true : false);
            };

            //Method to retreive user profile object
            var _getUserProfile = function () {
                return this._user.userProfile;
            };

            return {
                'getUser': _getUserDetails,
                'setUser': _setUserDetails,
                'isLoggedIn': _isUserLoggedIn,
                'getUserProfile': _getUserProfile,
                'isAdmin': _isAdmin,
                'isProducer': _isProducer,
                'isManufacturer': _isManufacturer,
                'isRetailer': _isRetailer,
                'resetUser': _reset
            }
        }]);

/*
*	JS for initializing angular module container.
*   Defining controller, model, service for User functionality.
*/

'use strict';


// User login and session functionality has been wrapped up inside 'userModule' module
angular.module('userModule', []);
/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('userModule')

    //Registering user login/register url
    .value('userUrl', {
        'login': 'asset/data/login.json', // TO-DO change it WEB API URL
        'register': 'api/register'
    })

    //Configuring resource for making service call
    .service('userResource', ['$resource', 'userUrl', '__ENV', function ($resource, userUrl, __ENV) {
        return $resource('', {}, {
            authenticateUser: { url: __ENV.apiUrl + userUrl.login, method: "GET" }, // TO-DO change it to POST
            registerUser: { url: __ENV.apiUrl + userUrl.register, method: "GET" },  // TO-DO change it to POST
        });
    }])

    //Making service call for user login/register
    .service('userServiceAPI', ['userResource', 'appConstants', '$q', '$log', function (userResource, appConstants, $q, $log) {
        
        this.register = function (user) {
            var deferred = $q.defer();
            try{
                userResource
                    .registerUser(user)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        this.login = function (user) {
            var deferred = $q.defer();
            try{
                userResource
                    .authenticateUser(user)
                    .$promise
                    .then(function (response) {
                    /*****
                     *  It's a temporary solution. This has to be removed in future once WEB API is up
                     */
                    if(angular.equals(user.id, 'manufacturer')){
                        response.user.userName = 'Azim';
                        response.user.userProfile.id = 'MANUFACT';
                        response.user.userProfile.profile = 'Manufacturer';
                        response.user.userProfile.alias = "Manufacturer";
                    }
                    if(angular.equals(user.id, 'retailer')){
                        response.user.userName = 'Macy';
                        response.user.userProfile.id = 'RETAIL';
                        response.user.userProfile.profile = 'Retailer';
                        response.user.userProfile.alias = "Retailer";
                    }
                    /**************************** */
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        }
    }]);