require 'rake/clean'
require 'json'
require 'uri'

remote_target = ENV['REMOTE_TARGET'] || 'https://blackwinter.de/addons'
remote_root   = ENV['REMOTE_ROOT']   || '/var/www/html'
remote_user   = ENV['REMOTE_USER']   || ENV['USER']

build_args = %w[-a . -i *.md Rakefile]

json = 'manifest.json'
conf = JSON.parse(File.read(json))

name, version = conf.values_at(*%w[name version])
name.downcase!.tr!(' ', '-')

zip = "#{name}-#{version}.zip"
xpi = "#{name.tr('-', '_')}-#{version}-an+fx.xpi"

CLOBBER.include('*.{zip,xpi}')

file zip do
  Rake.application.invoke_task('we:build')
end

file xpi do
  Rake.application.invoke_task('we:sign')
end

desc "Run firefox with #{name}"
task run: 'we:run'

desc "Check #{name} source"
task lint: 'we:lint'

desc "Generate #{zip}"
task build: zip

desc "Generate #{xpi}"
task sign: xpi

desc "Upload #{xpi}"
task upload: xpi do
  require 'net/scp'

  remote = URI(remote_target)
  base = File.join(remote_root, remote.path, name)

  Net::SCP.start(remote.host, remote_user) { |scp|
    scp.upload!(xpi, "#{base}.xpi")
  }
end

task :tag do
  sh 'git', 'tag', '-f', "v#{version}"
end

desc "Release #{name} v#{version}"
task release: %w[upload tag]

namespace :we do

  def we(*args); sh 'web-ext', *args.map(&:to_s); end

  %w[run lint].each { |cmd| task(cmd) { we(cmd) } }

  task :build do we :build, *build_args end

  task :sign do
    args = ENV.values_at(*%w[AMO_API_KEY AMO_API_SECRET])
    abort "AMO API Key/Secret missing" if args.any?(&:nil?)
    we :sign, *%w[--api-key --api-secret].zip(args).flatten + build_args
  end

end
