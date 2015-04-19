#!/bin/bash

# configure env
git config --global user.email 'michellekrejci@gmail.com'
git config --global user.name 'Michelle'

# checkout publish branch
git branch -D master
git checkout -b master

# Build the site
touch output_prod/.nojekyll

# commit build
git add -f output_prod
git commit -m "Build website"

# only commit output dir
git filter-branch --subdirectory-filter output_prod/ -f

# push to GitHub Pages
git push "https://github.com/craychee/craychee.github.io.git" -f master
