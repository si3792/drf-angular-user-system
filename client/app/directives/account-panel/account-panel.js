/********************************************************************************************************************
 *    A template directive, displaying a panel for modifying the current user's data (email, first and last names). *
 *    If a social account is connected, those fields are read-only, as they are generated.                          *
 ********************************************************************************************************************/

"use strict";

app.directive('cdAccountPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/directives/account-panel/account-panel.html',
        controller: ['$scope', '$location', 'AccountService', 'AlertModalService', function($scope, $location, AccountService, AlertModalService) {

            $scope.accountData = AccountService.account.get();
            $scope.newAccountData = {};

            $scope.readOnlyAccount = true;
            AccountService.social.get({}, function(response){
              $scope.readOnlyAccount = true;
              DEBUG && console.log(response);
            }, function(response){
              $scope.readOnlyAccount = false;
              DEBUG && console.log(response);
            });

            $scope.updateAccount = function() {
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
