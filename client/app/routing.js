/*******************************************************************************************************
 *    This file defines the routing of the SPA.                                                        *
 *    Each route must specify a templateUrl, as well as if it requires login or not.                   *
 *******************************************************************************************************/

"use strict";

app.config(['$routeProvider', function($routeProvider) {

    /**
     *    Factory for Route objects, see window.routes below for usage.
     *
     *    @param {String} templateUrl  Location of the template to render
     *    @param {Boolean} requireLogin Flag for whether the route requires authentication.
     */
    var Route = function(templateUrl, requireLogin) {

        var route = {};
        route.templateUrl = templateUrl;
        route.requireLogin = requireLogin;

        if (requireLogin) {
            route.resolve = {};
            route.resolve.waitforauth = function(AuthService) {
                return AuthService.autoRefreshToken();
            };
        }
        return route;
    };


    /**
     *    Definition of all routes
     *
     *    /login is the default route for Unauthenticated users.
     *      When trying to access root or routes for authenticated users, unauthenticated users will be redirected here.
     *
     *    /home is the default route for Authenticated users.
     *      When trying to access root or routes for unauthenticated users, authenticated users will be redirected here.
     *
     */
    window.routes = {
        "/login": Route('views/login.html', false),
        "/home": Route('views/home.html', true),
        "/register": Route('views/register.html', false)
    };

    //this loads up our routes dynamically from window.routes
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
