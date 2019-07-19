import fs from "fs";
import os from "os";
import { symmetricWrap } from "@botmock-api/utils";
import { ProjectIntent, ProjectResponse, ResourceIntent } from "./types";

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
  project: Partial<ProjectResponse>,
  filepath: string
): Promise<void> {
  const [intents, entities, messages, { name }] = project.data;
  console.log(messages.map(m => m.next_message_ids.map(id => id.conditional)));
  // map an intent into the object required for the resource
  const mapIntentToResource = (intent: ProjectIntent): any => {
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
      sampleUtterances: intent.utterances.map(utterance =>
        symmetricWrap(utterance.text, { l: "{", r: "}" })
      ),
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
                    name: variable.name.replace(/%/g, ""),
                    description: "",
                    slotConstraint: "Required",
                    slotType: variable.entity
                      ? (entities.find(id => id === variable.entity) || {}).name
                      : "",
                    slotTypeVersion: "1",
                    valueElicitationPrompt: {
                      messages: [createMessageFromContent("")],
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
      confirmationPrompt: {
        messages: [],
        maxAttempts: 1,
      },
      conclusionStatement: {
        messages: [],
        responseCard: JSON.stringify({ version: 1 }),
      },
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
          name,
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
    ) + os.EOL;
  await fs.promises.writeFile(filepath, data);
}

function getSlotTypes(entities: any[]): any[] {
  return entities.map(entity => ({
    description: entity.id,
    name: entity.name,
    version: "1",
    enumerationValues: entity.data.map(({ value }) => ({ value })),
    valueSelectionStrategy: "ORIGINAL_VALUE",
  }));
}

function createMessageFromContent(
  content: string,
  contentType: string = "PlainText"
): any {
  return { content, contentType };
}
