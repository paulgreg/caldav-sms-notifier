var caldav = require("node-caldav");
var moment = require("moment");
var config = require("./config.js");

caldav.getList(config.baseurl + config.baikal, config.username, config.password, function(out) {
    out.map(function(calendar) {
        if (calendar.displayName !== '') {
            caldav.getEvents(config.baseurl + calendar.href, config.username, config.password, function(events) {
                events.map(function(event) {
                    var d;
                    for(var key in event) {
                        if (key.indexOf('DTSTART') === 0) {
                            var start = event[key];
                            // console.log(key, start);
                            d = moment(start, ['YYYYMMDD', 'YYYYMMDDTHHmmss'] );
                        }
                    }

                    //console.log(event);
                    console.log('calendar', calendar.displayName, d.format(), ' : ', event.SUMMARY);
                });
            });
        }
    });

});

