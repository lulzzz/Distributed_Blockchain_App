/*
**  viewModel - pojo model for capturing product details
*/

"use strict";

angular.module('productModule')
    .factory('productModel', ['appConstants', '$log',
        function (appConstants, $log) {

            //Below is hardcoded for demo purpose
            var _init = {
                qrCode: "",
                filePath: [],
                productName: "Coach Crosby line Tote Handbag",
                quantity: "25 units",
                batchNumber: "CCLTH22216FL",
                manufactureDate: "",
                expiryDate: "",
                quality: "Top Grain",
                color: "Brown",
                weight: "5.7 oz.",
                description: "",
                dimension: "17' (L) x 8 3/4' (H) x 7' (W)",
                modelNumber: "33524LIC7C",
                selectedMaterials: []
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
                angular.forEach(list, function(val, key){
                    self.selectedMaterials.push({
                        'id': val.qrCode,
                        'label': val.materialName
                    })
                });
            };

            var _getSelectedMaterials = function () {
                return this.selectedMaterials;
            };

            return {
                'getProduct': _getProduct,
                'setProduct': _setProduct,
                'setFilePath': _setFilePath,
                'setSelectedMaterials': _setSelectedMaterials,
                'getSelectedMaterials': _getSelectedMaterials,
                'resetProduct': _reset
            }
        }]);
