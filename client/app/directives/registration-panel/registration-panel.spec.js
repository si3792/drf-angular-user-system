"use strict";

DEBUG = false; // Turn off console logs

describe("cd-registration-panel", function() {

    var $location, $rootScope, $compile, $q;
    var $scope;
    var compiledElement;

    function mockRegisterService() {}

    function mockAlertModalService() {}

    beforeEach(module('mainApp', function($provide) {
        $provide.service('RegisterService', mockRegisterService);
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
        var element = angular.element('<cd-registration-panel></cd-registration-panel>');
        $scope = $rootScope.$new();
        compiledElement = $compile(element)($scope);

        mockAlertModalService.prototype.alert = function(title, text, type) {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
    });


    describe("registerUser", function() {

        var registrationSuccessFlag = false;

        beforeEach(function() {

            mockRegisterService.prototype.register = {};
            mockRegisterService.prototype.register.save = function(opt, registerData, successCallback, errorCallback) {
                var validData = {
                    "username": "newUser",
                    "password": "password",
                    "email": "email@foo.bar",
                    "first_name": "foo",
                    "last_name": "bar"
                };
                if (angular.equals(validData, registerData)) {
                    registrationSuccessFlag = true;
                    successCallback();
                } else {
                    registrationSuccessFlag = false;
                    errorCallback({
                        'data': {
                            'error': 'someValidationError'
                        }
                    });
                }
            }

            mockRegisterService.prototype.checkUsername = {};
            mockRegisterService.prototype.checkUsername.save = function(opt, usernameContainer, successCallback, errorCallback) {
                if (usernameContainer == {
                        'username': 'newUser'
                    }) successCallback();
                else errorCallback();
            }

            mockRegisterService.prototype.checkEmail = {};
            mockRegisterService.prototype.checkEmail.save = function(opt, emailContainer, successCallback, errorCallback) {
                if (emailContainer == {
                        'email': 'email@foo.bar'
                    }) successCallback();
                else errorCallback();
            }

        });

        it("should successfuly register an user and redirect to /#/login", function() {

            spyOn(mockAlertModalService.prototype, 'alert').and.callThrough();
            spyOn(mockRegisterService.prototype.register, 'save').and.callThrough();
            $scope.$digest();
            $scope.registerData = {
                "username": "newUser",
                "password": "password",
                "email": "email@foo.bar",
                "first_name": "foo",
                "last_name": "bar"
            };
            $scope.registerUser();
            $scope.$digest();
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
            expect(mockRegisterService.prototype.register.save).toHaveBeenCalled();
            expect($location.path()).toEqual('/login');
            expect(registrationSuccessFlag).toBe(true);
        });

        it("should display an error when registration request fails", function() {

            spyOn(mockAlertModalService.prototype, 'alert').and.callThrough();
            spyOn(mockRegisterService.prototype.register, 'save').and.callThrough();
            $scope.$digest();
            $scope.registerData = {
                "this": "data is invalid"
            };
            $scope.registerUser();
            $scope.$digest();
            expect(mockAlertModalService.prototype.alert).toHaveBeenCalled();
            expect(mockRegisterService.prototype.register.save).toHaveBeenCalled();
            expect(registrationSuccessFlag).toBe(false);
        });

    });

});
