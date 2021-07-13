var app = angular.module('rescueMark', []);
app.controller('mainCtrl', function($scope) {
  $scope.locations = ["Please select a location","General View","Palace Hills", "Northwest", "Old Town", "Safe Town","Southwest", "Downtown","Wilson Forest","Broadview","Chapparal","Terrapin Springs","Pepper Mill"
  ,"Cheddarford","Easton", "Weston","Southton","Oak Willow","East Parton","West Parton",'Scenic Vista'];

  $scope.callDate = function(data)
  {
    console.log(data);
  }
});
