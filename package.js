Package.describe({
  name: 'rkstar:twitter',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'A simple wrapper for the twit npm package',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2')

  Npm.depends({
    'twit': '2.1.0'
  })

  api.use('service-configuration', 'server')
  api.use('underscore', 'server')

  api.addFiles('twitter.js', 'server')
})