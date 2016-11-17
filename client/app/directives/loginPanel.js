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


                var auth2; // GoogleAuth object

                /**
                 *    Initialize the GoogleAuth object
                 */
                $scope.initgoogle = function() {

                    gapi.load('auth2', function() {
                        auth2 = gapi.auth2.init({
                            client_id: CONSTANTS.GOOGLE_CLIENT_ID,
                            access_type: 'offline',
                            approval_prompt: 'force' // may not be needed: Always store user refresh tokens. If your application needs a new refresh token it must send a request with the approval_prompt query parameter set to force. This will cause the user to see a dialog to grant permission to your application again.
                        });
                    });
                }
                $scope.initgoogle();

                /**
                 *    Sends Google's authorization code to our server, and stores the
                 *    access and refresh tokens returned by it, completing the login.
                 *    Afterwards, user is routed to /#/home/
                 *
                 *    @param  {String} code Google's authorization code
                 */
                $scope.convertToken = function(code) {

                    var request = {
                        code: code
                    };

                    $http.post(CONSTANTS.BASE_URL + '/social-auth/google-auth-code/', request).then(function(response) {
                        DEBUG && console.log(JSON.parse(response.data));
                        OAuthToken.setToken(JSON.parse(response.data));
                        $timeout($location.path('/home'), 500);
                    },function(response){
                      // Error
                      if(response.data = 'User with that email already exists!') {
                        AlertModalService.alert('Error!', [
                          'User with that email already exists!',
                          'Maybe you have signed in through a different method.'
                        ], 'danger');
                      }
                    });
                }

                /**
                 *    Initiates a google sign-in
                 */
                $scope.googleSignin = function() {
                    auth2.grantOfflineAccess({
                        'redirect_uri': 'postmessage'
                    }).then(function(resp) {
                        DEBUG && console.log(JSON.stringify(resp));
                        $scope.convertToken(resp['code']);
                    });
                }


            }
        ]
    }
});
