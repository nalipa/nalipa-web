/* global angular */

'use strict';

/* Controllers */
var nalipaControllers = angular.module('nalipaControllers', [])
	.controller('MainController',['$scope','authService','$cookieStore',function($scope,authService,$cookieStore)
	{
		var main = this;
		main.authenicatedUser = "";

		if ($cookieStore.get('user')){
			main.authenicatedUser = eval('('+$cookieStore.get('user')+')');
		}


		return main;

	}])
	.controller('HomeController',['$scope','$location','orderManager','serviceProviderManager','amountManager','transactionManager','authService',function($scope,$location,orderManager,serviceProviderManager,amountManager,transactionManager,authService)
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

		});

		return home;

	}]).controller('WorkController',['$scope',function($scope)
	{


	}])
	.controller('CartController',['$scope','$location','$stateParams','$filter','transactionManager','countryManager','serviceProviderManager','amountManager','stripeManager','selcomManager','authService','userManager',function($scope,$location,$stateParams,$filter,transactionManager,countryManager,serviceProviderManager,amountManager,stripeManager,selcomManager,authService,userManager)
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

			//var invalidList = stripeManager.validateCardDetails(cardInfo);
			//if ( invalidList.length == 0 ) {

				stripeManager.createToken(cardInfo);

			//}
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
		if ( $stateParams.type && $stateParams.type == "bills" ){
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
		if ( $stateParams.type && $stateParams.type == "airtime" ){

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
		$scope.panels = [
			{
				"title": "1. What is Nalipa.com ?",
				"body": "Nalipa.com is a service of Twiga Associates LLC that provides Diaspora. consumers aged 18 and over with the ability to buy Airtime or Pay bills from providers in their home countries at nalipa.com with any U.S. Visa® or MasterCard® American Express® Credit Cards."
			},
			{
				"title": "2. How does Nalipa.com work?",
				"body": "You must verify your identity and register your information, as well as the designated service provider . You must correctly enter your credit card information and indicate the amount to be paid. Upon verification of your identity and credit card approval, the transaction is confirmed and processed for delivery according to service provider. "
			},
			{
				"title": "3. How do I Pay for Airtime or Bill online?",
				"body": "New users can easily register for a free account at Nalipa.com . If you are already a registered user, simply login to your account with your unique username(email address) and password. Review our Terms and Conditions and decide whether you want to proceed. If you agree with the terms and conditions, user will be able proceed. Choose a service provider from the list. Enter payment information or use the one you previous use from the list. Currently we are accepting credit or debit card. You may also type a message intended for your beneficiary/recipient in the space provided. Review your transaction for accuracy and accept . Finally, print your receipt and with the Transaction Reference Number for your reference. "
			},
			{
				"title": "4. Which country can I Pay for Airtime or Bill?",
				"body": "Currently, the service is available for service providers in Tanzania. We intend to bring other country in the future."
			},
			{
				"title": "5. Where can I Access the service from?",
				"body": "With Nalipa.com , you can buy Airtime or Pay bills from any computer in the World that has internet access and a web browser that supports 128-bit encryption."
			},
			{
				"title": "6. How can I pay?",
				"body": "We accept all US Visa® and MasterCard® American Express® credit/debit cards."
			},
			{
				"title": "7. What's the transaction limit?",
				"body": "You may buy Airtime or pay bills which is not more than $250 by credit or debit cards. However, your identity has to be verified first. Verification of your identity takes place after you place your first order."
			},
			{
				"title": "8. How much does it cost?",
				"body": "We charge 6% per transaction"
			},
			{
				"title": "9. How is the exchange rate determined?",
				"body": "The actual exchange rate will be determined at the time or order. Exchange rate is derived from local Banks exchange market"
			},
			{
				"title": "10. What currency is used?",
				"body": "Currency accepted from the sender is in U.S. Dollars.payment to local provider is done in Tanzania shillings TSH"
			},
			{
				"title": "11. How does beneficiary/recipient notified?",
				"body": "Purchaser receives an email notification of Transaction status, but also may check the status from their accounts. Also notification is sent to the mobile number of the beneficiary entered during transaction process."
			},
			{
				"title": "12. How do I report a problem?",
				"body": "If you are an existing customer, send us an email or call us. We are available 12 hours a day 6 days a week."
			},
			{
				"title": "13. Why won't my credit card process?",
				"body": "Your address must match exactly with the address on your credit/Debit card statement and on file with your credit card issuing bank. Our system will verify this address to protect you from credit card fraud -- if the address does not match exactly, your order will not be processed to protect you from fraud."
			}
			,
			{
				"title": "14. What are Verified by Visa and Mastercard Secure Code?",
				"body": "As a Visa or Mastercard card holder, you have an option to sign up with Verified by Visa or Mastercard Secure Code, programs established by those companies to minimize and eliminate the risk of fraudulent use online. Verified by Visa and Mastercard Secure Code offers card holders an extra layer of fraud protection by having you enter an additional password before an online transaction can be completed. If you are making a payment with Nalipa.com online using a credit card issued by a bank not in the U.S., or if you are a resident of a country other than the U.S., you must enroll with Verified by Visa or Mastercard Secure Code in order for Nalipa.com to process your credit card transaction. By requiring this extra layer of security, we can better ensure that we do not process a transaction not initiated by you."
			},
			{
				"title": "15. How do I login if I forgot my password?",
				"body": "If you forgot your password, click \"Forgot Password?\" You will be asked to provide your email you entered at the time of registration. Upon verification of your email, our system will send reset password link to the email we have on file. The reset password link is valid for only 12 hrs. After that you must request another reset password link."
			},
			{
				"title": "16. How do I change information in my user account?",
				"body": "Login to your account and click the \"Username or Name appears on top of the page\"."
			},
			{
				"title": "17. What hours is the online remittance service available?",
				"body": "Nalipa.com is available 24 hours a day, seven days a week (24/7)"
			},
			{
				"title": "18. What restrictions are applicable in money remittance transactions?",
				"body": "Nalipa.com prohibits the use of its Airtime and Bill Payment services to directly or indirectly fund illegal activities including but not limited to money laundering, support of terrorist activities, fraudulent sales, solicitations, or theft. In compliance with the law, we are required to gather additional information in certain transactions that meet the criteria of corresponding regulations. For new customers, we may require a clear and legible copy of your valid photo ID to be emailed, faxed, or mailed to us before your transaction can be processed for delivery."
			},
			{
				"title": "19. How do I change or update my remittance once the transaction has been submitted?",
				"body": "If you realize that you provided incorrect information, such as your service provider, beneficially number, please contact Nalipa.com as soon as possible. If the information has not been transmitted yet, Nalipa.com can amend your information without any additional fees. If the information has already been transmitted, a fee of $9.99 is charged to cover costs incurred by Nalipa.com to amend the information except for buying Airtime."
			}
			,{
				"title": "20. What Service Providers subscribe to Nalipa payment portal?",
				"body": "Airtel Tanzania, Vodacom Tanzania, Tigo Tanzania, Zantel Tanzania, TTCL Prepaid, TTCL Broadband, Sasatel, DAWASCO, LUKU, DSTV, ZUKU, StarTimes, UhuruOne, Azam Marine, NECTA, ZUKU, Smile Telecom."
			}

			,{
				"title": "21. Can you deposit funds directly into my recipient's account in Tanzania ?",
				"body": "No. At this time, all transaction are paid by Credit/Debit card. In the future user will be able to use their Bank accounts and Direct deposits"
			},{
				"title": "22. How can I send SMS?",
				"body": "Registered user can send one FREE SMS per transactions to the beneficially number in the local country"
			}
		];
		$scope.panels.activePanel = 0;

	}])
	.controller('ContactsController',['$scope',function($scope)
	{


	}])
	.controller('SettingsController',['$scope',function($scope)
	{


	}])
	.controller('UserController',['$scope','$window','$state','$stateParams','userManager','questionManager','orderManager','paramManager','authService',function($scope,$window,$state,$stateParams,userManager,questionManager,orderManager,paramManager,authService)
	{

		var user = this;

		user.profileDetails = {};

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

				console.log(credentials);
				authService.login(credentials).then(function(response){
					$state.go('home');
					$window.location.reload();
				},function(error){
					console.log(response);
				})
				//userManager.login(credentials).then(function(result){
                //
				//	if ( result.statusText == "OK" ) {
				//		$scope.$parent.$parent.main.authenicatedUser = result.data;
				//		localStorage.setItem('authenicatedUser',JSON.stringify(result.data));
                //
					//	userManager.requestToken({
					//		email:credentials.email,
					//		password:credentials.password
					//	}).then(function(tokenResponse){
                //
					//		if ( tokenResponse.statusText == "OK" )
					//		{
					//			localStorage.setItem('access_token',tokenResponse.data.access_token);
                //
					//			var order = localStorage.getItem('pending_order');
					//			if ( order ){
                //
					//				orderManager.addOrder(order,
					//					{
					//						headers: { 'X-XSRF-TOKEN':'eyJpdiI6ImlSNHVmektJQk9aNWZxOVVtVnNyUUE9PSIsInZhbHVlIjoiQ0RoR1dhY3QwSGtGQVRIUnRKd1FGdz09IiwibWFjIjoiZGJmNGExNzMzYTI3ZTZkYWIyZWNhMDc5MGZmYjdhMGQzMTk3N2I1MTU5YzU1MzI4OTg4ODY4MGYzZTI4NTIzYyJ9' }
					//					}
					//				).then(function(response){
                //
					//				});
                //
					//			}
                //
					//		}
                //
					//	},function(error){
					//		console.log(error);
					//	});
                //
                //
                //
                //
				//	}
                //
				//},function(error){
                //
				//})


			}else{
				console.log(credentials);
			}
		}

		if ($stateParams) {


			if ( $stateParams.user_id )
			{
				userManager.getUserById($stateParams.user_id).then(function(data){

					if ( data.statusText == "OK" )
					{
						user.profileDetails = data.data;
					}
				},function(error){

				});
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
