/*
**  register Controller for handling user based 
**  material registeration business logic 
*/

"use strict";

angular.module('materialModule')

    //For new material resgistration
    .controller('registerMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
        'registerMaterialService', '$log', 'materialModel', 'registeredMatList', '$scope', 'ngDialog', 'localStorageService',
        function (userModel, appConstants, $state, $rootScope,
            registerMaterialService, $log, materialModel, registeredMatList, $scope, ngDialog, localStorageService) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                setUserProfile(vm, userModel);
                vm.material = materialModel.resetMaterial();
                vm.file = {};
                vm.urlList = [];
                vm.list = [];
                vm.imageSrc = [];
                vm.datePickerData = vm.material.productionDate;
                vm.datePickerExpiryData = vm.material.expiryDate;

                //Populating list of Products on load based on productList resolve
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


                vm.reset = function () {
                    $rootScope.hasError = false;
                    $rootScope.isSuccess = false;
                    vm.isReadonly = false;
                    vm.material = materialModel.resetMaterial();
                    vm.urlList = vm.material.filePath;
                };



                /******************* Register new material *************************/
                vm.registerMaterial = function () {

                    if (vm.urlList.length <= 0) {
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = appConstants.UPLOAD_FILE_ERR;
                        return;
                    } else {
                        $rootScope.hasError = false;
                    }

                    vm.material.productionDate = PARSER.parseStrDate(vm.datePickerData);
                    vm.material.expiryDate = PARSER.parseStrDate(vm.datePickerExpiryData);
                    materialModel.setMaterial(vm.material);
                    materialModel.setFilePath(vm.urlList);

                    registerMaterialService
                        .registerMaterial(materialModel.getMaterial())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.id = 'GL' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            vm.material.id = $scope.id; // for time being
                            $scope.materialName = vm.material.materialName;
                            displayModal(ngDialog, $scope, 'material-register-confirmBox', 600, false, 'ngdialog-theme-default confirmation-box');
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
                        $state.go('materialBatch', { id: $scope.id });
                    }
                };



                /******************* VIEW EDIT registered material *************************/
                vm.edit = function (data) {
                    $rootScope.hasError = false;
                    //Making edit service call
                    registerMaterialService
                        .editMaterial({ materialId: data.id })
                        .then(function (response) {
                            materialModel.setMaterial(materialModel.getParsedMaterial(response));
                            vm.material = materialModel.getMaterial();
                            vm.urlList = vm.material.filePath;
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
                    registerMaterialService
                        .editMaterial({ materialId: data.id })
                        .then(function (response) {
                            materialModel.setMaterial(materialModel.getParsedMaterial(response));
                            vm.material = materialModel.getMaterial();
                            vm.urlList = vm.material.filePath;
                            vm.isReadonly = false;
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                vm.upload = function (data) {
                    if (vm.imageSrc.length >= 5) {
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = "Alert ! You cannot upload more than 5 files";
                        return;
                    }
                    if (data) {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(data);
                        fileReader.onload = function (e) {
                            (function () {
                                vm.imageSrc.push(e.target.result); // Retrieve the image. 
                            })();
                        };
                        $rootScope.hasError = false;
                        registerMaterialService
                            .uploadFile({ file: data })
                            .then(function (response) {
                                $rootScope.hasError = false;
                                vm.urlList = response;
                            }, function (err) {
                                vm.imageSrc.pop(); // delete the image. 
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
                        template: 'material-deleteBox'
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
function displayModal(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};