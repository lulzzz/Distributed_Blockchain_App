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
                setUserProfile(vm, userModel);
                vm.material = materialModel.getMaterial();
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
                        vm.list = materialModel.getParsedMaterialList(response.data);
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                if ($stateParams.id) {
                    //localStorageService.set('qrCode', angular.toJson($stateParams.id))
                    batchMaterialService
                        .getMaterial({id: $stateParams.id})
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
                            vm.selectedMat = vm.material.id;
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
                };


                vm.onMaterialChanged = function (mat) {
                    if(!mat){
                        vm.material = shipMaterialModel.resetMaterial();
                    }
                    if (mat) {
                        batchMaterialService
                            .getMaterial({id: mat.id})
                            .then(function (response) {
                                materialModel.setMaterial(materialModel.getParsedMaterial(response));
                                vm.material = materialModel.getMaterial();
                                //vm.urlList = vm.material.filePath;
                                vm.urlList = ['asset/images/bag1.png', 'asset/images/bag2.png']
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
                        id: vm.material.id,
                        quantity: vm.material.quantity
                    }
                    batchMaterialService
                        .registerBatchMaterial(req)
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.id = response.message;
                            $scope.qrCode = 'http://35.164.15.146:8082/rawmaterial/'+response.message;
                            vm.material.id = $scope.id; // for time being
                            $scope.materialName = vm.material.materialName;
                            renderModal(ngDialog, $scope, 'material-batch-confirmBox', 600, true, 'ngdialog-theme-default confirmation-box');
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
                        id: vm.material.id,
                        quantity: vm.material.quantity
                    }
                    batchMaterialService
                        .updateMaterialBatch(req)
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.id = 'CL' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.materialName = vm.material.materialName;
                            renderModal(ngDialog, $scope, 'material-batch-confirmBox', 600, true, 'ngdialog-theme-default confirmation-box');
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
                    }
                    else {
                        $state.go('materialShip', { id: $scope.id });
                    }
                };



                /******************* VIEW EDIT registered material *************************/
                vm.edit = function (data) {
                    $rootScope.hasError = false;
                    //Making edit service call
                    batchMaterialService
                        .getMaterial({id: data.id})
                        .then(function (response) {
                            materialModel.setMaterial(materialModel.getParsedMaterial(response));
                            vm.material = materialModel.getMaterial();
                            vm.urlList = vm.material.filePath;
                            vm.toUpdate = true;
                            vm.isReadonly = false;
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                vm.view = function (data) {
                    $rootScope.hasError = false;
                   //Making view service call
                    batchMaterialService
                        .getMaterial({ id: data.id })
                        .then(function (response) {
                            materialModel.setMaterial(materialModel.getParsedMaterial(response));
                            vm.material = materialModel.getMaterial();
                            vm.urlList = vm.material.filePath;
                            vm.toUpdate = true;
                            vm.isReadonly = true;
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
                            .deleteMaterialBatch({ materialId: $scope.data.id })
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

            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);


/****
 *  Utility function for populating userProfile 
 ***/
function setUserProfile(vm, userModel) {
    vm.isManufacturer = userModel.isManufacturer();
    vm.isProducer = userModel.isProducer();
    vm.isRetailer = userModel.isRetailer();
    vm.isAdmin = userModel.isAdmin();
};
/****
 *  Utility function for rendering product lineage 
 ***/
function renderModal(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};