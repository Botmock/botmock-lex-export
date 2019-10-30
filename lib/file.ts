// import { default as findEntity } from "@botmock-api/entity-map";
// import { wrapEntitiesWithChar } from "@botmock-api/text";
import * as flow from "@botmock-api/flow";
import { writeJson } from "fs-extra";
import { join } from "path";
import { EOL } from "os";

namespace Lex {
  export interface Resource {};
  export type Intents = unknown[];
  export type Slots = unknown[];
}

enum ContentTypes {
  text = "PlainText",
}

enum ObfuscationSettings {
  none = "NONE",
}

enum ValueSelectionStrategies {
  original = "ORIGINAL_VALUE",
}

export type ProjectData<T> = T extends Promise<infer K> ? K : any;

interface IConfig {
  readonly outputDirectory: string;
  readonly projectData: ProjectData<unknown>;
}

export default class FileWriter extends flow.AbstractProject {
  static clarificationPrompt = "I didn't understand you, what would you like me to do?";
  static abortStatement = "Sorry, I am not able to assist at this time";
  static voiceId = "Salli";
  static locale = "en-US";
  static version = "1";
  static sessionTTLSecs = 800;
  static isChildDirected = false;
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
   * Removes disallowed characters from text
   * @param text the text to transform
   */
  private sanitizeText(text: string): string {
    const disallowedCharactersRegex = new RegExp(/\s|-|_/g);
    return text.replace(disallowedCharactersRegex, "");
  }
  /**
   * Genereates lex intents from the original project
   */
  private generateSlotTypesForProject(): Lex.Slots {
    return [];
  }
  /**
   * Genereates lex intents from the original project
   * 
   * @remarks ..
   */
  private generateIntentsForProject(): Lex.Intents {
    return [];
  }
  /**
   * Generates resource object from project data
   * @returns object able to be serialized and written
   */
  private generateResourceDataForProject(): Lex.Resource {
    const { name } = this.projectData.project;
    const metadata = {
      schemaVersion: "1.0",
      importType: "LEX",
      importFormat: "JSON",
    };
    const description = `generated ${new Date().toLocaleDateString()}`;
    return {
      metadata,
      resource: {
        name: this.sanitizeText(name),
        version: FileWriter.version,
        intents: this.generateIntentsForProject(),
        slotTypes: this.generateSlotTypesForProject(),
        voiceId: FileWriter.voiceId,
        childDirected: FileWriter.isChildDirected,
        locale: FileWriter.locale,
        idleSessionTTLInSeconds: FileWriter.sessionTTLSecs,
        description,
        clarificationPrompt: {
          messages: [{
            contentType: ContentTypes.text,
            content: FileWriter.clarificationPrompt,
          }],
          maxAttempts: 2,
        },
        abortStatement: {
          messages: [{
            contentType: ContentTypes.text,
            content: FileWriter.abortStatement,
          }],
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
