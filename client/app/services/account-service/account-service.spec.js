"use strict";

describe('AccountService', function() {

    var AccountService, $httpBackend, CONSTANTS;

    beforeEach(module('mainApp'));

    beforeEach(inject(function(_AccountService_, _$httpBackend_, _CONSTANTS_) {
        AccountService = _AccountService_;
        $httpBackend = _$httpBackend_;
        CONSTANTS = _CONSTANTS_;
    }));

    it('should get account information', function() {

        var server_data = {
            username: "Username",
            email: "email@foo.bar",
            first_name: "Foo",
            last_name: "Bar"
        };
        $httpBackend.expectGET(CONSTANTS.BASE_URL + '/account/').respond(200, server_data);

        var data = AccountService.account.get();
        $httpBackend.flush();
        expect(data.username).toEqual('Username');
        expect(data.email).toEqual('email@foo.bar');
        expect(data.first_name).toEqual('Foo');
        expect(data.last_name).toEqual('Bar');
    });

    it('should check if password exists', function() {

        $httpBackend.expectGET(CONSTANTS.BASE_URL + '/account/password/').respond(404);

        var data;
        AccountService.password.get({}, {}, function(resp) {
            data = resp;
        }, function(resp) {
            data = resp;
        });

        $httpBackend.flush();
        expect(data.status).toEqual(404);
    });

    it('should get social provider', function() {

        $httpBackend.expectGET(CONSTANTS.BASE_URL + '/account/social/').respond(200, '{"social_provider": "facebook"}');

        var data = AccountService.social.get();
        $httpBackend.flush();
        expect(data.social_provider).toEqual('facebook');
    });

});
