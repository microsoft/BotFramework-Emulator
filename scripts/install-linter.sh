#!/usr/bin/env bash

target=$1

packages=(
  eslint
  eslint-config-prettier
  eslint-plugin-import
  eslint-plugin-notice
  eslint-plugin-prettier
  eslint-plugin-typescript@next
  prettier-eslint
  prettier-eslint-cli
)

for pkg in $packages; do
  lerna add --scope "$1" --dev $pkg
done
