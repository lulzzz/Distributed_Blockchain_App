/*
**  Product Object pojo model for capturing Product/shipment details
*/

"use strict";

angular.module('bverifyApp')
    .factory('Product', ['appConstants', '$log',
        function(appConstants, $log) {
            
            function Product(productData) {
                if (productData) {
                    this.setData(productData)
                }

            };
            Product.prototype = {
                setData: function(productData) {
                    angular.extend(this, productData);
                },
                getData: function() {
                    this;
                }
            };
            return Product;
        }]);