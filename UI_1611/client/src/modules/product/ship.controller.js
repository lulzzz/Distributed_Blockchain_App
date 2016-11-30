/*
**  ship Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('productModule')

    //For shipment of registered products
    .controller('shipProductController', ['userModel', 'appConstants', '$state', '$rootScope', 'shipService',
        '$log', 'ngDialog', '$scope', 'userServiceAPI', '$stateParams', 'shipProductModel',
        function (userModel, appConstants, $state, $rootScope, shipService,
            $log, ngDialog, $scope, userServiceAPI, $stateParams, shipProductModel) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                $rootScope.isLoggedIn = userModel.isLoggedIn();
                vm.productList = [];

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };

                //if ($stateParams.qrCode) { for time being
                shipService
                    .getProduct($stateParams.qrCode)
                    .then(function (response) {
                        shipProductModel.setModel(response);
                        vm.ship = shipProductModel.getModel();
                        vm.productList.push({
                            qrCode: vm.ship.qrCode,
                            productName: vm.ship.productName,
                            batchNumber: vm.ship.batchNumber
                        })
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
                /*} else {  for time being
                    shipService
                        .getProductList(vm.user)
                        .then(function (response) {
                            vm.productList = response;
                            shipProductModel.setModel(vm.productList[0]);
                            vm.ship = shipProductModel.getModel();
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }*/



                /****************** Distributer/Retailer Multiselect functionality *******************/
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.selectedRetailers = [];

                //Retreive all retailer list and populate inside Multiselect
                shipService
                    .getRetailerList(vm.user)
                    .then(function (response) {
                        vm.retailerList = response;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                vm.showLineage = function (data) {

                    shipService
                        .getShipLineageData(data)
                        .then(function (response) {
                            $scope.lineageData = response.data;
                            $scope.lineageSubData = $scope.lineageData.product.items[0];
                            $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            $scope.ifNegativeUsecase = false;
                            $scope.isShipped = true;
                            $scope.isShippedToRetailer = false;
                            renderLineage(ngDialog, 'product-lineageBox', '60%', true, 'ngdialog-theme-default lineage-box', $scope);
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                /****************** material Shipment functionality *******************/
                vm.shipProduct = function () {

                    if (vm.selectedRetailers.length <= 0) {
                        $rootScope.hasError = true;
                        vm.showRedBox = true;
                        $rootScope.ERROR_MSG = 'Please select atleast one distributer/retailer.';
                        return;
                    } else {
                        $rootScope.hasError = false;
                        vm.showRedBox = false;
                    }

                    if (shipProductModel.verifyQuantity(vm.ship.quantity, vm.userQuantity)) {
                        vm.ship.quantity = vm.userQuantity;
                    } else {
                        $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                        renderLineage(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box', $scope);
                        return;
                    }

                    shipProductModel.setModel(vm.ship);
                    shipProductModel.shippedTo(selectedRetailers);

                    // do product shipment
                    shipService
                        .shipProduct(shipProductModel.getModel())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.qrCode = 'CCTH' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.productName = vm.ship.productName;
                            renderLineage(ngDialog, 'product-ship-confirmBox', 600, false, 'ngdialog-theme-default', $scope);
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                /****************** Confirmation box functionality *******************/
                $scope.redirectUser = function (flag) {
                    ngDialog.close();
                    var userReq = {
                        id: 'retailer'
                    }
                    userServiceAPI
                        .login(userReq)
                        .then(function (response) {
                            userModel.setUser(response.user);
                            $state.go('productAck');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        });
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
 *  Utility function for rendering confirmation message 
 ***/
function renderLineage(ngDialog, templateID, width, showClose, className, scope) {
    ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
}