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
            vm.selectedProd = '';
            vm.ship = shipProduct.resetModel();

            vm.openDatepicker = function () {
                vm.datepickerObj.popup.opened = true;
            };

            if ($stateParams.id) {
                shipService
                    .getProduct($stateParams.id)
                    .then(function (response) {
                        vm.productList = [];
                        shipProductModel.setModel(shipProductModel.getParsedShipProduct(response));
                        vm.ship = shipProductModel.getModel();
                        vm.productList.push({
                            id: vm.ship.id,
                            productName: vm.ship.productName,
                            batchNumber: vm.ship.batchNumber
                        })
                        vm.selectedProd = {
                            id: vm.ship.id
                        };
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            } else {
                shipService
                    .getProductList(vm.user)
                    .then(function (response) {
                        vm.productList = shipProductModel.getParsedProductList(response.data);
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            }



            /****************** Distributer/Retailer Multiselect functionality *******************/
            vm.settings = appConstants.MULTISELECT_SETTINGS;
            vm.selectedRetailers = [];

            //Retreive all retailer list and populate inside Multiselect
            shipService
                .getRetailerList(vm.user)
                .then(function (response) {
                    //vm.retailerList = PARSER.parseShipToList(response.data);
                    vm.retailerList = [{
                        id: "6DF4F3F7B2DC8DB6309773C88F715F6EBC415ECC",
                        label: "Bloomingdale's - San Francisco Centre"
                    }];
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

            vm.onProductChanged = function (prod) {
                if (!prod) {
                    vm.ship = shipProductModel.resetModel();
                }
                if (prod) {
                    vm.selectedProd = {
                        id: prod.id
                    };
                    shipService
                        .getProduct({
                            id: prod.id
                        })
                        .then(function (response) {
                            shipProductModel.setModel(shipProductModel.getParsedShipProduct(response));
                            vm.ship = shipProductModel.getModel();
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }
            };


            /****************** material Shipment functionality *******************/
            vm.shipProduct = function () {

                if (vm.selectedRetailers.length <= 0) {
                    $rootScope.hasError = true;
                    vm.showRedBox = true;
                    $rootScope.ERROR_MSG = appConstants.RETAILER_OPTION_ERR;
                    return;
                } else {
                    $rootScope.hasError = false;
                    vm.showRedBox = false;
                }

                if (bverifyUtil.verifyQuantity(vm.ship.quantity, vm.userQuantity)) {
                    vm.ship.quantity = vm.userQuantity;
                } else {
                    $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                    bverifyUtil.openModalDialog(ngDialog, $scope, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box');
                    return;
                }

                if (_.isUndefined(vm.ship.carrier) || _.isEmpty(vm.ship.carrier)) {
                    $rootScope.hasError = true;
                    vm.showRedBox = true;
                    $rootScope.ERROR_MSG = appConstants.CARRIER_OPTION_ERR;
                    return;
                } else {
                    $rootScope.hasError = false;
                    vm.showRedBox = false;
                }


                angular.forEach(vm.selectedRetailers, function (val, key) {
                    vm.ship.sendTo = val.id;
                    shipProductModel.setModel(vm.ship);
                    // do product shipment
                    shipService
                        .shipProduct(shipProductModel.getModel())
                        .then(function (response) {
                            $scope.qrCode = 'http://35.164.15.146:8082/product/' + response.message;
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                            return;
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                            return;
                        });
                });
                $rootScope.hasError = false;
                $scope.shipId = (Math.floor(Math.random() * 90000) + 10000) + '';
                $scope.productName = vm.ship.productName;
                bverifyUtil.openModalDialog(ngDialog, $scope, 'product-ship-confirmBox', 600, false, 'ngdialog-theme-default');
            };


            /****************** Confirmation box functionality *******************/
            $scope.redirectUser = function (flag) {
                ngDialog.close();
                var userReq = {
                    id: 'retailer'
                }
                userServiceAPI
                    .retailerLogin(userReq)
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
    }
]);