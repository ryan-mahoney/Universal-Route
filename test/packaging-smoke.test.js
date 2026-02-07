const { execFileSync } = require("node:child_process");
const { readFileSync, unlinkSync } = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

describe("packaging smoke", () => {
  test("packed manifest includes runtime history dependency", () => {
    const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    expect(pkg.dependencies).toBeDefined();
    expect(pkg.dependencies.history).toBeTruthy();

    const packOutput = execFileSync("npm", ["pack", "--json", "--silent"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    const packed = JSON.parse(packOutput)[0];
    const tarball = path.join(repoRoot, packed.filename);
    const packedManifest = execFileSync("tar", ["-xOf", tarball, "package/package.json"], {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, LC_ALL: "C" },
    });

    try {
      const packedPkg = JSON.parse(packedManifest);
      expect(packedPkg.dependencies).toBeDefined();
      expect(packedPkg.dependencies.history).toBeTruthy();
    } finally {
      unlinkSync(tarball);
    }
  });
});
