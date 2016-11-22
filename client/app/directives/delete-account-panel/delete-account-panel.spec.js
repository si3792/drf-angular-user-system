"use strict";

DEBUG = false; // Turn off console logs

describe("cd-delete-account-panel", function() {

    var $location, $rootScope, $compile, $q;
    var $scope;
    var compiledElement;

    function mockAuthService() {}

    function mockAccountService() {}

    function mockAlertModalService() {}

    beforeEach(module('mainApp', function($provide) {
        $provide.service('AuthService', mockAuthService);
        $provide.service('AccountService', mockAccountService);
        $provide.service('AlertModalService', mockAlertModalService);
    }));

    beforeEach(module('templates'));

    beforeEach(inject(function(_$location_, _$rootScope_, _$compile_, _$q_) {
        $location = _$location_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $q = _$q_;
    }));

    beforeEach(function() {
        var element = angular.element('<cd-delete-account-panel></cd-delete-account-panel>');
        $scope = $rootScope.$new();
        compiledElement = $compile(element)($scope);
    });

    describe("deleteAccount", function() {

        it("should successfully delete account", function() {

            mockAccountService.prototype.account = {};
            mockAccountService.prototype.account.delete = function(opt, callback) {
                callback();
            }

            mockAuthService.prototype.forceLogout = function() {}
            mockAlertModalService.prototype.alert = function(title, text, type) {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }

            spyOn(mockAccountService.prototype.account, 'delete').and.callThrough();
            spyOn(mockAuthService.prototype, 'forceLogout').and.callThrough();

            $scope.$digest();
            $scope.deleteAccount();
            $scope.$digest();
            expect($location.path()).toEqual('/login');
            expect(mockAccountService.prototype.account.delete).toHaveBeenCalled();
            expect(mockAuthService.prototype.forceLogout).toHaveBeenCalled();
        });

    });

});
