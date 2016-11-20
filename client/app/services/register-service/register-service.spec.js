"use strict";

describe('Test RegisterService', function() {

    var RegisterService, httpBackend, CONSTANTS;

    beforeEach(module('mainApp'));

    beforeEach(inject(function(_RegisterService_, $httpBackend, _CONSTANTS_) {
        RegisterService = _RegisterService_;
        httpBackend = $httpBackend;
        CONSTANTS = _CONSTANTS_;
    }));

    it('should register an user', function() {

        var postData = {
            username: "Username",
            email: "email@foo.bar",
            first_name: "Foo",
            last_name: "Bar",
            password: "password"
        };
        httpBackend.expectPOST(CONSTANTS.BASE_URL + '/register/').respond(201, "BLA");

        var data;
        RegisterService.register.save({}, postData, function(resp){
          data = 'success';
        }, function(resp){
          data = 'error';
        });

        httpBackend.flush();
        expect(data).toEqual('success');
    });
});
