"use strict";

DEBUG = false; // Turn off console logs

describe("cd-location-changer", function() {

    var $location, $rootScope, $compile;
    var scope;

    function mockAuthService() {}

    beforeEach(module('mainApp', function($provide) {

        $provide.service('AuthService', mockAuthService);
    }));

    beforeEach(inject(function(_$location_, _$rootScope_, _$compile_) {
        $location = _$location_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    it("should change location when clicked", function() {

        mockAuthService.prototype.isAuthenticated = function() {
            return true;
        };

        var element = angular.element('<a cd-location-changer="/home"> Click </a>');
        scope = $rootScope.$new();
        var compiledElement = $compile(element)(scope);

        expect($location.path()).toEqual('');
        compiledElement.triggerHandler('click');
        scope.$digest();
        expect($location.path()).toEqual('/home');
    });

});
