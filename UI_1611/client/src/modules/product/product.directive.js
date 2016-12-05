'use strict';

angular.module('productModule')

//Directive for rendering confirmation box section
.directive('productRegisterDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/registerConfirm.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])


//Directive for rendering product lineage box section
.directive('productLineageDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/productLineage.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering delete box section
.directive('productDeleteDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/productDelete.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering product lineage box section
.directive('productShipDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/shipConfirm.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering product lineage box section
.directive('productProcureDialog', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/procureConfirm.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering product lineage box section
.directive('registerLineageBox', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/registerProductLineage.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

//Directive for rendering negative usecase for product lineage box section
.directive('registerLineageBoxNegative', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/negativeLineage.tpl.html',
        link: function (scope, element, attrs) {}
    }
}])

.directive('shipLineageBox', [function () {
    return {
        restrict: 'E',
        templateUrl: 'modules/product/shipLineage.tpl.html',
        link: function (scope, element, attrs) {}
    }
}]);