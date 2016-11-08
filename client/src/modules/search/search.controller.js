/*
**  controller for tracking shipment details and displaying result
*/

"use strict";

angular.module('bverifyApp')
    // searchController for tracking shipment details
    .controller('searchController', ['$state', 'appConstants', 'userModel', '$log', '$rootScope', 'ngDialog', '$scope',
        function ($state, appConstants, userModel, $log, $rootScope, ngDialog, $scope) {
            try {
                var vm = this;
                vm.searchQuery = ''; //TO-DO need to remove harcode
                vm.showDialog = false;
                vm.user = userModel.getUser();
                var req = "";
                vm.openDialog = function () {
                    ngDialog.open({ template: 'uploadDialog'});
                }

                //Capturing broadcasted event from qrCodeReader directive to retreive User info read from uploaded QR img.
                $scope.$on('readQR', function (event, trackInfo) {
                    if (trackInfo) {
                        req = trackInfo;
                    }
                });
                //Capturing broadcasted event from qrCodeReader directive to retreive User info read from uploaded QR img.
                $scope.$on('searchQR', function (event) {
                    $state.go('home.result', { id: vm.searchQuery, trackInfo: req });
                });
                vm.searchTrackID = function () {
                    $state.go('home.result', { id: vm.searchQuery });
                };

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])
    // searchResultController for rendering shipment details
    .controller('searchResultController', ['$state', 'appConstants', '$log', 'shipmentDetails', 'Product',
        function ($state, appConstants, $log, shipmentDetails, Product) {
            try {
                var vm = this;
                vm.product = new Product();
                shipmentDetails
                    .$promise
                    .then(function (response) {
                        vm.product.setData(response);
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);        