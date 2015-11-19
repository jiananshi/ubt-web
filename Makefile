node_modules: package.json
	@npm install

build: node_modules
	@npm run build

test: build
	@python -m SimpleHTTPServer 3153 > /dev/null 2>&1 &
	@open http://127.0.0.1:3153/tests

tag:
	@\
	version=$$(cat bower.json | grep "version" | awk -F '"' '{print $$4}'); \
	if [ $$(git status -s | wc -l) -gt 0 ]; then \
          echo "请先打好 commit"; \
	else \
	  git checkout HEAD~0; \
	  sed -i '' '/.*\.min\.js/d' .gitignore; \
          make build; \
	  git add . -A; \
	  git commit -m $$version; \
	  git tag $$version -f; \
	fi
