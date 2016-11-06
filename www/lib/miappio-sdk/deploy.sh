#!/bin/bash

set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy!"
  exit 0
fi

rev=$(git rev-parse --short HEAD)

git init
git config user.name "mlefree"
git config user.email "mat@mlefree.com"

git remote add upstream "https://$GH_TOKEN@github.com/miappio/miappio-sdk.git"

string=$(git log -1 --pretty=%B)
if [ $string == *"travis rev:"* ]
then
  echo "This commit is a tag : $string : No deploy!"
  exit 0
fi

npm run bump
git add -A .
git commit -m "travis rev: ${rev}"
git push -q upstream HEAD:master --tags

#npm publish

# _travis
git fetch upstream
git reset upstream/_travis

# being sure that dir is not empty and project won't be regrep by travis
rm -f .travis.did.the.job.*
rm -f .travis.yml

today=$(date +%Y-%m-%d_%H_%M_%S)
touch ".travis.did.the.job.$today"

git add -A .
git commit -m "travis rev: ${rev}"
#npm run bump

git push -q upstream HEAD:_travis --tags

#

