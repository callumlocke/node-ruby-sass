'use strict';

var path = require('path');
var spawn = require('win-spawn');
var portfinder = require('portfinder');
var util = require('util');
var dnode = require('dnode');
var async = require('async');
var SassError = require('./sass-error');

var serverRb = path.resolve(__dirname, '..', 'server.rb');


var defaults = {
    port: null,
    basePort: 8500
};


var Sass = function (options) {

    // process options
    if (!options) {
        options = defaults;
    }
    else {
        for (var key in defaults) {
            if (defaults.hasOwnProperty(key) && options[key] == null) {
                options[key] = defaults[key];
            }
        }
    }

    // manage readiness
    this.ready = false;
    this.queue = [];


    // do preparation then resolve deferred
    var self = this;
    async.waterfall([
        // choose a port
        function (done) {
            if (typeof options.port === 'number') {
                done(null, options.port);
            }
            else {
                portfinder.basePort = options.basePort;
                portfinder.getPort(done);
            }
        },

        // start ruby
        function (port, done) {
            // start ruby process (telling it our chosen port, plus sass options)
            var args = [ serverRb, port ];
            var ruby = spawn('ruby', args);
            ruby.stdout.setEncoding('utf8');
            ruby.stdin.setEncoding('utf8');

            // listen for the line "ready"
            ruby.stdout.on('data', function (data) {
                var output = data.toString().trim();

                // console.log('STDOUT', output);

                if (data.toString().trim() === 'ready') done(null, port);
                else done(new Error('Unexpected output from Ruby app: ' + output));
            });

            ruby.stderr.on('data', function (data) {
                console.log('STDERR', data.toString());
            });

            ruby.on('error', done);
        },

        // establish dnode connection to the ruby process
        function (port, done) {
            var d = dnode.connect(port);

            d.on('remote', function (remote) {
                self.remote = remote;

                // resolve as ready, and re-run any queued compile calls
                self.ready = true;
                self.queue.forEach(function (item) {
                    self.compile.apply(self, item);
                });
            });

            d.on('error', function (err) {
                throw err;
            });
            d.on('fail', function (err) {
                throw err;
            });
        }
    ]);
};

// util.inherits(Sass, EventEmitter);


Sass.prototype.compile = function (filename, sassOptions, callback) {
    if (this.ready) {
        if (callback == null) {
            callback = sassOptions;
            sassOptions = {};
        }

        // todo: validate options

        var request = {file: filename, options: sassOptions};

        this.remote.f(request, function (response) {
            var err = null;
            if (response.error) {
                err = new SassError(response.message, response.sass_backtrace);
            }

            callback(err, response.css/*, response.map || null*/);
        });
    }
    else {
        this.queue.push(arguments);
    }
};


module.exports = Sass;
