(function (window) {

    //namespace
    window.bverifyUtil = {

        setUserProfile: function (vm, userModel) {
            vm.isManufacturer = userModel.isManufacturer();
            vm.isProducer = userModel.isProducer();
            vm.isRetailer = userModel.isRetailer();
            vm.isAdmin = userModel.isAdmin();
        },

        openModalDialog: function (ngDialog, scope, templateID, width, showClose, className) {
            return ngDialog.open({
                scope: scope,
                width: width,
                template: templateID,
                showClose: showClose,
                className: className
            });
        },

        verifyQuantity: function (oldValue, newValue) {
            if ((isNaN(parseInt(newValue, 10)))) {
                return false;
            } else if (!(isNaN(parseInt(newValue, 10))) && parseInt(newValue) > parseInt(oldValue)) {
                return false;
            } else {
                return true;
            }
        },

        getShipmentHexRequest: function (obj, type) {
            return {
                carrier: CONVERTER.strTohex(obj.carrier),
                type: type, // 0 material  1 product
                item: parseInt(obj.id),
                quantity: parseInt(obj.quantity),
                shipTo: obj.shipTo
            }
        },

        parseList: function (data) {
            var list = [];
            angular.forEach(data, function (val, key) {
                //condition for ignoring null values encoded as 0
                if (parseInt(val.id) > 0) {
                    list.push({
                        name: CONVERTER.hexTostr(val.name),
                        quality: CONVERTER.hexTostr(val.quality),
                        registeredDate: PARSER.parseMilliSecToDate(val.regDates),
                        id: val.id
                    })
                }
            });
            return list;
        },

        parseBatchList: function (data) {
            var list = [];
            angular.forEach(data, function (val, key) {
                //condition for ignoring null values encoded as 0
                if (parseInt(val.id) > 0) {
                    list.push({
                        name: CONVERTER.hexTostr(val.rawmaterial),
                        quantity: val.quantity,
                        registeredDate: PARSER.parseMilliSecToDate(val.regDate),
                        id: val.id
                    })
                }
            });
            return list;
        },

        parseShipmentDetails: function (data) {
            return {
                    name: CONVERTER.hexTostr(data.name),
                    //modelNumber: CONVERTER.hexTostr(data.model),
                    productionDate: PARSER.parseMilliSecToDate(data.mnfDate),
                    expiryDate: PARSER.parseMilliSecToDate(data.expDate),
                    quality: CONVERTER.hexTostr(data.quality),
                    quantity: data.quantity,
                    weight: CONVERTER.hexTostr(data.weight),
                    shipDate: PARSER.parseMilliSecToDate(data.shipDate),
                    currentlyAt: bverifyUtil.getUserDetails(data.owner)
            }
        },

        getUserDetails: function(owner){
            if(owner === '11E6EBA265C7CFFD5B178649084B4AEE6A67CC4E'){
                return 'Coach, Florida';
            }
            if(owner === 'C5AA2E0022515A522FA9ABFE15C898392A5F10B5'){
                return 'Walmart, New York';
            }
        },

        getUserLocation: function(owner){
            if(owner === 'C5AA2E0022515A522FA9ABFE15C898392A5F10B5'){
                return 'Florida';
            }
        }

    };
})(this);