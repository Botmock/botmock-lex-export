# Botmock Lex Export

<!-- [![Build Status](https://dev.azure.com/botmock/botmock-lex-exporter/_apis/build/status/Botmock.botmock-lex-export?branchName=master)](https://dev.azure.com/botmock/botmock-lex-exporter/_build/latest?definitionId=7&branchName=master) -->

> create amazon lex [resources](https://docs.aws.amazon.com/IAM/latest/UserGuide/list_amazonlex.html#amazonlex-resources-for-iam-policies) from botmock projects

This script produces a `.json` file able to be imported as a resource in the Amazon Lex dashboard.

## Table of Contents

* [Overview](#overview)
  * [Botmock project structure](#botmock-project-structure)
  * [Approach to importing](#approach-to-importing)
  * [Prerequisites](#prerequisites)
    * [nodejs](#nodejs)
    * [aws](#aws)
  * [Installation](#installation)
    * [clone](#clone)
    * [env](#env)
  * [Commands](#commands)
    * [start](#start)
  * [Importing](#importing)

## Overview

### Botmock project structure

When designing a project, the main thing to keep in mind is that intents on connectors are responsible for breaking up the flow into the different intents recognized by Lex. Messages between connectors that have intents are treated as messages or response cards within the same Lex intent.

### Prerequisites

#### Node

- [Node.js](https://nodejs.org/en/) >= 12.x

```shell
# check nodejs version
node --version
```

#### AWS

- [AWS Account](https://console.aws.amazon.com/console/home)

### Installation

#### Clone

Clone this repository and install dependencies:

```shell
git clone git@github.com:Botmock/botmock-lex-export.git

cd botmock-lex-export

npm i
```

#### Env

Create `.env` in `/botmock-lex-export` and fill in values for the following:

```shell
BOTMOCK_TOKEN="token"
BOTMOCK_TEAM_ID="team_id"
BOTMOCK_BOARD_ID="board_id"
BOTMOCK_PROJECT_ID="project_id"
```

To get your Botmock API token, follow the [guide](http://help.botmock.com/en/articles/2334581-developer-api).

### Commands

#### `start`

Populates `/output` with `.zip` file produced from your original project.

```shell
# start the exporter
npm start
```

### Importing

- Compress the generated `.json` file
- Visit the Lex console [AWS console](https://console.aws.amazon.com/lex/)
- Choose **Bots**
- Choose **Actions**
- Choose **Import**
- Select the `.zip` file
