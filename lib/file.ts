import * as flow from "@botmock-api/flow";
import { writeJson } from "fs-extra";
import { join } from "path";
import { EOL } from "os";

export type ProjectData<T> = T extends Promise<infer K> ? K : any;

type LexResource = {};

interface IConfig {
  readonly outputDirectory: string;
  readonly projectData: ProjectData<unknown>;
}

export default class FileWriter extends flow.AbstractProject {
  static fallbackIntent = "I didn't understand you, what would you like me to do?";
  static quitIntent = "Sorry, I am not able to assist at this time";
  static voiceId = "Salli";
  static locale = "en-US";
  static version = "1";
  static sessionTTLSecs = 800;
  private outputDirectory: string;
/**
 * Creates new instance of FileWriter class
 *
 * @param config Object containing project data and path to output directory
 */
  constructor(config: IConfig) {
    super({ projectData: config.projectData as ProjectData<typeof config.projectData> });
    this.outputDirectory = config.outputDirectory;
  }
  /**
   * Generates resource object from project data
   * @returns object able to be serialized and written
   */
  private generateResourceDataForProject(): LexResource {
    return {
      metadata: {
        schemaVersion: "1.0",
        importType: "LEX",
        importFormat: "JSON",
      },
      resource: {
        name: "",
        version: FileWriter.version,
        intents: [],
        slotTypes: [],
        childDirected: false,
        voiceId: FileWriter.voiceId,
        locale: FileWriter.locale,
        idleSessionTTLInSeconds: FileWriter.sessionTTLSecs,
        description: name,
        clarificationPrompt: {
          messages: [],
          maxAttempts: 2,
        },
        abortStatement: {
          messages: [],
        },
      }
    }
  }
  /**
   * Writes lex resource file
   */
  public async write(): Promise<void> {
    const { name } = this.projectData.project;
    const resourceData = this.generateResourceDataForProject();
    await writeJson(join(this.outputDirectory, `${name}.json`), resourceData, { EOL, spaces: 2 });
  }
}
