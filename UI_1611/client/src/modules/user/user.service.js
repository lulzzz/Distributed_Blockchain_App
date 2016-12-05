/*
 *   User service to make service calls for user login/registration using ngResource
 *
 */

'use strict';
angular.module('userModule')

//Registering user login/register url
.value('userUrl', {
    'producer': 'asset/data/producerLogin.json', // TO-DO change it WEB API URL
    'manufacturer': 'asset/data/manufacturerLogin.json',
    'retailer': 'asset/data/retailerLogin.json',
    'register': 'api/register'
})

//Configuring resource for making service call
.service('userResource', ['$resource', 'userUrl', '__ENV', function ($resource, userUrl, __ENV) {
    return $resource('', {}, {
        authenticateProducer: {
            url: __ENV.apiUrl + userUrl.producer,
            method: "GET"
        }, // TO-DO change it to POST
        authenticateManufacturer: {
            url: __ENV.apiUrl + userUrl.manufacturer,
            method: "GET"
        },
        authenticateRetailer: {
            url: __ENV.apiUrl + userUrl.retailer,
            method: "GET"
        },
        registerUser: {
            url: __ENV.apiUrl + userUrl.register,
            method: "GET"
        }, // TO-DO change it to POST
    });
}])

//Making service call for user login/register
.service('userServiceAPI', ['userResource', 'appConstants', '$q', '$log', function (userResource, appConstants, $q, $log) {

    this.register = function (user) {
        var deferred = $q.defer();
        try {
            userResource
                .registerUser(user)
                .$promise
                .then(function (response) {
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err);
                });
        } catch (e) {
            console.log(appConstants.FUNCTIONAL_ERR, e);
        }
        return deferred.promise;
    };
    this.producerLogin = function (user) {
        var deferred = $q.defer();
        try {
            userResource
                .authenticateProducer(user)
                .$promise
                .then(function (response) {
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err);
                });
        } catch (e) {
            console.log(appConstants.FUNCTIONAL_ERR, e);
        }
        return deferred.promise;
    };
    this.manufacturerLogin = function (user) {
        var deferred = $q.defer();
        try {
            userResource
                .authenticateManufacturer(user)
                .$promise
                .then(function (response) {
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err);
                });
        } catch (e) {
            console.log(appConstants.FUNCTIONAL_ERR, e);
        }
        return deferred.promise;
    };
    this.retailerLogin = function (user) {
        var deferred = $q.defer();
        try {
            userResource
                .authenticateRetailer(user)
                .$promise
                .then(function (response) {
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err);
                });
        } catch (e) {
            console.log(appConstants.FUNCTIONAL_ERR, e);
        }
        return deferred.promise;
    }
}]);