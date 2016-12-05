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

        validateQuantity: function (oldValue, newValue) {
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
                item: obj.batchNumber,
                quantity: parseInt(obj.quantity),
                sendTo: CONVERTER.strTohex(obj.sendTo)
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
        }

    };
})(this);