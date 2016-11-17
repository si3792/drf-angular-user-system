/********************************************************************************************************************
 *    A template directive, displaying a panel for modifying the current user's data (email, first and last names). *
 *    @TODO values must be read-only when a social account is used.                                                 *
 ********************************************************************************************************************/

"use strict";

app.directive('cdAccountPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/accountPanel.html',
        controller: ['$scope', '$location', 'AccountService', 'AlertModalService', function($scope, $location, AccountService, AlertModalService) {

            $scope.accountData = AccountService.account.get();
            $scope.newAccountData = {};

            $scope.updateProfile = function() {
                AccountService.account.save({}, $scope.newAccountData, function(response) {
                    $scope.newAccountData = {};
                    $scope.accountData = AccountService.account.get();
                    AlertModalService.alert('Success', 'Your profile was updated.', 'success');

                }, function(response) {
                    // ERROR
                    var warningtext = [];
                    for (var key in response.data) {
                        var line = key.toUpperCase();
                        line += ': '
                        line += response.data[key];
                        warningtext.push(line);
                    }
                    AlertModalService.alert('Oops!', warningtext, 'warning');
                    $scope.newAccountData = {};
                    DEBUG && console.error(JSON.stringify(response));
                });

            }

        }]
    }
});
