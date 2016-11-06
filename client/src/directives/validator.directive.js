'use strict';

angular.module('bverifyApp')

    .constant('regExpConstant', {
        CHARACTER_REG_EX: /^[a-zA-Z]{2,30}$/i,
        ALPHA_NUMERIC_REG_EX: /^[a-z0-9]{3,50}$/i,
        NUMERIC_REG_EX: /^[0-9]{3,30}$/i
    })

    //Directive for validating alphabet inputs
    .directive("validateCharacter", ['$log', 'regExpConstant', function($log, regExpConstant) {
        return {
            restrict: "A",
            require: "?ngModel",
            link: function(scope, element, attributes, ngModel) {
                validateInput('validateCharacter', regExpConstant.SERVICE_NAME_REG_EX, ngModel);
            }
        };
    }])

    //Directive for validating alphabet inputs
    .directive("validateNumeric", ['$log', 'regExpConstant', function($log, regExpConstant) {
        return {
            restrict: "A",
            require: "?ngModel",
            link: function(scope, element, attributes, ngModel) {
                element.on('keypress', function(e) {
                    var k = e.which;
                    var key = (k >= 48 && k <= 57) || (k == 8) || (k == 0);
                    if (!key) {
                        e.preventDefault();
                        return;
                    }
                });
            }
        }
    }])

    //Directive for validating alphabet inputs
    .directive("validateAlphanumeric", ['$log', 'regExpConstant', function($log, regExpConstant) {
        return {
            restrict: "A",
            require: "?ngModel",
            link: function(scope, element, attributes, ngModel) {
                validateInput('validateAlphanumeric', regExpConstant.ALPHA_NUMERIC_REG_EX, ngModel);
            }
        };
    }])


function validateInput(dirName, regEx, ngModel) {
    try {
        ngModel.$validators[dirName] = function(val) {
            if (typeof val === 'undefined' || val === "" || (!regEx.test(val))) {
                return false;
            }
            else {
                return true;
            }
        };
    } catch (err) {
        $log.error("Error occurred while validating " + dirName + "content", err);
    }
};