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
                productName: "",
                quantity: "",
                batchNumber: "",
                manufactureDate: "",
                quality: "",
                color: "",
                weight: "",
                description: "",
                dimension: "",
                modelNumber: ""
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

            var _getParsedProduct = function (data) {
                return {
                    productName: CONVERTER.hexTostr(data.name),
                    quantity: CONVERTER.hexTostr(data.quantity ? '' : ''),
                    batchNumber: CONVERTER.hexTostr(data.batchNumber ? '' : ''),
                    modelNumber: CONVERTER.hexTostr(data.model),
                    manufactureDate: PARSER.parseMilliSecToDate(data.manufacturingDate),
                    quality: CONVERTER.hexTostr(data.quality),
                    dimension: CONVERTER.hexTostr(data.colour_dimensions),
                    weight: CONVERTER.hexTostr(data.weight),
                    description: CONVERTER.hexTostr(data.description ? '' : ''),
                    filePath: PARSER.parseHexToStrImage(data.img_vid_path)
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
                'resetProduct': _reset
            }
        }
    ]);