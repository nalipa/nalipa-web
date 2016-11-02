/* global angular */

'use strict';

/* Controllers */
var nalipaControllers = angular.module('nalipaControllers', [])
	.controller('MainController',['$scope',function($scope)
	{
		var main = this;
		main.authenicatedUser = "";

		if (localStorage.getItem('authenicatedUser')){
			main.authenicatedUser = eval('('+localStorage.getItem('authenicatedUser')+')');
		}


		return main;

	}])
	.controller('HomeController',['$scope','$location','orderManager','serviceProviderManager','amountManager','transactionManager',function($scope,$location,orderManager,serviceProviderManager,amountManager,transactionManager)
	{
		var home = this;
		home.activateAirtime = 'active';
		home.serviceProviders = [];
		home.amounts =  [];
		home.showOtherAmount = false;
		home.tabClick = function(tabName){
			 if ( tabName == 'air' )
			 {
				 home.activateAirtime = 'active';
				 home.activateBill = '';
			 }else{
				 home.activateAirtime = '';
				 home.activateBill = 'active';
			 }
		}

		home.sendAirTime = function(transaction){

			transaction.utility_code_id = 1;
			transaction.account_number = transaction.recipient_number;
			transaction.sms_result = "";
			transaction.status = "PENDING TRANSACTION";
			transaction.user_id = $scope.$parent.$parent.main.authenicatedUser.id;
			console.log(transaction);
			transactionManager.addTransaction(transaction).then(function(response){
				console.log(response)
				if (response && response.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}
				else{
					$location.path('cart');
				}
			},function(error){
				if ( error.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}
			});
		}

		home.payBills = function(transaction){
			transaction.utility_code_id = 3;
			transaction.sms_result = "";
			transaction.status = "PENDING TRANSACTION";
			transaction.user_id = $scope.$parent.$parent.main.authenicatedUser.id;
			transactionManager.addTransaction(transaction).then(function(response){
				if ( response.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}else
				{
					$location.path('cart');
				}
			},function(error){
				if ( error.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}
			});
		}

		home.monitorChange = function(amount){

			if (amount == "Other Amount") {
				home.showOtherAmount = true;
			}
			else
			{
				home.showOtherAmount = false;
			}
		}

		serviceProviderManager.listServiceProviders().then(function(result){
			home.serviceProviders = result.data;
		},function(error){

		});

		amountManager.listAmounts().then(function(result){
			home.amounts = result.data;
			var otherAmount = {
				amount:"Other Amount",
				created_at:null,
				id:home.amounts.length,
				updated_at:null,
				utility_code:{
					created_at:null,
					id:1,
					updated_at:null,
					utility_code:"BILL",
					utility_code_id:1
				}
			}
			home.amounts.push(otherAmount);
		},function(error){

		})

		return home;

	}]).controller('WorkController',['$scope',function($scope)
	{


	}])
	.controller('CartController',['$scope','$location','$routeParams','$filter','transactionManager','countryManager','serviceProviderManager','amountManager','stripeManager','selcomManager',function($scope,$location,$routeParams,$filter,transactionManager,countryManager,serviceProviderManager,amountManager,stripeManager,selcomManager)
	{
		var cart = this;
		cart.currentRate = 2240;
		cart.transactions = [];
		cart.totalAmountShoppend = 0;
		cart.currentExchangeRate = "$1 = TZS "+cart.currentRate;
		cart.amountInUS = 0;
		cart.transactionFee = 10;
		cart.totalAfterEverything = 0;
		cart.countries = [];


		cart.serviceProviders = [];
		cart.amounts =  [];
		cart.showOtherAmount = false;

		cart.propertyName = 'recipient';
		cart.reverse = false;

		cart.listTransactions = function(){
			transactionManager.listTransactions().then(function(result){
				localStorage.removeItem('pendingTransaction');
				cart.transactions = $filter('filterPendingTransactions')(result.data);
				cart.totalAmountShoppend = transactionManager.getTotalAmountShopped(cart.transactions);
				cart.amountInUS = parseFloat(cart.totalAmountShoppend/cart.currentRate).toFixed(2);
				cart.totalAfterEverything = parseFloat(cart.amountInUS) + parseFloat(cart.transactionFee);

			},function(error){

			});
		}


		countryManager.listCountries().then(function(result){
			cart.countries = result.data;
		},function(error){

		});

		serviceProviderManager.listServiceProviders().then(function(result){
			cart.serviceProviders = result.data;
		},function(error){

		});

		amountManager.listAmounts().then(function(result){
			cart.amounts = result.data;
			var otherAmount = {
				amount:"Other Amount",
				created_at:null,
				id:cart.amounts.length,
				updated_at:null,
				utility_code:{
					created_at:null,
					id:1,
					updated_at:null,
					utility_code:"BILL",
					utility_code_id:1
				}
			}
			cart.amounts.push(otherAmount);
		},function(error){

		})


		cart.editTransaction = function (transaction){
			if ( transaction ) {
				var transactionType = transaction.service_provider.product.toLocaleLowerCase();

					localStorage.setItem('editTransaction',JSON.stringify(transaction));
					$location.path('/cart/'+transaction.id+'/edit/'+transactionType);


			} else {
				// TODO:: handle exception if transaction is null
			}

		}

		cart.deleteTransaction = function(transaction){
			if ( transaction ) {
				// TODO:: put some user validation to make sure action is not accidental
				transactionManager.deleteTransaction(transaction.id).then(function(response){
					cart.listTransactions();
				},function(){

				})
			} else {
				// TODO:: handle exception if transaction is null
			}
		}

		cart.payForOrder = function(){
			//href="#/card-details"
			localStorage.setItem('totalAmount',parseFloat(cart.totalAfterEverything).toFixed(0));
			$location.path('card-details');
		}

		cart.processCard = function(cardInfo){

			var invalidList = stripeManager.validateCardDetails(cardInfo);
			if ( invalidList.length == 0 ) {

				stripeManager.createToken(cardInfo);

			}
		}



		cart.updateAirTime = function(transaction){

			transaction.utility_code_id = 1;
			transaction.account_number = transaction.recipient_number;
			transaction.sms_result = "";
			transaction.status = "PENDING TRANSACTION";
			transaction.user_id = $scope.$parent.$parent.main.authenicatedUser.id;
			transactionManager.updateTransaction(transaction,cart.airtime.id).then(function(response){

				if (response && response.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}
				else{
					$location.path('cart');
				}
			},function(error){
				if ( error.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}
			});
		}

		cart.updateBills = function(transaction){
			transaction.utility_code_id = 3;
			transaction.sms_result = "";
			transaction.status = "PENDING TRANSACTION";
			transaction.user_id = $scope.$parent.$parent.main.authenicatedUser.id;
			transactionManager.updateTransaction(transaction,cart.bill.id).then(function(response){
				if ( response.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}else
				{
					$location.path('cart');
				}
			},function(error){
				if ( error.statusText == "Unauthorized" )
				{
					localStorage.setItem('pending_transaction',JSON.stringify(transaction));
					$location.path('login');

				}
			});
		}

		cart.monitorChange = function(amount){

			if (amount == "Other Amount") {
				home.showOtherAmount = true;
			}
			else
			{
				home.showOtherAmount = false;
			}
		}

		// Edit bills
		if ( $routeParams.type && $routeParams.type == "bills" ){
			cart.bill = eval('('+localStorage.getItem('editTransaction')+')');
			cart.activateBill = 'active';
			cart.isBill = true;
			cart.isAir = false;
			cart.activateAirtime = '';

		}

		cart.backToCart = function(){
			$location.path('cart');
		}

		// Edit airtime
		if ( $routeParams.type && $routeParams.type == "airtime" ){

			cart.airtime = eval('('+localStorage.getItem('editTransaction')+')');

			cart.activateAirtime = 'active';
			cart.activateBill = '';
			cart.isBill = false;
			cart.isAir = true;
		}

		cart.listTransactions();



		return cart;

	}])
	.controller('OrderController',['$scope',function($scope)
	{


	}])
	.controller('FAQsController',['$scope',function($scope)
	{


	}])
	.controller('ContactsController',['$scope',function($scope)
	{


	}])
	.controller('SettingsController',['$scope',function($scope)
	{


	}])
	.controller('UserController',['$scope','userManager','questionManager','orderManager','paramManager',function($scope,userManager,questionManager,orderManager,paramManager)
	{

		var user = this;

		user.securityQuestions = [];
		questionManager.listQuestions().then(function(result){
			user.securityQuestions = result;
		}, function (error) {

		})


        user.registerUser = function(user){

            userManager.addUser(user).then(function(result){
                console.log(result);
            },function(error){

            })
            console.log(user);
        }

		user.authenicateUser = function(credentials){
			if ( typeof credentials != 'undefined' && checkIfCredentialsSupplied(credentials)) {
				userManager.login(credentials).then(function(result){

					if ( result.statusText == "OK" ) {
						$scope.$parent.$parent.main.authenicatedUser = result.data;
						localStorage.setItem('authenicatedUser',JSON.stringify(result.data));

						userManager.requestToken({
							email:credentials.email,
							password:credentials.password
						}).then(function(tokenResponse){

							if ( tokenResponse.statusText == "OK" )
							{
								localStorage.setItem('access_token',tokenResponse.data.access_token);

								var order = localStorage.getItem('pending_order');
								if ( order ){

									orderManager.addOrder(order,
										{
											headers: { 'X-XSRF-TOKEN':'eyJpdiI6ImlSNHVmektJQk9aNWZxOVVtVnNyUUE9PSIsInZhbHVlIjoiQ0RoR1dhY3QwSGtGQVRIUnRKd1FGdz09IiwibWFjIjoiZGJmNGExNzMzYTI3ZTZkYWIyZWNhMDc5MGZmYjdhMGQzMTk3N2I1MTU5YzU1MzI4OTg4ODY4MGYzZTI4NTIzYyJ9' }
										}
									).then(function(response){

									});

								}

							}

						},function(error){
							console.log(error);
						});




					}

				},function(error){

				})
			}else{
				console.log(credentials);
			}
		}

		function checkIfCredentialsSupplied(credentials){

			if ( credentials.email && credentials.email != "" && credentials.password && credentials.password != "" )
			{
				return true;
			}else{
				return false;
			}
		}

	}]);
