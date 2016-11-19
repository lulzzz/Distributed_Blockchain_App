'use strict';

angular.module('bverifyApp')

    //Directive for rendering confirmation box section
    .directive('dialogConfirmation',[function () {
        return {
            restrict: 'E',
            templateUrl: '../views/confirmationBox.tpl.html',
            scope:{
                isShipmentScreen: '@?',
                isRegisterScreen: '@?'
            },
            link: function (scope, element, attrs) {
                 scope.$parent.isShipmentScreen = scope.isShipmentScreen;
                 scope.$parent.isRegisterScreen = scope.isRegisterScreen;
            }
        }
    }])
    
     //Directive for rendering warning box section
    .directive('dialogWarning',[function () {
        return {
            restrict: 'E',
            templateUrl: '../views/warningBox.tpl.html',
            link: function (scope, element, attrs) {
            }
        }
    }])
    
    //Directive for rendering product lineage box section
    .directive('dialogProductLineage',[function () {
        return {
            restrict: 'E',
            templateUrl: '../views/productLineage.tpl.html',
            link: function (scope, element, attrs) {
            }
        }
    }])
    
     //Directive for rendering delete box section
    .directive('dialogDelete',[function () {
        return {
            restrict: 'E',
            templateUrl: '../views/deleteConfirmation.tpl.html',
            link: function (scope, element, attrs) {
            }
        }
    }]);