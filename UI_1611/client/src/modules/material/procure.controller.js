/*
**  procure Controller for handling user based 
**  product/material acknowledgement business logic 
*/

"use strict";

angular.module('materialModule')

    //For acknowledging received product
    .controller('procureMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
        'procureMaterialService', '$log', 'materialList', 'ngDialog', '$scope', 'ngToast',
        function(userModel, appConstants, $state, $rootScope,
            procureMaterialService, $log, materialList, ngDialog, $scope, ngToast) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                vm.list = [];
                $scope.ifRow = {};
                $scope.parentSelectedRows = [];

                /****************** MATERIAL List to procure */
                //Populating list of Material on load based on materialList resolve
                materialList
                    .$promise
                    .then(function(response) {
                        vm.list = parsePendingMatShipments(response.shipments);
                    }, function(err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function(e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });

                /***** CONFIRM action **********/
                $scope.redirectUser = function(flag) {
                    if (!flag) {
                        ngDialog.close();
                        return;
                    }
                    if (flag && vm.isManufacturer) {
                        $state.go('productReg');
                    }
                };

                /******************* PROCURE List of product/material *************************/
                /*    TO-DO need to test with actual data and implementation */

                vm.procure = function(dataList) {

                    if ($scope.ifRow.listOfSelectedRows.length <= 0) {
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = appConstants.PROCURE_CHECKBOX_ERR;
                        return;
                    }
                    $rootScope.hasError = false;

                    procureMaterialService
                        .procureMaterial({}) // for demo instance
                        //.procureMaterial(dataList)
                        .then(function(response) {
                            if (response)
                                renderDialog(ngDialog, $scope, 'material-procure-confirmBox', '38%', true, 'ngdialog-theme-default confirmation-box');
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                /**************Material Lineage functionality **********************/
                vm.showLineage = function(data) {
                    procureMaterialService
                        .getAckLineageData(data)
                        .then(function(response) {
                            $scope.lineageData = response.data;
                            $scope.lineageSubData = $scope.lineageData.product.items[0];
                            $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            renderDialog(ngDialog, $scope, 'procure-material-lineageBox', '60%', true, 'ngdialog-theme-default lineage-box');
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
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
 *  Utility function for rendering product lineage 
 ***/
function renderDialog(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};

function parsePendingMatShipments(data) {
    var list = [];
    angular.forEach(data, function(val, key) {
        list.push({
            id: data.id,
            quantity: data.quantity,
            shipDate: PARSER.parseMilliSecToDate(data.shipDate),
            sender: CONVERTER.hexTostr(data.sender),
            materialName: CONVERTER.hexTostr(data.name),
            quality: CONVERTER.hexTostr(data.quality),
            shipmentType: CONVERTER.hexTostr(data.shipmentType)
        })
    });
    return list;
}