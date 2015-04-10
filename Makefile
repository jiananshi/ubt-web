default: install build

build:
	@echo "编译中 ...\c"
	@compile-modules convert src/entry.js > ubt.js
	@echo "\033[32m 完成\033[0m"

dev: build watch

watch:
	@echo "监控文件变化中 ...\c"
	@while sleep 2; do if [ `find src/*.js -mtime -2s | wc -l` -gt 0 ]; then echo "\033[36m 发现\033[0m";make build; fi; done;

install:
ifeq ($(wildcard /usr/local/bin/compile-modules),)
	sudo npm install -g es6-module-transpiler
endif
	@cd tests && bower install

