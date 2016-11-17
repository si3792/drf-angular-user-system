/*******************************************************************************
 *    An attribute directive for checking if an email address is already used. *
 *    Used in the user registration form.                                      *
 *******************************************************************************/

"use strict";

app.directive('cdValidateEmail', function($q, RegisterService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$asyncValidators.validateEmail = function(modelValue, viewValue) {

                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty model valid
                    return $q.when();
                }

                var def = $q.defer();
                RegisterService.checkEmail.save({}, {
                    "email": modelValue
                }, function(response) {
                    def.resolve();
                }, function(response) {
                    def.reject();
                });

                return def.promise;
            };
        }
    };
});
