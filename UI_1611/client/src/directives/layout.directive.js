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

    //Directive for rendering legend section
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
    
    //Directive for QR code uploader/reader.
    .directive('qrCodeReader', ['userModel', 'appConstants', '$log', 
        function (userModel, appConstants, $log) {

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
                                scope.$emit('readQR', result);
                            }
                            else {
                                scope.$emit('QRError');
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