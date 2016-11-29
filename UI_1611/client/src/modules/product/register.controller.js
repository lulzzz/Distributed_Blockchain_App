/*
**  register Controller for handling user based 
**  product/material registeration business logic 
*/

"use strict";

angular.module('productModule')

    //For new product/material resgistration
    .controller('registerProductController', ['userModel', 'appConstants', '$state', '$rootScope',
        'registerService', '$log', 'productModel', 'productList', '$scope', 'ngDialog', 'materialList',
        function (userModel, appConstants, $state, $rootScope,
            registerService, $log, productModel, productList, $scope, ngDialog, materialList) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                setUserProfile(vm, userModel);
                vm.product = productModel.getProduct();
                vm.file = {};
                vm.urlList = [];
                vm.list = [];
                vm.selectedMaterial = [];

                //Populating list of Products on load based on productList resolve
                productList
                    .$promise
                    .then(function (response) {
                        vm.list = response;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                //Populating list of Products on load based on productList resolve
                materialList
                    .$promise
                    .then(function (response) {
                        vm.materialList = [];
                        angular.forEach(response, function (val, key) {
                            vm.materialList.push({
                                'id': val.qrCode,
                                'label': val.materialName
                            })
                        });
                        vm.settings = appConstants.MULTISELECT_SETTINGS;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };

                vm.reset = function () {
                    $rootScope.hasError = false;
                    $rootScope.isSuccess = false;
                    vm.isReadonly = false;
                    vm.product = productModel.resetProduct();
                };

                /******************* VIEW EDIT registered material *************************/
                vm.edit = function (data) {
                    productModel.setProduct(data);
                    vm.product = productModel.getProduct();
                    vm.isReadonly = false;
                };
                vm.view = function (data) {
                    productModel.setProduct(data);
                    vm.product = productModel.getProduct();
                    vm.isReadonly = true;
                };

                vm.upload = function (data) {
                    //Making upload service call
                    if (data) {
                        registerService
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
                        template: 'product-deleteBox'
                    });


                    $scope.confirmDelete = function () {
                        ngDialog.close();

                        //Making delete service call
                        registerService
                            .deleteProduct({ productId: $scope.data.id })
                            .then(function (response) {
                                vm.list = response;
                                $rootScope.hasError = false;
                                $rootScope.isSuccess = true;
                                $rootScope.SUCCESS_MSG = appConstants.PROD_DELETED;
                            }, function (err) {
                                $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            });
                    }
                };


                vm.showLineage = function (data) {

                    registerService
                        .getRegisterLineageData(data)
                        .then(function (response) {
                            $scope.lineageData = response.data;
                            $scope.lineageSubData = $scope.lineageData.product.items[0];
                            $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            $scope.ifNegativeUsecase = false;
                            $scope.isShipped = false;
                            $scope.isShippedToRetailer = false;

                            renderDialog(ngDialog, $scope, 'product-lineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                vm.registerProduct = function () {
                   
                    productModel.setProduct(vm.product);
                    productModel.setFilePath(vm.urlList);
                    productModel.setSelectedMaterials.call(vm.product, vm.selectedMaterial);

                    registerService
                        .registerProduct(productModel.getProduct())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.qrCode = 'CCTH' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.productName = vm.product.productName;
                            renderDialog(ngDialog, $scope, 'product-register-confirmBox', 600, false, 'ngdialog-theme-default confirmation-box');
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
                        productModel.resetProduct();
                        $state.reload();
                    }
                    else {
                        $state.go('productShip', { qrCode: $scope.qrCode });
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
function renderDialog(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};