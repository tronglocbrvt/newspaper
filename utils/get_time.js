module.exports = {
    get_time_now: function() {
        var d = new Date();
        return d.getTime();
    },
    get_time_from_date: function(date) {
        var d = new Date(date);
        return d.getTime();
    }
};