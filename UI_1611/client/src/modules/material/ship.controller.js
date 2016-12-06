/*
 **  ship Controller for handling user based 
 **  product shipment business logic 
 */

"use strict";

angular.module('materialModule')

//For shipment of registered products
.controller('shipMaterialController', ['userModel', 'appConstants', '$state', '$rootScope', 'shipMaterialService',
    '$log', 'shipMaterialModel', 'ngDialog', '$scope', 'userServiceAPI', '$stateParams',
    function (userModel, appConstants, $state, $rootScope, shipMaterialService,
        $log, shipMaterialModel, ngDialog, $scope, userServiceAPI, $stateParams) {
        try {
            var vm = this;
            vm.user = userModel.getUser();
            bverifyUtil.setUserProfile(vm, userModel);
            $rootScope.isLoggedIn = userModel.isLoggedIn();
            vm.materialList = [];
            vm.selectedMat = '';
            vm.batchToken = '';
            vm.ship = shipMaterialModel.resetModel();

            if ($stateParams.id) {

                shipMaterialService
                    .getMaterialBatch({
                        batchId: $stateParams.id
                    })
                    .then(function (batchData) {

                        shipMaterialService
                            .getMaterial({
                                id: batchData.rawMaterial
                            })
                            .then(function (response) {
                                vm.materialList = [];
                                shipMaterialModel.setModel(shipMaterialModel.getParsedShipMaterial(response));
                                vm.ship = shipMaterialModel.getModel();
                                vm.materialList.push({
                                    id: $stateParams.id,
                                    materialName: vm.ship.materialName + ' - BATCH00'+ $stateParams.id
                                });
                                vm.selectedMat = {
                                    id: $stateParams.id
                                };
                                vm.batchToken = 'BATCH00' + $stateParams.id;
                                vm.batchUrl = 'http://35.164.15.146:8082/rawmaterial/batch/' + $stateParams.id;
                            }, function (err) {
                                $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            });

                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            } else {
                shipMaterialService
                    .getMaterialList(vm.user)
                    .then(function (response) {
                        vm.materialList = shipMaterialModel.getParsedMaterialList(response.data);
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            }



            /****************** Distributer/Retailer Multiselect functionality *******************/
            vm.settings = appConstants.MULTISELECT_SETTINGS;
            vm.selectedManufacturer = [];

            //Retreive all manufacturerr list and populate inside Multiselect
            shipMaterialService
                .getManufacturerList(vm.user)
                .then(function (response) {
                    //vm.manufacturerList = PARSER.parseShipToList(response.data);
                    vm.manufacturerList = [{
                        id: "C5AA2E0022515A522FA9ABFE15C898392A5F10B5",
                        label: "Coach, Florida"
                    }];
                }, function (err) {
                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                })
                .catch(function (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                });

            vm.reset = function () {
                $rootScope.hasError = false;
                $rootScope.isSuccess = false;
                vm.ship = shipMaterialModel.resetModel();
                vm.selectedMat = '';
            };


            vm.onMaterialChanged = function (mat) {
                $rootScope.hasError = false;
                if (!mat) {
                    vm.ship = shipMaterialModel.resetModel();
                    vm.userQuantity = '';
                    vm.batchUrl = null;
                }
                if (mat) {
                    vm.selectedMat = {
                        id: mat.id
                    };
                    

                    shipMaterialService
                        .getMaterialBatch({
                            batchId: mat.id
                        })
                        .then(function (batchData) {
                            
                            shipMaterialService
                                .getMaterial({
                                    id: batchData.rawMaterial
                                })
                                .then(function (response) {
                                    shipMaterialModel.setModel(shipMaterialModel.getParsedShipMaterial(response));
                                    vm.ship = shipMaterialModel.getModel();
                                    vm.ship.id = mat.id;
                                    vm.userQuantity = batchData.quantity;
                                    vm.ship.quantity = batchData.quantity;
                                    vm.batchToken = 'BATCH00' + mat.id;
                                    vm.batchUrl = 'http://35.164.15.146:8082/rawmaterial/batch/' + vm.ship.id;
                                }, function (err) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                                })
                                .catch(function (e) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                                });

                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });

                }
            };

            /****************** material Shipment functionality *******************/
            vm.shipMaterial = function () {

                if (vm.selectedManufacturer.length <= 0) {
                    $rootScope.hasError = true;
                    vm.showRedBox = true;
                    $rootScope.ERROR_MSG = appConstants.MANUFACT_OPTION_ERR;
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

                angular.forEach(vm.selectedManufacturer, function (val, key) {
                    vm.ship.shipTo = val.id;
                    shipMaterialModel.setModel(vm.ship);
                    // do material shipment
                    shipMaterialService
                        .shipMaterial(shipMaterialModel.getModel())
                        .then(function (response) {
                            $scope.qrCode = 'http://35.164.15.146:8082/product/' + response.message;
                            $rootScope.hasError = false;
                            $scope.shipId = response;
                            $scope.materialName = vm.ship.materialName;
                            bverifyUtil.openModalDialog(ngDialog, $scope, 'material-ship-confirmBox', 600, false, 'ngdialog-theme-default');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                            return;
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                            return;
                        });
                });
                

                //shipMaterialModel.shippedTo(vm.selectedManufacturer);
            };

            /****************** Confirmation box functionality *******************/
            $scope.redirectUser = function (flag) {
                ngDialog.close();
                var userReq = {
                    id: 'manufacturer'
                }
                userServiceAPI
                    .manufacturerLogin(userReq)
                    .then(function (response) {
                        userModel.setUser(response.user);
                        $state.go('materialAck');
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