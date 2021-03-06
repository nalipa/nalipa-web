
'use strict';

/* App Module */

var nalipa = angular.module('nalipa',
                    ['ngRoute',
                     'ui.router',
                     'ngCookies',
                     'ngSanitize',
                     'nalipaDirectives',
                     'nalipaControllers',
                     'nalipaServices',
                     'nalipaFilters',
                     'mgcrea.ngStrap',
                     'ivh.treeview',
                     'ngAnimate',
                     'datatables',
                     'datatables.bootstrap',
                     'credit-cards',
                     'angularXml2json',
                     'angular-stripe',
                     'highcharts-ng',
                     'vcRecaptcha',
                     'angular-spinkit', 'angularjs-dropdown-multiselect',
                     'ngTable','multi-select-tree']);
nalipa.run(function($rootScope,$state,$cookieStore,authService){

    $rootScope.$on('$stateChangeError', function(event, toState,toParams, fromState, fromParams, error) {

            localStorage.setItem('unAuthorizedState',toState.name);
            if(error.unAuthorized) {
                $state.go("login");
            }else if(error.authorized){
                $state.go(toState.name);
            }
        });
    authService.user=$cookieStore.get('user');
});
nalipa.config(function($stateProvider,$urlRouterProvider,$locationProvider,$routeProvider,ivhTreeviewOptionsProvider,stripeProvider) {

    $stateProvider.state('home',{
        url: '/',
        controller:'HomeController',
        templateUrl:'views/home.html'
    })
        .state('how-it-works',{
        url: '/how-it-works',
        controller:'WorkController',
        templateUrl: 'views/how-it-works.html'
    })
        .state('cart',{
        url: '/cart',
        abstract:false,
        controller:'CartController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/cart.html'
    })
        .state('edit-cart',{
        url: '/cart/:id/edit/:type',
        controller:'CartController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/partials/editCart.html'
    })
        .state('delete-cart',{
        url: '/cart/:id/delete',
        controller:'CartController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/deleteCart.html'
    })
        .state('card-details',{
        url: '/card-details',
        controller:'CartController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/partials/cardDetails.html'
    })
        .state('orders',{
        url: '/orders',
        controller:'OrderController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/order.html'
    })
        .state('pay-order',{
        url: '/orders/:id/payfor',
        controller:'OrderController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/payforOrder.html'
    })
        .state('order-detail',{
        url: '/orders/:id/details',
        controller:'OrderController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/orderDetails.html'
    })
        .state('delete-order',{
        url: '/orders/:id/delete',
        controller:'OrderController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
        templateUrl: 'views/deleteOrder.html'
    })
        .state('faqs',{
        url: '/faqs',
        controller:'FAQsController',
        templateUrl: 'views/faqs.html'
    })
        .state('contacts',{
        url: '/contacts',
        controller:'ContactsController',
        templateUrl: 'views/contacts.html'
    })
        .state('settings',{
        url: '/settings',
        controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
        templateUrl: 'views/settings.html'
    })
        .state('reportSettings',{
            url: '/settings/reports',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){

                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('userSettings',{
            url: '/settings/users',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){

                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }

                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('transactionSettings',{
            url: '/settings/transactions',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('successfulTransactionSettings',{
            url: '/settings/transactions/successful',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('pendingTransactionSettings',{
            url: '/settings/transactions/pending',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        }).state('pendingTransactionSettingsDetail',{
            url: '/settings/transactions/pending/:transactionId',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('failedTransactionSettings',{
            url: '/settings/transactions/failed',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){

                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('failedTransactionSettingsDetail',{
            url: '/settings/transactions/failed/:transactionId',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('messagesSettings',{
            url: '/settings/transactions/messages',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('systemSettings',{
            url: '/settings/system',
            controller:'SettingsController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    if ( eval('('+authService.user+')').isSuperUser ){
                        return authService.user;
                    }else{
                        return $q.reject({unAuthorized:true});
                    }
                }]
            },
            templateUrl: 'views/settings.html'
        })
        .state('profile',{
            url: '/profile/:user_id',
            abstract:false,
            controller:'UserController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
            templateUrl: 'views/profile.html'
        })
        .state('profileEdit',{
            url: '/profile/:user_id/edit',
            abstract:false,
            controller:'UserController',
            resolve:{
                user:['authService','$q',function(authService,$q){
                    return authService.user || $q.reject({unAuthorized:true});
                }]
            },
            templateUrl: 'views/partials/editProfile.html'
        })
        .state('about-us',{
            url: '/about-us',
            abstract:false,
            controller:'UserController',
            templateUrl: 'views/partials/about-us.html'
        })
        .state('term-of-service',{
            url: '/term-of-service',
            abstract:false,
            controller:'UserController',
            templateUrl: 'views/partials/term-of-service.html'
        })
        .state('privacy',{
            url: '/privacy',
            abstract:false,
            controller:'UserController',
            templateUrl: 'views/partials/privacy.html'
        })
        .state('forgot-password',{
            url: '/forgot-password',
            abstract:false,
            controller:'UserController',
            templateUrl: 'views/partials/forgot-password.html'
        })
        .state('login',{
        url: '/login',
        controller:'UserController',
        templateUrl: 'views/login.html'
    })
        .state('signup',{
        url: '/signup',
        controller:'UserController',
        templateUrl: 'views/signup.html'
    });
    $urlRouterProvider.otherwise('/');

    stripeProvider.setPublishableKey('pk_test_Fs8KW1paR1d1Iox3hGltB7VF');

});
