/*
**  register Controller for handling user based 
**  material registeration business logic 
*/

"use strict";

angular.module('materialModule')

    //For new material resgistration
    .controller('registerMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
        'registerMaterialService', '$log', 'materialModel', 'materialList', '$scope', 'ngDialog', 'localStorageService',
        function (userModel, appConstants, $state, $rootScope,
            registerMaterialService, $log, materialModel, materialList, $scope, ngDialog, localStorageService) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                setUserProfile(vm, userModel);
                vm.material = materialModel.getMaterial();
                vm.file = {};
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

                
                vm.reset = function(){
                    $rootScope.hasError = false;
                    $rootScope.isSuccess = false;
                    vm.isReadonly = false;
                    vm.material = materialModel.resetMaterial();
                };



                /******************* Register new material *************************/
                vm.registerMaterial = function () {
                    vm.material.file = vm.file;
                    vm.material.productionDate = vm.datePickerData;
                    materialModel.setMaterial(vm.material);
                    materialModel.setFilePath(vm.urlList);

                    registerMaterialService
                        .registerMaterial(materialModel.getMaterial())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.entity = 'raw material';
                            $scope.randomToken = 'LFG' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.name = vm.material.materialName;
                            renderLineage(ngDialog, $scope, 'confirmationBox', 600, false, 'ngdialog-theme-default confirmation-box');
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
                        $state.go('materialBatch', { qrCode: $scope.randomToken });
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

                vm.upload = function (data) {
                    //Making delete service call
                    if (data) {
                        registerMaterialService
                            .uploadFile({ file: data })
                            .then(function (response) {
                                vm.urlList = response;
                            }, function (err) {
                                $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            });
                    }
                };


                /******************* DELETE registered product *************************/
                vm.delete = function (data) {
                    $scope.data = data;
                    ngDialog.open({
                        scope: $scope,
                        template: 'deleteBox'
                    });


                    $scope.confirmDelete = function () {
                        ngDialog.close();

                        //Making delete service call
                        registerMaterialService
                            .deleteMaterial({ materialId: $scope.data.id })
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
function renderLineage(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};