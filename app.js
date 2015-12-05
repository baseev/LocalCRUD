//Invoke 'strict' JavaScript mode
'use strict';

//Module
angular.module('index', []);
var config = {localStorageKey : 'myapp'};

//dataStore service, in-memory storage
angular.module('index').factory('dataStore', ['persistenceService', function(persistenceService) {
   var employees = JSON.parse(persistenceService.get()) || [];
   var get = function(index) {
     return employees[index];
   }
   var save = function(employee) {
     employees.push(employee);
     return employees;
   }
   var update = function(index, employee) {
     employees[index] = employee;
     return employees;
   }
   var remove = function(index) {
     if(index > -1) {
       employees.splice(index, 1);
     }
     return employees;
   }
   var addAll = function() {
     return employees;
   }
  //publically exposed methods
  return {
	get : get,
	save : save,
	update : update,
	remove: remove,
	getAll : addAll,
  }
}]);

//Persistence Storage, Try to persist on localStorage if exists
angular.module('index').factory('persistenceService', ['$window', function($window) {
  var getLocalStorageKey = function() {
	return config.localStorageKey;
  }
  var hasLocalStorage = function() {
  	return !!$window.localStorage.getItem;
  }
  var save = function(json) {
        if(!getLocalStorageKey()) {
		throw "localStorage is not supported";
        }
  	$window.localStorage.setItem(getLocalStorageKey(), json);
  }
  var get = function() {
	return $window.localStorage.getItem(getLocalStorageKey()) || '[]';
  }
  //publically exposed methods
  return {
	get : get,
	save : save,
	hasLocalStorage:hasLocalStorage
  }
}]);


//Controller
angular.module('index').controller('indexCtrl', ['$scope', '$routeParams', '$location', '$window', 'dataStore', 'persistenceService', 
                                                 function($scope, $routeParams, $location, $window, dataStore, persistenceService, window) {	
	$scope.init = function() {
		$scope.employees = dataStore.getAll()
		console.log("init... "+JSON.stringify($scope.employees));
	},
	$scope.add = function(isValid) {
		if(!isValid) return;
		var data = dataStore.save($scope.employee);
		console.log("add... "+JSON.stringify(data));	
		$scope.employee = null;
	},
	$scope.edit = function() {
		$scope.employee = dataStore.get($routeParams.employeeId);
		console.log($routeParams.employeeId+" edit... "+JSON.stringify($scope.employee));
	},
	$scope.update = function(isValid) {
		if(!isValid) return;
		var data = dataStore.update($routeParams.employeeId, $scope.employee);
		console.log("update... "+JSON.stringify(data));
		$location.path('/employee');
	},
	$scope.remove = function(index) {
		var data = dataStore.remove(index);
		console.log("delete... "+JSON.stringify(data));
	},
	$scope.onExit = function() {
		try {
      			persistenceService.save(JSON.stringify(dataStore.getAll()));
		}catch(ex) {
			console.log(ex);
		}
    	},
	//Try to persist the data on browser window close/exit 
	$window.onbeforeunload = function(){
  		$scope.onExit();  
	}; 	
}]);

//Routes
angular.module('index').config(['$routeProvider', function($routeProvider) {
		$routeProvider.
		when('/employee', {
			templateUrl: 'static/views/employee.index.html',
			controller: 'indexCtrl'
		}).
		when('/employee/add', {
			templateUrl: 'static/views/employee.add.html',
			controller: 'indexCtrl'
		}).
		when('/employee/edit/:employeeId', {
			templateUrl: 'static/views/employee.edit.html',
			controller: 'indexCtrl'
		})
	}

]);


// Set the main application name
var mainApplicationModuleName = 'myApp';

// Create the main application
var mainApplicationModule = angular.module(mainApplicationModuleName, ['ngResource', 'ngRoute', 'index']);

// Configure the hashbang URLs using the $locationProvider services 
mainApplicationModule.config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

// Fix Facebook's OAuth bug
if (window.location.hash === '#_=_') window.location.hash = '#!';

// Manually bootstrap the AngularJS application
angular.element(document).ready(function() {
	angular.bootstrap(document, [mainApplicationModuleName]);
});
