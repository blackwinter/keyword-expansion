require 'rake/clean'
require 'json'
require 'uri'

firefox = ENV['JPM_FIREFOX_BINARY'] || %x{which firefox}.chomp

remote_target = ENV['REMOTE_TARGET'] || 'https://blackwinter.de/addons'
remote_root   = ENV['REMOTE_ROOT']   || '/var/www/html'
remote_user   = ENV['REMOTE_USER']   || ENV['USER']

json = 'package.json'
conf = JSON.parse(File.read(json))

id, name, version, main = conf
  .values_at(*%w[id name version main])

xpi = "#{id}-#{version}.xpi"
rdf = "#{id}-#{version}.update.rdf"
sgn = "#{name.tr('-', '_')}-#{version}-fx.xpi"

CLOBBER.include('*.{xpi,update.rdf}', 'tmp/*.bak')

test_re = %r{^/*(.*test-bookmarks)}

file xpi do
  Rake.application.invoke_task('jpm:xpi')
end

file rdf => xpi

file sgn => xpi do
  Rake.application.invoke_task('jpm:sign')
end

desc 'Run program'
task run: 'jpm:run'

desc 'Run tests'
task test: 'jpm:test'

desc 'Generate xpi'
task xpi: xpi

desc 'Sign xpi'
task sign: sgn

desc 'Upload xpi'
task upload: [rdf, sgn] do
  require 'net/scp'

  remote = URI(remote_target)
  base = File.join(remote_root, remote.path, name)

  Net::SCP.start(remote.host, remote_user) { |scp|
    scp.upload!(rdf, "#{base}.update.rdf")
    scp.upload!(sgn, "#{base}.xpi")
  }
end

task :tag do
  sh 'git', 'tag', '-f', "v#{version}"
end

desc "Release #{name}"
task release: %w[upload tag]

namespace :jpm do

  task :run do
    testing { jpm :run }
  end

  task :test do
    jpm :test
  end

  task :xpi do
    update { jpm :xpi }
  end

  task :sign do
    args = ENV.values_at(*%w[AMO_API_KEY AMO_API_SECRET])
    abort "AMO API Key/Secret missing" if args.any?(&:nil?)

    args << xpi
    update { jpm(:sign, *%w[--api-key --api-secret --xpi].zip(args).flatten) }
  end

  define_singleton_method(:jpm) { |cmd, *args|
    sh 'jpm', cmd.to_s, '-b', firefox, *args
  }

  define_singleton_method(:backup) { |file, &block|
    bak = File.join('tmp', "#{file}.bak")
    abort "Backup already exists: #{bak}" if File.exist?(bak)

    begin
      cp file, bak
      block.call
    ensure
      mv bak, file
    end
  }

  define_singleton_method(:testing) { |&block| backup(main) {
    File.write(main, File.read(main).sub(test_re, '\1'))
    block.call
  } }

  define_singleton_method(:update) { |&block| backup(json) {
    base = File.join(remote_target, name)

    File.write(json, JSON.generate(conf.merge(
      'updateURL'  => "#{base}.update.rdf",
      'updateLink' => "#{base}.xpi"
    )))

    block.call
  } }

end
