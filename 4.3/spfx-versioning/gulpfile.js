'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');

build.initialize(gulp);

// custom task for version syncing
gulp.task('version-sync', function () {
    const gulpUtilities = require('gulp-util');
    const fs = require('fs'); // file system utils

    var pkgJson = require('./package.json');
    var pkgSolutionJson = require('./config/package-solution.json');

    var newSPFxVersion = pkgJson.version.split('-')[0] + '.0';
    gulpUtilities.log(`Changing SOLUTION version from ${pkgSolutionJson.solution.version} to ${newSPFxVersion}`);
    pkgSolutionJson.solution.version = newSPFxVersion;

    if (pkgSolutionJson.solution.features != null) {
        for (var i = 0; i < pkgSolutionJson.solution.features.length; i++) {
            var currentFeature = pkgSolutionJson.solution.features[i];
            gulpUtilities.log(`Changing FEATURE "${currentFeature.title}" version from ${currentFeature.version} to ${newSPFxVersion}`);
            currentFeature.version = newSPFxVersion;
        }
    }

    fs.writeFile(
        './config/package-solution.json', 
        JSON.stringify(pkgSolutionJson, null, 4));
});