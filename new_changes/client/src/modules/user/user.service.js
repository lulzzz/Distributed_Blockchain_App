/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('userModule')

    //Registering user login/register url
    .value('userUrl', {
        'login': 'api/login',
        'register': 'api/register'
    })

    //Configuring resource for making service call
    .service('userResource', ['$resource', 'userUrl', '__ENV', function ($resource, userUrl, __ENV) {
        return $resource('', {}, {
            authenticateUser: { url: __ENV.apiUrl + userUrl.login, method: "POST" },
            registerUser: { url: __ENV.apiUrl + userUrl.register, method: "POST" },
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