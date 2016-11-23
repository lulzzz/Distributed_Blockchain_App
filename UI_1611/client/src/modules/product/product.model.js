/*
**  Product Object pojo model for capturing Product/shipment details
*/

"use strict";

angular.module('productModule')
    .factory('productModel', ['appConstants', '$log',
        function (appConstants, $log) {

            // Only for demo instance.
            var _init = {
                tokenId: '',
                materialName: 'Garcia leather',
                productName: 'Handheld Bag',
                quantity: '35',
                batchNumber: 'GLB14012016HK',
                quality: 'Top Grain',
                color: 'Brown',
                weight: '50 oz.',
                productionDate: '14/1/2016 19:01:26',
                registeredDate: new Date(),
                dimension: "33 sq. ft. (L) x .25 sq. ft. (H) x 18 sq. ft. (W)",
                modelNumber: 'BG463A',
                shippedFrom: '',
                shippedOn: new Date(),
                trackDetails: {
                    currentlyAt: 'FedEx',
                    trackRecords: []
                },
                file: {},
                exitPort: {
                    location: "",
                    isAvailable: false
                },
                entryPort: {
                    location: "",
                    isAvailable: false
                },
                manufacturerDetail: {
                    name: '',
                    isAvailable: false
                },
                retailerDetail: {
                    name: '',
                    isAvailable: false
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

            var _clearAll = function () {
                try {
                    this._product = {};
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._product;
            };

            //Set user object
            var _setProduct = function (obj) {
                try {
                    this._product = {
                        tokenId: obj.tokenId,
                        materialName: obj.materialName,
                        productName: obj.productName,
                        quantity: obj.quantity,
                        batchNumber: obj.quantity,
                        quality: obj.quantity,
                        color: obj.quantity,
                        weight: obj.quantity,
                        productionDate: obj.quantity,
                        registeredDate: new Date(),
                        dimension: obj.quantity,
                        modelNumber: obj.quantity,
                        shippedFrom: obj.quantity,
                        shippedOn: new Date(),
                        trackDetails: obj.trackDetails,
                        file: obj.file,
                        exitPort: {
                            location: "",
                            isAvailable: false
                        },
                        entryPort: {
                            location: "",
                            isAvailable: false
                        },
                        manufacturerDetail: {
                            name: '',
                            isAvailable: false
                        },
                        retailerDetail: {
                            name: '',
                            isAvailable: false
                        }
                    }
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
            //Get user object
            var _getNewRegisteredProduct = function () {
                try {
                    var prod = this._product;
                    delete prod['productList'];
                    return prod;
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
                        "tokenId": obj.tokenId || "",
                        "materialName": obj.materialName || "",
                        "productName": obj.productName || "",
                        "batchNumber": obj.batchNumber || "",
                        "weight": obj.weight || "",
                        "quantity": obj.quantity || "",
                        "productionDate": obj.productionDate || "",
                        "registeredDate": obj.registeredDate || "",
                        "color": obj.color || "",
                        "modelNumber": obj.modelNumber || "",
                        "shippedFrom": obj.shippedFrom || "",
                        "shippedOn": obj.shippedOn || "",
                        "quality": obj.quality || "",
                        "trackDetails": obj.trackDetails,
                        "entryPort": obj.entryPort,
                        "exitPort": obj.exitPort,
                        "manufacturerDetail": obj.manufacturerDetail,
                        "retailerDetail": obj.retailerDetail
                    });
                });
            };


            return {
                'getProduct': _getProduct,
                'getNewRegisteredProduct': _getNewRegisteredProduct,
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
