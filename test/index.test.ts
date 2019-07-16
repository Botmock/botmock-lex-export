import fs from "fs";
import { execSync } from "child_process";
import { outputPath } from "../";

// afterAll(async done => {});

test("creates json file", () => {
  execSync("npm start");
  expect(async () => {
    await fs.promises.access(outputPath, fs.constants.R_OK);
  }).not.toThrow();
});
