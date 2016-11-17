/**************************************************************************
 *    An attribute directive for checking if an username is already used. *
 *    Used in the user registration form.                                 *
 **************************************************************************/

"use strict";

app.directive('cdValidateUsername', function($q, RegisterService) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$asyncValidators.validateUsername = function(modelValue, viewValue) {

                if (ctrl.$isEmpty(modelValue)) {
                    // consider empty model valid
                    return $q.when();
                }

                var def = $q.defer();
                RegisterService.checkUsername.save({}, {
                    "username": modelValue
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
