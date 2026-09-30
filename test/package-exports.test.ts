import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("published package shape", () => {
  it("builds the files declared by exports", () => {
    execFileSync("npm", ["run", "build"], { stdio: "ignore" });

    expect(readFileSync("dist/index.js", "utf8")).toContain("packageMeta");
    expect(readFileSync("dist/index.cjs", "utf8")).toContain("packageMeta");
    expect(readFileSync("dist/index.d.ts", "utf8")).toContain("packageMeta");
  });

  it("can be loaded through both module systems from a packed tarball", () => {
    execFileSync("npm", ["pack", "--pack-destination", tmpdir()], { stdio: "ignore" });
    const files = execFileSync("node", ["-e", "console.log(require('fs').readdirSync(process.argv[1]).filter(x=>x.endsWith('.tgz')).sort().pop())", tmpdir()], { encoding: "utf8" }).trim();
    const tarball = join(tmpdir(), files);
    const root = mkdtempSync(join(tmpdir(), "package-meta-pack-"));

    try {
      execFileSync("npm", ["init", "-y"], { cwd: root, stdio: "ignore" });
      execFileSync("npm", ["install", tarball], { cwd: root, stdio: "ignore" });

      const cjs = execFileSync("node", ["-e", "const m=require('package-meta'); console.log(typeof m.packageMeta)"], { cwd: root, encoding: "utf8" }).trim();
      const esm = execFileSync("node", ["--input-type=module", "-e", "import { packageMeta } from 'package-meta'; console.log(typeof packageMeta)"], { cwd: root, encoding: "utf8" }).trim();

      expect(cjs).toBe("function");
      expect(esm).toBe("function");
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(tarball, { force: true });
    }
  });
});
