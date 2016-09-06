var config = require('./config.json');
var workSchedule = require(__dirname + '/lib/workSchedule.js');
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
// exports.handler = function(event, context) {
//   var message = event.text ? event.text.trim() : null;

//   console.log('[EVENT] ', event);

//   // verify request came from slack - could also check that event.command === /weather
//   if(event.token !== config.slashCommandToken) {
//     return context.fail('Unauthorized request. Check config.slashCommandToken.');
//   }

//   context.succeed(workSchedule.getSchedule(message));
// };

workSchedule.getSlackMessage(['5', 'sam'])
.then(function (response) {
    console.log(JSON.stringify(response, null, 2));
});