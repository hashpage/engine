// define dummy replacements for firebug functionality (needed for Opera)
if (!window.console) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
    window.console = {};
    for (i in names) {
        window.console[names[i]] = function() {};
    }
}