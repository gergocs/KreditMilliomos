# Millionaire backend

Simple REST API written in Javascript.

## API endpoints

Every api request needs to provide in headers the following key:
`FireAuth` and value: `FIRE_AUTH_KEY` if it's not provided or invalid
the api will response with [401](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401)

### createUser

task: create a user<br />
address: `/user/create`<br />
methode: `POST`<br />
response status codes:<br />
[200](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200)<br />
[418](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418)<br />
response body: -

### getUser
task: get user info<br />
address: `/user/get`<br />
methode: `GET`<br />
response status codes:<br />
[200](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200)<br />
[418](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418)<br />
response body: the requested user info

### isUserAdmin
task: is the provided user an admin<br />
address: `/user/isAdmin`<br />
methode: `GET`<br />
response status codes:<br />
[200](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200)<br />
[418](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418)<br />
response body: true if the user is admin otherwise false
