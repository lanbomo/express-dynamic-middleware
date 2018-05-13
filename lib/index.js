/**
 * express dynamic middleware
 */

const async = require('async');

const create = function(initWares) {
    let wares = [];

    if (typeof initWares === 'function') {
        wares.push(initWares);
    } else if (Array.isArray(initWares)) {
        initWares.forEach(ware => {
            if (typeof ware === 'function') {
                return wares.push(ware);
            }
            console.warn('inintial middlewares array should be include functions');
        });
    } else if (initWares !== undefined) {
        console.warn('inintial argument should be a function or an array');
    } else {
        // do nothing
    }

    const use = function(fn) {
        if (typeof fn === 'function') {
            return wares.push(fn);
        }
        console.warn('use middleware should be a function');
    };

    const unuse = function(fn) {
        wares = wares.filter(func => func !== fn);
    };

    const clean = function() {
        wares = [];
    };

    const handle = function() {
        return function(req, res, next) {
            async.each(wares, function(fn, callback) {
                fn(req, res, callback);
            }, function(err) {
                if (err) {
                    return console.error(err);
                }

                next();
            });
        };
    };

    const get = function() {
        return wares;
    };

    return {
        use,
        unuse,
        clean,
        handle,
        get
    };
};

module.exports = {
    create
};
