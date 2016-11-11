/*
**  product Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('productModule')

    //For shipment of registered products
    .controller('productShipController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log', 'Product',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI, $log, Product) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isRetailer = userModel.isRetailer();
                vm.isAdmin = userModel.isAdmin();
                vm.product = new Product();
                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };
                vm.settings = {
                    scrollable: true,
                    scrollableHeight: '250px'
                };
                vm.exampleModel = [];
                vm.data = [{ id: 1, label: "Retailer1" }, { id: 2, label: "Retailer1" }, { id: 3, label: "Retailer1" },
                    { id: 4, label: "Retailer1" }, { id: 5, label: "Retailer1" }, { id: 6, label: "Distributer1" }, { id: 7, label: "Distributer2" }
                    , { id: 8, label: "Distributer3" }, { id: 9, label: "Distributer4" }, { id: 10, label: "Distributer5" }];

                vm.doProductShipment = function () {
                    // do Product/material shipment
                    productServiceAPI
                        .shipProduct(vm.product)
                        .then(function (response) {
                            vm.product.setData(response.shipmentDetails);
                            $rootScope.hasError = false;
                            $rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = "Product has been shipped successfully";
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])