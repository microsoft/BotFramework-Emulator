echo Pack releases

mkdir releases

pushd packages/app/main

npm version $TRAVIS_TAG --allow-same-version

gulp package:windows-nsis
gulp package:windows-squirrel

gulp package:mac

gulp package:linux

pushd dist

echo Files to dist

for filename in *; do
  if [[ $filename = *"$TRAVIS_TAG"* ]]; then
    echo $filename
    cp "$filename" $TRAVIS_BUILD_DIR/releases/
  fi
done

popd
popd
