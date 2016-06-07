PATH := ./node_modules/.bin:$(PATH)

build:
	browserify ./entry.js --transform babelify --outfile ./build.js

watch:
	watchify ./entry.js --transform babelify --outfile ./build.js

serve:
	parallel --jobs 2 --line-buffer ::: \
		"http-server" \
		"make watch"
