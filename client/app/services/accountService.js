/***************************************************
 *    A ngResource service for account management. *
 ***************************************************/

"use strict";

app.factory('AccountService', function ($resource) {
  return {
      about: $resource('http://127.0.0.1:8000/account/about/'),
      password: $resource('http://127.0.0.1:8000/account/password/')
  };
});
