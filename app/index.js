'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var rimraf = require('rimraf');


var WdSGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous wd_s generator!'));

    var prompts = [
      {
        type: 'input',
        name: 'themename',
        message: 'The project name',
        default: this.appname
      },
      {
        name: 'themeuri',
        message: 'What is the URL of your theme?',
        default: 'http://webdevstudios.com'
      },
      {
        name: 'author',
        message: 'What is your name?',
        default: 'WebDevStudios'
      },
      {
        name: 'authoruri',
        message: 'What is your URL?',
        default: 'http://webdevstudios.com/'
      },
      {
        name: 'themedescription',
        message: 'Enter the theme description:',
        default: 'A starter theme based on wd_s'
      },
    ];

    this.prompt(prompts, function (props) {
      this.themename = props.themename;
      this.themeuri = props.themeuri;
      this.author = props.author;
      this.authoruri = props.authoruri;
      this.themedescription = props.themedescription;

      done();
    }.bind(this));
  },

  cloneRepo: function() {
    var done = this.async(),
        clone,
        pull,
        update;

    if ( this.src.exists( 'package.json' ) ) {
      this.log( 'Updating wd_s from GitHub...' );
      pull = this.spawnCommand( 'git', ['pull', '--recurse-submodules', '-q'], { cwd: this.sourceRoot() } );
      pull.on( 'close', function() {
        update = this.spawnCommand( 'git', ['submodule', 'update', '--recursive', '-q'], { cwd: this.sourceRoot() } );

        update.on( 'close', function() {
          done();
        });
      }.bind( this ));
    } else {
      this.log( 'Cloning wd_s from GitHub...' );
      clone = this.spawnCommand( 'git', ['clone', '--recursive', 'git@github.com:WebDevStudios/wd_s.git', '.', '-q'], { cwd: this.sourceRoot() } );

      clone.on( 'close', function() {
        done();
      }.bind( this ));
    }
  },

  getFiles: function () {
    var files   = this.expandFiles('**/*', { cwd: this.sourceRoot(), dot: true }),
        self    = this,
        ignores = [
          'LICENSE',
          'README.md',
        ];

    this.package = JSON.parse(this.src.read( 'package.json' ));

    this.log.writeln('Generating from ' + 'WD_S' + ' v' + this.package.version + '...');

    files.forEach(function(file) {
      if (ignores.indexOf(file) !== -1 || file.indexOf( '.git/' ) !== -1 ) {
        return;
      }

      if ( file.indexOf( '.php' ) > -1 || file.indexOf( '.css'  ) > -1 || file.indexOf( '.scss'  ) > -1 || file.indexOf( '.js'  ) > -1 ) {
        var result = self.read( file );
        result = result.replace( /Text Domain: _s/g, 'Text Domain: ' + self._.slugify(self.themename));
        result = result.replace( /'_s'/g, '\'' + self._.slugify(self.themename) + '\'');
        result = result.replace( /_s_/g, self._.underscored(self._.slugify(self.themename)) + '_');
        result = result.replace( / _s/g, ' ' + self.themename);
        result = result.replace( /_s /g, self.themename + ' ');
        result = result.replace( /\/_s/g, '/' + self.themename );
        result = result.replace( /_s-/g, self._.slugify(self.themename) + '-');
        
        if ( file.indexOf( 'style.scss' ) > -1 ) {
          self.log.info( 'Updating theme information in ' + file );
          result = result.replace( /(Theme Name: )(.+)/g, '$1' + self.themename );
          result = result.replace( /(Theme URI: )(.+)/g, '$1' + self.themeuri );
          result = result.replace( /(Author: )(.+)/g, '$1' + self.author );
          result = result.replace( /(Author URI: )(.+)/g, '$1' + self.authoruri );
          result = result.replace( /(Description: )(.+)/g, '$1' + self.themedescription );
          result = result.replace( /(Version: )(.+)/g, '$10.0.1' );
        }

        if ( file == 'package.json' ) {
          self.log.info( 'Updating package information in ' + file );

          result = result.replace( /("name": )(.+)/g, '$1"' + self.themename + '",' );
          result = result.replace( /("description": )(.+)/g, '$1"' + self.themedescription + '",' );
          result = result.replace( /("version": )(.+)/g, '$1"0.0.1",' );
          result = result.replace( /("author": )(.+)/g, '$1"' + self.author + '",' );
          result = result.replace( /("homepage": )(.+)/g, '$1"' + self.themeuri + '",' );
          result = result.replace( /("bugs": )(.+)/g, '$1"",' );
          result = result.replace( /("url": )(.+)/g, '$1""' );
        }

        self.write( file.replace( '/_s', '/' + this.themename ), result );
      } else {
        // Copy over files substituting the theme name.
        this.copy( file, file.replace( '/_s', '/' + this.themename ) );
      }
    }, this);
  },
});

module.exports = WdSGenerator;
