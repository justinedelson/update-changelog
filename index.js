module.exports = (robot) => {
  robot.on('pull_request.opened', async context => {
    const files = await context.github.pullRequests.getFiles(context.issue())
    const changelog = files.data.find(function (file) {
      if (file.filename === 'CHANGELOG.md') {
        return file
      }
    })

    if (!changelog) {
      // Get config.yml and comment that on the PR
      try {
        const config = await context.config('config.yml')
        const title = context.payload.pull_request.title
        let whiteList
        if (config.updateChangelogWhiteList) {
          whiteList = config.updateChangelogWhiteList.find(function (item) {
            if (title.toLowerCase().includes(item.toLowerCase())) {
              return item
            }
          })
        }
        // Check to make sure it's not whitelisted (ie bug or chore)
        if (!whiteList) {
          const template = config.updateChangelogComment
          return context.github.issues.createComment(context.issue({body: template}))
        }
      } catch (err) {
        if (err.code !== 404) {
          throw err
        }
      }
    }
  })
}
