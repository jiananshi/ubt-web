help:
	@echo "# common tasks"
	@echo "$$ [35mmake[0m                            # help"
	@echo "$$ [35mmake node_modules[0m               # install dev dependencies"
	@echo "$$ [35mmake build[0m                      # build only"
	@echo "$$ [35mmake tag[0m                        # make a tag version"
	@echo "$$ [35mmake test[0m                       # open test page"
	@echo ""

node_modules: package.json
	@npm install

build: node_modules
	@webpack -p

tests/bower_components: tests/bower.json
	@cd tests && bower install

test: build tests/bower_components
	@python -m SimpleHTTPServer 3153 > /dev/null 2>&1 &
	@open http://127.0.0.1:3153/tests

tag:
	@\
	if [ $$(git status -s | wc -l) -gt 0 ]; then \
          echo "请先打好 commit"; \
	else \
	  git checkout $$(git rev-parse HEAD) 2>/dev/null; \
	  sed -i '' '/.*\.min\.js/d' .gitignore; \
          make build; \
	  git add . -A; \
	  version=$$(cat bower.json | grep "version" | awk -F '"' '{print $$4}'); \
	  git commit -m $$version; \
	  git tag $$version -f; \
	fi
