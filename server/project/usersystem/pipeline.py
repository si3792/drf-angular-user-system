from social.exceptions import AuthException


def reject_used_email(backend, details, user=None, *args, **kwargs):
    """
    Used in SOCIAL_AUTH_PIPELINE, this function checks if the user which is about to be
    created uses an email already existing in our system
    (Which breaks the authentication flow as duplicate emails are not allowed).
    """
    if user:
        return None

    email = details.get('email')
    if email:
        # Try to associate accounts registered with the same email address,
        # only if it's a single object. AuthException is raised if multiple
        # objects are returned.
        users = list(backend.strategy.storage.user.get_users_by_email(email))
        if len(users) == 0:
            return None
        else:
            raise AuthException(
                backend,
                'The given email address is associated with another account'
            )
