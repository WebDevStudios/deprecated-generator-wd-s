'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');


var WdSGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous wd_s generator!'));

    var prompts = [
      {
        type: 'input',
        name: 'themename',
        message: 'Enter the project name?',
        default: this.appname
      },
       {
        type: 'input',
        name: 'shortname',
        message: 'Enter the shortened project name?',
        default: function( props ) {
          return this._.slugify( props.themename );
        }.bind(this)
      },
      {
        name: 'themeuri',
        message: 'Enter the URI of your theme?',
        default: 'http://webdevstudios.com'
      },
      {
        name: 'author',
        message: 'Enter the  Author name?',
        default: 'WebDevStudios'
      },
      {
        name: 'authoruri',
        message: 'Enter the Author URI?',
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
      this.shortname = this._.slugify( props.shortname );
      this.themeuri = props.themeuri;
      this.author = props.author;
      this.authoruri = props.authoruri;
      this.themedescription = props.themedescription;

      done();
    }.bind(this));
  },

  _textReplace: function( file ) {
    var result = this.read( file );

    result = result.replace( /Text Domain: _s/g, 'Text Domain: ' + this.shortname);
    result = result.replace( /wds_/g, this._.underscored(this.shortname) + '_');
    result = result.replace( /'_s'/g, '\'' + this.shortname + '\'');
    result = result.replace( /_s_/g, this._.underscored(this.shortname) + '_');
    result = result.replace( / _s/g, ' ' + this.shortname);
    result = result.replace( /_s /g, this.shortname + ' ');
    result = result.replace( /\/_s/g, '/' + this.shortname );
    result = result.replace( /_s-/g, this.shortname + '-');
    result = result.replace( /_S_/g, this._.titleize( this.shortname ).replace( '-', '_' ) + '_' );
    result = result.replace( /_S /g, this._.titleize( this.shortname ).replace( '-', '_' ) + ' ' );

    if ( file.indexOf( 'style.scss' ) > -1 ) { // Do style header replacements
      this.log.info( 'Updating theme information in ' + file );
      result = result.replace( /(Theme Name: )(.+)/g, '$1' + this.themename );
      result = result.replace( /(Theme URI: )(.+)/g, '$1' + this.themeuri );
      result = result.replace( /(Author: )(.+)/g, '$1' + this.author );
      result = result.replace( /(Author URI: )(.+)/g, '$1' + this.authoruri );
      result = result.replace( /(Description: )(.+)/g, '$1' + this.themedescription );
      result = result.replace( /(Version: )(.+)/g, '$10.0.1' );
    }

    if ( file == 'package.json' ) { // Do package.json replacements
      this.log.info( 'Updating package information in ' + file );

      result = result.replace( /("name": )(.+)/g, '$1"' + this._.slugify( this.themename ) + '",' );
      result = result.replace( /("description": )(.+)/g, '$1"' + this.themedescription + '",' );
      result = result.replace( /("version": )(.+)/g, '$1"0.0.1",' );
      result = result.replace( /("author": )(.+)/g, '$1"' + this.author + '",' );
      result = result.replace( /("homepage": )(.+)/g, '$1"' + this.themeuri + '",' );
      result = result.replace( /("bugs": )(.+)/g, '$1"",' );
      result = result.replace( /("url": )(.+)/g, '$1""' );
    }

    return result;
  },

  writing: {
    cloneRepo: function() {
      var done = this.async(),
          clone,
          clear,
          pull,
          update;

      var cmdError = function(code, signal) {
        this.log( 'ERROR CAUGHT: ' + signal );
        this.log( code );
      }.bind(this);

      if ( this.src.exists( 'package.json' ) ) {
        this.log( 'Updating wd_s from GitHub...' );
        pull = this.spawnCommand( 'git', ['pull', '--recurse-submodules', '-q'], { cwd: this.sourceRoot() } );
        pull.on( 'close', function() {
          update = this.spawnCommand( 'git', ['submodule', 'update', '--recursive', '-q'], { cwd: this.sourceRoot() } );

          update.on( 'error', cmdError );

          update.on( 'close', function() {
            done();
          });
        }.bind( this ));
      } else {
        clear = this.spawnCommand( 'rm', ['-f', '.keep'], { cwd: this.sourceRoot() } );
        clear.on( 'error', cmdError );

        clear.on( 'close', function() {
          this.log( 'Cloning wd_s from GitHub...' );
          clone = this.spawnCommand( 'git', ['clone', '--recursive', 'git@github.com:WebDevStudios/wd_s.git', '.', '-q'], { cwd: this.sourceRoot() } );

          clone.on( 'error', cmdError );

          clone.on( 'close', function() {
            done();
          }.bind( this ));
        }.bind(this));
      }
    },

    doFiles: function () {
      var files   = this.expandFiles('**/*', { cwd: this.sourceRoot(), dot: true }),
          self    = this,
          ignores = [
            'LICENSE',
            'README.md',
            '.keep'
          ];

      this.package = JSON.parse(this.src.read( 'package.json' ));

      this.log.writeln('Generating from ' + 'WD_S' + ' v' + this.package.version + '...');

      files.forEach(function(file) {
        if (ignores.indexOf(file) !== -1 || file.indexOf( '.git/' ) !== -1 ) {
          return; // Don't copy over git folder or other ignored files
        }

        if ( file.indexOf( '.php' ) > -1 || file.indexOf( '.css'  ) > -1 || file.indexOf( '.scss'  ) > -1 || file.indexOf( '.js'  ) > -1 ) {
          var result = self._textReplace( file );

          self.write( file.replace( /\/_s|\/_wds/g, '/' + self.shortname ), result );
        } else {
          // Copy over files substituting the theme name.
          self.copy( file, file.replace( /\/_s|\/_wds/g, '/' + self.shortname ) );
        }
      }, this);
    }
  }
});

module.exports = WdSGenerator;
