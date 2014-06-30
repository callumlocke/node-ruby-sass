'use strict';

var path = require('path');
var spawn = require('win-spawn');
var portfinder = require('portfinder');
var util = require('util');
var dnode = require('dnode');
var async = require('async');
var EventEmitter = require('events').EventEmitter;

var serverRb = path.resolve(__dirname, 'server.rb');

var defaults = {
    sass: {},
    port: null,
    basePort: 8500
};


var Sass = function (options) {
    EventEmitter.call(this);

    // process options
    if (!options) options = {};
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key) && options[key] == null) {
            options[key] = defaults[key];
        }
    }

    // do preparation, then emit "ready" event
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
            var args = [ serverRb, port, JSON.stringify(options.sass)];
            // console.log('running: ruby ' + args.join(' '));
            var ruby = spawn('ruby', args);
            ruby.stdout.setEncoding('utf8');
            ruby.stdin.setEncoding('utf8');

            // listen for the line "ready"
            ruby.stdout.once('data', function (data) {
                var output = data.toString().trim();

                if (data.toString().trim() === 'ready') done(null, port);
                else done(new Error('Unexpected output from Ruby app: ' + output));
            });

            ruby.stderr.on('data', function (data) {
                console.log('STDERR', data.toString());
            });

            ruby.on('error', done);
        },

        // establish dnode connection to the ruby process, then emit ready
        function (port, done) {
            var d = dnode.connect(port);

            d.on('remote', function (remote) {
                self.remote = remote;
                self.emit('ready');
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

util.inherits(Sass, EventEmitter);


Sass.prototype.compile = function (filename, callback) {
    var err = null;
    var response = null;

    if (!this.remote) throw new Error('.compile() called before ready event emitted');

    this.remote.f(filename, function (response) {
        var err = null;
        if (response.error) {
            err = new Sass.CompilationError(response.message, response.sass_backtrace);
        }

        callback(err, response.css/*, response.map || null*/);
    });
};


module.exports = Sass;


Sass.CompilationError = function (message, backtrace) {
    Error.call(this);

    this.name = 'SassCompilationError';
    this.message = message;

    this.stack = this.message + backtrace.map(function (trace) {
        return '\n    at ' + trace.filename + ':' + trace.line;
    }).join('');
};
util.inherits(Sass.CompilationError, Error);
