/*
**  product Controller for handling user based 
**  product register/ship/acknowledgement business logic 
*/

"use strict";

angular.module('bverifyApp')

    //For dashboard of logged in user
    .controller('dashboardController', ['appConstants', '$state', 
        function (appConstants, $state) {
            try {
                var vm = this;
                
                //TO-DO will be replace by authenticated user
                vm.user = {
                    userName: 'Guest',
                    certification: '',
                    consortium: {
                        id: '',
                        name: ''
                    },
                    userProfile: {
                        id: '',
                        profile: window.profile === 'producer' ? 'Raw Material Producer' : window.profile
                    },
                    isAuthenticatedUser: true,
                };
            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For new product/material resgistration
    .controller('productRegisterController', ['appConstants', '$state', '$scope',
        function (appConstants, $state, $scope) {
            try {
                var vm = this;
                vm.product = {
                    materialName : 'Leather',
                    productName : 'Handbag',
                    quantity : '50',
                    batchNumber : 'B00RWSC2MW',
                    quality : 'Full Grain',
                    color : 'Brown',
                    weight : '100 kg',
                    manufacturingDate : new Date()
                };
/*                vm.datepickerObj = {
                    dateFormat : 'dd-MM-yyyy',
                    dateOptions : {
                        startingDay: 1,
                        showWeeks: false
                    },
                    popup : {
                        opened: false
                    }
                }
                vm.open = function () {
                        
                        vm.datepickerObj.popup.opened = true;
                    };
                    */
                vm.openDatepicker = function() {
                    vm.datepickerObj.popup.opened = true;
                };

                vm.fileName = "";
				vm.uploadFiles = function(file){
					if (file) {
						vm.fileName = file.name;
					}
				}

                //TO-DO will be replace by authenticated user
                vm.user = {
                    userName: 'Guest',
                    certification: '',
                    consortium: {
                        id: '',
                        name: ''
                    },
                    userProfile: {
                        id: '',
                        profile: window.profile === 'producer' ? 'Raw Material Producer' : window.profile
                    },
                    isAuthenticatedUser: true,
                };

                /*vm.registerNewProduct = function(){
                    var n = window.profile === 'producer' ? 'Material' : 'Product'; 
                    $scope.n = n;
                    $scope.randomNum = Math.floor(Math.random()*90000) + 10000;
					$scope.redirectShipProduct = function(){
						ngDialog.close();
						$scope.$destroy();
						$state.go('shipment');
					};
                    var dialog = ngDialog.open({
                            scope : $scope,
                            width: 400,
                            template: '\
                                <legend class="legendHead">GENERATED TOKEN\
                                </legend>\
                                <p class="alert alert-success">{{n}} has been registered successfully</p>\
                                <p><div class="text-center">\
                                    <img src="asset/images/dummy_qrcode.png" class="" style="position: relative;top:0px;"/>\
                                    <div class="" style="font-size:14px;font-weight:bold;position:relative;top:20px;">Token : ABC{{randomNum}}</div>\
							    </div></p>\
                                <div class="ngdialog-buttons text-center" style="padding-top:20px;">\
									<button type="button" class="ngdialog-button ngdialog-button-primary" style="float:none" ng-click="redirectShipProduct()">SHIP {{n | uppercase}}</button>\
                                    <button type="button" class="ngdialog-button ngdialog-button-primary" style="float:none" ng-click="closeThisDialog(0)">CANCEL</button>\
								</div>',
                            plain: true,
							closeByDocument: false
                });
				}*/
            } catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    ///For shipment of registered products
    .controller('productShipController', ['appConstants', '$state', '$rootScope', '$log', '$scope',
        function(appConstants, $state, $rootScope, $log, $scope) {
            try {
                var vm = this;
               vm.product = {
                    materialName : 'Leather',
                    productName : 'Handbag',
                    modelNumber : 'BG463A',
                    quantity : '50',
                    batchNumber : 'B00RWSC2MW',
                    quality : 'Full Grain',
                    color : 'Brown',
                    weight : '100 kg',
                    manufacturingDate : new Date()
                };
/*                vm.datepickerObj = {
                    dateFormat : 'dd-MM-yyyy',
                    dateOptions : {
                        startingDay: 1,
                        showWeeks: false
                    },
                    popup : {
                        opened: false
                    }
                }
                vm.open = function () {
                        
                        vm.datepickerObj.popup.opened = true;
                    };
                    */
                

                vm.fileName = "";
                vm.uploadFiles = function(file){
                    if (file) {
                        vm.fileName = file.name;
                    }
                }


                //TO-DO will be replace by authenticated user
                vm.user = {
                    userName: 'Guest',
                    certification: '',
                    consortium: {
                        id: '',
                        name: ''
                    },
                    userProfile: {
                        id: '',
                        profile: window.profile === 'producer' ? 'Raw Material Producer' : window.profile
                    },
                    isAuthenticatedUser: true,
                };
                vm.openDatepicker = function() {
                    vm.datepickerObj.popup.opened = true;
                };
                vm.settings = {
                    scrollable: true,
                    scrollableHeight: '250px'
                };
                vm.exampleModel = [];
                if(window.profile === 'manufacturer'){
                    vm.data = [{ id: 1, label: "Retailer1" }, { id: 2, label: "Retailer1" }, { id: 3, label: "Retailer1" },
                    { id: 4, label: "Retailer1" }, { id: 5, label: "Retailer1" }, { id: 6, label: "Distributer1" }, { id: 7, label: "Distributer2" }
                    , { id: 8, label: "Distributer3" }, { id: 9, label: "Distributer4" }, { id: 10, label: "Distributer5" }];
                }
                if(window.profile === 'producer'){
                    vm.data = [{ id: 1, label: "Manufacturer1" }, { id: 2, label: "Manufacturer2" }, { id: 3, label: "Manufacturer3" },
                    { id: 4, label: "Manufacturer4" }];
                }
				
                /*vm.doProductShipment = function(){
                    var n = window.profile === 'producer' ? 'Material' : 'Product'; 
                    $scope.n = n;
                    $scope.randomNum = Math.floor(Math.random()*90000) + 10000;
					$scope.redirectShipProduct = function(){
						ngDialog.close();
						$scope.$destroy();
						$state.go('acknowledge');
					};
                    ngDialog.open({
                            scope : $scope,
                            width: 400,
                            template: '\
                                <legend class="legendHead">GENERATED TOKEN\
                                </legend>\
                                <p class="alert alert-success">{{n}} has been shipped successfully</p>\
                                <p><div class="text-center">\
                                    <img src="asset/images/dummy_qrcode.png" class="" style="position: relative;top:0px;"/>\
                                    <div class="" style="font-size:14px;font-weight:bold;position:relative;top:20px;">Token : ABC{{randomNum}}</div>\
							    </div></p>\
                               <div class="ngdialog-buttons text-center" style="padding-top:20px;">\
									<button type="button" class="ngdialog-button ngdialog-button-primary" style="float:none" ng-click="redirectTrackShipment()">TRACK SHIPMENT</button>\
                                    <button type="button" class="ngdialog-button ngdialog-button-primary" style="float:none" ng-click="closeThisDialog(0)">CANCEL</button>\
								</div>',
                            plain: true,
							closeByDocument: false
                        });
                };*/


            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])

    //For acknowledging received product
    .controller('productAckController', ['appConstants', '$state', '$rootScope', '$log','$scope',
        function( appConstants, $state, $rootScope, $log, $scope) {
            try {
                var vm = this;
                vm.header = vm.isManufacturer ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
                 //TO-DO will be replace by authenticated user
                vm.user = {
                    userName: 'Guest',
                    certification: '',
                    consortium: {
                        id: '',
                        name: ''
                    },
                    userProfile: {
                        id: '',
                        profile: window.profile === 'producer' ? 'Raw Material Producer' : window.profile
                    },
                    isAuthenticatedUser: true,
                };

                 /*vm.procure = function(){
                    var n = window.profile === 'manufacturer' ? 'Materials' : 'Products'; 
                    $scope.n = n;
                    ngDialog.open({
                            scope : $scope,
                            width: 500,
                            template: '\
                                <legend class="legendHead">ACKNOWLEDGMENT\
                                </legend>\
                                <p class="alert alert-success">All the selected {{n}} has been acknowledged successfully</p>\
                                <div class="ngdialog-buttons text-center">\
                                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="closeThisDialog(0)">OK</button>\
                                </div>',
                            plain: true,
							closeByDocument: false
                        });
                };*/

                vm.header = vm.user.userProfile.profile === 'manufacturer' ? 'PROCURE RAW MATERIALS' : 'ACKNOWLEDGE PRODUCTS';
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);
