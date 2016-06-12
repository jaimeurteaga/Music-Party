var app = angular.module('musicParty', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',

function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainController'
    })

    .state('posts', {
      url :'/posts/{id}', 
      templateUrl: '/posts.html', 
      controller: 'PostsCtrl'
    });

  $urlRouterProvider.otherwise('home');

}]);

app.factory('posts', [function() {
  var o =  {
    posts:[]
  }

  return o;

}]);

app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};

  return auth;
}]);

app.controller('MainController', [
'$scope', 'posts', 

function($scope, posts) {
  $scope.test = 'Hello world!';

  $scope.posts = posts.posts;

  $scope.addPost = function() {
  	if ($scope.title == '') {
  		return;
  	}

  	$scope.posts.push({
      title : $scope.title, 
      upvotes : 0, 
      link : $scope.link, 
      comments : [{author : 'Joe', body : 'Cool Post'}]
      });
  	
    $scope.title = '';
    $scope.link = '';
  }

  $scope.incrementUpvotes = function(post) {
  	post.upvotes += 1;
  }

}]);

app.controller('PostsCtrl', [
  '$scope', 
  '$stateParams',
  'posts',

  function($scope, $stateParams, posts) {
    $scope.post = posts.posts[$stateParams.id];

    $scope.addComment = function(){
    
    if ($scope.body === '') { 
      return; 
    }
    
    $scope.post.comments.push({
        body: $scope.body,
        author: 'user',
        upvotes: 0
      });
  
    $scope.body = '';
  };
  
  }]);
