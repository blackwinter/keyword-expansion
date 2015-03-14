require 'rake/clean'
require 'json'
require 'uri'

addon_sdk_local, addon_sdk_url = 'addon-sdk', ENV['ADDON_SDK_URL'] ||
  'https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.tar.gz'

addon_sdk = File.expand_path(ENV['ADDON_SDK'] || '~/vendor/addon-sdk')
addon_sdk = addon_sdk_local unless File.directory?(addon_sdk)

remote_target = ENV['REMOTE_TARGET'] || 'https://blackwinter.de/addons'
remote_user   = ENV['REMOTE_USER']   || ENV['USER']

main, test_re = 'lib/main.js', %r{^/*(.*test-bookmarks)}

config = JSON.parse(File.read('package.json'))

name = config['name']
glob = "#{name}.{xpi,update.rdf}"

CLOBBER.include(glob)
CLEAN.include('C:\nppdf32Log\debuglog.txt')

task clean: 'testing:disable'

desc 'Run program'
task run: %w[testing:enable cfx:run clean]

desc 'Run tests'
task test: %w[addon_sdk clean cfx:test]

desc 'Generate xpi'
task xpi: %w[clean cfx:xpi]

desc 'Upload xpi'
task upload: :xpi do
  require 'net/scp'

  remote = URI(remote_target)

  Net::SCP.start(remote.host, remote_user) { |scp| Dir[glob].each { |file|
    scp.upload!(file, File.join('/var/www', remote.path))
  } }
end

desc "Release #{name}"
task release: %w[test upload tag]

task :tag do
  sh 'git', 'tag', '-f', "v#{config['version']}"
end

namespace :testing do
  { enable: '', disable: '//' }.each { |t, s| task(t) {
    File.write(main, File.read(main).sub(test_re, s + '\1'))
  } }
end

namespace :cfx do
  %w[run test].each { |t| task(t) { cfx(t) } }

  task :xpi do
    base = File.join(remote_target, name)

    cfx :xpi,
      '--update-link', "#{base}.xpi",
      '--update-url',  "#{base}.update.rdf"
  end

  class << self; self; end.send(:define_method, :cfx) { |*args|
    sh %Q{cd #{addon_sdk} && . bin/activate && cd - && cfx #{args.join(' ')}}
  }
end

file addon_sdk_file = File.basename(addon_sdk_url) do
  sh 'wget', addon_sdk_url
end

file addon_sdk_local => addon_sdk_file do
  sh 'tar', 'xf', addon_sdk_file

  if addon_sdk_dir = Dir[addon_sdk_local + '*'].first
    mv addon_sdk_dir, addon_sdk_local
  else
    abort "No such directory: #{addon_sdk_local}"
  end
end

task addon_sdk: File.directory?(addon_sdk) ? [] : addon_sdk_local

CLOBBER.include(addon_sdk_local)
CLEAN.include(addon_sdk_file)
