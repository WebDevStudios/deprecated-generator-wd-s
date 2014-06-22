'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');


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

  getFiles: function () {
    var files   = this.expandFiles('**/*', { cwd: this.sourceRoot(), dot: true });
    var ignores = [
      '.git',
      'LICENSE',
      'README.md',
    ];

    this.package = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

    this.log.writeln('Generating from ' + 'WD_S'.cyan + ' v' + this.package.version.cyan + '...');

    files.forEach(function(file) {
      if (ignores.indexOf(file) !== -1) {
        return;
      }

      this.copy(file, file);
    }, this);
  },

  renameFiles: function() {
    var filesToRename = this.expand( '**/_s*' ),
        fileToRename,
        oldSourceRoot = this.sourceRoot();
    
    this.sourceRoot( this.destinationRoot() );
    for ( var i = 0; i < filesToRename.length; i += 1 ) {
      fileToRename = filesToRename[i];
      this.copy( fileToRename, fileToRename.replace('/_s', '/' + this.themename ) );
      this.dest.delete( fileToRename );
    }
    this.sourceRoot( oldSourceRoot );
  },

  projectfiles: function () {
    //this.copy('editorconfig', '.editorconfig');
    //this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = WdSGenerator;
