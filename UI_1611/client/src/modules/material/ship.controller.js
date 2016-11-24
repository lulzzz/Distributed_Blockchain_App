/*
**  ship Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('materialModule')

    //For shipment of registered products
    .controller('shipMaterialController', ['userModel', 'appConstants', '$state', '$rootScope', 'materialService',
        '$log', 'shipModel', 'ngDialog', '$scope', 'userServiceAPI', '$stateParams', 'localStorageService',
        function (userModel, appConstants, $state, $rootScope, materialService,
            $log, shipModel, ngDialog, $scope, userServiceAPI, $stateParams, localStorageService) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                $rootScope.isLoggedIn = userModel.isLoggedIn();

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };

                if ($stateParams.qrCode) {
                    //localStorageService.set('qrCode', angular.toJson($stateParams.qrCode))
                    materialService
                        .getMaterial($stateParams.qrCode)
                        .then(function (response) {
                            shipModel.setModel(response);
                            vm.ship = shipModel.getModel();
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                } else {
                    materialService
                        .getMaterialList(vm.user)
                        .then(function (response) {
                            vm.materialList = response;
                            shipModel.setModel(vm.materialList[0]);
                            vm.ship = shipModel.getModel();
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                }



                /****************** Distributer/Retailer Multiselect functionality *******************/
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.exampleModel = [];

                //Retreive all manufacturerr list and populate inside Multiselect
                materialService
                    .getManufacturerList(vm.user)
                    .then(function (response) {
                        vm.manufacturerList = response;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });


                /****************** material Shipment functionality *******************/
                vm.shipMaterial = function () {

                    if (!(isNaN(parseInt(vm.userQuantity, 10)))) {
                        if (parseInt(vm.userQuantity) > parseInt(vm.ship.quantity)) {
                            $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                            showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box', $scope);
                            return;
                        }
                    } else {
                        $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                        showWarning(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box', $scope);
                        return;
                    }
                    vm.ship.quantity = vm.userQuantity;
                    shipModel.setModel(vm.ship);
                    shipModel.shippedTo(vm.manufacturerList);

                    // do material shipment
                    materialService
                        .shipMaterial(shipModel.getModel())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.randomToken = 'LFG' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.name = vm.ship.materialName;
                            $scope.quality = vm.ship.quality;
                            $scope.entity = 'material';
                            showConfirmation(ngDialog, 'confirmationBox', 600, false, 'ngdialog-theme-default', $scope);
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
                        id: 'manufacturer'
                    }
                    userServiceAPI
                        .login(userReq)
                        .then(function (response) {
                            userModel.setUser(response.user);
                            $state.go('materialAck');
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
 *  Utility function for rendering warning message 
 ***/
function showWarning(ngDialog, templateID, width, showClose, className, scope) {
    ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};

/****
 *  Utility function for rendering confirmation message 
 ***/
function showConfirmation(ngDialog, templateID, width, showClose, className, scope) {
    ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
}