var config = require("./config.js");
var caldav = require("node-caldav");
var moment = require("moment");

var debug = true;

caldav.getList(config.baseurl + config.baikal, config.username, config.password, function(calendars) {

    calendars.map(function(calendar) {

        if (calendar.displayName !== '') {

            var from = moment().format('YYYYMMDDTHH0000');
            var end  = moment().minutes(config.checkIntervalInMinutes).format('YYYYMMDDTHHmmss');

            caldav.getEvents(config.baseurl + calendar.href, config.username, config.password, from, end, function(events) {

                events.map(function(event) {
                    var d;
                    for(var key in event) {
                        if (key.indexOf('DTSTART') === 0) {
                            var start = event[key];
                            if (debug) { console.log(key, start); }
                            d = moment(start, ['YYYYMMDD', 'YYYYMMDDTHHmmss'] );
                        }
                    }

                    var now = moment();
                    if (d.date() !== now.date() || d.hour() !== now.hour()) {
                        return; // Stop if not same day or same hour...
                    }

                    if (debug) { console.log(event); }

                    var message = "{date}{time} {title} ({calendar})"
                    .replace("{date}", d.format('DD/MM'))
                    .replace("{time}", (d.hours() !== 0 && d.minutes() !== 0) ? " " + d.format('HH:mm') : "")
                    .replace("{title}", event.SUMMARY)
                    .replace("{calendar}", calendar.displayName);

                    if (debug) { console.log(message); }

                    var smsUrl = "https://smsapi.free-mobile.fr/sendmsg?user={username}&pass={password}&msg={message}"
                    .replace("{username}", config.smsUsername)
                    .replace("{password}", config.smsPassword)
                    .replace("{message}", encodeURIComponent(message));

                    if (debug) { console.log(smsUrl); }

                    var request = require('request');
                    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
                    request(smsUrl, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            if (debug) { console.log('ok'); }
                        } else if (error || (response && response.statusCode !== 200)) {
                            console.error(error, " - ", (response) ? response.statusCode : "no response");
                        }
                    })
                });
            });
        }
    });
});

