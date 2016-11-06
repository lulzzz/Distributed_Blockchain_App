/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('bverifyApp')

    //For dashboard of logged in user
    .controller('dashboardController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function(userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For new product/material resgistration
    .controller('productRegisterController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log', 'Product',
        function(userModel, appConstants, $state, $rootScope, productServiceAPI, $log, Product) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.header = vm.isManufacturer ? 'REGISTER NEW PRODUCT' : 'REGISTER NEW MATERIAL';
                vm.product = new Product();
                vm.list = [];

                // get complete previous Product/material list
                productServiceAPI
                    .getProductList({
                        userName: vm.user.userName,
                        userProfile: vm.user.userProfile
                    })
                    .then(function(response) {
                        vm.product.setProductList(response);
                        vm.list = vm.product.getProductList();
                        //$state.go('product'); //TO-DO this has to be redirect to dashboard screen
                    }, function(err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function(e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                vm.file = {
                    name: ''
                }
                vm.uploadFile = function(file, event) {
                    event.preventDefault();
                    if (file) {
                        vm.file.name = file.name;
                        vm.product.file = file;
                    }
                };
                vm.openDatepicker = function() {
                    vm.datepickerObj.popup.opened = true;
                };


                // Register new Product/material
                vm.registerNewProduct = function() {

                    productServiceAPI
                        .registerProduct(vm.product.getData())
                        .then(function(response) {
                            vm.product.setData(response);
                            $rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_REGISTERED : appConstants.MATERIAL_REGISTERED;
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For shipment of registered products
    .controller('productShipController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function(userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.product = {};
                vm.openDatepicker = function() {
                    vm.datepickerObj.popup.opened = true;
                };
                vm.settings = {
                    scrollable: true,
                    scrollableHeight: '250px'
                };
                vm.example8model = [];
                vm.example8data = [{ id: 1, label: "Retailer1" }, { id: 2, label: "Retailer1" }, { id: 3, label: "Retailer1" },
                    { id: 4, label: "Retailer1" }, { id: 5, label: "Retailer1" }, { id: 6, label: "Distributer1" }, { id: 7, label: "Distributer2" }
                    , { id: 8, label: "Distributer3" }, { id: 9, label: "Distributer4" }, { id: 10, label: "Distributer5" }];

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
    .controller('productAckController', ['userModel', 'appConstants', '$state', '$rootScope', 
                                'productServiceAPI', '$log', 'productList', 'NgTableParams', 'Product',
        function(userModel, appConstants, $state, $rootScope, 
                                productServiceAPI, $log, productList, NgTableParams, Product) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.isProducer = userModel.isProducer();
                vm.header = vm.isManufacturer ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
                vm.product = new Product();
                vm.list = [];
                productList
                    .$promise
                    .then(function(response) {
                        vm.product.setProductList(response);
                        vm.list = vm.product.getProductList();
                    }, function(err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function(e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });





                vm.customConfigParams =   new NgTableParams({
                        page: 1,
                        count: 10
                    },
                    {
                        total : vm.list.length
                    });
                vm.userProfile = userModel.getUserProfile();

                function createUsingFullOptions() {
                    
                   
                };

                /*      TO-DO need to test with actual data and implementation 
                                // do Product/material shipment
                                productServiceAPI
                                    .ackProduct(vm.product)
                                    .then(function (response) {
                                        
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