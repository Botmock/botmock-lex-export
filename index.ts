import "dotenv/config";
import { join } from "path";
import { zipSync } from "cross-zip";
import { Batcher } from "@botmock-api/client";
import { default as log } from "@botmock-api/log";
import { writeJson, remove, mkdirp } from "fs-extra";
import { default as FileWriter } from "./lib/file";
import { Platforms, Paths  } from "./lib/types";

/**
 * Removes and then creates the directories that hold generated files
 */
async function recreateOutputDirectories(paths: Paths): Promise<void> {
  const { outputPath } = paths;
  await remove(outputPath);
  await mkdirp(outputPath);
}

/**
 * Calls all fetch methods and calls all write methods
 * @remark entry point to the script
 */
async function main(argV: string[]): Promise<void> {
  const DEFAULT_OUTPUT = "output";
  let [, , outputDirectory] = argV;
  if (typeof outputDirectory === "undefined") {
    outputDirectory = process.env.OUTPUT_DIR || DEFAULT_OUTPUT;
  }
  log("creating output directories");
  await recreateOutputDirectories({ outputPath: outputDirectory, });
  log("fetching project data");
  const { data: projectData } = await new Batcher({
    token: process.env.BOTMOCK_TOKEN as string,
    teamId: process.env.BOTMOCK_TEAM_ID as string,
    projectId: process.env.BOTMOCK_PROJECT_ID as string,
    boardId: process.env.BOTMOCK_BOARD_ID as string,
  }).batchRequest([
    "project",
    "board",
    "intents",
    "entities",
    "variables"
  ]) as any;
  log("writing file");
  const fileWriter = new FileWriter({
    outputDirectory,
    projectData
  });
  // @ts-ignore
  fileWriter.on("write-complete", ({ basename }) => {
    log(`wrote ${basename}`);
  });
  await fileWriter.write();
  log("compressing generated files");
  if (process.platform === Platforms.DARWIN) {
    zipSync(outputDirectory, `${outputDirectory}.zip`);
    log(`${outputDirectory}.zip is ready to be imported in the Lex console`);
  } else {
    log(`auto-compression not yet supported for ${process.platform}`);
  }
  log("done");
}

process.on("unhandledRejection", () => {});
process.on("uncaughtException", () => {});

main(process.argv).catch(async (err: Error) => {
  log(err.stack as string, { isError: true });
  const { message, stack } = err;
  await writeJson(join(__dirname, "err.json"), {
    message,
    stack
  });
});
