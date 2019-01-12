import * as fse from "fs-extra";
import * as path from "path";

export function getThemes(): Array<{ name: string; href: string }> {
  let files: string[];
  try {
    const index = require.resolve("@bfemulator/client/public/index.html");
    const dir = path.join(path.parse(index).dir, "themes");
    files = fse.readdirSync(dir);
  } catch {
    return [];
  }
  files = files.filter(filePath => filePath.includes(".css")).sort();
  return files.map(file => {
    const parsedPath = path.parse(file);
    const name = parsedPath.name.replace(/^[a-z]/, match =>
      match.toUpperCase()
    );
    return {
      name,
      href: `./themes/${parsedPath.base}`
    };
  });
}
