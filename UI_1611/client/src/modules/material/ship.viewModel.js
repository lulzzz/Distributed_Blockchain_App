/*
**  viewModel - pojo model for capturing material details
*/

"use strict";

angular.module('materialModule')
    .factory('shipMaterialModel', ['appConstants', '$log',
        function (appConstants, $log) {

            //Below is hardcoded for demo purpose
            var _init = {
                qrCode: '',
                materialName: "Garcia leather",
                quantity: "35",
                batchNumber: "GLB14012016HK",
                productionDate: "14/1/2016 19:01:26",
                expiryDate: "Not Applicable",
                quality: "Top Grain",
                color: "Brown",
                weight: "50 oz.",
                description: "signature leather made from natural tanned Italian cowhide",
                dimension: "33 sq. ft. (L) x .25 sq. ft. (H) x 18 sq. ft. (W)",
                trackDetails : {},
                shippedTo: []
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
            var _setManufacturerList = function (list) {
                this._ship.shippedTo = list;
            };

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

            return {
                'getModel': _getShipMaterial,
                'setModel': _setShipMaterial,
                'shippedTo': _setManufacturerList,
                'verifyQuantity': _validateQuantity,
                'resetModel': _reset
            }
        }]);
