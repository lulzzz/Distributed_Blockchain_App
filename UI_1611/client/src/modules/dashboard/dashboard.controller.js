 /*
  *
  */

 "use strict";

 angular.module('dashboardModule')

 //For dashboard of logged in user
 .controller('dashboardController', ['userModel', 'appConstants', '$state', '$rootScope', '$log',
     function (userModel, appConstants, $state, $rootScope, $log) {
         try {
             var vm = this;
             vm.user = userModel.getUser();
             bverifyUtil.setUserProfile(vm, userModel);
             $rootScope.isLoggedIn = userModel.isLoggedIn();
         } catch (e) {
             $log.error(appConstants.FUNCTIONAL_ERR, e);
         }
     }
 ]);