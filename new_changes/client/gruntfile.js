/*
**	gruntfile.js for automating project task.
*	Tasks : Copying, Concatination, Minification, Watch, Less conversion, browser synchronization
*/


"use strict";

//Exporting project level automation configuration
module.exports = function (grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			dist: ["dist/"]
		},
		jshint: {
			dist: ["src/**/*.js"]
		},
		concat: {
			dist: {
				src: ["src/**/*.js"],
				dest: "dist/src/js/script.js"
			}
		},
		uglify: {
			options: {
				sourceMap: true,
				sourceMapName: 'dist/src/js/scriptMap.map',
				banner: '/*! Application : <%= pkg.name %>        '
							+'Version : <%= pkg.version %>        '
							+'Description : <%= pkg.description %>          ' 
							+'Author : <%= pkg.author %>           '
							+'License : <%= pkg.license %>         '
							+'Created at : <%= grunt.template.today("yyyy-mm-dd") %> */',
				compress: {
					drop_console: true,
					global_defs: {
						'DEBUG': false
					},
					dead_code: true
				}
			},
			dist: {
				src: ["dist/src/js/script.js"],
				dest: "dist/src/js/script-min.js"
			}
		},
		copy: {
			dist: {
				src: ["src/asset/css/*", "src/asset/data/*", "src/asset/images/*"],
				dest: "dist/"
			}
		},
		watch: {
			scripts: {
				files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.less'],
				tasks: ['concat', 'uglify'],
				options: {
					spawn: false,
				},
			},
		},
		less: {
			dev: {
				options: {
					compress: false,   // Compress output by removing some whitespaces.
					optimization: 2,  // Set the parser's optimization level. The lower the number, the less nodes it will create in the tree. 
					ieCompat: true    // Enforce the CSS output is compatible with Internet Explorer 8.
				},
				files: {
					"src/asset/css/style.css": "src/asset/css/style.less"  // destination file and source file
				},
				tasks: ['cssmin']
			}
		},
		cssmin: {
			dist: {
				options: {
					shorthandCompacting: false,
					roundingPrecision: -1
				},
				files: {
					'dist/src/asset/css/style.min.css': ['src/asset/**/*.css']
				}
			}
		}

	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	//grunt.loadNpmTasks('grunt-browser-sync');

	grunt.task.registerTask("build", ["clean", "less", "cssmin", "concat", "uglify", "copy", "watch"]);

}
