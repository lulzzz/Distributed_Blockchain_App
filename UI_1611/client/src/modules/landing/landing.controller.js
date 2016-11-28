/*
**  userController for handling user login/registration business logic 
*/

"use strict";

angular.module('landingModule')
    .controller('landingController', ['userModel', 'userServiceAPI', 'appConstants', '$state',
        '$log', '$sce','userInfo',
        function(userModel, userServiceAPI, appConstants, $state,
            $log, $sce , userInfo) {

			try {
                var vm = this;
                vm.user = userModel.getUser();

                if (userInfo.user) {
                    vm.user = userInfo.user;
                    userModel.setUser(userInfo.user);
                }
                setUserProfile(vm, userModel);
                vm.redirectUser = function(state, flag){
                    if(flag && state)
                        $state.go(state);
                }
			}
			catch (e) {
                console.log(appConstants.FUNCTIONAL_ERR, e);
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