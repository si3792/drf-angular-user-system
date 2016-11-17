"""
Settings for the usersystem app
"""

# Note that this settings are not enforced at database level
PASSWORD_MIN_LENGTH = 6
PASSWORD_MAX_LENGTH = 80
USERNAME_MIN_LENGTH = 6
USERNAME_MAX_LENGTH = 80  # Cannot be more than 150 as it is using the default django user model
