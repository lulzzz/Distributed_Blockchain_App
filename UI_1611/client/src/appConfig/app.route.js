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
