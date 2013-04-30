JS=$(wildcard src/*.js)
all: $(JS)
	sprockets -Isrc src/noembed.js | uglifyjs > noembed.min.js
