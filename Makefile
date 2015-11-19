node_modules: package.json
	@npm install

build: node_modules
	@npm run build

tag: build
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
