/************************************************************
 *    A ngResource service for handling user registration.  *
 ************************************************************/

"use strict";

app.factory('RegisterService', function ($resource) {

  return {
      checkEmail: $resource('http://127.0.0.1:8000/register/check-email/'),
      checkUsername: $resource('http://127.0.0.1:8000/register/check-username/'),
      register: $resource('http://127.0.0.1:8000/register/')
  };
});
