/*
 **  viewModel - pojo model for capturing material details
 */

"use strict";

angular.module('materialModule')
    .factory('shipMaterialModel', ['appConstants', '$log',
        function (appConstants, $log) {

            //Below is hardcoded for demo purpose
            var _init = {
                id: '',
                materialName: "",
                quantity: "",
                batchNumber: "",
                productionDate: "",
                expiryDate: "",
                quality: "",
                color: "",
                weight: "",
                description: "signature leather made from natural tanned Italian cowhide",
                dimension: "",
                carrier: '',
                shipTo: ''
            };

            var _ship = {};

            //Reset material obj
            var _reset = function () {
                try {
                    this._ship = angular.copy(_init);
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
                return this._ship;
            };
            //Set material object
            var _setShipMaterial = function (obj) {
                try {
                    this._ship = obj;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get material object
            var _getShipMaterial = function () {
                try {
                    return this._ship;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };

            //set list of uploaded file url 
            /* var _setManufacturerList = function (list) {
                 this._ship.shippedTo = list;
             };*/

            var _getParsedMaterialList = function (data) {
                var list = [];
                angular.forEach(data, function (val, key) {
                    if (parseInt(val.name) > 0) {
                    list.push({
                        materialName: CONVERTER.hexTostr(val.name) + ' - BATCH00'+val.id ,
                        id: val.id
                    })
                }
                });
                return list;
            };

            var _getParsedShipMaterial = function (data) {
                return {
                    materialName: CONVERTER.hexTostr(data.name),
                    modelNumber: CONVERTER.hexTostr(data.model),
                    productionDate: PARSER.parseMilliSecToDate(data.manufacturingDate),
                    expiryDate: PARSER.parseMilliSecToDate(data.expDate),
                    quality: CONVERTER.hexTostr(data.quality),
                    weight: CONVERTER.hexTostr(data.weight)
                }
            };

            return {
                'getModel': _getShipMaterial,
                'setModel': _setShipMaterial,
                'getParsedMaterialList': _getParsedMaterialList,
                'getParsedShipMaterial': _getParsedShipMaterial,
                'resetModel': _reset
            }
        }
    ]);