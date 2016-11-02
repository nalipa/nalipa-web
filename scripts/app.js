
'use strict';

/* App Module */

var nalipa = angular.module('nalipa',
                    ['ngRoute',
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
                     'angular-spinkit', 'angularjs-dropdown-multiselect',
                     'ngTable','multi-select-tree'])
.config(function($routeProvider,ivhTreeviewOptionsProvider,stripeProvider) {
	$routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
    }).when('/how-it-works', {
        templateUrl: 'views/how-it-works.html',
        controller: 'WorkController'
    }).when('/cart', {
        templateUrl: 'views/cart.html',
        controller: 'CartController'
    }).when('/cart/:id/edit/:type', {
        templateUrl: 'views/partials/editCart.html',
        controller: 'CartController'
    }).when('/cart/:id/delete', {
        templateUrl: 'views/deleteCart.html',
        controller: 'CartController'
    }).when('/card-details', {
        templateUrl: 'views/partials/cardDetails.html',
        controller: 'CartController'
    }).when('/orders', {
        templateUrl: 'views/order.html',
        controller: 'OrderController'
    }).when('/orders/:id/payfor', {
        templateUrl: 'views/payforOrder.html',
        controller: 'OrderController'
    }).when('/orders/:id/details', {
        templateUrl: 'views/orderDetails.html',
        controller: 'OrderController'
    }).when('/orders/:id/delete', {
        templateUrl: 'views/deleteOrder.html',
        controller: 'OrderController'
    }).when('/faqs', {
        templateUrl: 'views/faqs.html',
        controller: 'FAQsController'
    }).when('/contacts', {
        templateUrl: 'views/contacts.html',
        controller: 'ContactsController'
    }).when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsController'
    }).when('/login', {
        templateUrl: 'views/login.html',
        controller: 'UserController'
    }).when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'UserController'
    }).otherwise({
        redirectTo : '/'
    });

    stripeProvider.setPublishableKey('pk_test_Fs8KW1paR1d1Iox3hGltB7VF');

});
