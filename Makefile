PATH := ./node_modules/.bin:$(PATH)

build:
	browserify ./entry.js --transform babelify --outfile ./build.js

watch:
	watchify ./entry.js --transform babelify --outfile ./build.js

serve:
	concurrently \
		"http-server" \
		"$(MAKE) watch"

lint:
	eslint ./src

clean:
	rm ./build.js
