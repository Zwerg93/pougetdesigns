const gulp = require('gulp');

async function optimizeImages() {
    const imagemin = await import('gulp-imagemin');
    return gulp.src('dist/*.{jpg,jpeg,png,webp}')
        .pipe(imagemin.default())
        .pipe(gulp.dest('www'));
}

async function optimizeJS() {
    const terser = require('gulp-terser');
    try {
        return gulp.src('dist/*.js')
            .pipe(terser())
            .pipe(gulp.dest('www'));
    } catch (error) {
        console.error("Error optimizing JS:", error);
        // Optional: Force a stream to end
        return Promise.resolve();
    }
}

async function optimizeCSS() {
    const cleanCSS = await import('gulp-clean-css');
    return gulp.src('dist/*.css')
        .pipe(cleanCSS.default())
        .pipe(gulp.dest('www')); // Zielordner bleibt www
}

async function optimizeHTML() {
    const htmlmin = await import('gulp-htmlmin');
    return gulp.src('dist/index.html') // Index-HTML-Datei aus dist
        .pipe(htmlmin.default({ collapseWhitespace: true, removeComments: true })) // HTML optimieren
        .pipe(gulp.dest('www')); // Zielordner bleibt www
}

// Optimierungs-Aufgabe
gulp.task('optimize', gulp.series(optimizeJS, optimizeCSS, optimizeHTML));

// Watch-Task
gulp.task('watch', () => {
    gulp.watch('dist/*.js', optimizeJS);
    gulp.watch('dist/*.css', optimizeCSS);
    gulp.watch('dist/index.html', optimizeHTML); // HTML überwachen
});

// Standard-Task
gulp.task('default', gulp.series('optimize', 'watch'));
