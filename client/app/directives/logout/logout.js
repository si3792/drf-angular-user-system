/**************************************************************
 *    A directive which performs a logout, using AuthService. *
 *                                                            *
 *    Example usage:                                          *
 *    <cd-logout> Click me to logout </cd-logout>             *
 **************************************************************/

"use strict";

app.directive('cdLogout', ['$location', 'AuthService', 'AlertModalService', function($location, AuthService, AlertModalService) {
    return {
        restrict: 'AE',
        transclude: true,
        replace: false,
        template: '<a ng-transclude></a>',
        link: function(scope, elem, attr) {
            elem.bind("click", function() {
                AuthService.logout().then(function(response) {
                    // Success
                    $location.path('/login');
                }, function(response) {
                    // Error
                    /* This can occur if connection to server is lost or server is down */
                    AlertModalService.alert('Warning', 'A problem occured while logging you out.', 'warning').then(function(response){
                      $location.path('/login');
                    });
                });
            });
        }
    }
}]);
