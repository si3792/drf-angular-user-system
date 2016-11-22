/*********************************************************
 *    A template directive for displaying a login panel. *
 *********************************************************/

"use strict";

app.directive('cdLoginPanel', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/directives/login-panel/login-panel.html',
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
                        $location.path('/home');
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


                $scope.auth2 = {}; // GoogleAuth object

                /**
                 *    Initialize the GoogleAuth object
                 */
                $scope.initgoogle = function() {

                    gapi.load('auth2', function() {
                        $scope.auth2 = gapi.auth2.init({
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
                        DEBUG && console.log(response.data);
                        OAuthToken.setToken(response.data);
                        $timeout($location.path('/home'), 500);
                    }, function(response) {
                        // Error
                        if (response.data.message == 'User with that email already exists!') {
                            AlertModalService.alert('Error!', [
                                'User with that email already exists!',
                                'Maybe you have signed in through a different method.'
                            ], 'danger');
                        } else AlertModalService.alert('Error!', [
                            'We could not sign you in',
                            'Error code: ' + response.status
                        ], 'danger');
                    });
                }

                /**
                 *    Initiates a google sign-in
                 */
                $scope.googleSignin = function() {
                    $scope.auth2.grantOfflineAccess({
                        'redirect_uri': 'postmessage'
                    }).then(function(resp) {
                        DEBUG && console.log(JSON.stringify(resp));
                        $scope.convertToken(resp['code']);
                    });
                }

                /**
                 *    Initialize the FB object
                 */
                window.fbAsyncInit = function() {
                    FB.init({
                        appId: CONSTANTS.FACEBOOK_CLIENT_ID,
                        cookie: true, // enable cookies to allow the server to access
                        // the session
                        version: 'v2.8' // use graph api version 2.8
                    });
                };

                // Load the Facebook SDK asynchronously
                (function(d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) return;
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "//connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));

                /**
                 *    This function exchanges Facebook's access token for an access and refresh tokens
                 *    linked to our OAuth2 provider, saves them, then redirects to /#/home, thus completing the signin
                 *
                 *    @param  {Object} response Facebook's response object
                 */
                $scope.completeFacebookLogin = function(response) {

                    $http.post(CONSTANTS.BASE_URL + '/social-auth/convert-token', {
                        grant_type: 'convert_token',
                        client_id: CONSTANTS.LOCAL_OAUTH2_KEY,
                        backend: 'facebook',
                        token: response.authResponse.accessToken
                    }).then(function(response) {
                        DEBUG && console.log(response);
                        // Store access and refresh tokens
                        OAuthToken.setToken(response.data);
                        $timeout($location.path('/home'), 500);
                    }, function(response) {
                        // Error
                        if (response.status == 500) {
                            AlertModalService.alert('Error!', [
                                'User with that email already exists!',
                                'Maybe you have signed in through a different method.'
                            ], 'danger');
                        } else {
                            AlertModalService.alert('Error!', [
                                'We could not sign you in',
                                'Error code: ' + response.status
                            ], 'danger');
                        }
                    });
                }

                /**
                 *    Initiates a facebook sign-in
                 */
                $scope.facebookSignin = function() {
                    FB.login(function(response) {
                        $scope.completeFacebookLogin(response);
                    }, {
                        scope: 'public_profile,email'
                    });
                }

            }
        ]
    }
});
