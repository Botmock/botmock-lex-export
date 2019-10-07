import "dotenv/config";
import { join } from "path";
import { writeJson } from "fs-extra";
import { getProjectData, ProjectResponse, writeResource } from "./lib";
import { restoreOutput } from "./lib/file";
import { default as log } from "./lib/log";
// @ts-ignore
// import pkg from "./package.json";

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string;
    }
  }
}

// global.__rootdir__ = __dirname || process.cwd();

// Sentry.init({
//   dsn: SENTRY_DSN,
//   release: `${pkg.name}@${pkg.version}`,
//   integrations: [new RewriteFrames({
//     root: global.__rootdir__
//   })],
//   beforeSend(event): Sentry.Event {
//     if (event.user.email) {
//       delete event.user.email;
//     }
//     return event;
//   }
// });

async function main(args: string[]): Promise<void> {
  const DEFAULT_OUTPUT = "output";
  let [, , outputDirectory] = args;
  if (typeof outputDirectory === "undefined") {
    outputDirectory = process.env.OUTPUT_DIR;
  }
  const outputDir = join(__dirname, outputDirectory || DEFAULT_OUTPUT);
  try {
    log("recreating output directory");
    await restoreOutput(outputDir);
    const project: ProjectResponse = await getProjectData({
      projectId: process.env.BOTMOCK_PROJECT_ID,
      boardId: process.env.BOTMOCK_BOARD_ID,
      teamId: process.env.BOTMOCK_TEAM_ID,
      token: process.env.BOTMOCK_TOKEN,
    });
    const [, , , meta] = project.data;
    const filepath = join(outputDir, `${meta.name}_export.json`);
    await writeResource(project, filepath);
  } catch (err) {
    log(err.stack, { hasError: true });
    throw err;
  }
}

process.on("unhandledRejection", () => { });
process.on("uncaughtException", () => { });

main(process.argv).catch(async (err: Error) => {
  if (process.env.OPT_IN_ERROR_REPORTING) {
    // Sentry.captureException(err);
  } else {
    const { message, stack } = err;
    await writeJson(join(__dirname, "err.json"), {
      message,
      stack
    });
  }
});
