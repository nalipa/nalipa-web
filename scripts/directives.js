'use strict';

/* Directives */

var nalipaDirectives = angular.module('nalipaDirectives', []);
nalipaDirectives.directive('nalipaTopHeader', function() {
    var controller = ['$scope',function ($scope) {



    }];


    return {
        scope: {
            user: '=',
            options: '='
        },
        controller: controller,
        templateUrl: 'views/directives/nalipa-top-header.html',
        link: function(scope, elem, attrs) {
            scope.hideLogin  = false;
            scope.$watch('user', function (value) {
                if ( scope.user && scope.user != "" )
                {
                    scope.hideLogin = true;
                }
            });
        }

    };
});