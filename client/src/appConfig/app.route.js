/*
*   All application related routing and authentication has been wrapped up inside 'appRoute' module
*/
'use strict';

var _self = this;

angular
    .module('appRoute', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {

            $urlRouterProvider.otherwise('/home');

            $stateProvider
                // HOME STATES AND NESTED VIEWS 
                .state('home', {
                    url: '/home',
                    templateUrl: '../modules/search/search.tpl.html',
                    controllerAs: 'vm',
                    controller: 'searchController'
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
                        shipmentDetails: function($stateParams, searchServiceAPI, appConstants) {
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
                    params: {
                        msg: '',
                        view: null
                    },
                    controllerAs: 'vm',
                    controller: 'userController'
                })
                .state('logout', {
                    url: '/home',
                    controllerAs: 'vm',
                    controller: 'logoutController'
                })
                //Below has to comment out when dashboad screen gets ready. After login/register user will see it's dashboad. 
                .state('dashboard', {
                    url: '/dashboard',
                    templateUrl: '../modules/product/dashboard.tpl.html',
                    controllerAs: 'vm',
                    controller: 'dashboardController'
                })

                // PRODUCT REGISTER/SHIPMENT/ACKNOWLEDGMENT STATES
                .state('product', {
                    url: '/product/register',
                    templateProvider: function(userModel, $templateFactory) {
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
                        productList: function(userModel, productServiceAPI) {
                            const user = userModel.getUser();
                            return productServiceAPI.getProductList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'productRegisterController'
                })
                .state('shipment', {
                    url: '/product/ship',
                    templateProvider: function(userModel, $templateFactory) {
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
                        productList: function(userModel, productServiceAPI) {
                            const user = userModel.getUser();
                            return productServiceAPI.getProductList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'productAckController'
                });


            // use the HTML5 History API
            $locationProvider.html5Mode(true);
        }])


    .run(['$rootScope', 'userModel', '$state', 'appConstants', '$log', 
        function($rootScope, userModel, $state, appConstants, $log) {

            $log.debug('appRoute bootstrapped!');

            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                    try {
                        $rootScope.activeMenu = toState.url;
                        $rootScope.hasError = false;
                        $rootScope.isSuccess = false;
                        // Authenticating user. Maintaining session on each route
                        const user = userModel.getUser();
                        if (!(appConstants.ROUTE_STATES_CONSTANTS.indexOf(toState.name) >= 0)) {
                            if (user === null || !user.isAuthenticatedUser) {
                                $rootScope.isLoggedIn = false;
                                event.preventDefault();
                                $state.go('home');
                            }
                        }
                    } catch (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    }
                });

            $rootScope.reset = function() {
                $rootScope.hasError = false;
                $rootScope.isSuccess = false;
            };
        }]);
