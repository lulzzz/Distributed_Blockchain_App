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
			dist: ["client/**/*.js"]
		},
		concat: {
			dist: {
				src: ["client/**/*.js"],
				dest: "dist/client/js/script.js"
			}
		},
		uglify: {
			options: {
				sourceMap: true,
				sourceMapName: 'dist/client/js/scriptMap.map',
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
				src: ["dist/client/js/script.js"],
				dest: "dist/client/js/script-min.js"
			}
		},
		copy: {
			dist: {
				src: ["client/asset/css/*", "client/asset/data/*", "client/asset/images/*"],
				dest: "dist/"
			}
		},
		watch: {
			scripts: {
				files: ['client/**/*.js', 'client/**/*.html', 'client/**/*.less'],
				tasks: ['concat', 'uglify', 'less', 'copy', 'cssmin'],
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
					"client/asset/css/style.css": "client/asset/css/style.less"  // destination file and source file
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
					'dist/client/asset/css/style.min.css': ['client/asset/**/*.css']
				}
			}
		},
		browserSync: {
            dev: {
                bsFiles: {
                    src: ["./client/**/*.css", "./client/**/*.js", "./client/*.js", "./client/**/*.html", "./client/*.html", "./*.ico"]
                },
                options: {
                    watchTask: true
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
	grunt.loadNpmTasks('grunt-browser-sync');

	grunt.task.registerTask("build", ["clean", "less", "browserSync", "cssmin", "concat", "uglify", "copy", "watch"]);

}
