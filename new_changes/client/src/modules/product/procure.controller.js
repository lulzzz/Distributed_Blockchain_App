/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('productModule')

    //For acknowledging received product
    .controller('productAckController', ['userModel', 'appConstants', '$state', '$rootScope',
        'productServiceAPI', '$log', 'productList', 'Product',
        function (userModel, appConstants, $state, $rootScope,
            productServiceAPI, $log, productList, Product) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.isProducer = userModel.isProducer();
                vm.header = vm.isManufacturer ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
                vm.product = new Product();
                vm.list = [];

                //Populating list of Products on load based on productList resolve
                productList
                    .$promise
                    .then(function (response) {
                        vm.product.setProductList(response);
                        vm.list = vm.product.getProductList();
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

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);