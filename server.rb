require 'rubygems'
require 'sass'
require 'dnode'
require 'json'

$port = Integer(ARGV[0])

# NOTE - can't work out why this won't work when placed at the bottom, but
# seems to work here anyway for some reason...
STDOUT.write "ready\n"
STDOUT.flush


DNode.new({
  :f => proc { |request, cb|

    file = request[:file]
    options = request[:options]

    engine = Sass::Engine.for_file file, options

    begin
      cb.call({
        file: file,
        css: engine.render
      })
    rescue Sass::SyntaxError => e
      cb.call({
        file: file,
        error: true,
        message: e.message,
        sass_line: e.sass_line,
        sass_template: e.sass_template,
        sass_backtrace: e.sass_backtrace
      })
    end
  }
}).listen($port)
