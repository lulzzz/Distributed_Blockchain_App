/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('productModule')

    //For acknowledging received product
    .controller('productAckController', ['userModel', 'appConstants', '$state', '$rootScope',
        'productServiceAPI', '$log', 'productList', 'productModel', 'ngDialog', '$scope',
        function (userModel, appConstants, $state, $rootScope, 
            productServiceAPI, $log, productList, productModel, ngDialog, $scope) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.isProducer = userModel.isProducer();
                vm.header = vm.isManufacturer ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
                vm.product = productModel.getProduct();
                vm.list = [];

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


                /*      TO-DO need to test with actual data and implementation 
                                // do Product/material shipment
                                productServiceAPI
                                    .ackProduct(vm.product)
                                    .then(function (response) {
                                         $rootScope.isSuccess = true;
                                         $rootScope.SUCCESS_MSG = "Products has been acknowledged successfully";
                                        //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                                    }, function (err) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                                    })
                                    .catch(function (e) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                                    });*/




                 /***** Product Lineage functionality */
                 // isShipped value will be 'yes' for retailer
                //Hardcoded. Need to remove
                $scope.serviceData = {data:{product:{isShipped:'yes',name:'Handbag',mfgDate:'1/1/2016',receivedDate:'1/1/2016',items:[{name:'Leather',mfgDate:'3/1/2016',shipmentDate:'4/1/2016',receivedDate:'7/1/2016'},{name:'Buckel',mfgDate:'3/1/2016',shipmentDate:'4/1/2016',receivedDate:'7/1/2016'},{name:'screws',mfgDate:'7/1/2016',shipmentDate:'7/1/2016',receivedDate:'17/1/2016'}]}}};
				$scope.lineageData = $scope.serviceData.data;
				$scope.lineageSubData = $scope.lineageData.product.items[0];
				$scope.lineageSubMaterialData = $scope.lineageData.product.items;


                $scope.$on('productLineage', function (event, msg) {
                     if($scope.lineageData.product.isShipped === 'yes'){
						$scope.isShipped = true;
						$scope.isShippedToRetailer = true;
					} else if($scope.lineageData.product.isShipped === 'no') {
						 $scope.isShipped = false;
						 $scope.isShippedToRetailer = false;
					}
					else {
						$scope.isShipped = true;
						$scope.isShippedToRetailer = false;
					}

                    var dialog = ngDialog.open({
                            scope : $scope,
                            width: '70%',
                            template: 'externalTemplate.html'
					});
                });

                /*************************************************************** */

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);