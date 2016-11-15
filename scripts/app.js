
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
                     'angular-stripe',
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
                    return authService.user || $q.reject({unAuthorized:true});
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
    //$locationProvider.html5Mode({
    //    enabled: true,
    //    requireBase: false
    //});
    //$routeProvider.when('/', {
    //    templateUrl: 'views/home.html',
    //    controller: 'HomeController'
    //}).when('/how-it-works', {
    //    templateUrl: 'views/how-it-works.html',
    //    controller: 'WorkController'
    //}).when('/cart', {
    //    templateUrl: 'views/cart.html',
    //    controller: 'CartController'
    //}).when('/cart/:id/edit/:type', {
    //    templateUrl: 'views/partials/editCart.html',
    //    controller: 'CartController'
    //}).when('/cart/:id/delete', {
    //    templateUrl: 'views/deleteCart.html',
    //    controller: 'CartController'
    //}).when('/card-details', {
    //    templateUrl: 'views/partials/cardDetails.html',
    //    controller: 'CartController'
    //}).when('/orders', {
    //    templateUrl: 'views/order.html',
    //    controller: 'OrderController'
    //}).when('/orders/:id/payfor', {
    //    templateUrl: 'views/payforOrder.html',
    //    controller: 'OrderController'
    //}).when('/orders/:id/details', {
    //    templateUrl: 'views/orderDetails.html',
    //    controller: 'OrderController'
    //}).when('/orders/:id/delete', {
    //    templateUrl: 'views/deleteOrder.html',
    //    controller: 'OrderController'
    //}).when('/faqs', {
    //    templateUrl: 'views/faqs.html',
    //    controller: 'FAQsController'
    //}).when('/contacts', {
    //    templateUrl: 'views/contacts.html',
    //    controller: 'ContactsController'
    //}).when('/settings', {
    //    templateUrl: 'views/settings.html',
    //    controller: 'SettingsController'
    //}).when('/login', {
    //    templateUrl: 'views/login.html',
    //    controller: 'UserController'
    //}).when('/signup', {
    //    templateUrl: 'views/signup.html',
    //    controller: 'UserController'
    //}).otherwise({
    //    redirectTo : '/'
    //});

    stripeProvider.setPublishableKey('pk_test_Fs8KW1paR1d1Iox3hGltB7VF');

});
