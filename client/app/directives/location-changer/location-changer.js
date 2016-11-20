/*********************************************************************
 *    A directive for invoking $location.path() on click.            *
 *    Used to easily change routes.                                  *
 *                                                                   *
 *    Example usage:                                                 *
 *    <a cd-location-changer='/home'> Click me to go to /#/home </a> *
 *********************************************************************/

app.directive('cdLocationChanger', ['$location', function($location) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
            elem.bind("click", function() {
                $location.path(attr.cdLocationChanger);
                scope.$apply();
            });
        }
    }
}]);
