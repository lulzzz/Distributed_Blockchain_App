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
                this.productList = [];
            };
            Product.prototype = {
                setData: function(productData) {
                    angular.extend(this, productData);
                },
                getData: function() {
                    return this;
                },
                setProductList: function(list) {
                    this.clearProductList();
                    var _self = this;
                    angular.forEach(list, function(obj, key) {
                        _self.productList.push({
                            "id": obj.id || Math.floor(Math.random()*90000) + 10000,
                            "materialName": obj.materialName || "",
                            "productName": obj.productName || "",
                            "batchNumber": obj.batchNumber || "",
                            "weight": obj.weight || "",
                            "quantity": obj.quantity || "",
                            "manufactureDate": obj.manufactureDate || "",
                            "registeredDate": obj.registeredDate || "",
                            "color": obj.color || "",
                            "modelNumber": obj.modelNumber || "",
                            "shippedFrom": obj.shippedFrom || "",
                            "shippedOn": obj.shippedOn || "",
                            "quality": obj.quality || "",
                            "trackDetails": obj.trackDetails
                        });
                    });
                },
                getProductList: function() {
                    return this.productList;
                },
                clearProductList: function() {
                    this.productList = [];
                }
            };
            return Product;
        }]);