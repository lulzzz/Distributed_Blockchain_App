/*
 **  viewModel - pojo model for capturing product details
 */

"use strict";

angular.module('productModule')
    .factory('productModel', ['appConstants', '$log',
        function (appConstants, $log) {

            //Below is hardcoded for demo purpose
            var _init = {
                id: "",
                filePath: [],
                productName: "Coach Crosby line Tote Handbag",
                quantity: "25 units",
                batchNumber: "CCLTH22216FL",
                manufactureDate: "",
                expiryDate: "",
                quality: "Top Grain",
                color: "Brown",
                weight: "5.7 oz.",
                description: "",
                dimension: "17' (L) x 8 3/4' (H) x 7' (W)",
                modelNumber: "33524LIC7C",
                selectedMaterials: []
            };

            var _product = {};

            //Reset product obj
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
                    this._product = obj;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get product object
            var _getProduct = function () {
                try {
                    return this._product ? this._product : angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };

            //set list of uploaded file url 
            var _setFilePath = function (fileList) {
                this._product.filePath = fileList;
            };
            //set list of uploaded file url 
            var _setSelectedMaterials = function (list) {
                this.selectedMaterials = [];
                var self = this;
                angular.forEach(list, function (val, key) {
                    self.selectedMaterials.push({
                        id: val.id
                    })
                });
            };

            var _getSelectedMaterials = function () {
                return this.selectedMaterials;
            };

            var _getParsedMaterialList = function (data) {
                var list = [];
                angular.forEach(data, function (val, key) {
                    //limit to populate only 3 materials
                    if (key > 2) {
                        return;
                    }
                    list.push({
                        id: val.id,
                        label: CONVERTER.hexTostr(val.name)
                    })
                });
                return list;
            };

            var _getParsedProductList = function (data) {
                var list = [];
                angular.forEach(data, function (val, key) {
                    //condition for ignoring null values encoded as 0
                    if (parseInt(val.id) > 0) {
                        list.push({
                            productName: CONVERTER.hexTostr(val.name),
                            quality: CONVERTER.hexTostr(val.quality),
                            registeredDate: PARSER.parseMilliSecToDate(val.regDates),
                            id: val.id
                        })
                    }
                });
                return list;
            };

            var _getParsedProduct = function (data) {
                return {
                    //id: data[8] ? data[8]: '',
                    productName: CONVERTER.hexTostr(data[0]),
                    quantity: CONVERTER.hexTostr(data.quantity ? '' : ''),
                    batchNumber: CONVERTER.hexTostr(data.batchNumber ? '' : ''),
                    modelNumber: CONVERTER.hexTostr(data[2]),
                    manufactureDate: PARSER.parseMilliSecToDate(data[1]),
                    quality: CONVERTER.hexTostr(data[4]),
                    dimension: CONVERTER.hexTostr(data[5]),
                    weight: data[6],
                    description: CONVERTER.hexTostr(data.description ? '' : ''),
                    filePath: PARSER.parseHexToStrImage(data[7])
                }
            };

            return {
                'getProduct': _getProduct,
                'setProduct': _setProduct,
                'setFilePath': _setFilePath,
                'setSelectedMaterials': _setSelectedMaterials,
                'getSelectedMaterials': _getSelectedMaterials,
                'getParsedMaterialList': _getParsedMaterialList,
                'getParsedProduct': _getParsedProduct,
                'getParsedProductList': _getParsedProductList,
                'resetProduct': _reset
            }
        }
    ]);