module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    nggettext_extract: {
      pot: {
        files: {
          'po/template.pot': ['views/**/*.html']
        }
      },
    },
    nggettext_compile: {
    all: {
      files: {
        'js/languages/translation.js': ['po/*.po']
      }
    },
  },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-angular-gettext');

  // Default task(s).
  grunt.registerTask('default', ['nggettext_extract']);
  grunt.registerTask('translate:extract', ['nggettext_extract']);
  grunt.registerTask('translate:compile', ['nggettext_compile']);

};
