# Cocus PT Challenge

## Installation

```bash
$ npm install
```

## Running the app

Starts the localstack service, to use AWS locally.

```bash
$ docker-compose up
```

Start the NestJS application.

```bash
$ npm run start
```

## How to use the API:

The first step is to create a user, sending a POST with a payload with username and password to `/users`.

```bash
curl --request POST \
  --url http://localhost:3000/users \
  --header 'Content-Type: application/json' \
  --data '{
	"Username": "batman",
	"Password": "iloveclows"
       }'
```

With the user created, you need to login. Then POST to /users/auth/login by sending a payload with username and password.

```bash
curl --request POST \
  --url http://localhost:3000/users/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
	"Username": "batman",
	"Password": "iloveclows"
}'
```
A JWT Token will be returned if all goes well. This Token must be used in all subsequent interactions with the API.

A list of all implemented routes is avaiable in `http://localhost:3000/api`:



## Test

```bash
$ npm run test:e2e
```

## Deploy

```bash
$ terraform apply
```

## Backlog
Because of the time available to me, I had to make some technological/architectural choices that I know are not the best, but were the most viable, such as implementing only e2e tests - not ideal in a real project, but they cover my routes and test what I need.


The points I noticed that need improvement and/or need to be implemented:

__To be implemented__

- Front-end 
 The routes for creating a user and logging in exist and work fine. Therefore, in front-ent, after creating a user, it would be enough to make a request to `users/auth/login` and save the returned JWT token in `sessionStorage` or `localStorage`. This token must be used in all subsequent requests to the API.


 - Deploy
 I tested the terraform deploy only in localstack and not in a real AWS environment, so I have some code snippets in the project like the local DynamoDB URL in the `.tf` and `main.ts` file that should be dynamic, given a .env file.

 __Improvement__

- `Logger` could be an interface with a class that implements its usage, just like I did with `EncrypterBcrypt`.

- In the tests, I'm using a hardcoded JWT token, the correct thing would be to find a way to mock the request that returns the token.

- Authorization through Guards is working, but for some reason, when trying to access a resource with someone else's token, despite the content not being returned (correct), the API returns status 200 (wrong).

- I did the basic implementation of swagger, just to show all my routes, but as the automatic inference dont work very well, the routes dont show the parameters and responses. The controller needs to be decorated with some specifc decorators from nest to improve the docs, or the entire document can be write whitout the swagger plugin, to avoid controller pollution.
 