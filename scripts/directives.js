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
            scope.isSuperUSer  = false;

            function checkRole(userRoles){
                angular.forEach(userRoles, function(role){

                    if ( role.roles.role == "SuperUser" )

                    {
                        scope.isSuperUSer  = true;
                    }
                        else
                    {
                        scope.isSuperUSer  = false;
                    }

                } );
            }

            scope.$watch('user', function (value) {

                if ( scope.user && scope.user != "" )
                {
                    checkRole(scope.user.user_role);
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
                    scope.$parent.main.authenicatedUser = "";
                    scope.user = "";
                    scope.hideLogin = false;
                    $state.go('home');
                })
            }

        }

    };
});
nalipaDirectives.directive('nalipaBottomHeader',function(authService,$state,$window) {
    var controller = ['$scope',function ($scope) {



    }];


    return {
        scope: {
            user: '=',
            options: '='
        },
        controller: controller,
        templateUrl: 'views/directives/nalipa-bottom-header.html',
        link: function(scope, elem, attrs) {

        }

    };
});

nalipaDirectives.directive('nalipaSettingsLeftMenu',function(authService,$state,$window) {
    var controller = ['$scope',function ($scope) {



    }];


    return {
        scope: {
            settingsMenus: '='
        },
        controller: controller,
        templateUrl: 'views/directives/nalipa-settings-left-menu.html',
        link: function(scope, elem, attrs) {
            scope.menuConfig = function(menu)
            {
                angular.forEach(scope.settingsMenus,function(value,index){
                    scope.settingsMenus[index].status = "";
                    if ( scope.settingsMenus[index].name == menu.name)
                    {
                        scope.settingsMenus[index].status = "active";
                    }
                })
            }

        }

    };
});
nalipaDirectives.directive('nalipaReportTable',function(authService,$state,$window) {
    var controller = ['$scope',function ($scope) {



    }];

    return {
        scope: {
            data: '='
        },
        controller: controller,
        templateUrl: 'views/directives/nalipa-report-table.html',
        link: function(scope, elem, attrs) {

        }

    };
});