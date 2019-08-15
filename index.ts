import "dotenv/config";
import os from "os";
import fs from "fs";
// import zlib from "zlib";
import path from "path";
import assert from "assert";
import { getProjectData, ProjectResponse, writeResource } from "./lib";

const MIN_NODE_VERSION = 101600;
const numericalNodeVersion = parseInt(
  process.version
    .slice(1)
    .split(".")
    .map(seq => seq.padStart(2, "0"))
    .join(""),
  10
);

export const outputPath = path.join(
  process.cwd(),
  process.env.OUTPUT_DIR || "output"
);

try {
  assert.strictEqual(numericalNodeVersion < MIN_NODE_VERSION, false);
} catch (_) {
  throw "node.js version must be >= 10.16.0";
}

try {
  (async () => {
    const project: ProjectResponse = await getProjectData({
      projectId: process.env.BOTMOCK_PROJECT_ID,
      boardId: process.env.BOTMOCK_BOARD_ID,
      teamId: process.env.BOTMOCK_TEAM_ID,
      token: process.env.BOTMOCK_TOKEN,
    });
    assert.strictEqual(project.errors.length, 0);
    try {
      await fs.promises.access(outputPath, fs.constants.R_OK);
    } catch (_) {
      // create output path if unable to read from it
      await fs.promises.mkdir(outputPath);
    }
    const [, , , meta] = project.data;
    const filepath = path.join(outputPath, `${meta.name}_export.json`);
    await writeResource(project, filepath);
    const { size } = await fs.promises.stat(filepath);
    console.info(
      `done. ${os.EOL}wrote resource to ${path.sep}${path.basename(
        outputPath
      )}${path.sep}${path.basename(filepath)} (${size / 1000}kB).`
    );
  })();
} catch (err) {
  console.error(err);
  process.exit(1);
}
