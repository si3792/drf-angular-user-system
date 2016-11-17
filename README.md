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
* bootstrap-social

Developer dependencies include:

* http-server

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

### Notes on deployment

#### django-cors-middleware
To allow CORS requests in production, CORS_ORIGIN_WHITELIST must be configured in the project's `settings.py`.

#### configs.js
In constants:
* `LOCAL_OAUTH2_KEY` needs to be generated on the server and added here.
* `BASE_URL` needs to point to the server.
* `HTTPS` must be set to `true` when deploying over HTTPS.
* `AUTO_REFRESH_TOKEN_INTERVAL_SECONDS` must be set according to the server's `ACCESS_TOKEN_EXPIRE_SECONDS`.  
Recommended is 300, with `ACCESS_TOKEN_EXPIRE_SECONDS` having default value of 600
* USERNAME and PASSWORD must have allowed length values matching the server-side settings. (In usersystem's settings.py)

#### settings.py (in usersystem)
This file contains some settings for the usersystem app
`LOCAL_OAUTH2_KEY` must be set here as well.

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
