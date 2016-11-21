"use strict";

DEBUG = false; // Turn off console logs

describe('AuthService', function() {

    var AuthService, $httpBackend, CONSTANTS, $cookies, $q, $rootScope, $timeout;

    function mockOAuth() {}

    beforeEach(module('mainApp', function($provide) {
        $provide.service('OAuth', mockOAuth);
    }));

    beforeEach(inject(function(_AuthService_, _$httpBackend_, _CONSTANTS_, _$cookies_, _$q_, _$rootScope_, _$timeout_) {
        AuthService = _AuthService_;
        $httpBackend = _$httpBackend_;
        CONSTANTS = _CONSTANTS_;
        $cookies = _$cookies_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
    }));

    it("should initialize autoRefreshTokenInterval to correct value", function() {
        expect(AuthService.autoRefreshTokenInterval).toBeDefined();
        expect(AuthService.autoRefreshTokenInterval).toEqual(CONSTANTS.AUTO_REFRESH_TOKEN_INTERVAL_SECONDS * 1000);
    });

    describe('isAuthenticated', function() {

        it('should return auth. status based on OAuth', function() {

            mockOAuth.prototype.isAuthenticated = function() {
                return true;
            };

            var authFlag = AuthService.isAuthenticated();
            expect(authFlag).toEqual(true);
        });

        it('should return auth. status based on OAuth (2)', function() {

            mockOAuth.prototype.isAuthenticated = function() {
                return false;
            };

            var authFlag = AuthService.isAuthenticated();
            expect(authFlag).toEqual(false);
        });

    });

    describe('forceLogout', function() {

        it('should remove the cookie containing auth. data', function() {
            $cookies.put(CONSTANTS.COOKIE_NAME, 'test');
            AuthService.forceLogout();
            expect($cookies.get(CONSTANTS.COOKIE_NAME)).not.toBeDefined();
        });

    });

    describe("login", function() {

        beforeEach(function() {

            mockOAuth.prototype.getAccessToken = function(user, config) {
                var deferred = $q.defer();

                if (user.username == 'username' && user.password == 'password') deferred.resolve();
                else deferred.reject();

                return deferred.promise;
            };

        });

        it("should login the user using OAuth", function() {
            var flag;
            AuthService.login({
                username: 'username',
                password: 'password'
            }, {}).then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });

            $rootScope.$digest();
            expect(flag).toBe('success');
        });

        it("should not login user with incorrect credentials", function() {
            var flag;
            AuthService.login({
                username: 'NOTusername',
                password: 'NOTpassword'
            }, {}).then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });

            $rootScope.$digest();
            expect(flag).toBe('error');
        });

        it("should not login user with missing credentials", function() {
            var flag;
            AuthService.login({}, {}).then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });

            $rootScope.$digest();
            expect(flag).toBe('error');
        });

    });

    describe("logout", function() {

        it("should successfully logout the user", function() {

            mockOAuth.prototype.revokeToken = function() {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            };

            var flag;
            AuthService.logout().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toBe('success');
        });

        it("should forcefully logout the user when OAuth.revokeToken fails", function() {

            mockOAuth.prototype.revokeToken = function() {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            };

            spyOn(AuthService, "forceLogout");

            var flag;
            AuthService.logout().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toBe('error');
            expect(AuthService.forceLogout).toHaveBeenCalled();
        });

    });

    describe("refreshToken", function() {

        it("should not call getRefreshToken if not authenticated", function() {

            mockOAuth.prototype.isAuthenticated = function() {
                return false;
            };

            mockOAuth.prototype.getRefreshToken = function() {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            };

            spyOn(mockOAuth.prototype, "getRefreshToken").and.callThrough();

            var flag;
            AuthService.refreshToken().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toEqual('error');
            expect(mockOAuth.prototype.getRefreshToken).not.toHaveBeenCalled();
        });

        it("should successfully refresh tokens", function() {
            mockOAuth.prototype.isAuthenticated = function() {
                return true;
            };

            mockOAuth.prototype.getRefreshToken = function() {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            };

            spyOn(mockOAuth.prototype, "getRefreshToken").and.callThrough();

            var flag;
            AuthService.refreshToken().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toEqual('success');
            expect(mockOAuth.prototype.getRefreshToken).toHaveBeenCalled();
        });

        it("should fail when OAuth.getRefreshToken fails", function() {
            mockOAuth.prototype.isAuthenticated = function() {
                return true;
            };

            mockOAuth.prototype.getRefreshToken = function() {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            };

            spyOn(mockOAuth.prototype, "getRefreshToken").and.callThrough();

            var flag;
            AuthService.refreshToken().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toEqual('error');
            expect(mockOAuth.prototype.getRefreshToken).toHaveBeenCalled();
        });

    });

    describe("autoRefreshToken", function() {

        it("shouldn't refresh the access token when not needed", function() {

            AuthService.refreshNeeded = false;
            spyOn(AuthService, 'refreshToken');

            var flag;
            AuthService.autoRefreshToken().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toEqual('success');
            expect(AuthService.refreshToken).not.toHaveBeenCalled();
        });

        it("should refresh the access token when needed", function() {

            AuthService.refreshNeeded = true;

            AuthService.refreshToken = function() {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
            spyOn(AuthService, 'refreshToken').and.callThrough();

            var flag;
            AuthService.autoRefreshToken().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toEqual('success');
            expect(AuthService.refreshToken).toHaveBeenCalled();
            expect(AuthService.refreshNeeded).toEqual(false);
        });

        it("should fail when .refreshToken fails", function() {

            AuthService.refreshNeeded = true;

            AuthService.refreshToken = function() {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            }
            spyOn(AuthService, 'refreshToken').and.callThrough();

            var flag;
            AuthService.autoRefreshToken().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });
            $rootScope.$digest();
            expect(flag).toEqual('error');
            expect(AuthService.refreshToken).toHaveBeenCalled();
            expect(AuthService.refreshNeeded).toEqual(true);
        });

        it("should recursively call itself", function() {
            AuthService.refreshNeeded = true;

            AuthService.refreshToken = function() {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }

            var flag;
            AuthService.autoRefreshToken().then(function() {
                flag = 'success';
            }, function() {
                flag = 'error';
            });

            spyOn(AuthService, 'autoRefreshToken').and.callThrough();
            $rootScope.$digest();
            expect(flag).toEqual('success');
            $timeout.flush(AuthService.autoRefreshTokenInterval)
            expect(AuthService.autoRefreshToken).toHaveBeenCalled();

        });

    });

});
