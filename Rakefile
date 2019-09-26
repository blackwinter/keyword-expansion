require 'rake/clean'
require 'json'
require 'uri'

file xpi = "#{JSON.parse(File.read('package.json'))['name']}.xpi" do
  sh 'jpm', 'xpi', '-b', ENV['JPM_FIREFOX_BINARY'] || %x{which firefox}.chomp
end

desc 'Generate xpi'
task xpi: xpi

desc 'Upload xpi'
task upload: xpi do
  require 'net/scp'

  remote = URI(ENV['REMOTE_TARGET'] || 'https://blackwinter.de/addons')

  Net::SCP.start(remote.host, ENV['REMOTE_USER'] || ENV['USER']) { |scp|
    scp.upload!(xpi, File.join(ENV['REMOTE_ROOT'] || '/var/www/html', remote.path, xpi)) }
end

CLOBBER.include(xpi)
