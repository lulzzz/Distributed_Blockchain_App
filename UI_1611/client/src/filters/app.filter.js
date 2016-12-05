'use strict';

angular.module('bverifyApp')

//filter for display '-' symbol in shipment details list table when input is null/empty
.filter('emptyfy', function () {
    return function (input, optional1, optional2) {
        if (input && input !== '') {
            return input;
        } else {
            return '-';
        }
    }

})

//filter for display '-' symbol in shipment details list table when input is null/empty
.filter('parseRegDate', function () {
    return function (input, optional1, optional2) {
        var d = PARSER.parseMilliSecToDate(input);

        return d;
    }

});