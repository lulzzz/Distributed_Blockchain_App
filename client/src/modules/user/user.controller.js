/*
**  userController for handling user login/registration business logic 
*/

"use strict";

angular.module('bverifyApp')
    .controller('userController', ['userModel', 'userServiceAPI', 'appConstants', '$state',
        '$log', '$rootScope', '$scope', '$stateParams', '$sce',
        function (userModel, userServiceAPI, appConstants, $state,
            $log, $rootScope, $scope, $stateParams, $sce) {
            var vm = this;
            var loginRequest = null;
            if (!userModel.isLoggedIn) {
                userModel.resetUser();
            }
            vm.user = userModel.getUser();
            vm.newUserObject = {};
            vm.displayQR = false;
            vm.hasUploadErr = false;
            vm.UPLOAD_ERR = appConstants.UPLOAD_ERR;
            if ($stateParams.msg && $stateParams.msg !== '') {
                vm.header = $sce.trustAsHtml($stateParams.msg); 
            } else {
                vm.header = 'LOGIN';
            }

            //register new user role. Only admin can add new user
            vm.doRegistration = function () {
                userServiceAPI
                    .register(vm.newUserObject)
                    .then(function (response) {
                        userModel.setUser(response.user);
                        vm.user = response.user;
                        $rootScope.hasError = false;
                        $rootScope.isSuccess = true;
                        $rootScope.SUCCESS_MSG = "User has been registered successfully";
                        
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    })
            };
            //Capturing broadcasted event from qrCodeReader directive to retreive User info read from uploaded QR img.
            $scope.$on('readQR', function (event, userInfo) {
                if (userInfo) {
                    vm.hasUploadErr = false;
                    loginRequest = userInfo;
                }
            });

             $scope.$on('QRError', function (event) {
                    vm.hasUploadErr = true;
                });

            //login current user. Any registered user can login
            vm.doLogin = function () {
                if (!loginRequest) {
                    vm.hasUploadErr = true;
                    return;
                }
                userServiceAPI
                    .login(loginRequest)
                    .then(function (response) {
                        userModel.setUser(response.user);
                        vm.user = userModel.getUser();
                        
                       //Redirect to same page but view as a logged in user
                       if($stateParams.view && Object.keys($stateParams.view).length > 0){
                            $state.go($stateParams.view.name);
                        }else{
                         //If not selected "View As" then redirect to by default 'dashboard' page
                            $state.go('dashboard');
                        }
                    }, function (err) {
                        $log.error(appConstants.FUNCTIONAL_ERR, err);
                    })
                    .catch(function (e) {
                        $log.error(appConstants.FUNCTIONAL_ERR, e);
                    });
            };

            vm.generate = function () {
                vm.displayQR = true;
                vm.qrObject = vm.newUserObject;
            };
            vm.reset = function () {
                $rootScope.hasError = false;
                $rootScope.isSuccess = false;
                vm.hasUploadErr = false;
            };


        }])
    .controller('logoutController', ['userModel', 'appConstants', '$state', '$rootScope', '$log',
        function (userModel, appConstants, $state, $rootScope, $log) {
            try {
                var vm = this;
                userModel.resetUser();
                $rootScope.isLoggedIn = false;
                $state.go('home');
            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }]);