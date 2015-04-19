#!/bin/bash

# configure env
git config --global user.email 'michellekrejci@gmail.com'
git config --global user.name 'Michelle'

# checkout publish branch
git checkout -b master

# Build the site
touch output_prod/.nojekyll
if [ $? -ne 0 ]; then echo "Could not generate the site"; exit 1; fi

# commit build
git add -f output_prod
git commit -m "Build website"

# only commit output dir
git filter-branch --subdirectory-filter output_prod/ -f

# push to GitHub Pages
git push "https://github.com/craychee/craychee.github.io.git" -f master
