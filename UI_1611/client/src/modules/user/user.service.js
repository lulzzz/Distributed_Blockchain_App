/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('userModule')

    //Registering user login/register url
    .value('userUrl', {
        'login': 'asset/data/login.json', // TO-DO change it WEB API URL
        'register': 'api/register'
    })

    //Configuring resource for making service call
    .service('userResource', ['$resource', 'userUrl', '__ENV', function ($resource, userUrl, __ENV) {
        return $resource('', {}, {
            authenticateUser: { url: __ENV.apiUrl + userUrl.login, method: "GET" }, // TO-DO change it to POST
            registerUser: { url: __ENV.apiUrl + userUrl.register, method: "GET" },  // TO-DO change it to POST
        });
    }])

    //Making service call for user login/register
    .service('userServiceAPI', ['userResource', 'appConstants', '$q', '$log', function (userResource, appConstants, $q, $log) {
        
        this.register = function (user) {
            var deferred = $q.defer();
            try{
                userResource
                    .registerUser(user)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        this.login = function (user) {
            var deferred = $q.defer();
            try{
                userResource
                    .authenticateUser(user)
                    .$promise
                    .then(function (response) {
                    /*****
                     *  It's a temporary solution. This has to be removed in future once WEB API is up
                     */
                    if(angular.equals(user.id, 'manufacturer')){
                        response.user.userName = 'Coach';
                        response.user.userProfile.id = 'MANUFACT';
                        response.user.userProfile.profile = 'Manufacturer';
                        response.user.userProfile.alias = "Manufacturer";
                    }
                    if(angular.equals(user.id, 'retailer')){
                        response.user.userName = 'Walmart';
                        response.user.userProfile.id = 'RETAIL';
                        response.user.userProfile.profile = 'Retailer';
                        response.user.userProfile.alias = "Retailer";
                    }
                    /**************************** */
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                console.log(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        }
    }]);