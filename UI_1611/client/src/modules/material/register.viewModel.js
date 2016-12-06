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
                //batchNumber: "",
                modelNumber: "",
                productionDate: "",
                expiryDate: "",
                quality: "",
                //color: "",
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
                    materialName: CONVERTER.hexTostr(data.name),
                    modelNumber: CONVERTER.hexTostr(data.model),
                    productionDate: PARSER.parseMilliSecToDate(data.manufacturingDate),
                    expiryDate: PARSER.parseMilliSecToDate(data.expDate),
                    quality: CONVERTER.hexTostr(data.quality),
                    dimension: CONVERTER.hexTostr(data.colour_dimensions),
                    weight: CONVERTER.hexTostr(data.weight),
                    filePath: PARSER.parseHexToStrImage(data.img_vid_path)
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