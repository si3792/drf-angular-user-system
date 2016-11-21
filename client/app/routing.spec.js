"use strict";

DEBUG = false; // Turn off console logs

describe("Routing", function() {

    var CONSTANTS, $location, $rootScope;

    function mockAuthService() {}

    beforeEach(module('mainApp', function($provide) {
        $provide.service('AuthService', mockAuthService);
    }));

    beforeEach(inject(function(_CONSTANTS_, _$location_, _$rootScope_) {
        CONSTANTS = _CONSTANTS_;
        $location = _$location_;
        $rootScope = _$rootScope_;
    }));

    it('should redirect to /#/login when accessing /#/home and Unauthenticated', function() {

        mockAuthService.prototype.isAuthenticated = function() {
            return false;
        };

        $location.path('/home');
        $rootScope.$digest();
        expect($location.path()).toBe('/login');
    });

    it('should redirect to /#/home when accessing /#/login and Authenticated', function() {

        mockAuthService.prototype.isAuthenticated = function() {
            return true;
        };

        $location.path('/login');
        $rootScope.$digest();
        expect($location.path()).toBe('/home');
    });

});
