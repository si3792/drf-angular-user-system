/*************************************************************
 *    This file contains various configurations for the app. *
 *************************************************************/


"use strict";

/* This must be false in production */
var DEBUG = true;

/* Various constants */
app.constant('CONSTANTS', {
    LOCAL_OAUTH2_KEY: 'HdNeilGFzpQcTIEXe32LlzgpcSNzYosTo5krYhpk',
    BASE_URL: 'http://localhost:8000',
    HTTPS: false,
    AUTO_REFRESH_TOKEN_INTERVAL_SECONDS: 300,
    USERNAME_MIN_LENGTH: 6,
    USERNAME_MAX_LENGTH: 80,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 80,
    GOOGLE_CLIENT_ID: '231314126408-93f2l5ka9ehfbac0n014fuv33gnkopsp.apps.googleusercontent.com',
    FACEBOOK_CLIENT_ID: '1195143617226926',
    COOKIE_NAME: 'token' // Sets the name of the auth-storing cookie. Usually shouldn't be changed.
});

/*  By default, trailing slashes will be stripped from the calculated URLs,
    which can pose problems with server backends that do not expect that behavior */
app.config(function($resourceProvider) {
    $resourceProvider.defaults.stripTrailingSlashes = false;
});

/* Configuration for angular-oauth2 */

app.config(['OAuthProvider', 'CONSTANTS', function(OAuthProvider, CONSTANTS) {
    OAuthProvider.configure({
        baseUrl: CONSTANTS.BASE_URL,
        clientId: CONSTANTS.LOCAL_OAUTH2_KEY,
        grantPath: '/oauth2/token/',
        revokePath: '/oauth2/revoke_token/'
    });
}]);


app.config(['OAuthTokenProvider', 'CONSTANTS', function(OAuthTokenProvider, CONSTANTS) {
    OAuthTokenProvider.configure({
        name: CONSTANTS.COOKIE_NAME,
        options: {
            secure: CONSTANTS.HTTPS,
        }
    });
}]);
