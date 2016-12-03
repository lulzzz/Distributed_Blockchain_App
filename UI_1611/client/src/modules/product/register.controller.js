/*
**  register Controller for handling user based 
**  product/material registeration business logic 
*/

"use strict";

angular.module('productModule')

    //For new product resgistration
    .controller('registerProductController', ['userModel', 'appConstants', '$state', '$rootScope',
        'registerService', '$log', 'productModel', 'registeredProdList', '$scope', 'ngDialog', 'registeredMatList',
        function(userModel, appConstants, $state, $rootScope,
            registerService, $log, productModel, registeredProdList, $scope, ngDialog, registeredMatList) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                setUserProfile(vm, userModel);
                vm.product = productModel.resetProduct();
                vm.file = {};
                vm.urlList = [];
                vm.list = [];
                vm.selectedMaterial = [];
                vm.imageSrc = [];
                vm.datePickerData = vm.product.manufactureDate;
                vm.toUpdate = false;

                //Populating list of Products on load based on productList resolve
                registeredProdList
                    .$promise
                    .then(function(response) {
                        vm.list = productModel.getParsedProductList(response.data);
                    }, function(err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function(e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                //Populating list of Products on load based on productList resolve
                registeredMatList
                    .$promise
                    .then(function(response) {
                        vm.materialList = productModel.getParsedMaterialList(response.data);
                        vm.settings = appConstants.MULTISELECT_SETTINGS;
                    }, function(err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function(e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                /********RESET action ***********/
                vm.reset = function() {
                    $rootScope.hasError = false;
                    $rootScope.isSuccess = false;
                    vm.isReadonly = false;
                    vm.toUpdate = false;
                    vm.product = productModel.resetProduct();
                    vm.urlList = [];
                };


                /******************* VIEW EDIT registered material *************************/
                vm.edit = function(data) {
                    $rootScope.hasError = true;
                    //Making edit service call
                    registerService
                        .getProduct({ id: data.id })
                        .then(function(response) {
                            getProduct(response);
                            vm.isReadonly = false;
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };



                vm.view = function(data) {
                    $rootScope.hasError = true;
                    //Making edit service call
                    registerService
                        .getProduct({ id: data.id })
                        .then(function(response) {
                            getProduct(response);
                            vm.isReadonly = true;
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                /************ UPLOAD Action ****************** */
                vm.upload = function(data) {
                    if (vm.imageSrc.length >= 5) {
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = appConstants.FILE_UPLOAD_LIMIT;
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
                            .then(function(response) {
                                $rootScope.hasError = false;
                                vm.urlList = response;
                            }, function(err) {
                                vm.imageSrc.pop(); // delete the image. 
                                $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function(e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            });
                    }
                };

                /******************* DELETE registered product *************************/
                vm.delete = function(data) {
                    $scope.data = data;
                    ngDialog.open({
                        scope: $scope,
                        template: 'product-deleteBox'
                    });


                    $scope.confirmDelete = function() {
                        ngDialog.close();

                        //Making delete service call
                        registerService
                            .deleteProduct({ productId: $scope.data.id })
                            .then(function(response) {
                                vm.list = response;
                                $rootScope.hasError = false;
                                $rootScope.isSuccess = true;
                                $rootScope.SUCCESS_MSG = appConstants.PROD_DELETED;
                            }, function(err) {
                                $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function(e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            });
                    }
                };

                /******* PRODUCT LINEAGE Action **************** */
                vm.showLineage = function(data) {

                    registerService
                        .getRegisterLineageData(data)
                        .then(function(response) {
                            $scope.lineageData = response.data;
                            $scope.lineageSubData = $scope.lineageData.product.items[0];
                            $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            renderDialog(ngDialog, $scope, 'register-lineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                vm.negativeUsecase = function() {
                    $scope.serviceData = { data: { product: { isShipped: 'pending', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Garcia leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc: 'Florence, Italy', recLoc: 'Florida' }, { name: 'Buckle', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc: 'Florence, Italy', recLoc: 'Florida' }] } } };
                    $scope.lineageData = $scope.serviceData.data;
                    $scope.lineageSubData = $scope.lineageData.product.items[0];
                    $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                    renderDialog(ngDialog, $scope, 'negative-lineageBox', '65%', true, 'ngdialog-theme-default lineage-box');

                };

                /********** REgister new Product **************** */
                vm.registerProduct = function() {
                    vm.toUpdate = false;
                    validateProduct();
                    registerService
                        .registerProduct(productModel.getProduct())
                        .then(function(response) {
                            populateResponse(response);
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                /************** UPDATE Product *******************/
                vm.updateProduct = function() {
                    vm.toUpdate = true;
                    validateProduct();
                    registerService
                        .updateProduct(productModel.getProduct())
                        .then(function(response) {
                            populateResponse(response);
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                /********* CONFIRM box action *******************/
                $scope.redirectUser = function(flag) {
                    ngDialog.close();
                    if (flag) {
                        $state.reload();
                    }
                    else {
                        $state.go('productShip', { id: $scope.id });
                    }
                };



                /***************** HELPER Functions ************************/

                function validateProduct() {
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

                    vm.product.manufactureDate = PARSER.parseStrDate(vm.datePickerData);
                    productModel.setProduct(vm.product);
                    productModel.setFilePath(vm.urlList);
                    productModel.setSelectedMaterials.call(vm.product, vm.selectedMaterial);
                };

                function populateResponse(response) {
                    $rootScope.hasError = false;
                    $scope.id = response.message;
                    $scope.qrCode = 'http://35.164.15.146:8082/rawmaterial/' + response.message;
                    vm.product.id = $scope.id; // for time being
                    $scope.productName = vm.product.productName;
                    $scope.toUpdate = vm.toUpdate;
                    renderDialog(ngDialog, $scope, 'product-register-confirmBox', 600, true, 'ngdialog-theme-default confirmation-box');
                };

                function getProduct(response) {
                    productModel.setProduct(productModel.getParsedProduct(response));
                    vm.product = productModel.getProduct();
                    vm.urlList = vm.product.filePath;
                    vm.toUpdate = true;
                };

                /*************************************************************** */



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