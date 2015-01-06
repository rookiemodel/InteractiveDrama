module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                    'js/lexus/Application.js',
                    'js/lexus/model/nteractivedrama/InteractivedramaModel.js',
                    'js/lexus/collection/interactivedrama/InteractivedramaCollection.js',
                    'js/lexus/view/interactivedrama/InteractivedramaView.js',
                    'js/libs/plugins.js',
                    'js/config.js'
                ],
                dest: 'js/dist/<%= pkg.name %>.js'
            }
        },
		requirejs: {
			compile: {
				options: {
					mainConfigFile: "js/config.js", 
					baseUrl: 'js/lexus', 
					name: 'Application', 
					include: ['../config'],
					out: 'js/dist/<%= pkg.name %>.min.js'
				}
			}
		}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.registerTask('default', ['concat', 'requirejs']);
}