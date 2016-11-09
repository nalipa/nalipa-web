'use strict';

/* Directives */

var nalipaDirectives = angular.module('nalipaDirectives', []);
nalipaDirectives.directive('nalipaTopHeader', function(authService,$state,$window) {
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



            scope.logout = function(){

                authService.logout().then(function(response){
                    localStorage.removeItem('authenicatedUser');
                    localStorage.removeItem('pending_order');
                    localStorage.removeItem('totalAmount');
                    localStorage.removeItem('pendingTransaction');
                    localStorage.removeItem('editTransaction');
                    $state.go('home');
                    $window.location.reload();

                })
            }


        }

    };
});