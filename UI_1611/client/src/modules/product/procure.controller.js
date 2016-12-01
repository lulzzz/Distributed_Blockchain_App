/*
**  procure Controller for handling user based 
**  product/material acknowledgement business logic 
*/

"use strict";

angular.module('productModule')

    //For acknowledging received product
    .controller('procureProductController', ['userModel', 'appConstants', '$state', '$rootScope',
        'procureService', '$log', 'productList', 'ngDialog', '$scope',
        function (userModel, appConstants, $state, $rootScope,
            procureService, $log, productList, ngDialog, $scope) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                vm.list = [];
                $scope.ifRow = {};
				$scope.parentSelectedRows =[];
                vm.procuredList = [];

                /****************** PRODUCT/MATERIAL List to procure */
                //Populating list of Products on load based on productList resolve
                productList
                    .$promise
                    .then(function (response) {
                        vm.list = response;
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });

                /******************* PROCURE List of product/material *************************/
                /*    TO-DO need to test with actual data and implementation */

                vm.procure = function (dataList) {

                    if($scope.ifRow.listOfSelectedRows.length <= 0){
                        $rootScope.hasError = true;
                        $rootScope.ERROR_MSG = appConstants.PROCURE_CHECKBOX_ERR;
                        return;
                    }else{
                        $rootScope.hasError = false;
                        angular.forEach($scope.ifRow.listOfSelectedRows, function(val, key){
                            console.log(val);   
                        })
                    }
                    

                    procureService
                        .procureProduct({}) // for demo instance
                        //.procureProduct(vm.list)
                        .then(function (response) {
                            renderDialog(ngDialog, $scope, 'product-procure-confirmBox', '35%', false, 'ngdialog-theme-default confirmation-box');
                        }, function (err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function (e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };

                $scope.entity = 'products';
                $scope.redirectUser = function (flag) {
                    if (!flag) {
                        ngDialog.close();
                        return;
                    }
                    if (flag && vm.isRetailer) {
                        ngDialog.close();
                    }
                };


                /**************Product Lineage functionality **********************/
                vm.showLineage = function (data) {
                    procureService
                        .getAckLineageData(data)
                        .then(function (response) {
                            $scope.lineageData = response.data;
                            $scope.lineageSubData = $scope.lineageData.product.items[0];
                            $scope.lineageSubMaterialData = $scope.lineageData.product.items;
                            renderDialog(ngDialog, $scope, 'product-lineageBox', '82%', true, 'ngdialog-theme-default lineage-box');
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