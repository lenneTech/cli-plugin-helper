# TypeScript Starter

The [lenne.Tech](https://github.com/lenneTech) TypeScript Starter helps to initialize your next [TypeScript](https://www.typescriptlang.org/) project extremely fast.
For example, it is ideal for creating a new npm package.

[![License](https://img.shields.io/github/license/lenneTech/typescript-starter)](/LICENSE) [![CircleCI](https://circleci.com/gh/lenneTech/typescript-starter/tree/master.svg?style=shield)](https://circleci.com/gh/lenneTech/typescript-starter/tree/master)
[![Dependency Status](https://david-dm.org/lenneTech/typescript-starter.svg)](https://david-dm.org/lenneTech/typescript-starter) [![devDependency Status](https://david-dm.org/lenneTech/typescript-starter/dev-status.svg)](https://david-dm.org/lenneTech/typescript-starter?type=dev)

<!--
[![GitHub forks](https://img.shields.io/github/forks/lenneTech/typescript-starter)](https://github.com/lenneTech/typescript-starter/fork) [![GitHub stars](https://img.shields.io/github/stars/lenneTech/typescript-starter)](https://github.com/lenneTech/typescript-starter)
-->

## Requirements

- [Node.js incl. npm](https://nodejs.org):  
  the runtime environment for your TypeScript project

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git):  
  the version control system for your source code


## Initialization

### Via [CLI](https://github.com/lenneTech/cli) (recommended)

```
$ npm install -g @lenne.tech/cli
$ lt ts new <project-name>
$ cd <project-name>
$ npm test
```

Installation via the CLI is recommended, as automated adjustments are made to the configuration for the respective project, so that you can start development directly and spend as little time as possible on configuring the development environment.


### Via GitHub

```
$ git clone https://github.com/lenneTech/typescript-starter.git <project-name>
$ cd <project-name>
$ npm test
```

After the installation via GitHub it is recommended to adjust package.json and README.md directly.


## Update packages

For regular control and easy update of new npm packages you can use e.g. [npm-check-updates](https://github.com/tjunnone/npm-check-updates).

## Alternative recommendations for specific purposes

### Create a new CLI or shell script

For the creation of a new CLI or a shell script we recommend [Gluegun](https://github.com/infinitered/gluegun).

A corresponding starter is currently under development and will be linked here as soon as it is ready.

### Create a new server

So that you can quickly set up a server with database connection and GraphQL API via [NestJS](https://nestjs.com/), we have developed the lenne.Tech [Nest Server Starter](https://github.com/lenneTech/nest-server-starter) for you.

## License

MIT - see LICENSE
