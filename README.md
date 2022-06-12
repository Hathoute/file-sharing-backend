# File Sharing Backend

A very simple file sharing backend running on Node.js and Express.js.

## Getting Started

These instructions will give you a copy of the project up and running on
your local machine for development and testing purposes. See deployment
for notes on deploying the project on a live system.

### Prerequisites

The project runs on Node.js
- [Download Node.js](https://nodejs.org/en/download/)

### Installing

Clone this repository

    git clone https://github.com/Hathoute/file-sharing-backend

Switch to project directory

    cd file-sharing-backend

Run npm install to download dependencies

    npm install

Before continuing, please configure your environment (port, database, ...) by following 
[Configuring the environment](#configuring-the-environment).

Create the database (**Attention**: this will alter any database with the same name as the one specified in the config)

    npm run db-initialize

Start the backend

    npm start

## Configuring the environment

You can easily configure the backend without having to alter any javascript file.

Locate **config/default.json** and adapt it to whatever you need.

## API

You can view the API [here](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/Hathoute/file-sharing-backend/master/openapi.yaml#/)

## Built With

- [Express.js](https://expressjs.com/fr/)
- [WebStorm IDE](https://www.jetbrains.com/fr-fr/webstorm/)
- [OpenAPI 3.0](https://spec.openapis.org/oas/v3.1.0) - Used to create a documentation for the API

## License

This project is licensed under [The MIT License](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for
details