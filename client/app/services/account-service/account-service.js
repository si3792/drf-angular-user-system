/***************************************************
 *    A ngResource service for account management. *
 ***************************************************/

"use strict";

app.factory('AccountService', function ($resource, CONSTANTS) {
  return {
      account: $resource(CONSTANTS.BASE_URL + '/account/'),
      password: $resource(CONSTANTS.BASE_URL + '/account/password/'),
      social: $resource(CONSTANTS.BASE_URL + '/account/social/'),
  };
});
