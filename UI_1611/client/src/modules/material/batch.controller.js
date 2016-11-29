/*
**  register Controller for handling user based 
**  product/material registeration business logic 
*/

"use strict";

angular.module('materialModule')

    //For raw material resgistration
    .controller('batchMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
        'batchMaterialService', '$log', 'materialModel', 'materialList', '$scope', 'ngDialog', '$stateParams',
        function (userModel, appConstants, $state, $rootScope,
            batchMaterialService, $log, materialModel, materialList, $scope, ngDialog, $stateParams) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                setUserProfile(vm, userModel);
                vm.material = materialModel.getMaterial();
                vm.urlList = [];
                vm.list = [];
                vm.datePickerData = vm.material.productionDate;

                //Populating list of Products on load based on productList resolve
                materialList
                    .$promise
                    .then(function (response) {
                        vm.list = response;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                //if ($stateParams.qrCode) {  for time being
                //localStorageService.set('qrCode', angular.toJson($stateParams.qrCode))
                batchMaterialService
                    .getMaterial($stateParams.qrCode)
                    .then(function (response) {
                        materialModel.setMaterial(response);
                        vm.material = materialModel.getMaterial();
                        //vm.urlList = vm.material.filePath;
                        /***** Hardcoded for demo purpose */
                        vm.urlList = [{src:'asset/images/bag1.png',alt:'material image'},
										{src:'asset/images/bag5.jpg',alt:'material image'},
										{src:'asset/images/bag6.jpg',alt:'material image'},
										{src:'asset/images/bag7.jpg',alt:'material image'},
										{src:'asset/images/bag7.jpg',alt:'material image'}];
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
                /* } else {  for time being
                     shipMaterialService
                         .getMaterialList(vm.user)
                         .then(function (response) {
                             vm.materialList = response;
                             shipModel.setModel(vm.materialList[0]);
                             vm.ship = shipModel.getModel();
                         }, function (err) {
                             $log.error(appConstants.FUNCTIONAL_ERR, err);
                         })
                         .catch(function (e) {
                             $log.error(appConstants.FUNCTIONAL_ERR, e);
                         });
                 }*/


                vm.reset = function () {
                    $rootScope.hasError = false;
                    $rootScope.isSuccess = false;
                    vm.isReadonly = false;
                    vm.material = materialModel.resetMaterial();
                };



                /******************* Register new material *************************/
                vm.registerBatchMaterial = function () {
                    materialModel.setMaterial(vm.material);
                    var req = {
                        qrCode: vm.material.qrCode,
                        materialName: vm.material.materialName,
                        quantity: vm.material.quantity
                    }
                    batchMaterialService
                        .registerBatchMaterial(req)
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.qrCode = 'CL' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.materialName = vm.material.materialName;
                            renderModal(ngDialog, $scope, 'material-batch-confirmBox', 600, false, 'ngdialog-theme-default confirmation-box');
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
                        $state.go('materialShip', { qrCode: $scope.qrCode });
                    }
                };



                /******************* VIEW EDIT registered material *************************/
                vm.edit = function (data) {
                    materialModel.setMaterial(data);
                    vm.material = materialModel.getMaterial();
                    vm.isReadonly = false;
                };
                vm.view = function (data) {
                    materialModel.setMaterial(data);
                    vm.material = materialModel.getMaterial();
                    vm.isReadonly = true;
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