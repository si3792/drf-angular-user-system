/******************************************************************************************
 *    AuthService uses `angular-oauth2` module to provide authentication functionality,   *
 *    as well as automatic refresh of access tokens.                                      *
 ******************************************************************************************/

"use strict";

app.service('AuthService', ['$q', '$timeout', '$cookies', 'OAuth', 'CONSTANTS', function($q, $timeout, $cookies, OAuth, CONSTANTS) {

    var self = this;
    self.autoRefreshTokenInterval = CONSTANTS.AUTO_REFRESH_TOKEN_INTERVAL_SECONDS * 1000;


    /**
     *    Verifies if user is authenticated or not based on the `token` cookie.
     *
     *    @return {Boolean}
     */
    self.isAuthenticated = function() {
        return OAuth.isAuthenticated();
    }

    /**
     *    If logout cannot be performed (if server is down, for example), force logout by removing the `token` cookie.
     */
    self.forceLogout = function() {
      DEBUG && console.log("Forcing logout");
      $cookies.remove(CONSTANTS.COOKIE_NAME);
    }

    /**
     *    Tries to login a user by by obtaining access and refresh tokens and stores them in a cookie.
     *
     *    @param  {object} user - Object with `username` and `password` properties.
     *    @return {promise}       A response promise
     */
    self.login = function(user) {
        var deferred = $q.defer();
        OAuth.getAccessToken(user, {}).then(function(response) {
            DEBUG && console.info("Logged in successfuly!");
            deferred.resolve(response);
        }, function(response) {
            DEBUG && console.error("Error while logging in!");
            deferred.reject(response);
        });
        return deferred.promise;
    }

    /**
     *    Revokes the `token` and removes the stored `token` from cookies
     *
     *    @return {promise} A response promise.
     */
    self.logout = function() {
        var deferred = $q.defer();
        OAuth.revokeToken().then(function(response) {
            DEBUG && console.info("Logged out successfuly!");
            deferred.resolve(response);
        }, function(response) {
            DEBUG && console.error("Error while logging you out!");
            // Force logout
            self.forceLogout();
            deferred.reject(response);
        });
        return deferred.promise;
    }

    /**
     *    Gets a new access token.
     *    Should not be called directly, as autoRefreshToken() is used to manage it.
     *
     *    @return {promise} A response promise.
     */
    self.refreshToken = function() {
        var deferred = $q.defer();

        if (!self.isAuthenticated()) {
            DEBUG && console.error('Cannot refresh token if Unauthenticated');
            deferred.reject();
            return deferred.promise;
        }

        OAuth.getRefreshToken().then(function(response) {
            // Success
            DEBUG && console.info("Access token refreshed");
            deferred.resolve(response);
        }, function(response) {
            DEBUG && console.error("Error refreshing token ");
            DEBUG && console.error(response);
            deferred.reject(response);
        });

        return deferred.promise;
    }

    self.refreshNeeded = true; // Boolean flag for autoRefreshToken()

    /**
     *    A function to automatically refresh the access token as needed.
     *    It is called before a route change which requires authentication
     *    using ngRoute's resolve property and stalls the initialization
     *    of the view until the promise is resolved.
     *
     *    Additionally, once called it recursively calls itself every
     *    `autoRefreshTokenInterval` milliseconds to handle situations
     *    where an access token might expire and cause a 401, while
     *    the route doesn't change.
     *
     *    @return {promise} A response promise.
     */
    self.autoRefreshToken = function() {
        var deferred = $q.defer();

        // If we don't have to refresh the access token, simply resolve the promise
        if (!self.refreshNeeded) {
            deferred.resolve();
            return deferred.promise;
        }

        self.refreshToken().then(function(response) {
            self.refreshNeeded = false;
            deferred.resolve(response);
        }, function(response) {
            deferred.reject(response);
        });

        $timeout(function() {
            // Since autoRefreshTokenInterval milliseconds have passed since we refreshed the access token, we need to refresh it again.
            if (self.isAuthenticated()) {
                self.refreshNeeded = true;
                self.autoRefreshToken();
            }
        }, self.autoRefreshTokenInterval);

        return deferred.promise;
    }

}]);
