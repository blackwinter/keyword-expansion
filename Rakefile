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

bak = File.join('tmp', json)
xpi = "#{id}-#{version}.xpi"
rdf = "#{id}-#{version}.update.rdf"
sgn = "#{name.tr('-', '_')}-#{version}-fx+an.xpi"

CLOBBER.include('*.{xpi,update.rdf}', bak)

test_re = %r{^/*(.*test-bookmarks)}

task clean: 'testing:disable'

desc 'Run program'
task run: %w[testing:enable jpm:run clean]

desc 'Run tests'
task test: %w[clean jpm:test]

desc 'Generate xpi'
task xpi: %w[clean package:update jpm:xpi package:restore]

desc 'Sign xpi'
task sign: %w[clean package:update jpm:sign package:restore]

desc 'Upload xpi'
task upload: %w[xpi sign] do
  require 'net/scp'

  remote = URI(remote_target)
  base = File.join(remote_root, remote.path, name)

  Net::SCP.start(remote.host, remote_user) { |scp|
    scp.upload!(rdf, "#{base}.update.rdf")
    scp.upload!(sgn, "#{base}.xpi")
  }
end

desc "Release #{name}"
task release: %w[upload tag]

task :tag do
  sh 'git', 'tag', '-f', "v#{version}"
end

namespace :testing do
  { enable: '', disable: '//' }.each { |t, s| task(t) {
    File.write(main, File.read(main).sub(test_re, s + '\1'))
  } }
end

namespace :package do

  task :update do
    abort "Backup already exists: #{bak}" if File.exist?(bak)
    cp json, bak

    base = File.join(remote_target, name)

    File.write(json, JSON.generate(conf.merge(
      'updateUrl'  => "#{base}.update.rdf",
      'updateLink' => "#{base}.xpi"
    )))
  end

  task :restore do
    abort "Backup not found: #{bak}" unless File.exist?(bak)
    mv bak, json
  end

end

namespace :jpm do
  %w[run test xpi].each { |t| task(t) { jpm(t) } }

  task :sign do
    api = ENV.values_at(*%w[AMO_API_KEY AMO_API_SECRET])
    api.any?(&:nil?) ? warn("AMO API Key/Secret missing") :
      jpm(:sign, *%w[--api-key --api-secret].zip(api).flatten)
  end

  define_singleton_method(:jpm) { |cmd, *args|
    sh 'jpm', cmd.to_s, '-b', firefox, *args
  }
end
