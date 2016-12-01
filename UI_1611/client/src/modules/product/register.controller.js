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
                vm.imageSrc = [];

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
                            //limit to populate only 3 materials
                            if(key >2 ){
                                return;
                            }
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
                    $rootScope.hasError = true;
                    productModel.setProduct(data);
                    vm.product = productModel.getProduct();
                    vm.urlList = vm.product.filePath;
                    vm.isReadonly = false;
                };
                vm.view = function (data) {
                    $rootScope.hasError = true;
                    productModel.setProduct(data);
                    vm.product = productModel.getProduct();
                    vm.urlList = vm.product.filePath;
                    vm.isReadonly = true;
                };

                vm.upload = function (data) {
                     if(vm.imageSrc.length >= 5){
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = "Alert ! You cannot upload more than 5 files";
                        return;
                    }
                    //Making delete service call
                    if (data) {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(data);
                        fileReader.onload = function(e) {
                            (function() {
                                vm.imageSrc.push(e.target.result); // Retrieve the image. 
                            })();
                        };
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
                            renderDialog(ngDialog, $scope, 'register-lineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

				 vm.negativeUsecase = function () {
							$scope.serviceData = { data: { product: { isShipped: 'pending', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Garcia leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc: 'Florence, Italy', recLoc: 'Florida' }, { name: 'Buckle', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc: 'Florence, Italy', recLoc: 'Florida' }] } } };
							$scope.lineageData = $scope.serviceData.data;
							$scope.lineageSubData = $scope.lineageData.product.items[0];
							$scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            renderDialog(ngDialog, $scope, 'negative-lineageBox', '65%', true, 'ngdialog-theme-default lineage-box');
                     
				 };
				 
                vm.registerProduct = function () {
                    if (vm.selectedMaterial.length <= 0) {
                        $rootScope.hasError = true;
                        vm.showRedBox = true;
                        $rootScope.ERROR_MSG = 'Please select atleast one Material.';
                        return;
                    } else {
                        $rootScope.hasError = false;
                        vm.showRedBox = false;
                    }

                    if (vm.urlList.length <= 0) {
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = appConstants.UPLOAD_FILE_ERR;
                        return;
                    } else {
                        $rootScope.hasError = false;
                    }
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