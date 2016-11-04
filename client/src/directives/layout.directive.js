'use strict';

angular.module('bverifyApp')

    //Directive for rendering header section
    .directive('appHeader', function () {
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
            }
        }
    })

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
            template: '<legend class="legendHead">{{:: header}}</legend>',
            scope: {
                header: '@'
            },
            link: function (scope, element, attrs) {

            }
        }
    })

    //Directive for displaying/hiding loading on http request/response
    .directive("appLoader", ['$rootScope', function ($rootScope) {
        return {
            restrict: 'E',
            templateUrl: '../views/loader.tpl.html',
            link: function ($scope, element, attrs) {
                $rootScope.$on("loaderShow", function () {
                    return element.removeClass('displayNone');
                });
                return $rootScope.$on("loaderHide", function () {
                    return element.addClass('displayNone');
                });
            }
        }
    }])

    //Directive for Side Menu Section
    .directive('sideMenu', ['$rootScope', 'userModel', 'appConstants', '$log',
        function ($rootScope, userModel, appConstants, $log) {

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
        }])

    //Directive for rendering module section
    .directive('appDatepicker', function () {
        return {
            restrict: 'E',
            templateUrl: '../views/datepicker.tpl.html',
            link: function (scope, element, attrs) {
                try {
                    scope.vm.datepickerObj = {
                        dateFormat: 'dd-MM-yyyy',
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

    .directive('appFileuploader', function () {
        return {
            restrict: 'E',
            templateUrl: '../views/fileUpload.tpl.html',
            link: function (scope, element, attrs) {
                
            }
        }
    });