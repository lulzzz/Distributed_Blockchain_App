
'use strict';

angular.module('bverifyApp')

    .filter('entityDisplayFilter', function () {

        // In the return function, we must pass in a single parameter which will be the data we will work on.
        // We have the ability to support multiple other parameters that can be passed into the filter optionally
        return function (input, optional1, optional2) {
            if(input && input !== ''){
                return input;
            }else{
                return '-';
            }
        }

    });