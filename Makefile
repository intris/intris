PATH := ./node_modules/.bin:$(PATH)

build:
	browserify ./entry.js --transform babelify --outfile ./build.js

watch:
	watchify ./entry.js --transform babelify --outfile ./build.js

serve:
	concurrently \
		"http-server" \
		"make watch"

lint:
	eslint ./src
