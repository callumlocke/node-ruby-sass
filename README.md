# node-ruby-sass

[![Build Status](https://secure.travis-ci.org/callumlocke/node-ruby-sass.png?branch=master)](http://travis-ci.org/callumlocke/node-ruby-sass)

**WORK IN PROGRESS...**

This Node module is an attempt to provide a faster binding to Ruby Sass than currently available.

Explanation: Sass in a Rails app with LiveReload seems much faster than things like [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass). I'm guessing this is because Rails runs Sass using the same Ruby process every compile, avoiding Ruby spin-up time, and benefiting from in-memory caching. This module tries to do something similar. Benchmarks to follow.


## Installation

```sh
$ npm install ruby-sass
```

## Usage

```js
var Sass = require('ruby-sass');

var sass = new Sass(options);

sass.on('ready', function () {
    // this instance now has its own ruby process ready to repeatedly compile sass/scss files.

    sass.compile('path/to/something.scss', function (err, css) {
        // got the css (or an error with a *sass* stack trace)
    });
});
```


## To do

- source maps
- write benchmarks
- see if repeat runs on the same file are actually any faster. if not, look at using Sass::Plugin?
- make post install script to check if required gems are installed and print instructions to install them (or just install them?)


## Licence

MIT
