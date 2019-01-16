#!/usr/bin/env bash

target=$1

packages=(
  eslint
  eslint-config-prettier
  eslint-plugin-import
  eslint-plugin-notice
  eslint-plugin-prettier
  eslint-plugin-typescript@next
)

for pkg in ${packages[*]}; do
  lerna add --scope "$target" --dev $pkg
done

read -r -d '' eslintConfig << EOM
{
  "extends": "../../../.eslintrc.js"
}\n
EOM

echo "Done installing dependencies."
printf "Add these two lines to the package.json:\n\n"

printf "\t\"lint\": \"eslint --color --quiet --ext .js,.jsx,.ts,.tsx ./src\",\n"
printf "\t\"lint:fix\": \"npm run lint -- --fix\",\n"

printf "\nCreate a .eslintrc in $target with:\n\n"
printf "$eslintConfig"
