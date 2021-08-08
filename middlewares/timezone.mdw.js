const env = require('../env.js');
const moment = require("moment");
module.exports = {
    server_time_to_GMT_7: function(time)
    {
        return moment(time).add(env.DELTA_TIME_ZONE,'hours');
    },
    GMT_7_to_server_time:function (time)
    {
        return moment(time).add(-env.DELTA_TIME_ZONE,'hours');
    }
};