/*
*   All application related routing and authentication has been wrapped up inside 'appRoute' module
*/
'use strict';

var _self = this;

angular
    .module('appRoute', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {

            $urlRouterProvider.otherwise('landing');

            $stateProvider
                // HOME STATES AND NESTED VIEWS 
                .state('home', {
                    url: '/home',
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
                            controllerAs: 'vm',
                            controller: 'searchController'
                        }
                    },
                    /*params: {
                        role: window.profile
                    },
                    /****** below needs to be change. This has to be justify more when service gets ready */
                    resolve: {
                        /*  userInfo: function ($stateParams, userServiceAPI, searchServiceAPI, userModel) {
                              return $stateParams.role ? userServiceAPI.login({ id: $stateParams.role }) : "";
                          },*/
                        shipmentList: function ($stateParams, searchServiceAPI, userModel) {
                            var user = userModel.getUser();
                            if (userModel.isProducer()) {
                                return searchServiceAPI.getMaterialShipmentList({
                                    userName: user.userName,
                                    userProfile: user.userProfile
                                });
                            }
                            if (userModel.isManufacturer()) {
                                return searchServiceAPI.getProductShipmentList({
                                    userName: user.userName,
                                    userProfile: user.userProfile
                                });
                            }
                            else {
                                return null;
                            }
                        }
                    }
                })
                .state("home.result", {
                    url: '/result',
                    templateUrl: '../modules/search/searchResult.tpl.html',
                    params: {
                        id: '',
                        qrCode: null,
                        tokenInfo: null
                    },
                    //Resolve added to retreive shipmentDetails before loading searchResultController
                    resolve: {
                        shipmentDetails: function ($stateParams, searchServiceAPI, appConstants) {
                            if ($stateParams.tokenInfo) {
                                return $stateParams.tokenInfo;
                            } else {
                                return searchServiceAPI.search($stateParams.qrCode ? $stateParams.qrCode : $stateParams.id);
                            }
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
                    controller: 'registerController'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: '../modules/user/login.tpl.html',
                    params: {
                        id: window.profile // default value
                    },
                    /*************************************** */
                    controllerAs: 'vm',
                    controller: 'loginController'
                })
                .state('logout', {
                    url: '/home',
                    controllerAs: 'vm',
                    controller: 'logoutController'
                })
                .state('dashboard', {
                    url: '/dashboard',
                    templateUrl: '../modules/dashboard/dashboard.tpl.html',
                    controllerAs: 'vm',
                    controller: 'dashboardController'
                })
                .state('landing', {
                    url: '/landing',
                    templateUrl: '../modules/landing/landing.tpl.html',
                    controllerAs: 'vm',
                    controller: 'landingController',
                    params: {
                        role: window.profile
                    },
                    resolve: {
                        userInfo: function ($stateParams, userServiceAPI) {
                            return $stateParams.role ? userServiceAPI.login({ id: $stateParams.role }) : "";
                        }
                    }
                })

                /************************** FOR MATERIAL STATES **********************************/
                .state('materialReg', {
                    url: '/material/register',
                    templateUrl: '../modules/material/register.tpl.html',
                    //Resolve added to retreive registered material List before loading material register screen
                    resolve: {
                        materialList: function (userModel, registerMaterialService) {
                            var user = userModel.getUser();
                            return registerMaterialService.getMaterialList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'registerMaterialController'
                })

                .state('materialBatch', {
                    url: '/material/batch',
                    templateUrl: '../modules/material/batch.tpl.html',
                     params: {
                        qrCode: null,
                    },
                    resolve: {
                        materialList: function (userModel, batchMaterialService) {
                            var user = userModel.getUser();
                            return batchMaterialService.getMaterialList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });

                        }
                    },
                    controllerAs: 'vm',
                    controller: 'batchMaterialController'
                })

                .state('materialShip', {
                    url: '/material/ship',
                    templateUrl: '../modules/material/ship.tpl.html',
                    params: {
                        qrCode: null,
                    },
                    controllerAs: 'vm',
                    controller: 'shipMaterialController'
                })

                .state('materialAck', {
                    url: '/material/procure',
                    templateUrl: '../modules/material/procure.tpl.html',
                    //Resolve added to retreive registered material List before loading material register screen
                    resolve: {
                        materialList: function (userModel, procureMaterialService) {
                            var user = userModel.getUser();
                            return procureMaterialService.getMaterialList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'procureMaterialController'
                })

                .state('productReg', {
                    url: '/product/register',
                    templateUrl: '../modules/product/register.tpl.html',
                    //Resolve added to retreive registered material List before loading material register screen
                    resolve: {
                        productList: function (userModel, registerService) {
                            var user = userModel.getUser();
                            return registerService.getProductList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });
                        },
                        materialList: function (userModel, registerService) {
                            var user = userModel.getUser();
                            return registerService.getMaterialList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'registerProductController'
                })

                .state('productShip', {
                    url: '/product/ship',
                    templateUrl: '../modules/product/ship.tpl.html',
                    params: {
                        qrCode: null,
                    },
                    controllerAs: 'vm',
                    controller: 'shipProductController'
                })

                .state('productAck', {
                    url: '/product/procure',
                    templateUrl: '../modules/product/procure.tpl.html',
                    //Resolve added to retreive registered material List before loading material register screen
                    resolve: {
                        productList: function (userModel, procureService) {
                            var user = userModel.getUser();
                            return procureService.getProductList({
                                userName: user.userName,
                                userProfile: user.userProfile
                            });
                        }
                    },
                    controllerAs: 'vm',
                    controller: 'procureProductController'
                })

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
                                $state.go('landing');
                            }
                        }
                        if (angular.equals(toState.name, 'landing') && angular.equals(fromState.name, '')) {
                            userModel.resetUser();
                        }
                    } catch (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    }
                });

        }]);
