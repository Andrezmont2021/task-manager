<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center"></p>
    <p align="center">
</p>


## Gateway Microservice

Microservice to manage the request and redirect to the appropiated service on the administrator microservice


## Author

Andrés Montilla Orozco -- Systems Engineer -- Full Stack Developer

LinkedIn: https://co.linkedin.com/in/andres-felipe-montilla-orozco

## Description

This microservice receive the HTTP request from the outside and route with the internal administrator microservice through a TCP transport layer.

The microservice use JWT authentication and secure the endpoint with Guards using JWT too. 

You can find the Swagger documentation on the following route --> http[s]://[HOST]:[PORT]/api-documentation.

Note: Important to replace HOST, PORT with the preference settings for you.

## In adittion

IMPORTANT: Before to try to run the project, you need to setup a properly .env file, the project include the file structure but you need to include the values

This project have some unit test to validate the authentication and authorization functionalities, you can run tests by executing the following command ---> npx jest