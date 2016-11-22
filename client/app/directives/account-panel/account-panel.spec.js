"use strict";

DEBUG = false; // Turn off console logs

describe("cd-account-panel", function() {

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
        var element = angular.element('<cd-account-panel></cd-account-panel>');
        $scope = $rootScope.$new();
        compiledElement = $compile(element)($scope);
    });

    beforeEach(function() {
        mockAccountService.prototype.account = {};
        mockAccountService.prototype.account.get = function() {
            return {
                username: 'username',
                email: 'mail@foo.bar',
                first_name: 'foo',
                last_name: 'bar'
            };
        };

        mockAlertModalService.prototype.alert = function(title, text, type) {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
    });

    describe("accountData", function() {

        beforeEach(function() {
            mockAccountService.prototype.social = {};
            mockAccountService.prototype.social.get = function(opt, successCallback, errorCallback) {
                successCallback();
            };
        });

        it("should be retrieved during initialization", function() {

            $scope.$digest();
            expect($scope.accountData).toEqual({
                username: 'username',
                email: 'mail@foo.bar',
                first_name: 'foo',
                last_name: 'bar'
            });

        });

    });

    describe("readOnlyAccount", function() {

        it("should be set according to AccountService.social", function() {

            mockAccountService.prototype.social = {};
            mockAccountService.prototype.social.get = function(opt, successCallback, errorCallback) {
                successCallback();
            };

            $scope.$digest();
            expect($scope.readOnlyAccount).toBe(true);
        });

        it("should be set according to AccountService.social (2)", function() {

            mockAccountService.prototype.social = {};
            mockAccountService.prototype.social.get = function(opt, successCallback, errorCallback) {
                errorCallback();
            };

            $scope.$digest();
            expect($scope.readOnlyAccount).toBe(false);
        });

    });

    describe("updateAccount", function() {

        beforeEach(function() {
            mockAccountService.prototype.social = {};
            mockAccountService.prototype.social.get = function(opt, successCallback, errorCallback) {
                errorCallback();
            };

            mockAccountService.prototype.account.save = function(opt, newAccountData, successCallback, errorCallback) {
                if (newAccountData.first_name == 'newFN' && newAccountData.last_name == 'newLN') successCallback();
                else errorCallback({'data': {'error': 'someError'}});
            }
        });

        it("should successfully update account", function() {

            spyOn(mockAccountService.prototype.account, 'save').and.callThrough();
            $scope.$digest();
            $scope.newAccountData = {
                first_name: 'newFN',
                last_name: 'newLN'
            };
            $scope.updateAccount();
            $scope.$digest();
            expect($scope.newAccountData).toEqual({});
            expect(mockAccountService.prototype.account.save).toHaveBeenCalled();
        });

        it("should clear data and display warning if the update request fails", function() {

            spyOn(mockAccountService.prototype.account, 'save').and.callThrough();
            spyOn(mockAlertModalService.prototype, 'alert').and.callThrough();
            $scope.$digest();
            $scope.newAccountData = {
                username: 'username_cannot_be_updated',
            };
            $scope.updateAccount();
            $scope.$digest();
            expect($scope.newAccountData).toEqual({});
            expect(mockAccountService.prototype.account.save).toHaveBeenCalled();
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
        });

    });

});
