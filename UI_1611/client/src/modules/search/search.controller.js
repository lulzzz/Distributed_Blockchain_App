/*
 **  controller for tracking shipment details and displaying result
 */

"use strict";

angular.module('searchModule')
    // searchController for tracking shipment details
    .controller('searchController', ['$state', 'appConstants', 'userModel', '$log', '$rootScope',
        '$scope', '$stateParams', 'shipmentList',
        function ($state, appConstants, userModel, $log, $rootScope,
            $scope, $stateParams, shipmentList) {
            try {
                var vm = this;
                vm.searchQuery = '';
                vm.user = userModel.getUser();
                bverifyUtil.setUserProfile(vm, userModel);

                /***********QR CODE based search functionality *************************/
                //Capturing broadcasted event from qrCodeReader directive to retreive User info read from uploaded QR img.
                $scope.$on('readQR', function (event, qrCode) {
                    $rootScope.hasError = false;
                    $rootScope.ERROR_MSG = appConstants.UPLOAD_ERR;
                    if (qrCode) {
                        $state.go('home.result', {
                            id: "",
                            tokenInfo: null,
                            qrCode: qrCode
                        });
                    }
                });
                //Capturing broadcasted event from qrCodeReader directive to display error.
                $scope.$on('QRError', function (event) {
                    $rootScope.hasError = true;
                });



                /*********** TOKEN ID based search functionality *************************/
                vm.searchTrackID = function () {
                    $state.go('home.result', {
                        id: vm.searchQuery,
                        tokenInfo: null,
                        qrCode: null
                    });
                };

                /*********** Shipment List functionality on load *************************/
                //Populating shipment details on load based on shipmentDetails resolve
                //shipmentList will be 'null' for other than producer/manufacturer
                if (shipmentList) {
                    shipmentList
                        .$promise
                        .then(function (response) {
                            vm.list = response;
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });

                    vm.getShipmentDetails = function (data) {
                        if (data) {
                            $state.go('home.result', {
                                id: vm.searchQuery,
                                tokenInfo: data,
                                qrCode: null
                            });
                        }
                    };
                }

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }
    ])

// searchResultController for rendering shipment details
.controller('searchResultController', ['$state', 'appConstants', '$log', 'shipmentDetails', '$stateParams', 'userModel',
    function ($state, appConstants, $log, shipmentDetails, $stateParams, userModel) {
        try {
            var vm = this;
            bverifyUtil.setUserProfile(vm, userModel);
            /*********** Shipment Details functionality based on QR/TOKEN search *************************/
            if (!shipmentDetails.$promise) {
                vm.shipment = shipmentDetails;
                vm.tokenID = vm.shipment.tokenId;
            } else {
                vm.tokenID = ($stateParams.id && $stateParams.id !== '') ? $stateParams.id : '';
                shipmentDetails
                    .$promise
                    .then(function (response) {
                        vm.shipment = bverifyUtil.parseShipmentDetails(response);
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            }
        } catch (e) {
            $log.error(appConstants.FUNCTIONAL_ERR, e);
        }
    }
]);