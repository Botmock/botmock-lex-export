import fs from "fs";
import os from "os";
import { symmetricWrap } from "@botmock-api/utils";
import { ProjectIntent, ProjectResponse, ResourceIntent } from "./types";

export { ProjectResponse } from "./types";
export { default as getProjectData } from "./client";

function mapIntentToResource(intent: ProjectIntent): Partial<ResourceIntent> {
  const RETURN_INTENT = "ReturnIntent";
  return {
    description: "",
    rejectionStatement: {
      messages: [],
    },
    name: intent.name,
    version: "2",
    fulfillmentActivity: {
      type: RETURN_INTENT,
    },
    sampleUtterances: intent.utterances.map(utterance =>
      symmetricWrap(utterance.text, { l: "{", r: "}" })
    ),
    slots: [],
    confirmationPrompt: {
      messages: [],
      maxAttempts: 1,
    },
    conclusionStatement: {
      messages: [],
      responseCard: "",
    },
  };
}

export async function writeResource(
  project: Partial<ProjectResponse>,
  filepath: string
): Promise<void> {
  const [intents, entities, board, { name }] = project.data;
  const SESSION_TTL_SECS = 800;
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
        },
        slotTypes: [],
        voiceId: "",
        childDirected: false,
        locale: "en-US",
        idleSessionTTLInSeconds: SESSION_TTL_SECS,
        description: "",
        clarificationPrompt: {},
        abortStatement: {},
      },
      null,
      2
    ) + os.EOL;
  await fs.promises.writeFile(filepath, data);
}
