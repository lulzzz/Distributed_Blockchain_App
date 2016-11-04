/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('bverifyApp')

    //For dashboard of logged in user
    .controller('dashboardController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For new product/material resgistration
    .controller('productRegisterController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.header = vm.isManufacturer ? 'REGISTER NEW PRODUCT' : 'REGISTER NEW MATERIAL';
                vm.product = {
                    name: '',
                    quantity: '',
                    batchNumber: '12',
                    quality: '',
                    color: '',
                    weight: '',
                    manufacturingDate: new Date()
                };
                vm.file = {
                    name: ''
                }
                vm.uploadFile = function (file) {
                    if (file) {
                        vm.file.name = file.name;
                        vm.product.file = file;
                    }
                };
                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };
                vm.productList = [];

                // Register new Product/material
                vm.registerNewProduct = function () {
                    console.log(vm);
                    productServiceAPI
                        .registerProduct(vm.product)
                        .then(function (response) {
                            vm.product = response.product;
                            //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                /*      TO-DO need to test with actual data and implementation                                
                            // get complete previous Product/material list
                            productServiceAPI
                                .getProductList({})
                                .then(function (response) {
                                    vm.productList = response.list;
                                    //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                                }, function (err) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                                })
                                .catch(function (e) {
                                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                                });
                            
            */
            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For shipment of registered products
    .controller('productShipController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.product = {};

                /*      TO-DO need to test with actual data and implementation
                                // do Product/material shipment
                                productServiceAPI
                                    .shipProduct(vm.product)
                                    .then(function (response) {
                                        vm.product = response.shippedProduct;
                                        //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                                    }, function (err) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                                    })
                                    .catch(function (e) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                                    })
                */
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For acknowledging received product
    .controller('productAckController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.header = vm.isManufacturer ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
                vm.productList = [];

                /*      TO-DO need to test with actual data and implementation
                                // do Product/material shipment
                                productServiceAPI
                                    .ackProduct(vm.product)
                                    .then(function (response) {
                                        vm.product = response.shippedProduct;
                                        //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                                    }, function (err) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                                    })
                                    .catch(function (e) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                                    });
                */
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);