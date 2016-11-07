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

    //Directive for table section for product/material list
    .directive('appProductlist', ['NgTableParams', 'userModel', function (NgTableParams, userModel) {
        return {
            restrict: 'E',
            templateUrl: '../views/productList.tpl.html',
            scope: {
                list: '=',
                title: '@'
            },
            link: function (scope, element, attrs) {
                scope.customConfigParams = createUsingFullOptions();
                scope.userProfile = populateUserProfile(userModel);

                function createUsingFullOptions() {
                    var initialParams = {
                        count: 5 // initial page size
                    };
                    var initialSettings = {
                        // page size buttons (right set of buttons in demo)
                        counts: [],
                        // determines the pager buttons (left set of buttons in demo)
                        paginationMaxBlocks: 13,
                        paginationMinBlocks: 2,
                        dataset: scope.list
                    };
                    return new NgTableParams(initialParams, initialSettings);
                };
                function populateUserProfile(userModel) {
                    return {
                        isAdmin: userModel.isAdmin(),
                        isProducer: userModel.isProducer(),
                        isManufacturer: userModel.isManufacturer(),
                        isRetailer: userModel.isRetailer()
                    }
                };
            }
        }
    }])

    .directive("appTopMenu", ['userModel', '$state', function (userModel, $state) {
        return {
            restrict: 'E',
            templateUrl: '../views/topmenu.tpl.html',
            link: function (scope, element, attrs) {
                var id = "";
                function populateUserProfile(userModel) {
                    id = userModel.isManufacturer() ? "Manufacturer" : userModel.isProducer() ? "Producer" 
                            : userModel.isRetailer() ? "Retailer" : "";
                    return {
                        isAdmin: userModel.isAdmin(),
                        isProducer: userModel.isProducer(),
                        isManufacturer: userModel.isManufacturer(),
                        isRetailer: userModel.isRetailer()
                    }
                };
                scope.userProfile = populateUserProfile(userModel);

                scope.onSelect = function (event) {
                    if (event.srcElement.id === id) {
                        return;
                    } else {
                        id = event.srcElement.id;
                        userModel.resetUser();
                        $state.go("login", {msg: "<span>Please Login to view as " + id +"</span>"});
                    }
                };
            }
        }
    }]);
