/******************************************************
 *    Template directive for user registration panel. *
 ******************************************************/

"use strict";

app.directive('cdRegistrationPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/directives/registration-panel/registration-panel.html',
        controller: ['$scope', '$location', 'RegisterService', 'AlertModalService', 'CONSTANTS',
            function($scope, $location, RegisterService, AlertModalService, CONSTANTS) {

                $scope.CONSTANTS = CONSTANTS;
                $scope.registerData = {};
                $scope.registerUser = function() {
                    RegisterService.register.save({}, $scope.registerData, function(response) {
                        AlertModalService.alert("Welcome!", "Your new account has been successfuly created.", "success").then(
                            function() {
                                $location.path('/login');
                            }
                        );

                    }, function(response) {
                        DEBUG && console.log(JSON.stringify(response));
                        var errortext = [];
                        for (var key in response.data) {
                            var line = key.toUpperCase();
                            line += ': '
                            line += response.data[key];
                            errortext.push(line);
                        }
                        AlertModalService.alert("Registration error!", errortext, "danger");
                    });
                }
            }

        ]
    }
});
