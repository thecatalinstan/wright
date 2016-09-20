const chrome = require('../chrome')
    , path = require('path')
    , log = require('../log')
    , fs = require('fs')

let notificationId = 0

module.exports = function() {

  return chrome.send('Runtime.evaluate', {
    expression: `
      window.wright = {};
      (function() {
        ${ fs.readFileSync(path.join(__dirname, 'error.js'), { encoding: 'utf8' }) };
        ${ fs.readFileSync(path.join(__dirname, 'notification.js'), { encoding: 'utf8' }) }
      }())
    `
  }).catch(log.error)
}

module.exports.error = function(title, content) {
  chrome.send('Runtime.evaluate', {
    expression: `
      wright.error('${ title || '' }', \`${ content && content.stack ? content.stack : content }\`)
    `
  })
  .catch(log.error)
}


module.exports.notification = function(title, content) {
  const id = 'wrightnotification' + notificationId++

  chrome.send('Runtime.evaluate', {
    expression: `
      wright.notification('${ id }', '${ title || '' }', '${ content}')
    `
  })
  .then(r => r.result.value)
  .catch(log.error)

  return {
    done: () => done(id),
    close: () => close(id)
  }
}

function done(id) {

  chrome.send('Runtime.evaluate', {
    expression: `
      wright.notification.done('${ id }')
    `
  })
  .catch(log.error)
}

function close(id) {

  chrome.send('Runtime.evaluate', {
    expression: `
      wright.notification.close('${ id }')
    `
  })
  .catch(log.error)
}