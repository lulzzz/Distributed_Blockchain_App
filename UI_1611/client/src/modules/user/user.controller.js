/*
**  userController for handling user login/registration business logic 
*/

"use strict";

angular.module('userModule')
    .controller('userController', ['userModel', 'userServiceAPI', 'appConstants', '$state',
        '$log', '$rootScope', '$scope', '$stateParams', '$sce',
        function (userModel, userServiceAPI, appConstants, $state,
            $log, $rootScope, $scope, $stateParams, $sce) {

            var vm = this;
            if (!userModel.isLoggedIn) {
                userModel.resetUser();
            }
            vm.newUserObject = {};

            //Only for Demo instance
            vm.header = 'LOGIN';
            vm.user = {};
            vm.file = {
                name: "Upload QR"
            }
            vm.displayBtn = false;
            vm.uploadFile = function (file, event) {
                if (file) {
                    vm.displayBtn = true;
                    var imageType = /^image\//;
                    if (!imageType.test(file.type)) {
                        vm.uploadErr = true;
                        $rootScope.ERROR_MSG = appConstants.UPLOAD_ERR;
                        return;
                    }
                    vm.uploadErr = false;
                    vm.file = file;
                }
            }
            vm.doLogin = function () {
                $state.go('home', { role: window.profile });
            };
            /***************************************** */

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