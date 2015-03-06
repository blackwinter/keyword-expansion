require 'rake/clean'
require 'net/scp'
require 'json'
require 'uri'

ADDON_SDK = File.expand_path(ENV['ADDON_SDK'] || '~/vendor/addon-sdk')

remote_target = ENV['REMOTE_TARGET'] || 'https://blackwinter.de/addons'
remote_user   = ENV['REMOTE_USER']   || ENV['USER']

main, test_re = 'lib/main.js', %r{^/*(.*test-bookmarks)}

config = JSON.parse(File.read('package.json'))
CLOBBER.include(files = "#{name = config['name']}.{xpi,update.rdf}")

namespace :testing do
  { enable: '', disable: '//' }.each { |t, s| task(t) {
    File.write(main, File.read(main).sub(test_re, s + '\1'))
  } }
end

task clean: 'testing:disable'

desc 'Run program'
task run: 'testing:enable' do
  cfx :run
  rm_f 'C:\nppdf32Log\debuglog.txt', verbose: false
end

desc 'Run tests'
task test: 'testing:disable' do
  cfx :test
end

desc 'Generate xpi'
task :xpi do
  base = File.join(remote_target, name)

  cfx :xpi,
    '--update-link', "#{base}.xpi",
    '--update-url',  "#{base}.update.rdf"
end

desc 'Upload xpi'
task upload: :xpi do
  remote = URI(remote_target)

  Net::SCP.start(remote.host, remote_user) { |scp| Dir[files].each { |file|
    scp.upload!(file, File.join('/var/www', remote.path))
  } }
end

desc "Release #{name}"
task release: %w[test upload tag]

task :tag do
  sh 'git', 'tag', '-f', "v#{config['version']}"
end

def cfx(*args)
  sh %Q{cd #{ADDON_SDK} && . bin/activate && cd - && cfx #{args.join(' ')}}
end
