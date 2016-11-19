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

    .directive('appFileuploader', [ function () {
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
                    scope.$emit('fileUpload', scope.file);
                }
            }
        }
    }])

    .directive("appTopMenu", ['userModel', '$state', function (userModel, $state) {
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
                isRegisterScreen: '@?',
                isProcureScreen: '@?',
                editProduct: '&?',
                viewProduct: '&?',
                deleteProduct: '&?',
                procureProduct: '&?',
                showProductLineage: '&?'
            },
            link: function (scope, element, attrs) {
            },
            controller: function ($scope, $element, $attrs, $transclude, NgTableParams, userModel, ngDialog) {
                var self = this;
                self.userProfile = populateUserProfile(userModel);
                self.customConfigParams = createUsingFullOptions();

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
                title: '@',
                getShipmentDetails: '&'
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