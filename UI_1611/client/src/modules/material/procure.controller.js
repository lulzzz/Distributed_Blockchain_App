/*
 **  procure Controller for handling user based 
 **  product/material acknowledgement business logic 
 */

"use strict";

angular.module('materialModule')

//For acknowledging received product
.controller('procureMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
            'procureMaterialService', '$log', 'registeredMatList', 'ngDialog', '$scope', 'ngToast', 'searchServiceAPI',
            function (userModel, appConstants, $state, $rootScope,
                procureMaterialService, $log, registeredMatList, ngDialog, $scope, ngToast, searchServiceAPI) {
                try {
                    var vm = this;
                    vm.user = userModel.getUser();
                    bverifyUtil.setUserProfile(vm, userModel);
                    vm.list = [];
                    $scope.ifRow = {};
                    $scope.parentSelectedRows = [];


                    //Populating list of Material on load based on registeredMatList resolve
                    registeredMatList
                        .$promise
                        .then(function (response) {
                            vm.list = parsePendingMatShipments(response.shipments);
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });

                    /***** CONFIRM action **********/
                    $scope.redirectUser = function (flag) {
                        if (!flag) {
                            ngDialog.close();
                            return;
                        }
                        if (flag && vm.isManufacturer) {
                            $state.reload(); // for time being
                            //$state.go('productReg');
                        }
                    };

                    /******************* PROCURE List of product/material *************************/
                    /*    TO-DO need to test with actual data and implementation */

                    vm.procure = function (dataList) {

                        if ($scope.ifRow.listOfSelectedRows.length <= 0) {
                            $rootScope.hasError = true;
                            $rootScope.ERROR_MSG = appConstants.PROCURE_CHECKBOX_ERR;
                            return;
                        }
                        $rootScope.hasError = false;

                        angular.forEach($scope.ifRow.listOfSelectedRows, function (val, key) {

                                procureMaterialService
                                    .procureMaterial(val) // for demo instance
                                    //.procureMaterial(dataList)
                                    .then(function (response) {
                                        if (response)
                                            bverifyUtil.openModalDialog(ngDialog, $scope, 'material-procure-confirmBox', '38%', true, 'ngdialog-theme-default confirmation-box');
                                    }, function (err) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                                    })
                                    .catch(function (e) {
                                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                                    });
                            });
                        };

                        /**************Material Lineage functionality **********************/
                        vm.showLineage = function (rowData) {
                            searchServiceAPI
                                .search(rowData.id)
                                .then(function (response) {
                                    var shipmentDetails = bverifyUtil.parseShipmentDetails(response);
                                    var n = getLineageInfo(rowData, shipmentDetails, vm.user);
                                    $scope.lineageData = n.data;
                                    $scope.lineageSubData = $scope.lineageData.product.items[0];
                                    $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                                    bverifyUtil.openModalDialog(ngDialog, $scope, 'procure-material-lineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
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


        function parsePendingMatShipments(data) {
            var list = [];
            angular.forEach(data, function (val, key) {
                if (parseInt(val.id) > 0) {
                    list.push({
                        id: val.id,
                        quantity: val.quantity,
                        shipDate: PARSER.parseMilliSecToDate(val.shipDate),
                        sender: bverifyUtil.getUserDetails(val.sender),
                        materialName: CONVERTER.hexTostr(val.name),
                        quality: CONVERTER.hexTostr(val.quality),
                        shipmentType: CONVERTER.hexTostr(val.shipmentType)
                    })
                }
            });
            return list;
        };


        function getLineageInfo(row, shipmentDetails, user) {
            return {
                data: {
                    product: {
                        isShipped: "yes",
                        name: user.userName,
                        mfgDate: shipmentDetails.productionDate,
                        receivedDate: shipmentDetails.shipDate,
                        items: [{
                            name: shipmentDetails.name,
                            mfgDate: shipmentDetails.productionDate,
                            shipmentDate: shipmentDetails.shipDate,
                            loc: "Florence, Italy",
                            recLoc: bverifyUtil.getUserLocation(user.accountToken),
                        }]
                    }
                }
            }
        };