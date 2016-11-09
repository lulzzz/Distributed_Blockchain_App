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