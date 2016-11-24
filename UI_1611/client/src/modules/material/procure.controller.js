/*
**  procure Controller for handling user based 
**  product/material acknowledgement business logic 
*/

"use strict";

angular.module('materialModule')

    //For acknowledging received product
    .controller('procureMaterialController', ['userModel', 'appConstants', '$state', '$rootScope',
        'materialService', '$log', 'materialList','ngDialog', '$scope',
        function(userModel, appConstants, $state, $rootScope,
            materialService, $log, materialList, ngDialog, $scope) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                vm.list = [];

                /****************** MATERIAL List to procure */
                //Populating list of Material on load based on materialList resolve
                materialList
                    .$promise
                    .then(function(response) {
                        vm.list = response;
                    }, function(err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function(e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });

					$scope.entity = 'materials';
					$scope.redirectUser = function(flag){
						if(!flag) {
							ngDialog.close();
							return;
						}
						if(flag && vm.isManufacturer) {
							$state.go('productReg');
						}
					};

                /******************* PROCURE List of product/material *************************/
                /*    TO-DO need to test with actual data and implementation */
				
                vm.procure = function(dataList) {
                    materialService
                        .procureMaterial({}) // for demo instance
                        //.procureMaterial(dataList)
                        .then(function(response) {
                            if(response)
                                renderLineage(ngDialog, $scope, 'confirmationBox', '35%', false, 'ngdialog-theme-default confirmation-box');
                        }, function(err) {
                            $log.error(appConstants.FUNCTIONAL_ERR, err);
                        })
                        .catch(function(e) {
                            $log.error(appConstants.FUNCTIONAL_ERR, e);
                        });
                };


                /**************Product Lineage functionality **********************/
                // isShipped value will be 'yes' for retailer
                //Hardcoded. Need to remove
                $scope.serviceData = { data: { product: { isShipped: 'yes', name: 'Handbag', mfgDate: '1/1/2016', receivedDate: '1/1/2016', items: [{ name: 'Garcia leather', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc:'Florence, Italy',recLoc:'Florida' }, { name: 'Buckle', mfgDate: '3/1/2016', shipmentDate: '4/1/2016', receivedDate: '7/1/2016', loc:'Florence, Italy',recLoc:'Florida' }] } } };
                $scope.lineageData = $scope.serviceData.data;
                $scope.lineageSubData = $scope.lineageData.product.items[0];
                $scope.lineageSubMaterialData = $scope.lineageData.product.items;

                vm.showLineage = function(data){
                    if ($scope.lineageData.product.isShipped === 'yes') {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = true;
                    } else if ($scope.lineageData.product.isShipped === 'no') {
                        $scope.isShipped = false;
                        $scope.isShippedToRetailer = false;
                    }
                    else {
                        $scope.isShipped = true;
                        $scope.isShippedToRetailer = false;
                    }
                    renderLineage(ngDialog, $scope, 'productLineageBox', '82%', true, 'ngdialog-theme-default lineage-box');
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
function renderProductLineage(ngDialog, scope, templateID, width, showClose, className) {
    return ngDialog.open({
        scope: scope,
        width: width,
        template: templateID,
        showClose: showClose,
        className: className
    });
};