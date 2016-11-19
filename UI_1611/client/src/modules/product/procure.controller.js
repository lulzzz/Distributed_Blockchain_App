/*
**  procure Controller for handling user based 
**  product/material acknowledgement business logic 
*/

"use strict";

angular.module('productModule')

    //For acknowledging received product
    .controller('productAckController', ['userModel', 'appConstants', '$state', '$rootScope',
        'productServiceAPI', '$log', 'productList', 'productModel', 'ngDialog', '$scope',
        function(userModel, appConstants, $state, $rootScope,
            productServiceAPI, $log, productList, productModel, ngDialog, $scope) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                vm.header = vm.isManufacturer ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
                vm.product = productModel.getProduct();
                vm.list = [];


                /****************** PRODUCT/MATERIAL List to procure */
                //Populating list of Products on load based on productList resolve
                productList
                    .$promise
                    .then(function(response) {
                        productModel.setProductList(response);
                        vm.list = productModel.getProductList();
                    }, function(err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function(e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                /******************* PROCURE List of product/material *************************/
                /*    TO-DO need to test with actual data and implementation */

                vm.procureProduct = function(productList) {
                    if (productList) {
                        productModel.setProductList(productList);
                        vm.list = productModel.getProductList();
                    }
                    productServiceAPI
                        .ackProduct(vm.list)
                        .then(function(response) {
                            $rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = "Selected Products has been acknowledged successfully";
                            //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                            if (vm.isManufacturer) {
                                $state.go('product');
                            } if (vm.isRetailer) {
                                return;
                            }
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                /**************Product Lineage functionality **********************/
                // isShipped value will be 'yes' for retailer
                //Hardcoded. Need to remove
                $scope.serviceData = { data: { product: { isShipped: 'yes', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }, { name: 'Buckel', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016' }] } } };
                $scope.lineageData = $scope.serviceData.data;
                $scope.lineageSubData = $scope.lineageData.product.items[0];
                $scope.lineageSubMaterialData = $scope.lineageData.product.items;


                $scope.$on('productLineage', function(event, msg) {
                    if ($scope.lineageData.product.isShipped === 'yes') {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = true;
                    } else if ($scope.lineageData.product.isShipped === 'no') {
                        $scope.isShipped = false;
                        $scope.isShippedToRetailer = false;
                    }
                    else {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = false;
                    }
                    renderProductLineage(ngDialog, $scope, 'productLineageBox', '70%', true, 'ngdialog-theme-default lineage-box');
                });

                /*************************************************************** */

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
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
function renderProductLineage(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};