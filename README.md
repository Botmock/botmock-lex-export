# Botmock Lex Export

Node.js project for importing [Botmock](https://botmock.com) projects in [Lex](https://aws.amazon.com/lex/)

> **Note**: The deprecated version of this exporter can be found in the `legacy` branch.

## Table of Contents

* [Overview](#overview)
  * [Usage](#usage)
  * [Importing](#importing)

## Overview

### Usage

> **Note**: prerequisites
> - [Node.js LTS version](https://nodejs.org/en/)
> - [AWS Account](https://console.aws.amazon.com/console/home)

Running the following commands should allow you to generate restorable content from your Botmock project.

- `git clone git@github.com:Botmock/botmock-lex-export.git`
- `cd botmock-lex-export`
- `npm install`
- `mv ./sample.env ./env` and edit `.env` to contain your [token and project ids](http://help.botmock.com/en/articles/2334581-developer-api)
- `npm start`

`./output` should be generated in your project root.

### Importing

### Importing

- Compress the `.json` file generated in `./output`
- Visit the Lex console [AWS console](https://console.aws.amazon.com/lex/)
- Choose **Bots**
- Choose **Actions**
- Choose **Import**
- Select the `.zip` file
