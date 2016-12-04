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
                carrier : '',
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

            var _validateQuantity = function (oldValue, newValue) {
                if ((isNaN(parseInt(newValue, 10)))) {
                    return false;
                }
                else if (!(isNaN(parseInt(newValue, 10))) && parseInt(newValue) > parseInt(oldValue)) {
                    return false;
                }
                else {
                    return true;
                }
            };

            var _getParsedMaterialList = function (data) {
                var list = [];
                angular.forEach(data, function (val, key) {
                    list.push({
                        materialName: CONVERTER.hexTostr(val.name),
                        quality: CONVERTER.hexTostr(val.quality),
                        registeredDate: PARSER.parseMilliSecToDate(val.regDates),
                        id: val.id
                    })
                });
                return list;
            };

            var _getParsedShipMaterial = function (data) {
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
                    description: CONVERTER.hexTostr(data.description)
                }
            };

            return {
                'getModel': _getShipMaterial,
                'setModel': _setShipMaterial,
                'getParsedMaterialList': _getParsedMaterialList,
                'verifyQuantity': _validateQuantity,
                'getParsedShipMaterial': _getParsedShipMaterial,
                'resetModel': _reset
            }
        }]);
