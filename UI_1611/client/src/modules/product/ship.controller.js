/*
**  product Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('productModule')

    //For shipment of registered products
    .controller('productShipController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI',
        '$log', 'productModel', 'ngDialog', '$scope', 'userServiceAPI',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI,
            $log, productModel, ngDialog, $scope, userServiceAPI) {
            try {
                var vm = this;
                productModel.resetProduct();
                vm.user = userModel.getUser();
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.isManufacturer = userModel.isManufacturer();
                vm.isProducer = userModel.isProducer();
                vm.isRetailer = userModel.isRetailer();
                vm.isAdmin = userModel.isAdmin();
                vm.product = productModel.getProduct();
                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.exampleModel = [];
                if (vm.isManufacturer) {
                    vm.data = [{ id: 1, label: "Retailer1" }, { id: 2, label: "Retailer1" }, { id: 3, label: "Retailer1" },
                        { id: 4, label: "Retailer1" }, { id: 5, label: "Retailer1" }, { id: 6, label: "Distributer1" }, { id: 7, label: "Distributer2" }
                        , { id: 8, label: "Distributer3" }, { id: 9, label: "Distributer4" }, { id: 10, label: "Distributer5" }];
                }
                if (userModel.isProducer(0)) {
                    vm.data = [{ id: 1, label: "Manufacturer1" }, { id: 2, label: "Manufacturer2" }, { id: 3, label: "Manufacturer3" },
                        { id: 4, label: "Manufacturer4" }];
                }

                $scope.redirectUser = function(flag){
                    ngDialog.close();
                    var userReq = {
                        id : vm.isManufacturer ? 'retailer' : vm.isProducer ? 'manufacturer' : ''
                    }
                    userServiceAPI
                            .login(userReq)
                            .then(function(response){
                                userModel.setUser(response.user);
                                $state.go('acknowledge');
                            }, function(err){
                                 $log.error(appConstants.FUNCTIONAL_ERR, err);
                            })
                            .catch(function(e){
                                 $log.error(appConstants.FUNCTIONAL_ERR, err);
                            });
                };

                vm.doProductShipment = function () {
                    // do Product/material shipment
                    productServiceAPI
                        .shipProduct(vm.product)
                        .then(function (response) {
                            //productModel.setProduct(response.shipmentDetails);
                            //vm.product = productModel.getProduct();
                            $rootScope.hasError = false;
                            /*$rootScope.isSuccess = true;
                            $rootScope.SUCCESS_MSG = "Product has been shipped successfully";
                            */
                            //displayModelDialog(ngDialog, $scope, '');
                            
                            $scope.randomToken = 'LFG' + (Math.floor(Math.random()*90000) + 10000) + '';
                            $scope.name = vm.isManufacturer ? response.productName : response.materialName;
                            var templateID = vm.isManufacturer ? 'productShipConfirmation' : 'materialShipConfirmation';
                            ngDialog.open({
                                scope: $scope,
                                width: 600,
                                template: templateID,
                                closeByDocument: false,
                            });
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
        }]);

function displayModelDialog(ngDialog, scope, templateID) {
    ngDialog.open({
        scope: scope,
        width: 400,
        template: '',
        plain: true
    });
}