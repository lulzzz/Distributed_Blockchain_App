/*
**  viewModel - pojo model for capturing material details
*/

"use strict";

angular.module('productModule')
    .factory('shipModel', ['appConstants', '$log',
        function (appConstants, $log) {

            //Below is hardcoded for demo purpose
            var _init = {
                qrCode: "",
                productName: "Coach Crosby line Tote Handbag",
                quantity: "25 units",
                batchNumber: "CCLTH22216FL",
                manufactureDate: "14/1/2016 22:01:26",
                expiryDate: "",
                quality: "Top Grain",
                color: "Brown",
                weight: "5.7 oz.",
                description: "",
                dimension: "17' (L) x 8 3/4' (H) x 7' (W)",
                modelNumber: "33524LIC7C",
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
            var _setShipProduct = function (obj) {
                try {
                    this._ship = obj;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };
            //Get material object
            var _getShipProduct = function () {
                try {
                    return this._ship;
                } catch (e) {
                    $log.error(appConstants.FUNCTIONAL_ERR, e);
                }
            };

            //set list of uploaded file url 
            var _setRetailerList = function (list) {
                this._ship.shippedTo = list;
            };

            return {
                'getModel': _getShipProduct,
                'setModel': _setShipProduct,
                'shippedTo': _setRetailerList,
                'resetModel': _reset
            }
        }]);
