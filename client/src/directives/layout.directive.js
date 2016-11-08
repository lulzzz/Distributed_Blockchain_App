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
            template: '<legend class="legendHead" ng-bind-html="header"></legend>',
            scope: {
                header: '@'
            },
            link: function (scope, element, attrs) {

            }
        }
    })

    //Directive for rendering module section
    .directive('uploadDialog', ['$rootScope', 'ngDialog', function ($rootScope, ngDialog) {
        return {
            restrict: 'E',
            templateUrl: '../modules/search/uploadDialog.tpl.html',
            link: function (scope, element, attrs) {
                scope.searchQR = function(){
                    $rootScope.$broadcast('searchQR');
                };
                scope.reset = function(){
                    ngDialog.close();
                }
            }
        }
    }])

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


    //Directive for QR code uploader/reader. Login screen
    .directive('qrCodeReader', ['$rootScope', 'userModel', 'appConstants', '$log',
        function ($rootScope, userModel, appConstants, $log) {

            return {
                restrict: 'E',
                templateUrl: '../views/fileUpload.tpl.html',
                link: function (scope, element, attrs) {
                    try {
                        //Initialize file object
                        scope.file = {
                            name : "Upload QR Code"
                        };

                        var qr = new QrCode();
                        //QR callback function gets called once uploaded qr decoded
                        qr.callback = function (result, err) {
                            if (result) {
                                //Broadcasting event and data user info after successfull reading of QR code
                                $rootScope.$broadcast('readQR', result);
                            }
                            else {
                                console.log(appConstants.FUNCTIONAL_ERR, err);
                            }
                        };
                        scope.uploadFile = function (file, event) {
                            scope.vm.hasUploadErr = false;
                            event.preventDefault();
                            if (file) {
                                scope.file = file;
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