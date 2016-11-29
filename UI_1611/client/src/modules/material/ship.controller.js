/*
**  ship Controller for handling user based 
**  product shipment business logic 
*/

"use strict";

angular.module('materialModule')

    //For shipment of registered products
    .controller('shipMaterialController', ['userModel', 'appConstants', '$state', '$rootScope', 'shipMaterialService',
        '$log', 'shipMaterialModel', 'ngDialog', '$scope', 'userServiceAPI', '$stateParams', 'localStorageService',
        function (userModel, appConstants, $state, $rootScope, shipMaterialService,
            $log, shipMaterialModel, ngDialog, $scope, userServiceAPI, $stateParams, localStorageService) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                $rootScope.isLoggedIn = userModel.isLoggedIn();

                vm.openDatepicker = function () {
                    vm.datepickerObj.popup.opened = true;
                };

                //if ($stateParams.qrCode) {  for time being
                //localStorageService.set('qrCode', angular.toJson($stateParams.qrCode))
                shipMaterialService
                    .getMaterial($stateParams.qrCode)
                    .then(function (response) {
                        shipMaterialModel.setModel(response);
                        vm.ship = shipMaterialModel.getModel();
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
                /* } else {  for time being
                     shipMaterialService
                         .getMaterialList(vm.user)
                         .then(function (response) {
                             vm.materialList = response;
                             shipMaterialModel.setModel(vm.materialList[0]);
                             vm.ship = shipMaterialModel.getModel();
                         }, function (err) {
                             $log.error(appConstants.FUNCTIONAL_ERR, err);
                         })
                         .catch(function (e) {
                             $log.error(appConstants.FUNCTIONAL_ERR, e);
                         });
                 }*/



                /****************** Distributer/Retailer Multiselect functionality *******************/
                vm.settings = appConstants.MULTISELECT_SETTINGS;
                vm.exampleModel = [];

                //Retreive all manufacturerr list and populate inside Multiselect
                shipMaterialService
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
                    if (shipMaterialModel.verifyQuantity(vm.ship.quantity, vm.userQuantity)) {
                        vm.ship.quantity = vm.userQuantity;
                    } else {
                        $scope.warningMsg = appConstants.QUANTITY_EXCEEDED;
                        renderPopup(ngDialog, 'warningBox', '42%', false, 'ngdialog-theme-default warning-box', $scope);
                        return;
                    }
                    shipMaterialModel.setModel(vm.ship);
                    shipMaterialModel.shippedTo(vm.manufacturerList);

                    // do material shipment
                    shipMaterialService
                        .shipMaterial(shipMaterialModel.getModel())
                        .then(function (response) {
                            $rootScope.hasError = false;
                            $scope.qrCode = 'GL' + (Math.floor(Math.random() * 90000) + 10000) + '';
                            $scope.materialName = vm.ship.materialName;
                            renderPopup(ngDialog, 'material-ship-confirmBox', 600, false, 'ngdialog-theme-default', $scope);
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
function renderPopup(ngDialog, templateID, width, showClose, className, scope) {
    ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};