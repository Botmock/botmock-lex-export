import { EOL } from "os";
import uuid from "uuid/v4";
import { writeFile } from "fs-extra";
import { wrapEntitiesWithChar } from "@botmock-api/text";
import * as Assets from "./types";

export { ProjectResponse } from "./types";
export { default as getProjectData } from "./client";

const FALLBACK_INTENT_CONTENT =
  process.env.FALLBACK_INTENT_CONTENT ||
  "I didn't understand you, what would you like me to do?";

const QUIT_INTENT_CONTENT =
  process.env.QUIT_INTENT_CONTENT ||
  "Sorry, I am not able to assist at this time";

const VOICE_ID = process.env.VOICE_ID || "Salli";
const LOCALE = process.env.LOCALE || "en-US";
const SESSION_TTL_SECS = process.env.SESSION_TTL_SECS || 800;

export async function writeResource(
  project: Partial<Assets.ProjectResponse>,
  filepath: string
): Promise<void> {
  let [intents, entities, messages, { name }] = project.data;
  // because entities are mapped to slot types, if there are no entities, lex
  // will recognize no slot types and fail to import
  if (!entities.length) {
    entities = [{ id: uuid(), name: "AMAZON.TIME", data: [{ value: Date.now() + "" }] }];
  }
  // map an intent into the object required for the resource
  const mapIntentToResource = (intent: Assets.ProjectIntent): object => {
    return {
      description: intent.id,
      rejectionStatement: {
        messages: [createMessageFromContent(`!${intent.name}`)],
      },
      name: intent.name,
      version: "2",
      fulfillmentActivity: {
        type: "ReturnIntent",
      },
      sampleUtterances: intent.utterances.map(({ text }) => wrapEntitiesWithChar(text, "{")),
      // map over a reduction on unique variable names to create slots
      slots: Object.entries(
        intent.utterances
          .filter(utterance => utterance.variables.length > 0)
          .reduce(
            (acc, utt, _, utterances) => ({
              ...acc,
              ...utt.variables.reduce(
                (acc_, variable) => ({
                  ...acc_,
                  [variable.name.replace(/%/g, "")]: {
                    name: variable.name
                      .replace(/%/g, "")
                      .replace(/\s/g, "")
                      .trim(),
                    description: "",
                    slotConstraint: "Required",
                    slotType: variable.entity
                      ? (entities.find(id => id === variable.entity) || {}).name
                      : entities[0].name,
                    slotTypeVersion: "1",
                    valueElicitationPrompt: {
                      messages: [
                        createMessageFromContent(FALLBACK_INTENT_CONTENT),
                      ],
                      maxAttempts: 1,
                    },
                    priority: 1,
                    sampleUtterances: utterances
                      .filter(u => {
                        u.variables.some(v => v.name === variable.name);
                      })
                      .map(u => u.text),
                  },
                }),
                {}
              ),
            }),
            {}
          )
      ).map(([_, values]) => values),
      // confirmationPrompt: {
      //   messages: [],
      //   maxAttempts: 1,
      // },
      // conclusionStatement: {
      //   messages: [],
      //   responseCard: JSON.stringify({ version: 1 }),
      // },
    };
  };
  const data =
    JSON.stringify(
      {
        metadata: {
          schemaVersion: "1.0",
          importType: "LEX",
          importFormat: "JSON",
        },
        resource: {
          name: name.replace(/\s|-/g, "").toLowerCase(),
          version: "1",
          intents: intents.map(mapIntentToResource),
          slotTypes: getSlotTypes(entities),
          childDirected: false,
          voiceId: VOICE_ID,
          locale: LOCALE,
          idleSessionTTLInSeconds: SESSION_TTL_SECS,
          description: name,
          clarificationPrompt: {
            messages: [createMessageFromContent(FALLBACK_INTENT_CONTENT)],
            maxAttempts: 2,
          },
          abortStatement: {
            messages: [createMessageFromContent(QUIT_INTENT_CONTENT)],
          },
        },
      },
      null,
      2
    ) + EOL;
  await writeFile(filepath, data);
}

function getSlotTypes(entities: any[]): any[] {
  return entities.map(entity => ({
    description: entity.id,
    name: entity.name,
    version: "1",
    enumerationValues: entity.data.map(({ value = "" }) => ({ value })),
    valueSelectionStrategy: "ORIGINAL_VALUE",
  }));
}

function createMessageFromContent(
  content: string,
  contentType: string = "PlainText"
): any {
  return { content, contentType };
}

// function stripDisallowedCharactersFromString(str: string): string {
//   return str.replace(/^[a-zA-Z_.]+/g, "");
// }
