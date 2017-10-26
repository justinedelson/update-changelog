# update-changelog

> a GitHub App built with [probot](https://github.com/probot/probot) that verifies that pull requsts contain an update to the CHANGELOG.md file. Heavily
based on https://github.com/behaviorbot/update-docs.

## Usage

1. Install the bot on the intended repositories. The plugin requires the following **Permissions and Events**:
- Pull requests: **Read & Write**
  - [x] check the box for **Pull Request** events
2. Add a `.github/config.yml` file that contains the contents you would like to reply within an `updateChangelogComment`
3. Optionally, you can also add a `updateChangelogWhiteList` that includes terms, that if found in the title, the bot will not comment on.
```yml
# Configuration for update-changelog - https://github.com/justinedelson/update-changelog

# Comment to be posted to on PRs that don't update documentation
updateChangelogComment: >
  Thanks for opening this pull request! The maintainers of this repository would appreciate it if you would update the CHANGELOG.md file with this pull request.

updateChangelogWhiteList:
  - bug
  - chore
```

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [the probot deployment docs](https://github.com/probot/probot/blob/master/docs/deployment.md) if you would like to run your own instance of this plugin.
