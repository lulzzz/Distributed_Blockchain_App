/*
**  ship Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('productModule')

    //For shipment of registered products
    .controller('shipProductController', ['userModel', 'appConstants', '$state', '$rootScope', 'shipService',
        '$log', 'ngDialog', '$scope', 'userServiceAPI', '$stateParams', 'shipProductModel',
        function (userModel, appConstants, $state, $rootScope, shipService,
            $log, ngDialog, $scope, userServiceAPI, $stateParams, shipProductModel) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                bverifyUtil.setUserProfile(vm, userModel);
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.productList = [];

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };

                //if ($stateParams.qrCode) { for time being
                shipService
                    .getProduct($stateParams.id)
                    .then(function (response) {
                        shipProductModel.setModel(response);
                        vm.ship = shipProductModel.getModel();
                        vm.productList.push({
                            id: vm.ship.id,
                            productName: vm.ship.productName,
                            batchNumber: vm.ship.batchNumber
                        })
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
                /*} else {  for time being
                    shipService
                        .getProductList(vm.user)
                        .then(function (response) {
                            vm.productList = response;
                            shipProductModel.setModel(vm.productList[0]);
                            vm.ship = shipProductModel.getModel();
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }*/



                /****************** Distributer/Retailer Multiselect functionality *******************/
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.selectedRetailers = [];

                //Retreive all retailer list and populate inside Multiselect
                shipService
                    .getRetailerList(vm.user)
                    .then(function (response) {
                        vm.retailerList = response;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                vm.showLineage = function (data) {

                    shipService
                        .getShipLineageData(data)
                        .then(function (response) {
                            $scope.lineageData = response.data;
                            $scope.lineageSubData = $scope.lineageData.product.items[0];
                            $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            bverifyUtil.openModalDialog(ngDialog, $scope, 'ship-lineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                /****************** material Shipment functionality *******************/
                vm.shipProduct = function () {

                    if (vm.selectedRetailers.length <= 0) {
                        $rootScope.hasError = true;
                        vm.showRedBox = true;
                        $rootScope.ERROR_MSG = 'Please select atleast one Distributer/Retailer.';
                        return;
                    } else {
                        $rootScope.hasError = false;
                        vm.showRedBox = false;
                    }

                    if (shipProductModel.verifyQuantity(vm.ship.quantity, vm.userQuantity)) {
                        vm.ship.quantity = vm.userQuantity;
                    } else {
                        $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                        bverifyUtil.openModalDialog(ngDialog, $scope, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box');
                        return;
                    }

                    shipProductModel.setModel(vm.ship);
                    shipProductModel.shippedTo(vm.selectedRetailers);

                    // do product shipment
                    shipService
                        .shipProduct(shipProductModel.getModel())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.qrCode = 'CCTH' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.productName = vm.ship.productName;
                            bverifyUtil.openModalDialog(ngDialog, $scope, 'product-ship-confirmBox', 600, false, 'ngdialog-theme-default');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                /****************** Confirmation box functionality *******************/
                $scope.redirectUser = function (flag) {
                    ngDialog.close();
                    var userReq = {
                        id: 'retailer'
                    }
                    userServiceAPI
                        .login(userReq)
                        .then(function (response) {
                            userModel.setUser(response.user);
                            $state.go('productAck');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        });
                };

                /*************************************************************** */

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);