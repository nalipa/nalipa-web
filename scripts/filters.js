'use strict';

/* Filters */

var nalipaFilters = angular.module('nalipaFilters', [])
    .filter('replaceSemiColonWithComma',function() {
        return function(textToReplace) {
            var replacedText = textToReplace.replace(/\;/g,', ');
            return replacedText;
        }
    })
    .filter('toFixed',function(){
        return function(textToApproximate,precision){
            var approximatedFilter = textToApproximate.toFixed(precision);
            return approximatedFilter;
        }
    })
    .filter('filterPendingTransactions', function ($filter) {
		return function (input) {
            var pendingTransactions = [];
            if ( input && input.length > 0 ){
                angular.forEach(input,function(value){

                    if ( value.status == "PENDING TRANSACTION" )
                    {
                        pendingTransactions.push(value);
                    }

                })
            }
            localStorage.setItem('pendingTransaction',JSON.stringify(pendingTransactions));
			return pendingTransactions;
		};
	})
    .filter('filterTops', function ($filter) {
		return function (input) {
            var tops = [];
            if ( input && input.length > 0 ){
                angular.forEach(input,function(value){
                    if (value.utility_code.utility_code == "TOP") {
                        tops.push(value);
                    }
                })
            }

			return tops;
		};
	})
    .filter('filterBills', function ($filter) {
		return function (input) {
            var tops = [];
            if ( input && input.length > 0 ){
                angular.forEach(input,function(value){
                    if (value.utility_code.utility_code != "TOP") {
                        tops.push(value);
                    }
                })
            }

			return tops;
		};
	})
    .filter('countObjects', function ($filter) {
		return function (input) {

                return input===undefined ? 0 : input.length;

		};
	})
    .filter('filterTransactions', function ($filter) {
		return function (input,pattern) {

            var filteredTransaction = [];

            angular.forEach(input,function(value,index){

                if ( value.status.indexOf(pattern.toUpperCase()) >= 0 )
                {

                    filteredTransaction.push(value);
                }

            });

                return filteredTransaction;
		};
	})
    .filter('setDecimal', function ($filter) {
		return function (input, places) {
			if (isNaN(input)) return input;
			// If we want 1 decimal place, we want to mult/div by 10
			// If we want 2 decimal places, we want to mult/div by 100, etc
			// So use the following to create that factor
			var factor = "1" + Array(+(places > 0 && places + 1)).join("0");
			return Math.round(input * factor) / factor;
		};
	});
