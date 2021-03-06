//export logger as es6 format
import winston from 'winston'
import { _ } from 'meteor/underscore';
const si = require('systeminformation');
let details = {};

let modifiedConsole = new winston.transports.Console({
    name: "console",
    timestamp: true
});

export const logger = new winston.Logger({
    transports: [
        modifiedConsole,
    ]
});

// @meta here comes two things combined params and old doc
logger.on('logging', function (transport, level, msg, meta) {
    //get exact time of method call
    let timeStamp = new Date();
    //check null values of params
    let params = {};
    si.getStaticData(data => {
        details.platform = data.os.platform;
        details.version = data.os.distro;
        details.arch = data.os.arch;
        details.ip4 = data.net[0].ip4;
        details.ip6 = data.net[0].ip6;
        details.mac = data.net[1].mac;
        if(level === 'info'){
            params = meta.params[0] || {}
        }
        else{
            params = {
                error: meta.params.error,
                reason:meta.params.reason,
                details: meta.params.details,
                message: meta.params.message,
                type: meta.params.errorType,
            }
        }
        Meteor.call('logs.insert', {
            log:{
                level: level,
                log: msg,
                params: params,
                details: details,
                timeStamp: timeStamp,
                record: meta.doc
            }
        }, (err, response) => {
        })
    });


});