/***************************************************
 *    A ngResource service for account management. *
 ***************************************************/

"use strict";

app.factory('AccountService', function ($resource) {
  return {
      account: $resource('http://127.0.0.1:8000/account/'),
      password: $resource('http://127.0.0.1:8000/account/password/'),
      social: $resource('http://127.0.0.1:8000/account/social/'),
  };
});
