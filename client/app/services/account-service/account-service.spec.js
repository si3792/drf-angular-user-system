"use strict";

describe('Test AccountService', function() {

    var AccountService, httpBackend, CONSTANTS;

    beforeEach(module('mainApp'));

    beforeEach(inject(function(_AccountService_, $httpBackend, _CONSTANTS_) {
        AccountService = _AccountService_;
        httpBackend = $httpBackend;
        CONSTANTS = _CONSTANTS_;
    }));

    it('should get account information', function() {

        var server_data = {
            username: "Username",
            email: "email@foo.bar",
            first_name: "Foo",
            last_name: "Bar"
        };

        var data = AccountService.account.get();
        httpBackend.expectGET(CONSTANTS.BASE_URL + '/account/').respond(200, server_data);
        httpBackend.flush();
        expect(data.username).toEqual('Username');
        expect(data.email).toEqual('email@foo.bar');
        expect(data.first_name).toEqual('Foo');
        expect(data.last_name).toEqual('Bar');
    });

    it('should check if password exists', function() {
        httpBackend.expectGET(CONSTANTS.BASE_URL + '/account/password/').respond(404);
        var data = AccountService.password.get();
        httpBackend.flush();
        expect(data.$promise.$$state.value.status).toEqual(404);
    });

    it('should get social provider', function() {

        var data = AccountService.social.get();
        httpBackend.expectGET(CONSTANTS.BASE_URL + '/account/social/').respond(200, '{"social_provider": "facebook"}');
        httpBackend.flush();
        expect(data.social_provider).toEqual('facebook');
    });

});
