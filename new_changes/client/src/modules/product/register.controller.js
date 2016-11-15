/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('productModule')

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
    .controller('productRegisterController', ['userModel', 'appConstants', '$state', '$rootScope',
        'productServiceAPI', '$log', 'Product', 'productList', '$scope', 'ngDialog',
        function (userModel, appConstants, $state, $rootScope,
            productServiceAPI, $log, Product, productList, $scope, ngDialog) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isReadonly = false;
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.isAdmin = userModel.isAdmin();
                vm.header = vm.isManufacturer ? 'REGISTER NEW PRODUCT' : 'REGISTER NEW MATERIAL';
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

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };

                // Register new Product/material
                vm.registerNewProduct = function () {

                    var req = angular.copy(vm.product.getData());
                    delete req['productList'];

                    productServiceAPI
                        .registerProduct(req)
                        .then(function (response) {
                            vm.product.setData(response);
                            $rootScope.hasError = false;
                            $rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_REGISTERED : appConstants.MATERIAL_REGISTERED;
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                //Capturing broadcasted event from appProductList directive to implement edit/view
                $scope.$on('edit/view', function (event, msg) {
                    vm.product.setData(msg.data);
                    vm.isReadonly = msg.isEdit ? false : true;
                });

                //Capturing broadcasted event from appProductList directive to implement delete
                $scope.$on('delete', function (event, data) {

                    //Making delete service call
                    productServiceAPI
                        .productDelete({ productId: data.id })
                        .then(function (response) {
                            vm.product.setProductList(response);
                            vm.list = vm.product.getProductList();
                            $rootScope.hasError = false;
                            $rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = vm.isManufacturer ? appConstants.PROD_DELETED : appConstants.MATERIAL_DELETED;
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                });


            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);