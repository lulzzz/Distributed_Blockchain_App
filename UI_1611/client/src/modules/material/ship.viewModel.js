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
                sendTo: ''
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
                        materialName: CONVERTER.hexTostr(val.name),
                        id: val.id
                    })
                }
                });
                return list;
            };

            var _getParsedShipMaterial = function (data) {
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
                    weight: data[6]
                    //description: CONVERTER.hexTostr(data.description ? '' : ''),
                    //filePath: PARSER.parseHexToStrImage(data[7])
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