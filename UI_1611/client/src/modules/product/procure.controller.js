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

					$scope.entity = vm.isManufacturer ? 'materials' :'products';
					
					$scope.redirectUser = function(flag){
						if(!flag) {
							ngDialog.close();
							return;
						}
						if(flag && vm.isManufacturer) {
							$state.go('product');
						}
						if(flag && vm.isRetailer) {
							ngDialog.close();
						} 						
						
						
					};

                /******************* PROCURE List of product/material *************************/
                /*    TO-DO need to test with actual data and implementation */
				vm.selectedRows = [];
				vm.rowSelected = function(data){
                    $rootScope.hasError = false;
                    if(checkRows(data.tokenId) > -1){
                        vm.selectedRows.splice(vm.selectedRows.indexOf(data.tokenId, 1));
                    }else{
					    vm.selectedRows.push(data.tokenId);
                    }
					//console.log('selectedRows',vm.selectedRows);
				};
                function checkRows(tokenId) {
                        return vm.selectedRows.indexOf(tokenId);
                };
                vm.procureProduct = function(productList) {
                    //added for demo purpose
                    if(vm.selectedRows.length <= 0){
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = "Please select atleast one record.";
                        return;
                    }
                    $rootScope.hasError = false;
                    if (productList) {
                        productModel.setProductList(productList);
                        vm.list = productModel.getProductList();
                    }
                    productServiceAPI
                        .ackProduct({}) // for demo instance
                        //.ackProduct(vm.list)
                        .then(function(response) {
                            //$rootScope.isSuccess = true;
                            //$rootScope.SUCCESS_MSG = "Selected Products has been acknowledged successfully";
                            //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                            renderProductLineage(ngDialog, $scope, 'confirmationBox', '35%', false, 'ngdialog-theme-default confirmation-box');
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
                 $scope.serviceData = { data: { product: { isShipped: 'yes', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Garcia leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc:'Florence, Italy',recLoc:'Florida' }, { name: 'Buckle', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc:'Florence, Italy',recLoc:'Florida' }] } } };
                $scope.lineageData = $scope.serviceData.data;
                $scope.lineageSubData = $scope.lineageData.product.items[0];
                $scope.lineageSubMaterialData = $scope.lineageData.product.items;

                vm.showProductLineage = function(data){
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
                    renderProductLineage(ngDialog, $scope, 'productLineageBox', '82%', true, 'ngdialog-theme-default lineage-box');
                };

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