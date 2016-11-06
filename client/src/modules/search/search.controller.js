/*
**  controller for tracking shipment details and displaying result
*/

"use strict";

angular.module('bverifyApp')
    // searchController for tracking shipment details
    .controller('searchController', ['$state', 'appConstants', 'userModel', '$log',
        function ($state, appConstants, userModel, $log) {
            try {
                var vm = this;
                vm.searchQuery = ''; //TO-DO need to remove harcode
                vm.user = userModel.getUser();
                vm.search = function () {
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