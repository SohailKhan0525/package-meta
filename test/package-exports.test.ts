import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, mkdirSync, renameSync } from "node:fs";
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
    const temp = mkdtempSync(join(tmpdir(), "package-meta-pack-"));
    const packageName = JSON.parse(readFileSync("package.json", "utf8")).name as string;
    const packageDir = join(temp, "node_modules", ...packageName.split("/"));

    try {
      const tarball = execFileSync(
        "npm",
        ["pack", "--pack-destination", temp],
        { encoding: "utf8" },
      ).trim().split("\n").pop()!;

      const archive = join(temp, tarball);
      mkdirSync(join(temp, "node_modules"), { recursive: true });
      execFileSync("tar", ["-xzf", archive, "-C", temp]);

      mkdirSync(join(temp, "node_modules", packageName.split("/")[0]), { recursive: true });
      renameSync(join(temp, "package"), packageDir);

      const cjs = execFileSync(
        "node",
        ["-e", "const m=require(" + JSON.stringify(packageName) + "); console.log(typeof m.packageMeta)"],
        { cwd: temp, encoding: "utf8" },
      ).trim();

      const esm = execFileSync(
        "node",
        ["--input-type=module", "-e", "import { packageMeta } from " + JSON.stringify(packageName) + "; console.log(typeof packageMeta)"],
        { cwd: temp, encoding: "utf8" },
      ).trim();

      expect(cjs).toBe("function");
      expect(esm).toBe("function");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  }, 30000);
});
