"use strict";

DEBUG = false; // Turn off console logs

describe("cd-password-panel", function() {

    var $rootScope, $compile, $q;
    var $scope;
    var compiledElement;

    function mockAccountService() {}

    function mockAlertModalService() {}

    beforeEach(module('mainApp', function($provide) {
        $provide.service('AccountService', mockAccountService);
        $provide.service('AlertModalService', mockAlertModalService);
    }));

    beforeEach(module('templates'));

    beforeEach(inject(function(_$location_, _$rootScope_, _$compile_, _$q_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $q = _$q_;
    }));

    beforeEach(function() {
        var element = angular.element('<cd-password-panel></cd-password-panel>');
        $scope = $rootScope.$new();
        compiledElement = $compile(element)($scope);
    });

    describe("passwordStatus", function() {

        it("should be set to correct value depending on AccountService", function() {

            mockAccountService.prototype.password = {};
            mockAccountService.prototype.password.get = function(opt, opt2, callbackSuccess, callbackError) {
                callbackSuccess();
            };

            $scope.$digest();
            expect($scope.passwordStatus).toEqual('exists');
        });

        it("should be set to correct value depending on AccountService (2)", function() {

            mockAccountService.prototype.password = {};
            mockAccountService.prototype.password.get = function(opt, opt2, callbackSuccess, callbackError) {
                callbackError({
                    status: '404'
                });
            };

            $scope.$digest();
            expect($scope.passwordStatus).toEqual('missing');
        });

        it("should be set to correct value depending on AccountService (3)", function() {

            mockAccountService.prototype.password = {};
            mockAccountService.prototype.password.get = function(opt, opt2, callbackSuccess, callbackError) {
                callbackError({
                    status: '-1'
                });
            };

            $scope.$digest();
            expect($scope.passwordStatus).toEqual('unknown');
        });

    });

    describe("changePassword", function() {

        beforeEach(function() {
            mockAccountService.prototype.password = {};
            mockAccountService.prototype.password.get = function(opt, opt2, callbackSuccess, callbackError) {
                callbackSuccess();
            };
            mockAccountService.prototype.password.save = function(opt, passwordChangeData, callbackSuccess, callbackError) {

                if (passwordChangeData.oldPassword == 'oldPassword' && passwordChangeData.newPassword == 'newPassword')
                    callbackSuccess();
                else callbackError();

            };
            mockAlertModalService.prototype.alert = function(title, text, type) {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
        });

        it("should successfully update password and clear form data", function() {

            spyOn(mockAccountService.prototype.password, 'save').and.callThrough();
            $scope.$digest();
            $scope.passwordChangeData = {
                oldPassword: 'oldPassword',
                newPassword: 'newPassword'
            };

            $scope.changePassword();
            expect(mockAccountService.prototype.password.save).toHaveBeenCalled();
            expect($scope.passwordStatus).toEqual('exists');
            expect($scope.passwordChangeData).toEqual({});
        });

        it("should clear form data and display error if request fails", function() {

            spyOn(mockAccountService.prototype.password, 'save').and.callThrough();
            spyOn(mockAlertModalService.prototype, 'alert').and.callThrough();
            $scope.$digest();
            $scope.passwordChangeData = {
                oldPassword: 'oldPassword'
            };

            $scope.changePassword();
            expect(mockAccountService.prototype.password.save).toHaveBeenCalled();
            expect($scope.passwordChangeData).toEqual({});
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
        });

    });

});
