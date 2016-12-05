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
        }

    };
})(this);