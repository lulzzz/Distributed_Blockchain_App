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
                        template: 'deleteBox'
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

                            renderLineage(ngDialog, $scope, 'productLineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                vm.registerProduct = function () {

                    productModel.setProduct(vm.product);
                    productModel.setSelectedMaterials.call(vm.product, vm.selectedMaterial);

                    registerService
                        .registerProduct(productModel.getProduct())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.entity = 'product';
                            $scope.randomToken = 'CCTH' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.name = vm.product.productName;
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
                        productModel.resetProduct();
                        $state.reload();
                    }
                    else {
                        $state.go('productShip', { qrCode: $scope.randomToken });
                    }
                };

                /*productModel.resetProduct();
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                setUserProfile(vm, userModel);
                vm.header = vm.isManufacturer ? 'REGISTER NEW PRODUCT' : 'REGISTER NEW MATERIAL';
                vm.product = productModel.getProduct();
                vm.list = [];
                if (vm.isManufacturer) {
                    vm.product = {
                        tokenId: '',
                        materialName: 'Garcia leather',
                        productName: 'Coach Crosby line Tote Handbag',
                        quantity: '25 units',
                        batchNumber: 'CCLTH22216FL',
                        quality: 'Top Grain',
                        color: 'Brown',
                        weight: '5.7 oz.',
                        manufactureDate: '22/2/2016',
                        registeredDate: new Date(),
                        dimension: "17' (L) x 8 3/4' (H) x 7' (W)",
                        modelNumber: '33524LIC7C',
                        shippedFrom: '',
                        shippedOn: new Date(),
                        trackDetails: {
                            currentlyAt: 'FedEx',
                            trackRecords: []
                        },
                        file:{}
                    }
                }
                //For demo
                vm.userMaterial = vm.product.materialName;

                //Populating list of Products on load based on productList resolve
                productList
                    .$promise
                    .then(function (response) {
                        productModel.setProductList(response);
                        vm.list = productModel.getProductList();
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };
                $scope.redirectUser = function (flag) {
                    ngDialog.close();
                    if (flag) {
                        $state.reload();
                    }
                    else {
                        $state.go('shipment', { tokenId: $scope.randomToken });
                    }
                };



                /******************* Register new Product/material *************************/
                /* vm.registerNewProduct = function () {
 
 
                     productModel.setProduct(vm.product);
                     var req = productModel.getNewRegisteredProduct();
 
                     registerServiceAPI
                         .registerProduct(req)
                         .then(function (response) {
                             //vm.product.setData(response);
                             $rootScope.hasError = false;
                             $scope.entity = vm.isManufacturer ? 'product' : 'raw material';
                             $scope.randomToken = 'LFG' + (Math.floor(Math.random() * 90000) + 10000) + '';
                             $scope.name = vm.isManufacturer ? 'Coach Crosby line Tote Handbag' : response.materialName;
                             renderProductLineage(ngDialog, $scope, 'confirmationBox', 600, false, 'ngdialog-theme-default confirmation-box');
                         }, function (err) {
                             $log.error(appConstants.FUNCTIONAL_ERR, err);
                         })
                         .catch(function (e) {
                             $log.error(appConstants.FUNCTIONAL_ERR, e);
                         });
                 };
 
 
                 /******************* VIEW EDIT registered product *************************/
                /* vm.editProduct = function (data) {
                     productModel.setProduct(data);
                     vm.product = productModel.getProduct();
                     vm.isReadonly = false;
                 };
                 vm.viewProduct = function (data) {
                     productModel.setProduct(data);
                     vm.product = productModel.getProduct();
                     vm.isReadonly = true;
                 };
 
 
 
 
                 /******************* DELETE registered product *************************/
                /*   vm.deleteProduct = function (data) {
                       $scope.data = data;
                       ngDialog.open({
                           scope: $scope,
                           template: 'deleteBox'
                       });
   
   
                       $scope.confirmDelete = function () {
                           ngDialog.close();
   
                           /****** below needs to be change. Hardcoded for demo */
                /*        if (vm.isManufacturer) {
                            //Making delete service call
                            registerServiceAPI
                                .productDelete({ productId: data.tokenId })
                                .then(function (response) {
                                    productModel.setProductList(response);
                                    vm.list = productModel.getProductList();
                                    $rootScope.hasError = false;
                                    $rootScope.isSuccess = true;
                                    $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_DELETED : appConstants.MATERIAL_DELETED;
                                }, function (err) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                                })
                                .catch(function (e) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                                });
                        }


                        /****** below needs to be change. Hardcoded for demo */
                /*           if (vm.isProducer) {
                               //Making delete service call
                               registerServiceAPI
                                   .materialDelete({ productId: data.id })
                                   .then(function (response) {
                                       productModel.setProductList(response);
                                       vm.list = productModel.getProductList();
                                       $rootScope.hasError = false;
                                       $rootScope.isSuccess = true;
                                       $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_DELETED : appConstants.MATERIAL_DELETED;
                                   }, function (err) {
                                       $log.error(appConstants.FUNCTIONAL_ERR, err);
                                   })
                                   .catch(function (e) {
                                       $log.error(appConstants.FUNCTIONAL_ERR, e);
                                   });
                           }
                       };
   
                   };
   
   
   
                   /************** Product Lineage functionality *********************/
                // isShipped value will be 'no'  for manufacturer
                /*          $scope.serviceData = { data: { product: { isShipped: 'no', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Garcia leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc: 'Florence, Italy', recLoc: 'Florida' }, { name: 'Buckle', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc: 'Florence, Italy', recLoc: 'Florida' }] } } };
                          $scope.lineageData = $scope.serviceData.data;
                          $scope.lineageSubData = $scope.lineageData.product.items[0];
                          $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                          
                          vm.showProductLineage = function (data) {
                              $scope.ifNegativeUsecase = false;
                              /****************Retailer************************/
                /*           if ($scope.lineageData.product.isShipped == 'yes') {
       
                               $scope.isShipped = true;
                               $scope.isShippedToRetailer = true;
       
                               /****************Manufacturer************************/
                /*            } else if ($scope.lineageData.product.isShipped == 'no') {
                                $scope.isShipped = false;
                                $scope.isShippedToRetailer = false;
                            }
                            else {
                                $scope.isShipped = true;
                                $scope.isShippedToRetailer = false;
                            }
                            renderProductLineage(ngDialog, $scope, 'productLineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                        };
        
        
                        /******************* MATERIAL Multiselect functionality *************************/
                //For material list
                /*              vm.settings = appConstants.MULTISELECT_SETTINGS;
                              vm.materialList = [];
                              if (vm.isManufacturer) {
                                  vm.dataList = [{ id: 1, label: "Garcia leather - Top Grain" }, { id: 2, label: "Buckle - Rose Gold" }];
                              }
              
                              /*************************************************************** */


                /*      vm.negativeUsecase = function () {
                          $scope.ifNegativeUsecase = true;
                          renderProductLineage(ngDialog, $scope, 'productLineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                      }
      */
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