# package-root-meta

Tiny, dependency-free local package metadata and package-root resolver for Node.js.

> Find the package a file belongs to.

## Install

```bash
npm install package-root-meta
```

Requires Node.js 18 or newer.

## Usage

### ESM

```ts
import { packageMeta, packageMetaSync } from "package-root-meta";

const meta = await packageMeta(import.meta.url);

console.log(meta.root);              // package root directory
console.log(meta.path);              // package.json path
console.log(meta.packageJson.name);  // package name
console.log(meta.packageJson.version);

const syncMeta = packageMetaSync(import.meta.url);
```

### CommonJS

```js
const { packageMeta, packageMetaSync } = require("package-root-meta");

async function main() {
  const meta = await packageMeta(__filename);

  console.log(meta.root);
  console.log(meta.path);
  console.log(meta.packageJson.name);
  console.log(meta.packageJson.version);

  const syncMeta = packageMetaSync(__filename);
}

main();
```

### File paths, directories, and `file:` URLs

All of these forms are supported:

```ts
packageMeta("./src");
packageMeta("/absolute/path/to/src/file.js");
packageMeta(import.meta.url);
```

The resolver walks upward from the supplied location until it finds the nearest `package.json`. That means nested packages in a monorepo resolve to their own package boundary rather than the repository root.

If no location is supplied, the current working directory is used:

```ts
const meta = packageMeta();
```

## API

### `packageMeta(location?)`

Finds the nearest `package.json` from a file path, directory, or `file:` URL.

Returns:

- `root` — absolute directory containing the nearest `package.json`
- `path` — absolute path to that `package.json`
- `packageJson` — parsed package metadata

### `packageMetaSync(location?)`

Synchronous version of `packageMeta` with the same input and return shape.

## Design

- Zero runtime dependencies
- ESM and CommonJS
- TypeScript declarations
- Node.js 18+
- Works with monorepos and nested packages
- Local filesystem only
- No npm registry access
- No package-manager assumptions

This package intentionally does one thing: resolve local package boundaries and metadata.

## License

MIT
