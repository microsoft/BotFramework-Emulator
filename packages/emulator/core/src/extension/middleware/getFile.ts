import * as Restify from 'restify';
import * as path from 'path';
import { readFile, readJSON } from 'fs-extra';
import * as mime from 'mime';

const memCache = {};

export async function getFile(req: Restify.Request, res: Restify.Response, next: Restify.Next) {
  const { extensionId } = req.params;

  const manifestFileLocation = path.resolve(path.join('./app/extensions/', extensionId, '/bf-extension.json'));

  try {
    let manifest = memCache[manifestFileLocation];
    if (!manifest) {
      manifest = memCache[manifestFileLocation] = await readJSON(manifestFileLocation);
    }
    const descriptorFileLocation = path.resolve(path.join(manifest.location, 'bf-extension.json'));

    let descriptor = memCache[descriptorFileLocation];
    if (!descriptor) {
      descriptor = memCache[descriptorFileLocation] = await readJSON(descriptorFileLocation);
    }

    const extensionRoot = path.resolve(path.join(manifest.location, descriptor.root));
    const idx = req.url.indexOf(extensionId);
    const filePathWithinRoot = req.url.substring(idx + extensionId.length);

    const mimeType = (mime as any)._types[path.extname(filePathWithinRoot).replace('.', '')];
    const fileContents = await readFile(path.join(extensionRoot, filePathWithinRoot));
    res.writeHead(200, {
      'Cache-Control': 'max-age=600', // 10 minutes
      'Content-type': `${mimeType}; charset=utf-8`,
      'Content-Length': fileContents.byteLength,
    });
    res.write(fileContents);
    res.end();
  } catch (e) {
    res.writeHead(404);
    res.end();
  }

  next();
}
