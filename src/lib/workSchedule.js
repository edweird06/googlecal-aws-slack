/// <reference path="../../typings/index.d.ts" />

var rp = require('request-promise');
var moment = require('moment-timezone');
var config = require('../config.json');

var timeZone = 'America/Los_Angeles';
var timeFormat = 'h:mm a';
var currentMoment = moment.tz(timeZone);
var daysToDisplay = 1;
var args = [];

function getFromGoogle(calId, numOfDays) {
    var forDays = numOfDays ? parseInt(numOfDays) : daysToDisplay;
    var startingMoment = currentMoment;
    var startDateRange = startingMoment.clone().tz(timeZone).startOf('day').format();
    var endDateRange = startingMoment.clone().tz(timeZone).add(forDays - 1, 'days').endOf('day').format();
    var newUrl = 'https://clients6.google.com/calendar/v3/calendars/' +
            config.calGroup + '@group.calendar.google.com/' +
            'events?calendarId=' + calId + '%40group.calendar.google.com&' +
            'singleEvents=true&timeZone=America%2FLos_Angeles&maxAttendees=1&' +
            'maxResults=500&sanitizeHtml=false&timeMin=' + startDateRange + '&' +
            'timeMax=' + endDateRange + '&key=' + config.calKey;
    return rp(newUrl);
}

function getSlackMessage(argsFromApp) {
    args = argsFromApp;
    if (!argsFromApp || !argsFromApp.length || argsFromApp.length === 0 || !/^[0-9]+$/.test(argsFromApp[0])) {
        return getHelpMessage ();
    } else {
        return getSchedule(argsFromApp);
    }
}

function getSchedule(arrayOfArgs) {
    var numOfDays = arrayOfArgs[0]
    return getFromGoogle(config.workCalId, numOfDays)
    .then(function (body) {
        var calObj = JSON.parse(body);
        var events = calObj.items;
        events.sort(function (a, b) {
            a = a.start.dateTime;
            b = b.start.dateTime;
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });
        return events.map(function (event) {
            return {
                schedule: event.organizer.displayName,
                name: event.summary.trim(),
                start: moment(event.start.dateTime),
                end: moment(event.end.dateTime)
            }
        });
    })
    .then(buildMessageBody)
    .then(formatResponse);
}

function buildMessageBody (events) {
    var message = '';
    var dateFormat = '-- ddd, MMMM D YYYY --';
    var date = currentMoment.clone().subtract(1, 'day').tz(timeZone);
    events.forEach(function (event) {
        if (args[1]) {
            if (event.name.toLowerCase().indexOf(args[1]) === -1) {
                return;
            }
        }
        if (!date.isSame(event.start, 'day')) {
            date = event.start;
            message += '\n*' + date.format(dateFormat) + '*\n';
        }
        message += event.name + ' - ' + event.start.tz(timeZone).format(timeFormat);
        message += '\n';
    });

    return message;
}

function formatResponse (message, header) {
    var headerText = header || 'Schedule for the next ' + args[0] + ' day(s)';
    if (!message) {
        message = '*No schedules found';
        if(args[1]) {
            message += ' for "' + args[1] + '"';
        }
        message += '*';
    }
    return {
        response_type: args[2] === 'everyone' ? 'in_channel' : 'ephemeral',
        text: headerText,
        mrkdwn: true,
        attachments: [{
            text: message,
            mrkdwn_in: ['text']
        }]
    }
}

function getHelpMessage () {
    return new Promise(resolve => {
        var header = 'Help for `/schedule` command';
        var mainHelp = `
The \`/schedule\` command will allow you to search from today forward to find out what the current work schedule is.

*Examples*
Define the number of days
\`\`\`/schedule 5\`\`\`
this would return the work schedule for the next 5 days for everyone.

Define the number of days and the name to filter on
\`\`\`/schedule 7 Chasity\`\`\`
this would return the work schedule for the next 7 days for only Chasity.
`;
        resolve(formatResponse(mainHelp, header));
    });
}
module.exports = {
    getSchedule: getSchedule,
    getSlackMessage: getSlackMessage
};