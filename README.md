# drf-angular-user-system

## Overview

A user management system, consisting of a RESTful Django (DRF) server and an AngularJS SPA client.

It is meant to be used as a backbone for any DRF + Angular project requiring user authentication, including social authentication.

### Features

- Completely separated Server and Client
- User registraton, authentication and basic management (update account information and delete account)
- Social signin through Facebook and Google
- Google signin implements authorization code grant, which allows for server calls to Google's API.
- Simple client routing system

### Demo

[Check out a working demo here.](http://simoiliev.me/usersystem.html)

### Index

1. [Overview](#overview)
2. [Technologies](#technologies)
3. [Setup & Configuration](#setup)
4. [Additional Configurations](#additional)
5. [Testing](#testing)
6. [Deployment considerations](#deployment)
7. [Further development notes](#further)
8. [License](#license)

**! Note that social authentication is disabled for the demo.**

## Technologies

### Client

Client is provided as an NPM package. Its dependencies are:

- Angular
- Bootstrap
- JQuery
- angular-bootstrap-alert-modals
- angular-route
- angular-oauth2
- angular-resource
- angular-cookies
- bootstrap-social

Developer dependencies include:

- http-server
- angular-mocks
- Karma + Jasmine for testing
- Istanbul for code coverage

### Server

The main functionality is provided by the Django app `usersystem`.

Server requirements include:

- Python **(3.5)**
- Django
- Django Rest Framework
- django-cors-middleware, for managing CORS
- Django OAuth Toolkit, as an OAuth2 provider
- Django rest-framework Social Oauth2, for social authentication
- requests

## Setup & Configuration

After cloning the repository, both the server and client need to be configured:

### Server

1. Go into the `server` directory
2. Create a virtualenv: `virtualenv env`
3. Activate it: `source env/bin/activate`
4. Install requirements from requirements.txt: `pip install -r requirements.txt`
5. `cd` into `project/`
6. `secrets.py` contains the secret keys for social authentication and since it is ignored by git, needs to be created from `template.secrets.py`. Run `cp usersystem/template.secrets.py usersystem/secrets.py`.
7. Next, sync your database with `python manage.py migrate`
8. Create a superuser with `python manage.py createsuperuser`
9. Try to run the test suite with `python manage.py test`. If everything is alright you shouldn't see any errors.
10. You can now start the server using `python manage.py runserver`
11. Go to [http://localhost:8000/admin](http://localhost:8000/admin) and login with the superuser you created
12. You will now be able to create client application:

  - Go to `DJANGO OAUTH TOOLKIT -> Applications -> ADD APPLICATION`
  - Set the `User` property to your superuser
  - Set `Client type` to `Public`
  - Set `Authorization grant type` to `Resource owner password-based`
  - Set `Name` to whatever you like your client name to be.
  - Copy the `Client id`, you'll need it in a moment.
  - Save it

13. Now go to `server/project/usersystem/settings.py` and paste the Client id into `LOCAL_OAUTH2_KEY`. You'll also need to update it client-side in a minute, but the server is now configured.

### Client

1. Go into the `client/` directory
2. Install all dependencies with `npm install`
3. Go to `app/configs.js`. You'll need to set `LOCAL_OAUTH2_KEY` here as well.
4. Client is now configured! Try to run the tests: `npm test`. You shouldn't see any errors
5. Start serving the client with `npm start`

Now, you should be able to go to [http://localhost:8001](http://localhost:8001) and see the client.

However, in order to get the social authentication working, some additional configuration is required.

## Additional configurations

### Setting up social authentication

#### Google OAuth2

To get Google signin working, OAuth2 KEY and SECRET pair must be obtained from Google. These values must then be placed in `server/project/usersystem/secrets.py`. The key must also be available to the client, so go to `client/app/configs.js` and place it in `GOOGLE_CLIENT_ID`.

#### Facebook

To get it working, KEY and SECRET pair must be obtained from Facebook. These values must then be placed in usersystem's `server/project/usersystem/secrets.py`. The key must also be available to the client, so go to `client/app/configs.js` and place it in `FACEBOOK_CLIENT_ID`.

### Changing min and max length of usernames and passwords

By default, the system allows an username or password to be between 6 and 80 symbols. To change those defaults go to the respective constants in `server/project/usersystem/settings.py` and `client/app/configs.js` and update both files to the same values.

### Client (Angular) routing

Client's routing configuration is stored in `client/app/routing.js`. Right now `/login` and `/home` are required as default routes for unauthenticated and authenticated users, respectively. Any number of other routes can be defined in `window.routes` in the same way (using the Route factory provided there).

### Changing the lifetime of access tokens

By default (Recommended) the server issues access tokens with lifetime of 600 seconds. To change that value go to `server/project/settings.py` and update `ACCESS_TOKEN_EXPIRE_SECONDS`. You must also change the value of `AUTO_REFRESH_TOKEN_INTERVAL_SECONDS` in `client/app/configs.js`, so that the client knows how often to ask for a renewal.

## Testing

### Client

`npm test` is the command for running the tests. Coverage report is then generated at `coverage/`.

### Server

`python manage.py test` runs the test suite.

## Deployment considerations

Apart from the [standard deployment checklist for django projects](https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/), here are some project-specific notes on deployment:

- Since **django-cors-middleware** is used, it needs to be configured to allow CORS
- In `client/app/configs.js`:

  - `BASE_URL` needs to point to the server
  - `HTTPS` **must** be set to `true` when using HTTPS.

## Further development notes

The current mechanism for detecting duplicate emails when signing in through a social account is a bit messy (Look at `pipeline.py` as well as `loginPanel.js`'s way of reporting it). A better way of handling this exception must be implemented.

Client should be able to infer the lifetime of the server's access tokens when issued and configure `AUTO_REFRESH_TOKEN_INTERVAL_SECONDS` accordingly by itself.

## License

Copyright 2016 Simo Iliev

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
