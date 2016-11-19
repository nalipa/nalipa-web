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

		localStorage.setItem('exchangeRate',2240);
		localStorage.setItem('transactionFee',10);

		return main;

	}])
	.controller('HomeController',['$scope','$location','orderManager','serviceProviderManager','amountManager','transactionManager','authService','utilityCodeManager',function($scope,$location,orderManager,serviceProviderManager,amountManager,transactionManager,authService,utilityCodeManager)
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
			home.showAirSpinner = true;
			transaction.utility_code_id = 1;
			transaction.account_number = transaction.recipient_number;
			transaction.sms_result = "";
			transaction.status = "PENDING TRANSACTION";
			if ( !$scope.$parent.$parent.main.authenicatedUser.id ) {
				localStorage.removeItem('raw_transaction');
				localStorage.removeItem('unAuthorizedState');
				transaction.type = "airtime";
				localStorage.setItem('raw_transaction',JSON.stringify(transaction));
				localStorage.setItem('unAuthorizedState','cart');
				$location.path('login');
			} else {
				transaction.user_id = $scope.$parent.$parent.main.authenicatedUser.id;
				transactionManager.addTransaction(transaction).then(function(response){
					home.showAirSpinner = false;
					if (response && response.statusText == "Unauthorized" )
					{
						orderManager.addOrder(orderManager.prepareOrder(transaction,response),function(orderResponse){

						},function(){

						});
						localStorage.setItem('pending_transaction',JSON.stringify(transaction));
						$location.path('login');

					}
					else{
						orderManager.addOrder(orderManager.prepareOrder(transaction,response),function(orderResponse){

						},function(){

						});
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


		}

		home.payBills = function(transaction){
			home.showBillSpinner = true;
			transaction.utility_code_id = 3;
			transaction.sms_result = "";
			transaction.status = "PENDING TRANSACTION";

			if ( !$scope.$parent.$parent.main.authenicatedUser.id ) {
				localStorage.removeItem('raw_transaction');
				localStorage.removeItem('unAuthorizedState');
				transaction.type = "bill";
				localStorage.setItem('raw_transaction',JSON.stringify(transaction));
				localStorage.setItem('unAuthorizedState','cart');
				$location.path('login');
			} else {
				transaction.user_id = $scope.$parent.$parent.main.authenicatedUser.id;
				transactionManager.addTransaction(transaction).then(function(response){
					home.showBillSpinner = false;
						if ( response.statusText == "Unauthorized" )
					{
						orderManager.addOrder(orderManager.prepareOrder(transaction,response),function(orderResponse){

						},function(){

						});
						localStorage.setItem('pending_transaction',JSON.stringify(transaction));
						$location.path('login');

					}
						else
					{
						orderManager.addOrder(orderManager.prepareOrder(transaction,response),function(orderResponse){

						},function(){

						});
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

		utilityCodeManager.listUtilities().then(function(result){
			if ( result.statusText == "OK" && result.data)
			{
				localStorage.removeItem('utilityCodes');
				localStorage.setItem('utilityCodes',JSON.stringify(result.data));
			}
		},function(error){

		});

		return home;

	}]).controller('WorkController',['$scope',function($scope)
	{


	}])
	.controller('CartController',['$scope','$location','$stateParams','$filter','transactionManager','countryManager','serviceProviderManager','amountManager','stripeManager','selcomManager','authService','userManager',function($scope,$location,$stateParams,$filter,transactionManager,countryManager,serviceProviderManager,amountManager,stripeManager,selcomManager,authService,userManager)
	{
		var cart = this;

		cart.getCurrentExchangeRate = function(){
			if (localStorage.getItem('exchangeRate')){
				return parseInt(localStorage.getItem('exchangeRate'))
			} else {
				return 2240;
			}

		}
		cart.getCurrentTransactionFee = function(){
			if (localStorage.getItem('transactionFee')){
				return parseInt(localStorage.getItem('transactionFee'))
			} else {
				return 10;
			}

		}

		cart.currentRate = cart.getCurrentExchangeRate();
		cart.transactions = [];
		cart.totalAmountShoppend = 0;
		cart.currentExchangeRate = "$1 = TZS "+cart.currentRate;
		cart.amountInUS = 0;
		cart.transactionFee = cart.getCurrentTransactionFee();
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
			cart.responseObject = {};
			cart.responseObject.message = "";
			cart.responseObject.alert = "";
			cart.finalResponse = false;



			var invalidList = stripeManager.validateCardDetails(cardInfo);
			if ( invalidList.length == 0 ) {
				cart.showPaySpinner = true;
				stripeManager.createToken(cardInfo).then(function(resultFromProcess){

					if ( resultFromProcess.status )
					{
						cart.responseObject.alert = "alert-success";
						cart.responseObject.message = resultFromProcess.description
					}
					else
					{
						cart.cardInfo = {};
						cart.responseObject.message = resultFromProcess.message;
						cart.responseObject.alert = "alert-danger";
					}

					cart.finalResponse = true;
					cart.showPaySpinner = false;
				});

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
	.controller('OrderController',['$scope','orderManager',function($scope,orderManager)
	{
		var order = this;

		order.orders = [];

		orderManager.listOrders().then(function(result){
			if ( result.statusText == "OK" )
			{
				order.orders = result.data;
			}

		},function(error){

		})

		return order;

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
	.controller('ContactsController',['$scope','userManager','vcRecaptchaService',function($scope,userManager,vcRecaptchaService)
	{
		var contact = this;
		contact.messageContact = {};

		contact.contactUs = function(messageContact){

				var valid;

				/**
				 * SERVER SIDE VALIDATION
				 *
				 * You need to implement your server side validation here.
				 * Send the reCaptcha response to the server and use some of the server side APIs to validate it
				 * See https://developers.google.com/recaptcha/docs/verify
				 */

				if (!valid) {
					console.log('Success');
				} else {
					console.log('Failed validation');

					// In case of a failed validation you need to reload the captcha
					// because each response can be checked just once
					vcRecaptchaService.reload($scope.widgetId);
				}

			//console.log(messageContact);
			userManager.contactUs(messageContact).then(function(result){

				if ( result.statusText == "OK" && result.data )
				{
					contact.messageContact = {};
				}

			},function(error){

			})
		}

		var apiKey = "6LeP8AsUAAAAAOOoY2h2FG2wJkN1eX9bA41jlzBH";

		contact.response = null;
		contact.widgetId = null;

		contact.model = {
			key: apiKey
		};

		contact.setResponse = function (response) {
			console.info('Response available');

			contact.response = response;
		};

		contact.setWidgetId = function (widgetId) {

			contact.widgetId = widgetId;
		};

		contact.cbExpiration = function() {

			vcRecaptchaService.reload(contact.widgetId);

			contact.response = null;
		};



		return contact;
	}])
	.controller('SettingsController',['$scope','$stateParams','$location','reportService',function($scope,$stateParams,$location,reportService)
	{
		var settings = this;

		settings.getStatus = function(statusPage){

			if ($location.$$path.indexOf(statusPage)>=0){
				settings.templateUrl = 'views/partials/settings-'+statusPage+'.html';
				return "active";
			} else  {

				return "";
			}
		};

		settings.menus = [
			{name:'Reports',url:'#/settings/reports',status:settings.getStatus('reports')},
			{name:'Users',url:'#/settings/users',status:settings.getStatus('users')},
			{name:'System Configurations',url:'#/settings/system',status:settings.getStatus('system')},
		];

		settings.reports = {};

		settings.reports.types = [
			{name:'Transactions',id:'transactions',childrens:[]},
			{name:'Orders',id:'orders',childrens:[]},
		]

		settings.reports.reportTypes = [
			{name:'Table',id:'table',status:'active'},
			{name:'Bar Chart',id:'bar',status:''},
			{name:'Column Chart',id:'column',status:''},
			{name:'Line Chart',id:'line',status:''},
			{name:'Pie Chart',id:'pie',status:''},
		]

		settings.reports.categories = [
			{name:'All',children:null},
			{name:'Utility Codes',children:[
				{name:'TOP'},
				{name:'LUKU'},
				{name:'DAWASCO'},
				{name:'DSTV'},
				{name:'STARTIMES'},
				{name:'ZUKU'},
				{name:'AMCASHIN'},
				{name:'TPCASHIN'},
				{name:'VMCASHIN'},
			]},
			{name:'Product',children:[
				{name:'AIRTIME'},
				{name:'BILLS'}
			]},
			{name:'Service Providers',children:[
				{name:'Vodacom'},
				{name:'Airtel'},
				{name:'Tigo'},
				{name:'Zantel'},
				{name:'LUKU Prepaid Electricity'},
				{name:'DAWASCO water and sewerage'},
				{name:'DSTV Satellite Television'},
				{name:'STARTIMES Terrestrial Television'},
				{name:'ZUKU Television'},
				{name:'Airtel Money'},
				{name:'Tigo Pesa'},
				{name:'Vodacom M-pesa'}
			]}
		]

		settings.reports.selectedReportType = 'table';
		settings.reports.selectedType = 'transactions';
		settings.reports.selectedCategory = settings.reports.categories[0];
		settings.reports.selectedPeriodType = 'Monthly';
		settings.reports.selectedYear = 2016;
		settings.reports.selectedMonth = '01';
		settings.reports.showChart = false;
		settings.reports.showTable = true;
		settings.reports.chartType = 'column';
		settings.reports.title = settings.reports.selectedType + " by " + settings.reports.selectedCategory.name +' '+ settings.reports.selectedYear;

		settings.getYears = function(){
			var date = new Date();
			var fullYear = date.getFullYear();

			var years = [];

			while(years.length<10){
				years.push(fullYear);
				fullYear--;

			}

			return years;
		};

		settings.checkForParameters = function(){
			if ( !settings.reports.selectedType ||  !settings.reports.selectedCategory ||  !settings.reports.selectedPeriodType ||  !settings.reports.selectedYear )
			{


				return false;
			}

			if ( settings.reports.selectedPeriodType=="Monthly" && !settings.reports.selectedMonth )
			{
				return false;
			}
			return true;
		}

		settings.drawChart = function(){
			settings.chartConfig = {

				options: {
					//This is the Main Highcharts chart config. Any Highchart options are valid here.
					//will be overriden by values specified below.
					chart: {
						type: ''
					},
					tooltip: {
						style: {
							padding: 10,
							fontWeight: 'bold'
						}
					}
				},
				//The below properties are watched separately for changes.

				//Series object (optional) - a list of series using normal Highcharts series options.
				series: [{
					data: [10, 15, 12, 8, 7]
				}],
				//Title configuration (optional)
				title: {
					text: 'Yes'
				},
				//Boolean to control showing loading status on chart (optional)
				//Could be a string if you want to show specific loading text.
				loading: false,
				//Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
				//properties currentMin and currentMax provided 2-way binding to the chart's maximum and minimum
				xAxis: {
					currentMin: 0,
					currentMax: 20,
					title: {text: 'values'}
				},
				//Whether to use Highstocks instead of Highcharts (optional). Defaults to false.
				useHighStocks: false,
				//size (optional) if left out the chart will default to size of the div or something sensible.
				size: {
					width: 750,
					height: 300
				},
				//function (optional)
				func: function (chart) {
					//setup some logic for the chart

				}
			};
			settings.chartConfig.options.chart.type=settings.reports.chartType;
			settings.chartConfig.title.text=settings.reports.title;
			console.log(settings.chartConfig);
		}

		settings.changeReportType = function(reportType){

			angular.forEach(settings.reports.reportTypes,function(value,index){
				settings.reports.reportTypes[index].status='';
				if ( settings.reports.reportTypes[index].id ==  reportType.id ){
					settings.reports.reportTypes[index].status='active';
					settings.reports.selectedReportType = settings.reports.reportTypes[index].name;
				}
			})

			if (reportType == 'table' || reportType.name == 'Table'){
				settings.reports.showChart = false;
				settings.reports.showTable = true;
			}else{
				settings.reports.showChart = true;
				settings.reports.showTable = false;
				settings.reports.chartType = reportType.id;
				settings.drawChart();
			}



		}

		settings.getReport = function(){
			if ( settings.checkForParameters() )
			{
				settings.showChartSelection = true;
				reportService.getDataFromApiSource(settings.reports.selectedType).then(function(result){


						var preparedData = 	reportService.prepareData(
							result.data,
							settings.reports.selectedType,
							settings.reports.selectedCategory,
							settings.reports.selectedYear,
							settings.reports.selectedMonth,
							settings.reports.selectedReportType
						);

					if ( settings.reports.selectedReportType == 'table' ){
							settings.reports.chartData = null;
							settings.reports.tableData = preparedData;
						settings.changeReportType(settings.reports.selectedReportType)
						}
					else
						{
							settings.reports.chartData = preparedData;
							settings.reports.tableData = null;
							settings.changeReportType(settings.reports.selectedReportType)
						}



				},
				function(error){
					console.log(error)
				});


			}

			else

			{
				settings.showChartSelection = false;
			}

		}

		settings.reports.years = settings.getYears();

		settings.getReport();

		return settings;

	}])
	.controller('UserController',['$scope','$window','$state','$stateParams','$cookieStore','$location','userManager','questionManager','orderManager','paramManager','transactionManager','authService',function($scope,$window,$state,$stateParams,$cookieStore,$location,userManager,questionManager,orderManager,paramManager,transactionManager,authService)
	{

		var user = this;

		user.profileDetails = {};


		user.securityQuestions = [];
		questionManager.listQuestions().then(function(result){
			user.securityQuestions = result;
		}, function (error) {

		})


        user.registerUser = function(user){
			user.register.alertBody = {};
            userManager.addUser(user).then(function(result){
				if ( result.statusText=="OK" && result.data)
				{
					user.register = {};
					user.alertBody = {alert:'alert-success',isShown:true,message:"User registered successful"};
				}
				else{
					user.alertBody = {alert:'alert-danger',isShown:true,message:"User registration failed"};
				}

            },function(error){

            });
        }

		user.updateUser = function(user){

			userManager.updateUser(user,user.id).then(function(result){
				if ( result.statusText=="OK" && result.data)
				{

					//user.register.alertBody.alert='alert-success';
					//user.register.alertBody.isShown = true;
					//user.register.alertBody.message="Profile updated successful";

					$location.path('profile/'+user.id);
				}
				else{

					//user.register.alertBody.alert='alert-danger';
					//user.register.alertBody.isShown = true;
					//user.register.alertBody.message="Profile update failed";
				}
			},function(error){

			})
		}
		user.completeAirTime = function(transaction,authenicatedUser){


				transaction.user_id = authenicatedUser.id;
				transactionManager.addTransaction(transaction).then(function(response){

				},function(error){

				});

		}

		user.completeBills = function(transaction,authenicatedUser){

				transaction.user_id = authenicatedUser.id;
				transactionManager.addTransaction(transaction).then(function(response){

				},function(error){

				});


		}

		// this function get executed when user order without login in
		user.completeShopping = function(authenicatedUser){

			var transaction = eval('('+localStorage.getItem('raw_transaction')+')');

			if (transaction.type == 'airtime') {
				user.completeAirTime(transaction,authenicatedUser);
			}

			if (transaction.type == 'bill') {
				user.completeBills(transaction,authenicatedUser);
			}
		}

		user.authenicateUser = function(credentials){
			user.message = {isPositive:false,body:"",show:false};
			if ( typeof credentials != 'undefined' && checkIfCredentialsSupplied(credentials)) {

				authService.login(credentials).then(function(authenicatedUser){
					if ( authenicatedUser )
					{
						user.message.isPositive = true;
						user.message.body = "User logged in successfully";
						user.message.show = true;
						if (localStorage.getItem('unAuthorizedState')){
							user.completeShopping(authenicatedUser);
							setTimeout(function() {
								$scope.$parent.$parent.main.authenicatedUser = authenicatedUser;
								$state.go(localStorage.getItem('unAuthorizedState'));
							}, 3000);

						}else{
							user.completeShopping(authenicatedUser);
							setTimeout(function() {
								$scope.$parent.$parent.main.authenicatedUser = authenicatedUser;
								$state.go('home');
							}, 3000);

						}

					}else{
						user.message.isPositive = false;
						user.message.body = "Login failure";
						user.message.show = true;
					}

				},function(error){

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

			}
		}


		user.deleteAccount = function(profile){
			userManager.deleteUser(profile.id).then(function(result){
				authService.logout().then(function(response){
					localStorage.removeItem('authenicatedUser');
					localStorage.removeItem('pending_order');
					localStorage.removeItem('totalAmount');
					localStorage.removeItem('pendingTransaction');
					localStorage.removeItem('editTransaction');
					user.$parent.main.authenicatedUser = "";
					$state.go('home');
				})
			},function(error){

			})
		}

		if ($stateParams) {

			user.register = {};
			if ( $stateParams.user_id )
			{
				userManager.getUserById($stateParams.user_id).then(function(data){

					if ( data.statusText == "OK" )
					{
						user.profileDetails = data.data;
						user.register = user.profileDetails;
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
