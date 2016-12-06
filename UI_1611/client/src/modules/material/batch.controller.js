/*
 **  register Controller for handling user based 
 **  product/material registeration business logic 
 */

"use strict";

angular.module('materialModule')

//For raw material resgistration
.controller('batchMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
    'batchMaterialService', '$log', 'materialModel', 'registeredMatList', '$scope', 'ngDialog', '$stateParams',
    function (userModel, appConstants, $state, $rootScope,
        batchMaterialService, $log, materialModel, registeredMatList, $scope, ngDialog, $stateParams) {
        try {
            var vm = this;
            vm.user = userModel.getUser();
            $rootScope.isLoggedIn = userModel.isLoggedIn();
            vm.isReadonly = false;
            bverifyUtil.setUserProfile(vm, userModel);
            vm.material = materialModel.resetMaterial();
            vm.urlList = [];
            vm.list = [];
            vm.matList = [];
            vm.datePickerData = vm.material.productionDate;
            vm.selectedMat = '';
            vm.toUpdate = false;

            //Populating list of Products on load based on materialList resolve
            registeredMatList
                .$promise
                .then(function (response) {
                    vm.list = bverifyUtil.parseBatchList(response.batches);
                }, function (err) {
                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                })
                .catch(function (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                });


            if ($stateParams.id) {
                //localStorageService.set('qrCode', angular.toJson($stateParams.id))
                batchMaterialService
                    .getMaterial({
                        id: $stateParams.id
                    })
                    .then(function (response) {
                        vm.matList = [];
                        materialModel.setMaterial(materialModel.getParsedMaterial(response));
                        vm.material = materialModel.getMaterial();
                        vm.matList.push({
                                id: vm.material.id,
                                materialName: vm.material.materialName,
                                modelNumber: vm.material.modelNumber
                            })
                            //vm.urlList = vm.material.filePath;
                            /***** Hardcoded for demo purpose */
                            //vm.urlList = vm.material.filePath;
                        vm.urlList = ['asset/images/bag1.png', 'asset/images/bag2.png']
                        vm.selectedMat = {
                            id: vm.material.id
                        };
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            } else {
                batchMaterialService
                    .getRMList(vm.user)
                    .then(function (response) {
                        vm.matList = materialModel.getParsedBatchMaterialList(response.data);
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            }


            vm.reset = function () {
                $rootScope.hasError = false;
                $rootScope.isSuccess = false;
                vm.isReadonly = false;
                vm.toUpdate = false;
                vm.material = materialModel.resetMaterial();
                vm.urlList = [];
                vm.selectedMat = '';
            };


            vm.onMaterialChanged = function (mat) {
                vm.toUpdate = false;
                vm.isReadonly = false;
                if (!mat) {
                    vm.material = materialModel.resetMaterial();
                    vm.urlList = [];
                }
                if (mat) {
                    vm.selectedMat = {
                        id: mat.id
                    };
                    batchMaterialService
                        .getMaterial({
                            id: mat.id
                        })
                        .then(function (response) {
                            materialModel.setMaterial(materialModel.getParsedMaterial(response));
                            vm.material = materialModel.getMaterial();
                            vm.material.id = mat.id;
                            //vm.urlList = vm.material.filePath;
                            vm.urlList = ['asset/images/bag1.png', 'asset/images/bag2.png'];
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }
            };


            /******************* Register new material *************************/
            vm.registerBatchMaterial = function () {

                vm.toUpdate = false;
                // materialModel.setMaterial(vm.material);
                var req = {
                    rawmaterial: vm.material.id,
                    quantity: vm.material.quantity
                }
                batchMaterialService
                    .registerBatchMaterial(req)
                    .then(function (response) {
                        populateResponse(response);
                        $scope.batchId = response.message;
                        $scope.qrCode = 'http://35.164.15.146:8082/rawmaterial/batch/' + response.message;
                        vm.material.id = $scope.batchId; // for time being
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            };

            /******************* Register new material *************************/
            vm.updateBatchMaterial = function () {
                vm.toUpdate = true;
                // materialModel.setMaterial(vm.material);
                var req = {
                    rawmaterial: vm.material.id,
                    quantity: parseInt(vm.material.quantity)
                }
                batchMaterialService
                    .updateMaterialBatch(req)
                    .then(function (response) {
                        populateResponse(response);
                        $scope.batchId = vm.material.id;
                        $scope.qrCode = 'http://35.164.15.146:8082/rawmaterial/batch/' + vm.material.id;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            };

            $scope.redirectUser = function (flag) {
                ngDialog.close();
                if (flag) {
                    $state.reload();
                } else {
                    $state.go('materialShip', {
                        id: $scope.batchId
                    });
                }
            };



            /******************* VIEW EDIT registered material *************************/
            vm.edit = function (data) {
                $rootScope.hasError = false;
                //Making edit service call
                batchMaterialService
                    .getMaterialBatch({
                        batchId: data.id
                    })
                    .then(function (batchData) {

                        batchMaterialService
                            .getMaterial({
                                id: batchData.rawMaterial
                            })
                            .then(function (response) {
                                materialModel.setMaterial(materialModel.getParsedMaterial(response));
                                vm.material = materialModel.getMaterial();
                                vm.urlList = vm.material.filePath;
                                vm.material.quantity = batchData.quantity;
                                vm.toUpdate = true;
                                vm.material.id = data.id;
                                vm.selectedMat = {
                                    id: batchData.rawMaterial
                                };
                                vm.isReadonly = false;
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
            };


            vm.view = function (data) {
                $rootScope.hasError = false;
                //Making edit service call
                batchMaterialService
                    .getMaterialBatch({
                        batchId: data.id
                    })
                    .then(function (batchData) {

                        batchMaterialService
                            .getMaterial({
                                id: batchData.rawMaterial
                            })
                            .then(function (response) {
                                materialModel.setMaterial(materialModel.getParsedMaterial(response));
                                vm.material = materialModel.getMaterial();
                                vm.urlList = vm.material.filePath;
                                vm.material.quantity = batchData.quantity;
                                vm.toUpdate = true;
                                vm.material.id = data.id;
                                vm.selectedMat = {
                                    id: batchData.rawMaterial
                                };
                                vm.isReadonly = true;
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
            };


            /******************* DELETE registered product *************************/
            vm.delete = function (data) {
                $scope.data = data;
                ngDialog.open({
                    scope: $scope,
                    template: 'material-deleteBox'
                });


                $scope.confirmDelete = function () {
                    ngDialog.close();

                    //Making delete service call
                    batchMaterialService
                        .deleteMaterialBatch({
                            id: $scope.data.id
                        })
                        .then(function (response) {
                            vm.list = response;
                            $rootScope.hasError = false;
                            $rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = appConstants.MATERIAL_DELETED;
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }
            };


            /***************** HELPER Functions ************************/


            function populateResponse(response) {
                $rootScope.hasError = false;
                $scope.toUpdate = vm.toUpdate;
                $scope.materialName = vm.material.materialName;
                bverifyUtil.openModalDialog(ngDialog, $scope, 'material-batch-confirmBox', 600, true, 'ngdialog-theme-default confirmation-box');
            };
            /*************************************************************** */



        } catch (e) {
            console.log(appConstants.FUNCTIONAL_ERR, e);
        }
    }
]);