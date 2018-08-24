echo Pack releases

mkdir releases

cd ./packages/app/main/

npm version $TRAVIS_TAG --allow-same-version

gulp package:windows-nsis
gulp package:windows-squirrel

gulp package:mac

gulp package:linux

cd ./dist/

echo Files to dist

for filename in *; do
  if [[ $filename = *"$TRAVIS_TAG"* ]]; then
    echo $filename
    cp "$filename" ./../../../../releases/
  fi
done
