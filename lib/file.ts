import { default as findEntity } from "@botmock-api/entity-map";
import { wrapEntitiesWithChar } from "@botmock-api/text";
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

enum SlotConstraints {
  required = "Required",
}

enum ValueSelectionStrategies {
  original = "ORIGINAL_VALUE",
}

enum FulfillmentActivityTypes {
  return = "ReturnIntent",
}

export type ProjectData<T> = T extends Promise<infer K> ? K : any;

interface IConfig {
  readonly outputDirectory: string;
  readonly projectData: ProjectData<unknown>;
}

export default class FileWriter extends flow.AbstractProject {
  static botmockCardType = "generic";
  static clarificationPrompt = "I didn't understand you, what would you like me to do?";
  static abortStatement = "Sorry, I am not able to assist at this time";
  static responseCardContentType = "application/vnd.amazonaws.card.generic";
  static voiceId = "Joanna";
  static locale = "en-US";
  static version = "1";
  static intentVersion = "2";
  static slotTypeVersion = "1";
  static maxValueElicitationAttempts = 2;
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
    const disallowedCharactersRegex = new RegExp(/\s|-|_|\./g);
    return text.replace(disallowedCharactersRegex, "");
  }
  /**
   * Gets full entity from a entity id
   * @param entityId id of the entity to find
   */
  private getEntity(entityId: string): unknown {
    return this.projectData.entities.find(entity => entity.id === entityId);
  }
  /**
   * Gets full variable from a variable id
   * @param variableId id of the variable to find
   */
  private getVariable(variableId: string): unknown {
    return this.projectData.variables.find(variable => variable.id === variableId);
  }
  /**
   * Genereates lex intents from the original project
   */
  private generateSlotTypesForProject(): Lex.Slots {
    return this.projectData.entities.map(entity => ({
      description: entity.id,
      name: entity.name,
      version: FileWriter.version,
      enumerationValues: entity.data.map((datapoint: any) => ({ value: datapoint.value })),
      valueSelectionStrategy: ValueSelectionStrategies.original,
    }));
  }
  /**
   * Genereates lex intents from the original project
   * 
   * @remarks if there are slots for an intent, tries to identify
   * any referenced amazon system entity; fallsback to custom entity
   */
  private generateIntentsForProject(): Lex.Intents {
    const intentsInFlow = Array.from(this.segmentizeBoardFromMessages())
      .reduce((acc, pair: [string, string[]]) => {
        const [idOfMessage, idsOfIntents] = pair;
        return [
          ...acc,
          ...idsOfIntents.map(intentId => ({
            intent: this.getIntent(intentId),
            messageId: idOfMessage,
          }))
        ]
      }, []);
    return intentsInFlow.map(({ intent, messageId }: { [key: string]: any }) => {
      const description = new Date().toLocaleString();
      const name = this.sanitizeText(intent.name);
      const connectedMessage = this.getMessage(messageId) as flow.Message;
      const messagesInSegment = this.gatherMessagesUpToNextIntent(connectedMessage);
      const attachments = [
        connectedMessage,
        ...messagesInSegment,
      ].filter(message => message.message_type === FileWriter.botmockCardType);
      const responseCard = !attachments.length
        ? undefined
        : JSON.stringify({
          version: FileWriter.version,
          contentType: FileWriter.responseCardContentType,
          genericAttachments: attachments
            .reduce((acc, message) => {
              const { elements } = message.payload;
              return [
                ...acc,
                ...elements.reduce((acc, element: any) => {
                  return [
                    ...acc,
                    {
                      imageUrl: element.image_url,
                      subTitle: element.subtitle,
                      title: element.title,
                      buttons: element.buttons.map((button: any) => ({
                        text: button.title,
                        value: button.payload
                      })),
                    },
                  ]
                }, [])
              ]
            }, [])
        });
      const messages = [connectedMessage, ...messagesInSegment].map((message, index) => ({
        groupNumber: index + 1,
        contentType: ContentTypes.text,
        content: wrapEntitiesWithChar(message.payload.text, "{"),
      }));
      return {
        description,
        name,
        version: FileWriter.intentVersion,
        fulfillmentActivity: {
          type: FulfillmentActivityTypes.return,
        },
        sampleUtterances: !intent.utterances.length
          ? undefined
          : intent.utterances.map((utterance: any) => (
            wrapEntitiesWithChar(utterance.text, "{")
          )),
        slots: Object.is(intent.slots, null) || !intent.slots.length
          ? undefined
          : intent.slots.map((slot: flow.Slot, index: number) => {
            const variable = this.getVariable(slot.variable_id) as flow.Variable;
            let slotType: string;
            let didUseCustomEntity = false;
            try {
              slotType = findEntity(variable.entity, { platform: "amazon" }) as string;
            } catch (_) {
              const { name: customEntityName } = this.getEntity(variable.entity) as flow.Entity;
              didUseCustomEntity = true;
              slotType = customEntityName;
            }
            return {
              // sampleUtterances: [],
              slotType,
              slotTypeVersion: !didUseCustomEntity ? undefined : FileWriter.slotTypeVersion,
              obfuscationSetting: ObfuscationSettings.none,
              slotConstraint: SlotConstraints.required,
              valueElicitationPrompt: !slot.prompt
                ? undefined
                : {
                  messages: [
                    {
                      contentType: ContentTypes.text,
                      content: wrapEntitiesWithChar(slot.prompt, "{"),
                    },
                  ],
                  maxAttempts: FileWriter.maxValueElicitationAttempts,
              },
              priority: index + 1,
              name: variable.name,
              description: new Date().toLocaleString(),
            }
          }),
        conclusionStatement: {
          responseCard,
          messages,
        },
      }
    });
  }
  /**
   * Generates resource object from project data
   * @returns object able to be serialized and written
   */
  private generateResourceForProject(): Lex.Resource {
    const { name } = this.projectData.project;
    const metadata = {
      schemaVersion: "1.0",
      importType: "LEX",
      importFormat: "JSON",
    };
    const description = new Date().toLocaleString();
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
          maxAttempts: FileWriter.maxValueElicitationAttempts,
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
    const resourceData = this.generateResourceForProject();
    const filename = join(this.outputDirectory, `${this.sanitizeText(name)}.json`);
    await writeJson(filename, resourceData, { EOL, spaces: 2 });
  }
}
