cache = ~/.eleme/ubt-web

build:
	@if [ ! -L node_modules ]; then rm -rf node_modules; fi
	@mkdir -p $(cache)/node_modules
	@ln -s -f $(cache)/node_modules .
	@npm install
