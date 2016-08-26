module.exports = {
	proxy: 'localhost/_dev/doless/html',
	webpack: {
		entry: 'src/js/main.js',
		resolveExtensions: ['', '.js', '.json', '.es6']
	},
	src: {
		html: './html/*.html',
		js: './src/js/main.js',
		sass: './src/sass/**/*.scss',
		img: './src/img',
		icons: './src/icons/**/*.svg',
		fonts: './src/fonts',
		vendor: ['./src/js/vendor/*.js', './bower_components/**/picturefill.min.js']
	},
	dest: {
		js: './dist/public/js',
		css: './dist/public/css',
		img: './dist/public/img',
		icons: './dist/public/icons',
		fonts: './dist/public/fonts'
	},
	baseNames: {
		css: 'style',
		js: 'main'
	}
};