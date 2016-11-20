/************************************************************
 *    A ngResource service for handling user registration.  *
 ************************************************************/

"use strict";

app.factory('RegisterService', function ($resource, CONSTANTS) {

  return {
      checkEmail: $resource(CONSTANTS.BASE_URL + '/register/check-email/'),
      checkUsername: $resource(CONSTANTS.BASE_URL + '/register/check-username/'),
      register: $resource(CONSTANTS.BASE_URL + '/register/')
  };
});
