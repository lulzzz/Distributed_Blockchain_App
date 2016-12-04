/*
**  ship Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('materialModule')

    //For shipment of registered products
    .controller('shipMaterialController', ['userModel', 'appConstants', '$state', '$rootScope', 'shipMaterialService',
        '$log', 'shipMaterialModel', 'ngDialog', '$scope', 'userServiceAPI', '$stateParams', 'localStorageService',
        function (userModel, appConstants, $state, $rootScope, shipMaterialService,
            $log, shipMaterialModel, ngDialog, $scope, userServiceAPI, $stateParams, localStorageService) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                bverifyUtil.setUserProfile(vm, userModel);
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.materialList = [];
                vm.selectedMat = '';
                vm.carrier = '';
                vm.ship = shipMaterialModel.resetModel();

                /*vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };*/

                if ($stateParams.id) {
                //localStorageService.set('qrCode', angular.toJson($stateParams.qrCode))
                shipMaterialService
                    .getMaterial($stateParams.id)
                    .then(function (response) {
                        vm.materialList = [];
                        shipMaterialModel.setModel(shipMaterialModel.getParsedShipMaterial(response));
                        vm.ship = shipMaterialModel.getModel();
                        vm.materialList.push({
                            id: vm.ship.id,
                            materialName: vm.ship.materialName,
                            batchNumber: vm.ship.batchNumber
                        });
                        vm.selectedMat = vm.ship.id;
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
                        vm.manufacturerList = PARSER.parseShipToList(response.data);
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
                };


                vm.onMaterialChanged = function (mat) {
                    if(!mat){
                        vm.ship = shipMaterialModel.resetModel();
                    }
                    if (mat) {
                        shipMaterialService
                            .getMaterial({id: mat.batchNumber})
                            .then(function (response) {
                                shipMaterialModel.setModel(shipMaterialModel.getParsedShipMaterial(response));
                                vm.ship = shipMaterialModel.getModel();
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
                        $rootScope.ERROR_MSG = 'Please select atleast one Manufacturer.';
                        return;
                    } else {
                        $rootScope.hasError = false;
                        vm.showRedBox = false;
                    }

                    if (shipMaterialModel.verifyQuantity(vm.ship.quantity, vm.userQuantity)) {
                        vm.ship.quantity = vm.userQuantity;
                    } else {
                        $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                        bverifyUtil.openModalDialog(ngDialog, $scope, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box');
                        return;
                    }

                    if (_.isUndefined(vm.ship.carrier) || _.isEmpty(vm.ship.carrier)) {
                        $rootScope.hasError = true;
                        vm.showRedBox = true;
                        $rootScope.ERROR_MSG = 'Please select a shipment carrier.';
                        return;
                    } else {
                        $rootScope.hasError = false;
                        vm.showRedBox = false;
                    }
                    
                    angular.forEach(vm.selectedManufacturer, function(val, key){
                        vm.ship.sendTo = val;
                        shipMaterialModel.setModel(vm.ship);
                        // do material shipment
                        shipMaterialService
                            .shipMaterial(shipMaterialModel.getModel())
                            .then(function (response) {
                                
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
                            $scope.id = 'GL' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.materialName = vm.ship.materialName;
                            bverifyUtil.openModalDialog(ngDialog, $scope, 'material-ship-confirmBox', 600, false, 'ngdialog-theme-default');
                    
                    //shipMaterialModel.shippedTo(vm.selectedManufacturer);
                };

                /****************** Confirmation box functionality *******************/
                $scope.redirectUser = function (flag) {
                    ngDialog.close();
                    var userReq = {
                        id: 'manufacturer'
                    }
                    userServiceAPI
                        .login(userReq)
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
        }]);
