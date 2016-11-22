"use strict";

DEBUG = false; // Turn off console logs

describe("cd-login-panel", function() {

    var $location, $rootScope, $compile, $q, $httpBackend, CONSTANTS, OAuthToken, AuthService;
    var $scope;
    var compiledElement;

    function mockAuthService() {}

    function mockAlertModalService() {}

    function mockAuthService() {}

    beforeEach(module('mainApp', function($provide) {
        $provide.service('AuthService', mockAuthService);
        $provide.service('AlertModalService', mockAlertModalService);
        $provide.service('AuthService', mockAuthService);
    }));

    beforeEach(module('templates'));

    beforeEach(inject(function(_$location_, _$rootScope_, _$compile_, _$q_, _$httpBackend_, _CONSTANTS_, _OAuthToken_) {
        $location = _$location_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $q = _$q_;
        $httpBackend = _$httpBackend_;
        CONSTANTS = _CONSTANTS_;
        OAuthToken = _OAuthToken_;
    }));

    beforeEach(function() {
        var element = angular.element('<cd-login-panel></cd-login-panel>');
        $scope = $rootScope.$new();
        compiledElement = $compile(element)($scope);

        mockAlertModalService.prototype.alert = function(title, text, type) {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
    });

    beforeEach(function() {

        // Mock object for Google's gapi
        window.gapi = {};
        gapi.load = function(str, call) {
            call();
        };
        gapi.auth2 = {};
        gapi.auth2.init = function() {};
    });

    beforeEach(function() {

        // Mock object for FB
        window.FB = {};
        FB.login = function(callback, scope) {
            callback({
                'authResponse': {
                    'accessToken': 'access-token-value'
                }
            });
        };

    });

    describe("login", function() {

        beforeEach(function() {

            // Set up the mock AuthService login function. Depending on different loginData different
            // success and error cases are produced, to cover all cases.
            mockAuthService.prototype.login = function(loginData) {
                var deferred = $q.defer();
                if (loginData.requestError == true) deferred.reject({
                    'status': '500'
                });

                if (loginData.username == 'username') {

                    if (loginData.password == 'password') deferred.resolve();
                    else deferred.reject({
                        'status': '401'
                    });

                } else deferred.reject({
                    'status': '-1'
                }); // mock no response from server
                return deferred.promise;
            }

        });

        it("should login using AuthService, clear form data and redirect user to /#/home", function() {

            $scope.$digest();
            expect($scope.loginData).toBeDefined();
            $scope.loginData = {
                'username': 'username',
                'password': 'password'
            };
            $scope.login();
            $scope.$digest();
            expect($location.path()).toBe('/home');
            expect($scope.loginData.username).toEqual("");
            expect($scope.loginData.password).toEqual("");
        });

        it("should display an error message if request is invalid and clear form data", function() {

            spyOn(mockAlertModalService.prototype, 'alert');

            $scope.$digest();
            expect($scope.loginData).toBeDefined();
            $scope.loginData = {
                'username': 'username',
                'password': 'wrongPassword'
            };
            $scope.login();
            $scope.$digest();
            expect($scope.loginData.username).toEqual("");
            expect($scope.loginData.password).toEqual("");
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
        });

        it("should display an error message if connection to server is down and clear form data", function() {

            spyOn(mockAlertModalService.prototype, 'alert');

            $scope.$digest();
            expect($scope.loginData).toBeDefined();
            $scope.loginData = {};
            $scope.login();
            $scope.$digest();
            expect($scope.loginData.username).toEqual("");
            expect($scope.loginData.password).toEqual("");
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
        });

        it("should display other errors if they occur and clear form data", function() {

            spyOn(mockAlertModalService.prototype, 'alert');

            $scope.$digest();
            expect($scope.loginData).toBeDefined();
            $scope.loginData = {
                'requestError': true
            };
            $scope.login();
            $scope.$digest();
            expect($scope.loginData.username).toEqual("");
            expect($scope.loginData.password).toEqual("");
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
        });

    });

    describe("Facebook Login", function() {

        it("should login user using facebook", function() {

            $httpBackend.expectPOST(CONSTANTS.BASE_URL + '/social-auth/convert-token').respond(200, {});
            spyOn(OAuthToken, 'setToken');
            mockAuthService.prototype.isAuthenticated = function() {
                return true;
            }

            $scope.$digest();
            $scope.facebookSignin();
            $httpBackend.flush();
            $scope.$digest();

            expect(OAuthToken.setToken).toHaveBeenCalled();
            expect($location.path()).toEqual('/home');
        });

        it("should show an error when a user with that email already exists", function() {

            $httpBackend.expectPOST(CONSTANTS.BASE_URL + '/social-auth/convert-token').respond(500, {});
            spyOn(OAuthToken, 'setToken');
            spyOn(mockAlertModalService.prototype, 'alert');

            $scope.$digest();
            $scope.facebookSignin();
            $httpBackend.flush();
            $scope.$digest();

            expect(OAuthToken.setToken).not.toHaveBeenCalled();
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
        });

        it("should show an error code when the login request fails for other reason", function() {

            $httpBackend.expectPOST(CONSTANTS.BASE_URL + '/social-auth/convert-token').respond(400, {});
            spyOn(OAuthToken, 'setToken');
            spyOn(mockAlertModalService.prototype, 'alert');

            $scope.$digest();
            $scope.facebookSignin();
            $httpBackend.flush();
            $scope.$digest();

            expect(OAuthToken.setToken).not.toHaveBeenCalled();
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
        });

    });

    describe("Google Login", function() {

        it("should login user using Google", function() {

            var server_resp = {
              'access_token': 'access-token',
              'expires_in': 600,
              'refresh_token': 'refresh-token',
              'token_type': 'Bearer',
              'scope': 'write read'
            };
            $httpBackend.expectPOST(CONSTANTS.BASE_URL + '/social-auth/google-auth-code/').respond(200, server_resp);

            $scope.$digest();

            spyOn(OAuthToken, 'setToken');
            spyOn($scope, 'convertToken').and.callThrough();

            // mock GoogleAuth object
            $scope.auth2 = {};
            $scope.auth2.grantOfflineAccess = function() {
                var deferred = $q.defer();
                deferred.resolve({'code': 'google-authorization-code'});
                return deferred.promise;
            };

            $scope.googleSignin();
            $httpBackend.flush();
            $scope.$digest();
            expect($location.path()).toEqual('/home');
            expect(OAuthToken.setToken).toHaveBeenCalled();
            expect($scope.convertToken).toHaveBeenCalled();
        });

        it("should show an error when a user with that email already exists", function() {

            $httpBackend.expectPOST(CONSTANTS.BASE_URL + '/social-auth/google-auth-code/').respond(400, {"message": "User with that email already exists!"});

            $scope.$digest();

            spyOn(mockAlertModalService.prototype, 'alert');
            spyOn($scope, 'convertToken').and.callThrough();
            spyOn(OAuthToken, 'setToken');

            // mock GoogleAuth object
            $scope.auth2 = {};
            $scope.auth2.grantOfflineAccess = function() {
                var deferred = $q.defer();
                deferred.resolve({'code': 'google-authorization-code'});
                return deferred.promise;
            };

            $scope.googleSignin();
            $httpBackend.flush();
            $scope.$digest();

            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
            expect($scope.convertToken).toHaveBeenCalled();
            expect(OAuthToken.setToken).not.toHaveBeenCalled();
        });

        it("should show an error code when the login request fails for other reason", function() {

            $httpBackend.expectPOST(CONSTANTS.BASE_URL + '/social-auth/google-auth-code/').respond(-1, {});

            $scope.$digest();

            spyOn(mockAlertModalService.prototype, 'alert');
            spyOn($scope, 'convertToken').and.callThrough();
            spyOn(OAuthToken, 'setToken');

            // mock GoogleAuth object
            $scope.auth2 = {};
            $scope.auth2.grantOfflineAccess = function() {
                var deferred = $q.defer();
                deferred.resolve({'code': 'google-authorization-code'});
                return deferred.promise;
            };

            $scope.googleSignin();
            $httpBackend.flush();
            $scope.$digest();

            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
            expect($scope.convertToken).toHaveBeenCalled();
            expect(OAuthToken.setToken).not.toHaveBeenCalled();
        });

    });

});
