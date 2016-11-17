/*********************************************************
 *    A template directive for displaying a login panel. *
 *********************************************************/

"use strict";

app.directive('cdLoginPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/loginPanel.html',
        controller: ['$scope', '$location', '$http', '$timeout', 'OAuthToken', 'AuthService', 'AlertModalService', 'CONSTANTS',
            function($scope, $location, $http, $timeout, OAuthToken, AuthService, AlertModalService, CONSTANTS) {

                $scope.loginData = {
                    username: "",
                    password: "",
                };

                /**
                 *    Performs a login, using AuthService
                 */
                $scope.login = function() {
                    AuthService.login($scope.loginData).then(function(response) {
                        // Success
                        $location.path('/main');
                    }, function(response) {
                        // Error
                        if (response.status == 401)
                            AlertModalService.alert('Error', 'Incorrect username or password.', 'danger');
                        else if (response.status == -1)
                            AlertModalService.alert('Error', 'No response from server.', 'danger');
                        else AlertModalService.alert('Error',
                            'There was a problem logging you in. Error code: ' +
                            response.status + '.', 'danger');
                    });

                    // Clear loginData
                    $scope.loginData.username = "";
                    $scope.loginData.password = "";
                }

            }
        ]
    }
});
