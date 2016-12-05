'use strict';

angular.module('materialModule')

//Directive for rendering confirmation box section
.directive('materialRegisterDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/material/registerConfirm.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering confirmation box section
.directive('materialBatchDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/material/batchConfirm.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering product lineage box section
.directive('materialLineageDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/material/materialLineage.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering delete box section
.directive('materialDeleteDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/material/materialDelete.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering product lineage box section
.directive('materialShipDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/material/shipConfirm.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering product lineage box section
.directive('materialProcureDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/material/procureConfirm.tpl.html',
        link: function (scope, element, attrs) {}
    }
}]);