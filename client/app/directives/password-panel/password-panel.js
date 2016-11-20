/********************************************************
 *    Template directive for password set/change panel. *
 ********************************************************/

"use strict";

app.directive('cdPasswordPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/directives/password-panel/password-panel.html',
        controller: ['$scope', 'AccountService', 'AlertModalService', 'CONSTANTS', function($scope, AccountService, AlertModalService, CONSTANTS) {

            $scope.passwordChangeData = {};
            $scope.CONSTANTS = CONSTANTS;

            /*
              Depending on whether the user has a password or not, we have to show
              either a password change or set panel. passwordStatus is a flag for that.
              Possible values:
                'unknown' - waiting for server response, hide both panels
                'exists' - show change password panel
                'missing' - show set password panel
             */
            $scope.passwordStatus = "unknown";

            AccountService.password.get({}, {}, function(response) {
                $scope.passwordStatus = "exists";
            }, function(response) {
                if (response.status == 404)
                    $scope.passwordStatus = "missing";
            });

            $scope.changePassword = function() {
                AccountService.password.save({}, $scope.passwordChangeData, function(response) {
                    $scope.passwordChangeData = {};
                    AlertModalService.alert("Success!", "Your new password has been set!", "success");
                    $scope.passwordStatus = "exists";
                }, function(response) {
                    $scope.passwordChangeData = {};
                    AlertModalService.alert("Error!", ["Password wasn't updated.",
                            "Make sure you have entered your password correctly."
                        ],
                        "danger");
                    DEBUG && console.log(response);
                });
            }

        }]
    }
});
