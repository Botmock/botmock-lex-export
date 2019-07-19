# Botmock Lex Export

Generates an [Amazon Lex resource](https://docs.aws.amazon.com/lex/latest/dg/import-from-lex.html) from a Botmock project.

- Tutorial Video (Coming Soon)
- Documentation (Coming Soon)
- [Support Email](mailto:help@botmock.com)

## ethos

<!-- There are certain things to keep in mind about Botmock project structure in order to properly leverage this export script. -->

## prerequisites

- [Node.js](https://nodejs.org/en/) >= 10.16.x

```shell
node --version
```

- [AWS Account](https://console.aws.amazon.com/console/home)

## guide

Clone this repository and install dependencies:

```shell
git clone git@github.com:Botmock/botmock-lex-export.git

cd botmock-lex-export

npm i
```

Create `/.env` and fill in values for the following:

```shell
BOTMOCK_TOKEN=@YOUR-BOTMOCK-TOKEN
BOTMOCK_TEAM_ID=@YOUR-BOTMOCK-TEAM-ID
BOTMOCK_BOARD_ID=@YOUR-BOTMOCK-BOARD-ID
BOTMOCK_PROJECT_ID=@YOUR-BOTMOCK-PROJECT-ID
```

```shell
npm start
```

### importing in Lex

- Compress the generated `.json` file
- Visit the Lex console [AWS console](https://console.aws.amazon.com/lex/)
- Choose **Bots**
- Choose **Actions**
- Choose **Import**
- Select the `.zip` file

## want to help?

Found bugs or have some ideas to improve this integration? We'd love to to hear from you! You can start by submitting an issue at the [Issues](https://github.com/Botmock/botmock-lex-export/issues) tab. If you want, feel free to submit a pull request and propose a change as well!

### submitting a Pull Request

1. Start with creating an issue if possible, the more information, the better!
2. Fork the Repository
3. Make a new change under a branch based on master. Ideally, the branch should be based on the issue you made such as "issue-530"
4. Send the Pull Request, followed by a brief description of the changes you've made. Reference the issue.

_NOTE: Make sure to leave any sensitive information out of an issue when reporting a bug with imagery or copying and pasting error data. We want to make sure all your info is safe!_

## license

Botmock Lex Export is copyright © 2019 Botmock. It is free software, and may be redistributed under the terms specified in the LICENSE file.
