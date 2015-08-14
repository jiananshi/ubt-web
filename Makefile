cache = ~/.eleme/ubt-web
version = $$(cat bower.json | grep "version" | awk -F '"' '{print $$4}')

build:
	@if [ ! -L node_modules ]; then rm -rf node_modules; fi
	@mkdir -p $(cache)/node_modules
	@ln -s -f $(cache)/node_modules .
	@npm install

tag:
	@\
	if [ $$(git status -s | wc -l) -gt 0 ]; then \
          echo "请先打好 commit"; \
	else \
	  git checkout HEAD~0; \
	  sed -i '' '/.*\.min\.js/d' .gitignore; \
          make build; \
	  git add . -A; \
	  git commit -m $(version); \
	  git tag $(version) -f; \
	fi
