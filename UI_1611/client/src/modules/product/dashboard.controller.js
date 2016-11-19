 /*
*
*/

"use strict";

angular.module('productModule')
 
 //For dashboard of logged in user
    .controller('dashboardController', ['userModel', 'appConstants', '$state', '$rootScope', 'productServiceAPI', '$log',
        function (userModel, appConstants, $state, $rootScope, productServiceAPI, $log) {
            try {
                var vm = this;
                vm.user = userModel.getUser();
                setUserProfile(vm, userModel);
                $rootScope.isLoggedIn = userModel.isLoggedIn();

            } catch (e) {
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
        }])