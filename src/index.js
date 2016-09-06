var config = require('./config.json');
var workSchedule = require('./lib/workSchedule.js');
var urlencode = require('urlencode');
// var workSchedule = require('./module.workSchedule.js');

// example event payload from slack slash command
// token=asdfghjklzxcvbnm
// team_id=T0001
// team_domain=example
// channel_id=C2147483705
// channel_name=test
// user_id=U2147483697
// user_name=Steve
// command=/weather
// text=94070

// Entrypoint for AWS Lambda
exports.handler = function(event, context) {
  var slackEvent;
  if (typeof event.formparams === 'string') {
    slackEvent = urlencode.parse(event.formparams, {charset: 'utf8'});
    // context.succeed('if: ' + JSON.stringify(slackEvent));
  } else {
    slackEvent = event;
    // context.succeed('else: ' + JSON.stringify(slackEvent));
  }

  var days = '1';
  var args = [];
  if(slackEvent && slackEvent.text) {
    slackEvent.text.trim().split(' ').forEach(function (arg) {
      var name = arg.trim();
      if(name) {
        args.push(name.toLowerCase());
      }
    });
  }

  console.log('[EVENT] ', slackEvent);

  // verify request came from slack - could also check that event.command === /weather
  if(slackEvent.token !== config.slashCommandToken) {
    return context.fail('Unauthorized request. Check config.slashCommandToken.');
  }
  workSchedule.getSlackMessage(args)
  .then(function (response) {
    context.succeed(response);
  })
  .catch(function (err) {
    if (err) {
      context.fail(err);
    }
  });
};
