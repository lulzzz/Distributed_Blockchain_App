/*
**  viewModel - pojo model for capturing material details
*/

"use strict";

angular.module('materialModule')
    .factory('materialModel', ['appConstants', '$log',
        function (appConstants, $log) {

            //Below is hardcoded for demo purpose
            var _init = {
                qrCode: '',
                filePath: [],
                materialName: "Garcia leather",
                quantity: "35",
                batchNumber: "GLB14012016HK",
                productionDate: "",
                expiryDate: "Not Applicable",
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
                    return this._material;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };

            //set list of uploaded file url 
            var _setFilePath = function (fileList) {
                this._material.filePath = fileList;
            };

            return {
                'getMaterial': _getMaterial,
                'setMaterial': _setMaterial,
                'setFilePath': _setFilePath,
                'resetMaterial': _reset
            }
        }]);
