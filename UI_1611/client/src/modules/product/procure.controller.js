/*
 **  procure Controller for handling user based 
 **  product/material acknowledgement business logic 
 */

"use strict";

angular.module('productModule')

//For acknowledging received product
.controller('procureProductController', ['userModel', 'appConstants', '$state', '$rootScope',
    'procureService', '$log', 'registeredProdList', 'ngDialog', '$scope',
    function (userModel, appConstants, $state, $rootScope,
        procureService, $log, registeredProdList, ngDialog, $scope) {
        try {
            var vm = this;
            vm.user = userModel.getUser();
            bverifyUtil.setUserProfile(vm, userModel);
            vm.list = [];
            $scope.ifRow = {};
            $scope.parentSelectedRows = [];

            //Populating list of Products on load based on registeredProdList resolve
            registeredProdList
                .$promise
                .then(function (response) {
                    vm.list = parsePendingProdShipments(response.shipments);
                }, function (err) {
                    $log.error(appConstants.FUNCTIONAL_ERR, err);
                })
                .catch(function (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                });

            /******************* PROCURE List of product/material *************************/

            vm.procure = function (dataList) {

                if ($scope.ifRow.listOfSelectedRows.length <= 0) {
                    $rootScope.hasError = true;
                    $rootScope.ERROR_MSG = appConstants.PROCURE_CHECKBOX_ERR;
                    return;
                }
                $rootScope.hasError = false;

                procureService
                    .procureProduct({}) // for demo instance
                    //.procureProduct(vm.list)
                    .then(function (response) {
                        bverifyUtil.openModalDialog(ngDialog, $scope, 'product-procure-confirmBox', '35%', true, 'ngdialog-theme-default confirmation-box');
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            };

            /***** CONFIRM action **********/
            $scope.redirectUser = function (flag) {
                ngDialog.close();
                return;
            };


            /**************Product Lineage functionality **********************/
            vm.showLineage = function (data) {
                procureService
                    .getAckLineageData(data)
                    .then(function (response) {
                        $scope.lineageData = response.data;
                        $scope.lineageSubData = $scope.lineageData.product.items[0];
                        $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                        bverifyUtil.openModalDialog(ngDialog, $scope, 'product-lineageBox', '82%', true, 'ngdialog-theme-default lineage-box');
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            };

            /*************************************************************** */

        } catch (e) {
            $log.error(appConstants.FUNCTIONAL_ERR, e);
        }
    }
]);

function parsePendingProdShipments(data) {
    var list = [];
    angular.forEach(data, function (val, key) {
        list.push({
            id: data.id,
            quantity: data.quantity,
            shipDate: PARSER.parseMilliSecToDate(data.shipDate),
            sender: CONVERTER.hexTostr(data.sender),
            productName: CONVERTER.hexTostr(data.name),
            quality: CONVERTER.hexTostr(data.quality),
            shipmentType: CONVERTER.hexTostr(data.shipmentType)
        })
    });
    return list;
}