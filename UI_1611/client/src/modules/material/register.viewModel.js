/*
 **  viewModel - pojo model for capturing material details
 */

"use strict";

angular.module('materialModule')
    .factory('materialModel', ['appConstants', '$log',
        function (appConstants, $log) {

            //Below is hardcoded for demo purpose
            var _init = {
                id: '',
                filePath: [],
                materialName: "",
                quantity: "",
                batchNumber: "",
                modelNumber: "",
                productionDate: "",
                expiryDate: "",
                quality: "",
                color: "",
                weight: "",
                description: "signature leather made from natural tanned Italian cowhide",
                dimension: ""
            };

            var _material = {};

            //Reset material obj
            var _reset = function () {
                try {
                    this._material = angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._material;
            };
            //Set material object
            var _setMaterial = function (obj) {
                try {
                    this._material = obj;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get material object
            var _getMaterial = function () {
                try {
                    return this._material ? this._material : angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };

            //set list of uploaded file url 
            var _setFilePath = function (fileList) {
                this._material.filePath = fileList;
            };

            var _getParsedBatchMaterialList = function (data) {
                var list = [];
                angular.forEach(data, function (val, key) {
                    //condition for ignoring null values encoded as 0
                    if (parseInt(val.id) > 0) {
                        list.push({
                            materialName: CONVERTER.hexTostr(val.name),
                            id: val.id
                        })
                    }
                });
                return list;
            };

            var _getParsedMaterial = function (data) {
                return {
                    //id: data[8] ? data[8]: '',
                    materialName: CONVERTER.hexTostr(data[0]),
                    //quantity: CONVERTER.hexTostr(data.quantity ? '' : ''),
                    //batchNumber: CONVERTER.hexTostr(data.batchNumber ? '' : ''),
                    modelNumber: CONVERTER.hexTostr(data[2]),
                    productionDate: PARSER.parseMilliSecToDate(data[1]),
                    expiryDate: PARSER.parseMilliSecToDate(data[3]),
                    quality: CONVERTER.hexTostr(data[4]),
                    dimension: CONVERTER.hexTostr(data[5]),
                    weight: data[6],
                    //description: CONVERTER.hexTostr(data.description ? '' : ''),
                    filePath: PARSER.parseHexToStrImage(data[7])
                }
            };

            return {
                'getMaterial': _getMaterial,
                'setMaterial': _setMaterial,
                'setFilePath': _setFilePath,
                'getParsedMaterial': _getParsedMaterial,
                'getParsedBatchMaterialList': _getParsedBatchMaterialList,
                'resetMaterial': _reset
            }
        }
    ]);