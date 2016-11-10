/*
*   User service to make service calls for user login/registration using ngResource
*
*/

'use strict';
angular.module('bverifyApp')

    // Registering/Retreiving/shipping/acknowledging product
    .value('productUrl', {
        'register': 'api/product/register',
        'products': 'api/product/list',
        'ship': 'api/product/ship',
        'acknowledge': 'api/product/ack',
        'deleteProd': 'api/product/delete/:productId'
    })

    //Configuring resource for making service call
    .service('productResource', ['$resource', 'productUrl', '__ENV', function ($resource, productUrl, __ENV) {
        return $resource('', {_id: '@productId'}, {
            productList: { url: __ENV.apiUrl + productUrl.products, method: "GET", isArray: "true" },
            registerProduct: { url: __ENV.apiUrl + productUrl.register, method: "POST" },
            shipProduct: { url: __ENV.apiUrl + productUrl.ship, method: "POST" },
            ackProduct: { url: __ENV.apiUrl + productUrl.acknowledge, method: "POST" },
            productDelete: { url: __ENV.apiUrl + productUrl.deleteProd, method: "DELETE", isArray: "true" }
        });
    }])

    //Making service call 
    .service('productServiceAPI', ['productResource', 'appConstants', '$q', '$log', function (productResource, appConstants, $q, $log) {
        
        this.registerProduct = function (product) {
            var deferred = $q.defer();
            try{
                productResource
                    .registerProduct(product)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        this.getProductList = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .productList(data)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
         this.shipProduct = function (list) {
            var deferred = $q.defer();
            try{
                productResource
                    .shipProduct(list)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        this.ackProduct = function (list) {
            var deferred = $q.defer();
            try{
                productResource
                    .ackProduct(list)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
        this.productDelete = function (data) {
            var deferred = $q.defer();
            try{
                productResource
                    .productDelete(data)
                    .$promise
                    .then(function (response) {
                        deferred.resolve(response);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }catch(e){
                $log.error(appConstants.FUNCTIONAL_ERR, e);
            }
            return deferred.promise;
        };
    }]);