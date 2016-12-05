'use strict';

angular.module('bverifyApp')

//Directive for rendering module section
.directive('appDatepicker', ['appConstants', function (appConstants) {
    return {
        restrict: 'E',
        templateUrl: 'views/datepicker.tpl.html',
        scope: {
            datePickerData: '=',
            isExpiryDate: '@?'
        },
        link: function (scope, element, attrs) {

            scope.$watch('date', function () {
                scope.datePickerData = scope.date;
            });

            try {
                scope.vm = {};
                scope.vm.datepickerObj = {
                    dateFormat: 'dd/MM/yyyy',
                    dateOptions: {
                        startingDay: 1,
                        showWeeks: false,
                        maxDate: !scope.isExpiryDate ? new Date() : null,
                        minDate: scope.isExpiryDate ? new Date() : null,
                    },
                    popup: {
                        opened: false
                    }
                };
                if (scope.datePickerData !== null && angular.isDefined(scope.datePickerData) && scope.datePickerData !== "") {
                    scope.array = scope.datePickerData.split('/');
                    var month = scope.array[0] - 1;
                    scope.date = new Date(scope.array[2], month, scope.array[1]);
                } else {
                    scope.date = new Date();
                }
                scope.openDatepicker = function () {
                    scope.vm.datepickerObj.popup.opened = true;
                };
            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }
    }
}])


.directive('appFileuploader', [function () {
    return {
        restrict: 'E',
        templateUrl: '../views/fileUpload.tpl.html',
        scope: {
            file: '=',
            upload: '&'
        },
        link: function (scope, element, attrs) {}
    }
}])

.directive("appTopMenu", ['userModel', '$state', function (userModel, $state) {
    return {
        restrict: 'E',
        templateUrl: '../views/topmenu.tpl.html',
        link: function (scope, element, attrs) {
            var id = "";
            id = userModel.isManufacturer() ? "manufacturer" : userModel.isProducer() ? "producer" :
                userModel.isRetailer() ? "retailer" : "producer";

            scope.userProfile = populateUserProfile(userModel);
            scope.onSelect = function (event) {
                if (event.srcElement)
                    id = event.srcElement.id;
                if (event.target)
                    id = event.target.id;
                // For demo instance
                $state.go("landing", {
                    role: id
                });
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
                    scope.activeMenu = populateSideMenu($rootScope.activeMenu);
                    scope.a = false;
                    scope.openNav = function () {
                        if (scope.a == true) {
                            $('#mySidenav').animate({
                                marginRight: '-165px'
                            }, 500); //for sliding animation
                            scope.a = false;
                        } else {
                            $('#mySidenav').animate({
                                marginRight: '0px'
                            }, 500); //for sliding animation
                            scope.a = true;
                        }
                    }
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            }
        }
    }
])

//Directive for table section for product/material list
.directive('appRegistrationList', function () {
    return {
        restrict: 'E',
        templateUrl: '../views/registrationList.tpl.html',
        scope: {
            list: '=',
            title: '@',
            isRegisterScreen: '@?',
            isProcureScreen: '@?',
            edit: '&?',
            view: '&?',
            delete: '&?',
            procure: '&?',
            showLineage: '&?',
            rowSelected: '&?'
        },
        link: function (scope, element, attrs) {},
        controller: function ($scope, $element, $attrs, $transclude, NgTableParams, userModel, ngDialog) {
            var self = this;
            self.userProfile = populateUserProfile(userModel);
            self.customConfigParams = createUsingFullOptions();

            /************************************************** */

            $scope.$watchCollection('list', function (newNames, oldNames) {
                self.customConfigParams = createUsingFullOptions();
            });

            $scope.header = {
                selectedRows: false
            };
            if ($scope.$parent.ifRow) {
                $scope.ifRow = $scope.$parent.ifRow;
                $scope.ifRow.listOfSelectedRows = $scope.$parent.parentSelectedRows;

                $scope.selectedRow = function (data, flag) {
                    if ($scope.ifRow.listOfSelectedRows.indexOf(data.qrCode) === -1) {
                        $scope.ifRow.listOfSelectedRows.push(data.qrCode);
                        data.selectedRows = true;
                    } else {
                        var deleteItem = $scope.ifRow.listOfSelectedRows.indexOf(data.qrCode);
                        if (deleteItem > -1) {
                            $scope.ifRow.listOfSelectedRows.splice(deleteItem, 1);
                            data.selectedRows = false;
                        }
                    }
                };

                $scope.selectAllRows = function (list, flag) {
                    $scope.selectedRows = $scope.selectedRows ? false : true;
                    if (!flag) {
                        $scope.ifRow.listOfSelectedRows = [];
                        $scope.header.selectedRows = false;
                        $scope.selectedRows = false;
                    }
                    if ($scope.selectedRows) {
                        $scope.header.selectedRows = true;
                        angular.forEach(list, function (value, key) {
                            value.selectedRows = true;
                            if ($scope.ifRow.listOfSelectedRows.indexOf(value.qrCode) === -1) {
                                $scope.ifRow.listOfSelectedRows.push(value.qrCode);
                                value.selectedRows = true;
                            } else {
                                // var deleteItem = $scope.listOfSelectedRows.indexOf(value.qrCode);
                                // if (deleteItem > -1) {
                                // $scope.listOfSelectedRows.splice(deleteItem, 1);
                                // value.selectedRows = false;
                                // }
                                //$scope.header.selectedRows = false;
                            }
                        });
                    } else {
                        $scope.ifRow.listOfSelectedRows = [];
                        $scope.header.selectedRows = false;
                        angular.forEach(list, function (value, key) {
                            value.selectedRows = false;
                        });
                    }
                }
            }

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


function populateUserProfile(userModel) {
    return {
        isAdmin: userModel.isAdmin(),
        isProducer: userModel.isProducer(),
        isManufacturer: userModel.isManufacturer(),
        isRetailer: userModel.isRetailer()
    }
};

function populateSideMenu(menu) {
    return {
        dashboard: menu === '/dashboard' ? true : false,
        userRegister: menu === '/register' ? true : false,
        prodRegister: menu === '/product/register' ? true : false,
        matRegister: menu === '/material/register' ? true : false,
        prodShip: menu === '/product/ship' ? true : false,
        matShip: menu === '/material/ship' ? true : false,
        trackShip: menu === '/home' ? true : false,
        prodProcure: menu === '/product/procure' ? true : false,
        matProcure: menu === '/material/procure' ? true : false,
        rmBatch: menu === '/material/batch' ? true : false
    }
};