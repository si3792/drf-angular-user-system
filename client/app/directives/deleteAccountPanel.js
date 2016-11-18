/********************************************************
 *    Template directive for account deletion           *
 ********************************************************/

"use strict";

app.directive('cdDeleteAccountPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/deleteAccountPanel.html',
        controller: ['$scope', '$location', 'AccountService', 'AuthService', 'AlertModalService', function($scope, $location, AccountService, AuthService, AlertModalService) {

            $scope.deleteAccount = function() {
                AccountService.account.delete({}, function(response) {
                    AuthService.forceLogout();
                    AlertModalService.alert("Account deleted!", "", "success").then(
                        function(response) {
                            $location.path('/login')
                        }
                    )
                });
            }

        }]
    }
});
