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
  :f => proc { |options, cb|

    file = options[:filename]

    real_options = if options[:sourcemap]
      css_path = file.sub(/[^.]+\z/, "css")
      sourcemap_path = "#{css_path}.map"

      {
        sourcemap: true,
        sourcemap_filename: sourcemap_path,
        css_path: css_path,
      }
    else
      {

      }
    end

    engine = Sass::Engine.for_file file, real_options

    # STDERR.write String(options[:sourcemap])
    # STDERR.flush

    begin
      if real_options[:sourcemap] == true
        css, sourcemap = engine.render_with_sourcemap(File.basename(sourcemap_path))

        cb.call({
          file: file,
          css: css,
          sourcemap: sourcemap.to_json({
            css_path: css_path,
            sourcemap_path: sourcemap_path
          })
        })
      else
        css = engine.render

        cb.call({
          file: file,
          css: css
        })
      end
    rescue Sass::SyntaxError => e

      cb.call({
        file: file,
        error: e.message,
        sass_line: e.sass_line,
        sass_template: e.sass_template,
        sass_backtrace: e.sass_backtrace
      })

    end
  }
}).listen($port)
