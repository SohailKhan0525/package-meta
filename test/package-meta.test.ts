import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { packageMeta, packageMetaSync } from "../src/index.js";

const fixtures: string[] = [];

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "package-meta-"));
  fixtures.push(root);
  return root;
}

afterEach(() => {
  for (const root of fixtures.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("packageMeta", () => {
  it("finds the nearest package from a nested file", () => {
    const root = fixture();
    const nested = join(root, "dist", "nested");
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(root, "package.json"), '{"name":"fixture","version":"1.2.3"}');
    const file = join(nested, "index.js");
    writeFileSync(file, "");

    expect(packageMeta(file)).toEqual({
      root,
      path: join(root, "package.json"),
      packageJson: { name: "fixture", version: "1.2.3" },
    });
  });

  it("prefers the nearest package boundary", () => {
    const root = fixture();
    const child = join(root, "packages", "app", "src");
    mkdirSync(child, { recursive: true });
    writeFileSync(join(root, "package.json"), '{"name":"root"}');
    writeFileSync(join(root, "packages", "app", "package.json"), '{"name":"app"}');

    expect(packageMeta(child).packageJson.name).toBe("app");
  });

  it("accepts file URLs", () => {
    const root = fixture();
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, "package.json"), '{"name":"url-fixture"}');
    const file = join(root, "src", "index.js");
    writeFileSync(file, "");

    expect(packageMeta(new URL("file://" + file)).packageJson.name).toBe("url-fixture");
  });

  it("supports directories", () => {
    const root = fixture();
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, "package.json"), '{"name":"directory-fixture"}');

    expect(packageMeta(join(root, "src")).root).toBe(root);
  });

  it("has a synchronous API", () => {
    const root = fixture();
    writeFileSync(join(root, "package.json"), '{"name":"sync-fixture"}');

    expect(packageMetaSync(root).packageJson.name).toBe("sync-fixture");
  });

  it("throws when no package boundary exists", () => {
    const root = fixture();
    expect(() => packageMeta(root)).toThrow("No package.json found");
  });

  it("rejects non-file URLs", () => {
    expect(() => packageMeta(new URL("https://example.com/module.js"))).toThrow(
      "only supports file: URLs",
    );
  });
});
