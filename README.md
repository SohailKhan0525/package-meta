# package-meta

Tiny, dependency-free local package metadata and package-root resolver for Node.js.

> Find the package a file belongs to.

## Install

```bash
npm install @sohailkhan0525/package-meta
```

## Usage

### ESM

```ts
import { packageMeta } from "@sohailkhan0525/package-meta";

const meta = packageMeta(import.meta.url);

console.log(meta.root);
console.log(meta.path);
console.log(meta.packageJson.name);
console.log(meta.packageJson.version);
```

### CommonJS

```js
const { packageMeta } = require("@sohailkhan0525/package-meta");

const meta = packageMeta(__filename);
```

### Directories

```ts
const meta = packageMeta("./src");
```

The nearest `package.json` is returned, so nested packages in a monorepo are handled naturally.

## API

### `packageMeta(location?)`

Finds the nearest `package.json` from a file path, directory, or `file:` URL.

Returns `root`, `path`, and the parsed `packageJson`.

`location` defaults to `process.cwd()`.

### `packageMetaSync(location?)`

Synchronous alias for `packageMeta`.

## Design

- Zero runtime dependencies
- ESM and CommonJS
- TypeScript declarations
- Node.js 18+
- Works with monorepos and nested packages
- No npm registry access
- No package-manager assumptions

This package intentionally does one thing: resolve local package boundaries and metadata.

## License

MIT
