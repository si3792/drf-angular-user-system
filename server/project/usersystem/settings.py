"""
Settings for the usersystem app
"""

# Note that this settings are not enforced at database level
PASSWORD_MIN_LENGTH = 6
PASSWORD_MAX_LENGTH = 80
USERNAME_MIN_LENGTH = 6
USERNAME_MAX_LENGTH = 80  # Cannot be more than 150 as it is using the default django user model


# Used by usersystem to call its own APIs
# As the key is used to generate the client's in-house token from the external social auth token,
# it must equal the value in configs.js client-side.
# This is also why the client type is set to `public`, as per rfc6749 section 2.1
LOCAL_OAUTH2_KEY = "HdNeilGFzpQcTIEXe32LlzgpcSNzYosTo5krYhpk"
