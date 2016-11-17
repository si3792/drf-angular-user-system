/*******************************************************************************************************
 *    This file defines the routing of the SPA.                                                        *
 *    Each route must specify a templateUrl, as well as if it requires login or not.                   *
 *    Additionally, routes that require login **MUST** also include waitforauth as shown. This ensures *
 *    the validity of access tokens before making requests with them.                                  *
 *******************************************************************************************************/

"use strict";

/* Definition of all routes. */
window.routes = {
    "/login": {
        templateUrl: 'views/login.html',
        requireLogin: false,
    },
    "/register": {
        templateUrl: 'views/register.html',
        requireLogin: false
    },
    "/home": {
        templateUrl: 'views/home.html',
        requireLogin: true,
        resolve: {
            waitforauth: function(AuthService) {
                return AuthService.autoRefreshToken();
            }
        }
    }
};

app.config(['$routeProvider', function($routeProvider) {

    //this loads up our routes dynamically from the previous object
    for (var path in window.routes) {
        $routeProvider.when(path, window.routes[path]);
    }
    $routeProvider.otherwise({
        redirectTo: '/login'
    });

}]).run(function($rootScope, AuthService, $location) {

    $rootScope.$on("$locationChangeStart", function(event, next, current) {
        for (var i in window.routes) {
            if (next.indexOf(i) != -1) {
                if (window.routes[i].requireLogin && !AuthService.isAuthenticated()) {
                    // Unauthenticated request to a route requiring auth is redirected to /#/login
                    event.preventDefault();
                    $location.path('/login');
                } else if (!window.routes[i].requireLogin && AuthService.isAuthenticated()) {
                    // If authenticated and requesting a route which doesn't require auth (etc /#/login), redirect back to /#/home
                    event.preventDefault();
                    $location.path('/home');
                }
            }
        }
    });

});
