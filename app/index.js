'use strict';
var yeoman = require('yeoman-generator');
var chalk  = require('chalk');
var yosay  = require('yosay');
var git    = require('nodegit');
module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the killer ' + chalk.blue('WD_s') + ' generator!'
    ));

    var prompts = [{
      type: 'text',
      name: 'name',
      message: 'Project Title',
      default: 'WDS Project Title'
    },{
      type: 'text',
      name: 'shortname',
      message: 'Slug',
      default: function(props){
        return this._.slugify( props.name );
      }.bind(this)
    },{
      type: 'text',
      name: 'uri',
      message: 'Project URI',
      default: 'http://webdevstudios.com'
    },{
      type: 'text',
      name: 'author',
      message: 'Author',
      default: 'WebDevStudios',
      save: true
    },{
      type: 'text',
      name: 'authoruri',
      message: 'Author URI',
      default: 'http://webdevstudios.com',
      save: true
    },{
      type: 'text',
      name: 'description',
      message: 'Description',
      default: 'A new WD_s project!'
    }];

  this.prompt(prompts, function (props) {
      this.name = props.name;
      this.slug = this._.slugify( props.slug );
      this.uri  = props.uri;
      this.author = props.author;
      this.authoruri = props.authoruri;
      this.description = props.description;

      done();
    }.bind(this));
  },

  writing: {
    git: function() {
      var done = this.async();
      this.log('Starting Git repo in ' + this.destinationPath());

      git.Repository.init( this.destinationPath(), 0 )
        .then(function(repo){
          this.log('Git repo initialized');
          console.log( repo.path() );

          this.repo = repo;

          done();
        }.bind(this));
    },

    projectfiles: function () {
      this.log('Setting up project configurations');
      this.fs.copy(
        this.templatePath('_gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copyTpl(
        this.templatePath('composer.json'),
        this.destinationPath('composer.json'),
        this
      );
    },

    muPlugins: function() {
      var done = this.async();
      this.log('Installing mu-plugins');

      this.fs.copyTpl(
        this.templatePath('mu-plugins/mu-plugins-include.php'),
        this.destinationPath('mu-plugins/mu-plugins-include.php'),
        this
      );

      var modules = [{
            name: 'cmb2',
            url:  'https://github.com/WebDevStudios/CMB2.git'
          },{
            name: 'cpt-core',
            url:  'https://github.com/WebDevStudios/CPT_Core.git'
          },{
            name: 'taxonomy-core',
            url:  'https://github.com/WebDevStudios/Taxonomy_Core.git'
          },{
            name: 'wds-required-plugins',
            url:  'https://github.com/WebDevStudios/WDS-Required-Plugins.git'
          }],
          i = -1,
          subRepo;

      var nextModule = function() {
        i += 1;
        if ( i >= modules.length ) {
          done();
          return;
        }
        this.spawnCommand('git', ['submodule', 'add', modules[i].url, 'mu-plugins/' + modules[i].name ] ).on( 'close', nextModule );
      }.bind(this);

      nextModule();
    },

    theme: function() {
      this.log('Installing theme');
    }
  },

  install: function () {
    if ( ! this.options['skip-install'] ) {
      this.spawnCommand('composer', ['install'] );
    }
  }
});
