import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface PackageJson {
  [key: string]: unknown;
}

export interface PackageMeta {
  root: string;
  path: string;
  packageJson: PackageJson;
}

export type PackageLocation = string | URL;

function toPath(location: PackageLocation): string {
  if (location instanceof URL) {
    if (location.protocol !== "file:") {
      throw new TypeError("package-meta only supports file: URLs");
    }
    return fileURLToPath(location);
  }

  if (location.startsWith("file://")) {
    return fileURLToPath(new URL(location));
  }

  return isAbsolute(location) ? location : resolve(location);
}

function startDirectory(location: PackageLocation): string {
  const path = toPath(location);

  if (existsSync(path) && statSync(path).isDirectory()) {
    return path;
  }

  return dirname(path);
}

function readPackageJson(packagePath: string): PackageJson {
  try {
    return JSON.parse(readFileSync(packagePath, "utf8")) as PackageJson;
  } catch (error) {
    throw new Error("Failed to read package.json at " + packagePath, { cause: error });
  }
}

function findPackagePath(start: string): string {
  let current = start;

  while (true) {
    const candidate = join(current, "package.json");

    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = dirname(current);

    if (parent === current) {
      throw new Error("No package.json found from " + start);
    }

    current = parent;
  }
}

export function packageMeta(location: PackageLocation = process.cwd()): PackageMeta {
  const path = findPackagePath(startDirectory(location));

  return {
    root: dirname(path),
    path,
    packageJson: readPackageJson(path),
  };
}

export const packageMetaSync = packageMeta;
