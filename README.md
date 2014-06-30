# node-ruby-sass

**WORK IN PROGRESS...**

This Node module is an attempt to provide a faster binding to Ruby Sass than currently available.

Sass when used as part of a Rails app seems extremely fast compared to when using things like [gulp-ruby-sass](#) etc. I'm assuming this is because Rails uses a long-running Ruby process, thus avoiding having a Ruby spin-up penalty on every Sass compile, and benefiting from in-memory caching.

This module tries to imitate the same approach in the hope it will be faster. Benchmarks to follow.


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


## Licence

MIT
