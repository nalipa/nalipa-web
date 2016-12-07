/* global angular */

'use strict';

/* Services */

var nalipaServices = angular.module('nalipaServices', ['ngResource'])
    .value('API_BASE_URL', location.origin+'/nalipa/public/index.php/api')
    .value('BASE_AUTH_URL', location.origin+'/nalipa/public/index.php')
    .value('STRIPE_URL', location.origin+':8080/stripe/payment')
    .value('MAIL_URL', location.origin+':8080/mailUs');
nalipaServices.factory('orderManager', function ($http, API_BASE_URL, $q,$cookieStore) {
    var orderManager = {
        listOrders: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/orders').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addOrder: function (order) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/orders', order).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateOrder: function (order, order_id) {
            var defer = $q.defer();

            $http.put(DHIS2URL + '/orders/' + order_id, order).then(function (result) {
                defer.resolve(result);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteOrder: function (order_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/orders/' + order_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        prepareOrder:function(transaction,transactionAddResponse){
            var order = {};
            var utilitId = transaction.utility_code_id;
            var utilityCodes = eval('('+localStorage.getItem('utilityCodes')+')');
            angular.forEach(utilityCodes,function(utilityCode){
                if ( utilityCode.id == utilitId )
                {
                    transaction.utility = utilityCode;
                }
            });

            if ( transactionAddResponse.data )
            {
                transaction.id = transactionAddResponse.data.id;
            }
            else
            {
                transaction.id = transaction.user_id;
            }

            if (transaction.status.indexOf('PENDING')>=0)
            {
                transaction.status = "PENDING COMPLETION";
            }
            var currentRate = parseInt(localStorage.getItem('exchangeRate'));
            order.user_id = transaction.user_id;
            order.order_number = transaction.id;
            order.status = transaction.status;
            order.tzs_amount = transaction.amount;
            order.exchange_rate = currentRate;
            order.usd_amount = parseFloat(parseInt(transaction.amount)/currentRate).toFixed(2);
            order.transaction_fee = "";
            order.order_amount = transaction.amount;
            order.stripe_customer = "";
            order.stripe_charge = "";
            order.stripe_amount = "";

            return order;
        }

    }
    return orderManager;
});
nalipaServices.factory('transactionManager', function ($http, API_BASE_URL, $q,$cookieStore,userManager) {


    var transactionManager = {
        listAllTransactions: function () {

            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/transactions/').then(function (result) {

                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },listTransactions: function () {
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
nalipaServices.factory('userManager', function ($http,$cookieStore,$location, API_BASE_URL, BASE_AUTH_URL,MAIL_URL, $q) {
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
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateUser: function (user, user_id) {
            var defer = $q.defer();

            $http.put(API_BASE_URL + '/users/' + user_id, user).then(function (data) {
                defer.resolve(data);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteUser: function (user) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/users/' + user.id).then(function (result) {
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
            var authenticated = eval('('+$cookieStore.get('user')+')');

            if ( authenticated ){return authenticated}
            return false;
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
        },
        contactUs: function(message){
            //console.log(message);
            var deferred = $q.defer();
            $http.post(MAIL_URL,message).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }


    }
    return userManager;
});
nalipaServices.factory('authService',function ($http, API_BASE_URL, BASE_AUTH_URL, $q, $cookieStore,$state,userManager) {
    var auth = {};
    auth.login = function (credentials) {
        return $http.post(API_BASE_URL + '/login', credentials).then(function (response, status) {
            function checkRole(userRoles){
                angular.forEach(userRoles, function(role){

                    if ( role.roles.role == "SuperUser" )

                    {
                        console.log(role);
                        return true;
                    }
                    else
                    {
                        return false;
                    }

                } );
            }
            if ( response.status == 200 &&  response.data !="login failed" ) {
                auth.user = response.data;
                auth.user.isSuperUser = checkRole(auth.user.user_role);
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
nalipaServices.factory('stripeManager', function ($http,STRIPE_URL,API_BASE_URL, stripe, $q, selcomManager,ngXml2json) {
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
            var deferred = $q.defer();
            return stripe.card.createToken(
                {
                    number: cardDetails.card_number,
                    cvc: cardDetails.cvc,
                    exp_month: cardDetails.expire_month,
                    exp_year: cardDetails.expire_year,
                    address_zip: cardDetails.zip
                }
            ).then(function (response) {
                cardDetails.token = response.id;
                cardDetails.amount = parseFloat(localStorage.getItem('totalAmount'));
                stripeManager.chargeCustomerCard(cardDetails).then(function (results) {

                    if (results.statusText == "OK" && results.data) {

                        if ( stripeManager.isRechargable(results.data) )
                        {
                            selcomManager.rechargeCustomerUtilityAccount().then(function(data){ console.log('FROM SELCOM ', data);
                                var responseCounter = 0;
                                angular.forEach(data,function(promiseObject){

                                    promiseObject.then(function(success){
                                        responseCounter++;
                                        if ( responseCounter >= data.length ){
                                            if ( success.data )
                                            {
                                                var selcomMessage  = stripeManager.checkSelcomApiMessage(success.data);

                                                if ( selcomMessage.result.string !='FAIL' )
                                                {
                                                    //TODO:: sending if succeed. THIS HAS TO CHECK FOR EACH INDIVIDUAL TRANSACTIONS
                                                    var authenticated = eval('('+$cookieStore.get('user')+')');
                                                    var recepients = stripeManager.getTransactionsDetails(eval('('+localStorage.getItem('pendingTransaction')+')'));

                                                    angular.forEach(recepients , function(recipient){
                                                        /**
                                                         * Send user success response to recepient mobile phone via sms
                                                         * */

                                                        var message  = "Hello "+recipient.name+"("+recipient.phone+")"
                                                                       +"                     "
                                                                       +"You have been charged with "+recipient.amount+" TZS. for "+recipient.utility
                                                                       +"                     "
                                                                       +"by "+authenticated.first_name+" "+authenticated.last_name+"("+authenticated.phone_number+")";

                                                        var messageSMS = {recipient_number:recipient.phone,
                                                            sms:message
                                                        }
                                                        stripeManager.sendBongoLiveSMS(messageSMS).then(function(data){
                                                            console.log(data);
                                                        },function(error){
                                                            console.log(error);
                                                        });


                                                        /**
                                                         * Send user success response via email to user
                                                         * */

                                                        var messageEmail  = "Hello "+authenticated.first_name+" "+authenticated.last_name+"("+authenticated.phone_number+")"
                                                            +"                     "
                                                            +"You have recharged "+recipient.amount+" TZS. for "+recipient.utility
                                                        +"                     "
                                                        +"to "+recipient.name+"("+recipient.phone+")";
                                                    });




                                                }

                                                if ( selcomMessage.result.string == 'FAIL' )
                                                {

                                                    var message = {recipient_number:'0787656606',
                                                        sms:'HELLOW NALIPA TEAM.' +
                                                        '                         ' +
                                                        'SELCOM TRANSACTION FAILED.' +
                                                        '                           ' +
                                                        'ERROR: '+selcomMessage.message.string
                                                    }

                                                    stripeManager.sendBongoLiveSMS(message).then(function(data){
                                                        console.log(data);
                                                    },function(error){
                                                        console.log(error);
                                                    });


                                                }
                                            }
                                            var stripeMessage = stripeManager.getMessage(results.data);
                                            deferred.resolve(stripeMessage);
                                        }

                                    },function(failure){
                                        console.log(failure);
                                    })
                                })
                            },function(error){
                                console.log('error',error);
                            });
                        }
                        else
                        {
                                var stripeMessage = stripeManager.getMessage(results.data);
                            deferred.resolve(stripeMessage);
                        }

                        //TODO:: take care of selcom  transaction
                    } else {
                        deferred.resolve({message:"Process Could not complete try again later"});
                    }

                }, function (error) {
                    console.log(error);
                });

                return deferred.promise;
            })
        },
        sendBongoLiveSMS:function(object){
            var defer = $q.defer();

            $http.post(API_BASE_URL + '/notifyBySMS', object).then(function (data) {
                defer.resolve(data);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }
        ,
        chargeCustomerCard: function (paymentInformation) {
            var defer = $q.defer();

            $http.post(STRIPE_URL, paymentInformation).then(function (data) {
                defer.resolve(data);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        isRechargable:function(chargeObject) {
            if ( chargeObject.type )
            {
                // here is when charging failed
                    return false;
            }

            if ( chargeObject.status )
            {
                // here is when either charging succeeded or there is custome error to check
                if ( chargeObject.status == 'paid' )
                {
                    return true;
                }
            }

        },
        getMessage:function(chargeObject) {
            if ( chargeObject.type )
            {
                // here is when charging failed
                return chargeObject.raw;
            }

            if ( chargeObject.status )
            {
                return chargeObject;
            }
        },
        checkSelcomApiMessage:function(selcomData) {
            var messageObject = ngXml2json.parser(selcomData);

            var messageArray = messageObject.methodresponse.params.param.value.struct.member;
            var messageOutput = {};
            angular.forEach(messageArray, function(messageMember){
                messageOutput[messageMember.name] = messageMember.value;
            });
            return messageOutput;
        },
        getTransactionsDetails:function(pendingTransaction){
            var recipients = [];

            angular.forEach(pendingTransaction, function(transaction){
                recipients.push({name:transaction.recipient,phone:transaction.recipient_number,amount:transaction.amount,utility:transaction.utility_code.utility_code});
            });

            return recipients;
        }
    }

    return stripeManager;
});
nalipaServices.factory('selcomManager', function ($http,API_BASE_URL, $q,ngXml2json) {
    var selcomManager = {
        prepareOrdersForRecharge: function () {
            var availableOrders = eval('(' + localStorage.getItem('pendingTransaction') + ')');
            var preparedOrder = [];
            console.log("AVAILABLE ORDERS",availableOrders);
            angular.forEach(availableOrders, function (data) {

                var methodName = 'SELCOM.utilityPayment';
                var utilityCode = data.service_provider.utility_code.utility_code;
                var transactionId = data.id;
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
        rechargeCustomerUtilityAccount: function () {
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
nalipaServices.factory('utilityCodeManager',function($http,API_BASE_URL, $q,ngXml2json){
    var utilityCodeManager = {
        listUtilities: function () {
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/utilityCodes').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        addUtility: function (utility) {
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/utilityCodes', utility).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        updateUtility: function (utility, utility_id) {
            var defer = $q.defer();

            $http.put(DHIS2URL + '/utilityCodes/' + utility_id, utility).then(function (result) {
                defer.resolve(result);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        deleteUtility: function (utility_id) {
            var deferred = $q.defer();
            $http.delete(API_BASE_URL + '/utilityCodes/' + utility_id).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    }
    return utilityCodeManager;
});
nalipaServices.factory('reportService', function($http,API_BASE_URL,$q,transactionManager,orderManager){
    var reportService = {
        data:[],
        getDataFromApiSource:function(type){

            if (type=="transactions")
            {
                return transactionManager.listTransactions();
            }

            if (type=="orders")
            {
                return orderManager.listOrders();
            }
        },
        prepareTableData:function(data,type,category,year,month,chartType){
            var tableArray = [];
            angular.forEach(data,function(rowValue,rowIndex){
                tableArray.push(rowValue);
            })
            return tableArray;
        },
        prepareChartData:function(data,type,category,year,month,chartType){
            return reportService.prepareSeries(data,year,month,type,category);
        },
        prepareSeries:function(data,year,month,type,category){

            var names = []
            if ( category.name == 'All' )
            {
                names.push(type);
            }
            else
            {

            }

            var chartArray = [];
            var counter = 0;
            angular.forEach(data,function(rowValue,rowIndex){

            })

            angular.forEach(data,function(rowValue,rowIndex){
                counter++;
            })

            chartArray.push({data:[counter],name:names[0]});
            return chartArray;
        }
    }

    return reportService;
});
nalipaServices.factory('systemService', function($http,API_BASE_URL,$q){
    var systemService = {
        getConfigurations:function(){
            var deferred = $q.defer();
            $http.get(API_BASE_URL + '/system').then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        setConfigurations:function(data){
            var deferred = $q.defer();
            $http.post(API_BASE_URL + '/system',data).then(function (result) {
                deferred.resolve(result);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

        extractLatestConfigurations:function(data){
            return data[data.length-1];
        }
    }

    return systemService;
});