# drf-angular-user-system
A user management system, consisting of a RESTful Django (DRF) server and an AngularJS SPA client.

It is meant to be used as a backbone for any DRF + Angular project requiring user authentication, including social authentication.

## Structure

### Client

Client is provided as an NPM package. Its dependencies are:

* Angular
* Bootstrap
* JQuery
* angular-bootstrap-alert-modals
* angular-route
* angular-oauth2
* angular-resource
* angular-cookies
* bootstrap-social

Developer dependencies include:

* http-server
* angular-mocks
* Karma + Jasmine for testing
* Istanbul for code coverage

### Server

The main functionality is provided by the Django app `usersystem`.

Server requirements include:

* Django
* Django Rest Framework
* django-cors-middleware, for managing CORS
* Django OAuth Toolkit, as an OAuth2 provider
* Django rest-framework Social Oauth2, for social authentication
* requests

You can install the requirements using `pip`, from `requirements.txt` (Preferably using `virtualenv`).

## Testing

### Client

`npm test` is the command for running the tests.
Coverage report is then generated at `coverage/`.

### Server

`python manage.py test` runs the test suite.

## Important Notes

#### django-cors-middleware
To allow CORS requests in production, CORS_ORIGIN_WHITELIST must be configured in the project's `settings.py`.

### Client routing

Routing configuration is stored in `routing.js`.  
Right now `/login` and `/home` are required as default routes for Unauthenticated and Authenticated users respectively.
Any number of other routes can be defined in `window.routes` in the same way (using the Route factory).

#### configs.js
In constants:
* `LOCAL_OAUTH2_KEY` needs to be generated on the server and added here.
* `BASE_URL` needs to point to the server.
* `HTTPS` must be set to `true` when deploying over HTTPS.
* `AUTO_REFRESH_TOKEN_INTERVAL_SECONDS` must be set according to the server's `ACCESS_TOKEN_EXPIRE_SECONDS`.  
Recommended is 300, with `ACCESS_TOKEN_EXPIRE_SECONDS` having default value of 600.
* USERNAME and PASSWORD must have allowed length values matching the server-side settings. (In usersystem's settings.py).
* `GOOGLE_CLIENT_ID` is needed for social sign-in with google, and must equal `SOCIAL_AUTH_GOOGLE_OAUTH2_KEY` in `secrets.py`.
* `FACEBOOK_CLIENT_ID` is needed for social sign-in with google, and must equal `SOCIAL_AUTH_FACEBOOK_KEY` in `secrets.py`.
* `COOKIE_NAME` sets the name of the cookie which stores the authentication data. Default is `token` and usually shouldn't be changed.

#### settings.py (in usersystem)
This file contains some settings for the usersystem app.
`LOCAL_OAUTH2_KEY` must be set here as well.

#### Social keys management
__Google OAuth2__ is available as social login.
To get it working, OAuth2 KEY and SECRET pair must be obtained from Google.
These values must then be placed in usersystem's `secrets.py` (As `secrets.py` is in `.gitignore`, look at `template.secrets.py`).  

__Facebook__ is also available for social login.
To get it working, KEY and SECRET pair must be obtained from Facebook.
These values must then be placed in usersystem's `secrets.py` (As `secrets.py` is in `.gitignore`, look at `template.secrets.py`).

## Further development notes

The current mechanism for detecting duplicate emails when signing in through a social account
is a bit messy (Look at `pipeline.py` as well as `loginPanel.js`'s way of reporting it). A better way of handling this exception must be implemented.

## License

Copyright 2016  Simo Iliev

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
