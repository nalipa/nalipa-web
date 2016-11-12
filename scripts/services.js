/* global angular */

'use strict';

/* Services */

var nalipaServices = angular.module('nalipaServices', ['ngResource'])
    .value('API_BASE_URL', location.origin+'/nalipa/public/index.php/api')
    .value('BASE_AUTH_URL', location.origin+'/nalipa/public/index.php')
    .value('STRIPE_URL', location.origin+':8080/stripe/payment');
nalipaServices.factory('orderManager', function ($http, API_BASE_URL, $q,$cookieStore) {
    var orderManager = {
        listOrders: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/orders').then(function (result) {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addOrder: function (order, parameters) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/orders', order, parameters).then(function (result) {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateOrder: function (order, order_id) {
            var defer = $q.defer();

            $http.put(DHIS2URL + '/orders/' + order_id, order).then(function (data) {
                defer.resolve();
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteOrder: function (order_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/orders/' + order_id).then(function (result) {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
    return orderManager;
});
nalipaServices.factory('transactionManager', function ($http, API_BASE_URL, $q,$cookieStore,userManager) {


    var transactionManager = {
        listTransactions: function () {
            var loggedUser = userManager.getAuthenticatedUser();
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/userTransactions/'+loggedUser.id).then(function (result) {

                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addTransaction: function (transaction) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/transactions', transaction).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateTransaction: function (transaction, transaction_id) {
            var defer = $q.defer();

            $http.put(API_BASE_URL + '/transactions/' + transaction_id, transaction).then(function (result) {
                defer.resolve(result);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteTransaction: function (transaction_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/transactions/' + transaction_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getTotalAmountShopped: function (transactions) {
            var amount = 0;
            angular.forEach(transactions, function (value) {
                if (value.status == 'PENDING TRANSACTION') {
                    amount = parseFloat(amount) + parseFloat(value.amount);
                }
            })
            return amount;
        }
    }

    return transactionManager;
});
nalipaServices.factory('userManager', function ($http,$cookieStore, API_BASE_URL, BASE_AUTH_URL, $q) {
    var userManager = {

        getUserById: function(user_id) {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/users/'+user_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        listUsers: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/users').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addUser: function (user) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/users', user).then(function (result) {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateUser: function (user, user_id) {
            var defer = $q.defer();

            $http.put(API_BASE_URL + '/users/' + user_id, user).then(function (data) {
                defer.resolve();
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteUser: function (order_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/users/' + user_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        login: function (credentials) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/login', credentials).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
        ,
        getAuthenticatedUser: function () {
            return eval('('+$cookieStore.get('user')+')');
        }
        ,
        requestToken: function (credentials) {

            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/csrf').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;

            //var form_params = {
            //    'grant_type':'password',
            //    'client_id':7,
            //    'client_secret':'0zbxDCnY6GJpD5hVG0tgRH8MzUpVjkMB9sBHEVxc',
            //    'username':credentials.email,
            //    'password':credentials.password,
            //    'scope':''
            //}
            //
            //var deferred = $q.defer();
            //$http.post(BASE_AUTH_URL+'/oauth/token',form_params).then(function(result){
            //    deferred.resolve(result);
            //},function(error){
            //    deferred.reject(error);
            //});
            //return deferred.promise;
        }


    }
    return userManager;
});
nalipaServices.factory('authService',function ($http, API_BASE_URL, BASE_AUTH_URL, $q, $cookieStore,$state,userManager) {
    var auth = {};
    auth.login = function (credentials) {
        return $http.post(API_BASE_URL + '/login', credentials).then(function (response, status) {
            if ( response.status == 200 &&  response.data !="login failed" ) {
                auth.user = response.data;
                $cookieStore.put('user', JSON.stringify(auth.user));

                userManager.requestToken({
                    email:credentials.email,
                    password:credentials.password
                }).then(function(tokenResponse){

                    if ( tokenResponse.statusText == "OK" )
                    {
                        localStorage.setItem('access_token',tokenResponse.data.access_token);


                    }

                },function(error){
                    console.log(error);
                });
            }

            return auth.user;
        });
    }
    auth.logout = function () {
        return $http.post(API_BASE_URL + '/logout').then(function (response) {
            auth.user = undefined;
            localStorage.removeItem('unAuthorizedState');
            $cookieStore.remove('user');
        });
    }
    return auth;
});
nalipaServices.factory('questionManager', function ($http, API_BASE_URL, $q) {
    var questionManager = {
        listQuestions: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/securityQuestions').then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addQuestion: function (question) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/securityQuestions', question).then(function (result) {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateQuestion: function (question, question_id) {
            var defer = $q.defer();

            $http.put(API_BASE_URL + '/securityQuestions/' + question_id, question).then(function (data) {
                defer.resolve();
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteQuestion: function (question_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/securityQuestions/' + question_id).then(function (result) {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
    return questionManager;
});
nalipaServices.factory('countryManager', function ($http, API_BASE_URL, $q) {

    var countryManager = {
        listCountries: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/countries').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addCountry: function (country) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/countries', country).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateCountry: function (country, country_id) {
            var defer = $q.defer();

            $http.put(API_BASE_URL + '/countries/' + country_id, country).then(function (result) {
                defer.resolve(result.data);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteCountry: function (country_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/countries/' + country_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }

    return countryManager;
});
nalipaServices.factory('serviceProviderManager', function ($http, API_BASE_URL, $q) {
    var serviceProviderManager = {
        listServiceProviders: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/serviceProviders').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addServiceProvider: function (serviceProvider) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/serviceProviders', serviceProvider).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateServiceProvider: function (serviceProvider, serviceProvider_id) {
            var defer = $q.defer();

            $http.put(API_BASE_URL + '/serviceProviders/' + serviceProvider_id, serviceProvider).then(function (data) {
                defer.resolve(result);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteServiceProvider: function (serviceProvider_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/serviceProviders/' + serviceProvider_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
    return serviceProviderManager;
});
nalipaServices.factory('amountManager', function ($http, API_BASE_URL, $q) {
    var amountManager = {
        listAmounts: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/amounts').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addAmount: function (amount) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/amounts', amount).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateAmount: function (amount, amount_id) {
            var defer = $q.defer();

            $http.put(API_BASE_URL + '/amounts/' + amount_id, amount).then(function (data) {
                defer.resolve(result);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteAmount: function (amount_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/amounts/' + amount_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
    return amountManager;
});
nalipaServices.factory('paramManager', function () {
    var paramManager = {
        transform: function (data) {
            return $.param(data);
        }
    }
    return paramManager;
});
nalipaServices.factory('stripeManager', function ($http,STRIPE_URL, stripe, $q, selcomManager) {
    var stripeManager = {
        validateCardDetails: function (cardDetails) {

            this.invalidList = [];

            if (stripe.card.validateCardNumber(cardDetails.card_number)) {

            } else {
                this.invalidList.push('card');
            }


            if (stripe.card.validateExpiry(cardDetails.expire_month, cardDetails.expire_year)) {

            } else {
                this.invalidList.push('expiry');
            }

            if (stripe.card.validateCVC(cardDetails.cvc)) {

            } else {
                this.invalidList.push('expiry');
            }

            return this.invalidList;
        },
        createToken: function (cardDetails) {
            stripe.card.createToken(
                {
                    number: cardDetails.card_number,
                    cvc: cardDetails.cvc,
                    exp_month: cardDetails.expire_month,
                    exp_year: cardDetails.expire_year,
                    address_zip: cardDetails.zip
                }
            ).then(function (response) { console.log('STRIPE TOKEN ', response);
                cardDetails.token = response.id;
                cardDetails.amount = parseFloat(localStorage.getItem('totalAmount'));
                stripeManager.chargeCustomer(cardDetails).then(function (results) { console.log('FROM CHARGING CARD ', results);

                    if (results.statusText == "OK" && results.data) {
                        selcomManager.rechargeCustomer().then(function(data){ console.log('FROM SELCOM ', data);

                            angular.forEach(data,function(promiseObject){
                                console.log(promiseObject);
                                promiseObject.then(function(success){
                                    var x2js = new X2JS();
                                    var jsonObj = x2js.xml_str2json( success.data );
                                    console.log(success.data);
                                },function(failure){
                                    console.log(failure);
                                })
                            })
                        },function(error){
                            console.log('error',error);
                        });
                        //TODO:: take care of selcom  transaction
                    } else {

                    }
                    console.log('customer charges', results);
                }, function (error) {
                    console.log(error);
                });
                console.log('card token charges', response);
            })
        },
        chargeCustomer: function (paymentInformation) {
            var defer = $q.defer();

            $http.post(STRIPE_URL, paymentInformation).then(function (data) {
                defer.resolve(data);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }
    }

    return stripeManager;
});
nalipaServices.factory('selcomManager', function ($http,API_BASE_URL, $q) {
    var selcomManager = {
        prepareOrdersForRecharge: function () {
            var availableOrders = eval('(' + localStorage.getItem('pendingTransaction') + ')');
            var preparedOrder = [];
            console.log("AVAILABLE ORDERS",availableOrders);
            angular.forEach(availableOrders, function (data) {

                var methodName = 'SELCOM.utilityPayment';
                var utilityCode = data.service_provider.utility_code.utility_code;
                var transactionId = 657;
                var amount = data.amount;
                var msisdn = data.account_number;


                preparedOrder.push(
                    {
                        utilityCode: utilityCode,
                        amount: amount,
                        transactionId:transactionId
                    }
                );


            })
            return preparedOrder;
        },
        rechargeCustomer: function () {
            var paymentInformations = selcomManager.prepareOrdersForRecharge();
            var httpCalls = [];
            angular.forEach(paymentInformations, function (paymentInformation) {

                var httpCall = $http.post(API_BASE_URL + '/rechargeCustomer', paymentInformation);

                httpCalls.push(httpCall);

            });

            var deferred = $q.defer();
            $.when( httpCalls ).done(function(data){
                deferred.resolve(data);
            });
            return deferred.promise;

        }
    }

    return selcomManager;
});