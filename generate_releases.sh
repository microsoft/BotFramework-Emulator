echo Pack releases $TRAVIS_TAG

npm i -g gulp@4.0.0 gulp-cli@2.0.1

pushd packages/app/main

npm version $TRAVIS_TAG --allow-same-version

gulp copy-extension-stubs
gulp get-licenses
gulp stage:windows
gulp redist:windows-nsis

pushd dist

echo Files to dist

ls -la

cp latest.yml /project/releases/
cp botframework-emulator-setup-$TRAVIS_TAG.exe /project/releases/

popd
popd
