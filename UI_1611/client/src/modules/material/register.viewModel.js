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
                materialName: "Garcia leather",
                quantity: "35",
                batchNumber: "GLB14012016HK",
                modelNumber: "GLB14012016HK",
                productionDate: "",
                expiryDate: "",
                quality: "Top Grain",
                color: "Brown",
                weight: "50 oz.",
                description: "signature leather made from natural tanned Italian cowhide",
                dimension: "33 sq. ft. (L) x .25 sq. ft. (H) x 18 sq. ft. (W)"
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

            var _getParsedMaterialList = function (data) {
                var list = [];
                angular.forEach(data, function (val, key) {
                    list.push({
                        materialName: CONVERTER.hexTostr(val.name),
                        quantity: val.quantity,
                        registeredDate: val.regDate,
                        id: val.id
                    })
                });
                return list;
            };

            var _getParsedMaterial = function (data) {
                return {
                    materialName: CONVERTER.hexTostr(data.name),
                    quantity: CONVERTER.hexTostr(data.quantity),
                    batchNumber: CONVERTER.hexTostr(data.batchNumber),
                    modelNumber: CONVERTER.hexTostr(data.model),
                    productionDate: PARSER.parseMilliSecToDate(data.mnfDate),
                    expiryDate: PARSER.parseMilliSecToDate(data.expDate),
                    quality: CONVERTER.hexTostr(data.quality),
                    dimension: CONVERTER.hexTostr(data.dimension),
                    weight: data.weight,
                    description: CONVERTER.hexTostr(data.description),
                    filePath: PARSER.parseHexToStrImage(data.images)
                }
            };

            return {
                'getMaterial': _getMaterial,
                'setMaterial': _setMaterial,
                'setFilePath': _setFilePath,
                'getParsedMaterialList': _getParsedMaterialList,
                'getParsedMaterial': _getParsedMaterial,
                'resetMaterial': _reset
            }
        }]);    
