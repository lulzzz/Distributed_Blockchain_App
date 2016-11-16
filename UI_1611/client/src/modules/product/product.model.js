/*
**  Product Object pojo model for capturing Product/shipment details
*/

"use strict";

angular.module('productModule')
    .factory('productModel', ['appConstants', '$log',
        function (appConstants, $log) {

            // Only for demo instance.
            var _init = {
                materialName: 'Leather',
                productName: 'Handheld Bag',
                quantity: '50',
                batchNumber: 'B00RWSC2MW',
                quality: 'Full Grain',
                color: 'Brown',
                weight: '100 kg',
                manufactureDate: '10/17/2016',
                registeredDate: new Date(),
                modelNumber: 'BG463A',
                shippedFrom: '',
                shippedOn: new Date(),
                trackDetails: {
                    currentlyAt: 'FedEx',
                    trackRecords: []
                },
                file: {
                    name: ''
                },
                productList: []
            };

            var _product = {};

            //Reset user object on logout
            var _reset = function () {
                try {
                    this._product = angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._product;
            };

            var _clearAll = function(){
                 try {
                    this._product = {};
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._product;
            }

            //Set user object
            var _setProduct = function (obj) {
                try {
                    this._product = obj;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get user object
            var _getProduct = function () {
                try {
                    return this._product;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            var _getProductList = function () {
                return _product.productList;
            };
            var _clearProductList = function () {
                _product.productList = [];
            };

            var _setProductList = function (list) {
                _clearProductList();
                angular.forEach(list, function (obj, key) {
                    _product.productList.push({
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
                console.log(_product);
            };


            return {
                'getProduct': _getProduct,
                'setProduct': _setProduct,
                'getProductList': _getProductList,
                'setProductList': _setProductList,
                'resetProduct': _reset,
                'clearAll': _clearAll
            }
        }]);

            /*function Product(productData) {
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
            return Product;*/

/*
            "use strict";

            angular.module('productModule')
                .factory('productModel', ['appConstants', '$log',
                    function (appConstants, $log) {

                        // Only for demo instance.
                        var _init = {
                            // Shipment specific QR code
                            "qr": "",

                            // Product object which will be used to register/ship/acknowledge
                            "product": {
                                // Product specific QR code
                                "qr": "",
                                "productName": "",

                                // Material object nested inside product
                                "material": {
                                    // Material specific QR code
                                    "qr": "",
                                    "materialName": "",
                                    "batchNumber": "",
                                    "manufacturingDate": "",
                                    "quantity": "",
                                    "quality": "",
                                    "colour_dimensions": "",
                                    "weight": "",
                                    "img_vid_path": ""
                                },
                                "quantity": "",
                                "quality": "",
                                "manufacturingDate": "",
                                "dimensions": "",
                                "weight": "",
                                "modelNumber": "",
                                "img_vid_path": ""
                            },
                            "shippedFrom": "",
                            "trackDetails": {
                                "currentlyAt": "",
                                "trackRecords": []
                            },
                            "shippedOn": "",
                            "quality": ""
                        }


                        var _product = {};

                        //Reset product object
                        var _reset = function () {
                            try {
                                this._product = angular.copy(_init);
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                            return this._product;
                        };
                        //Set product object
                        var _setProduct = function (obj) {
                            try {
                                this._product = angular.copy(obj);
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };
                        //Get product object
                        var _getProduct = function () {
                            try {
                               return this._product;
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };
                        //Set material object
                        var _setMaterial = function (obj) {
                            try {
                               this._product.material['qr'] = obj['qr'] || '';
                               this._product.material['materialName'] = obj['materialName'] || '';
                               this._product.material['batchNumber'] = obj['batchNumber'] || '';
                               this._product.material['manufacturingDate'] = obj['manufacturingDate'] || '';
                               this._product.material['quantity'] = obj['quantity'] || '';
                               this._product.material['quality'] = obj['quality'] || '';
                               this._product.material['colour_dimensionsqr'] = obj['colour_dimensions'] || '';
                               this._product.material['weight'] = obj['weight'] || '';
                               this._product.material['img_vid_path'] = obj['img_vid_path'] || '';
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };
                        //Get material object
                        var _getMaterial = function () {
                            try {
                               return this._product.material;
                            } catch (e) {
                                $log.error(appConstants.FUNCTIONAL_ERR, e);
                            }
                        };

                        return {
                            'getProduct': _getProduct,
                            'setProduct': _setProduct,
                            'setMaterial': _setMaterial,
                            'getMaterial': _getMaterial,
                            'resetProduct': _reset
                        }
                    }]);
*/
