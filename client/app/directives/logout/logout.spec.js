"use strict";

DEBUG = false; // Turn off console logs

describe("cd-logout", function() {

    var $location, $rootScope, $compile, $q;
    var scope;

    function mockAuthService() {}

    function mockAlertModalService() {}

    beforeEach(module('mainApp', function($provide) {
        $provide.service('AuthService', mockAuthService);
        $provide.service('AlertModalService', mockAlertModalService);
    }));

    beforeEach(inject(function(_$location_, _$rootScope_, _$compile_, _$q_) {
        $location = _$location_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $q = _$q_;
    }));

    it("should logout the user when clicked", function() {

        mockAuthService.prototype.logout = function() {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
        spyOn(mockAuthService.prototype, "logout").and.callThrough();

        var element = angular.element('<cd-logout> Click me to logout </cd-logout>');
        scope = $rootScope.$new();
        var compiledElement = $compile(element)(scope);

        expect($location.path()).toEqual('');
        compiledElement.triggerHandler('click');
        scope.$digest();
        expect($location.path()).toEqual('/login');
        expect(mockAuthService.prototype.logout).toHaveBeenCalled();
    });

    it("should display warning when forceLogout was required to logout", function() {

        mockAuthService.prototype.logout = function() {
            var deferred = $q.defer();
            deferred.reject();
            return deferred.promise;
        }
        spyOn(mockAuthService.prototype, "logout").and.callThrough();

        mockAlertModalService.prototype.alert = function() {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
        spyOn(mockAlertModalService.prototype, "alert").and.callThrough();

        var element = angular.element('<cd-logout> Click me to logout </cd-logout>');
        scope = $rootScope.$new();
        var compiledElement = $compile(element)(scope);

        expect($location.path()).toEqual('');
        compiledElement.triggerHandler('click');
        scope.$digest();
        expect($location.path()).toEqual('/login');
        expect(mockAuthService.prototype.logout).toHaveBeenCalled();
        expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
    });

});
