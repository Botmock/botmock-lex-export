// import { EOL } from "os";
// import uuid from "uuid/v4";
// import { writeJSON } from "fs-extra";
// import { wrapEntitiesWithChar } from "@botmock-api/text";
// import * as Assets from "./types";

// export { ProjectResponse } from "./types";
// export { default as getProjectData } from "./client";

// export async function writeResource(
//   project: Partial<Assets.ProjectResponse>,
//   filepath: string
// ): Promise<void> {
//   let [intents, entities, messages, { name }] = project.data;
//   // because entities are mapped to slot types, if there are no entities, lex
//   // will recognize no slot types and fail to import
//   if (!entities.length) {
//     entities = [{ id: uuid(), name: "AMAZON.TIME", data: [{ value: Date.now() + "" }] }];
//   }
//   // map an intent into the object required for the resource
//   const mapIntentToResource = (intent: Assets.ProjectIntent): object => {
//     const slots = Object.entries(
//       intent.utterances
//         .filter(utterance => utterance.variables.length > 0)
//         .reduce(
//           (acc, utt, _, utterances) => ({
//             ...acc,
//             ...utt.variables.reduce(
//               (accu, variable) => ({
//                 ...accu,
//                 [variable.name.replace(/%/g, "")]: {
//                   name: variable.name
//                     .replace(/%/g, "")
//                     .replace(/\s/g, "")
//                     .trim(),
//                   description: uuid(),
//                   slotConstraint: "Required",
//                   slotType: variable.name.replace(/%/g, ""),
//                   slotTypeVersion: "1",
//                   valueElicitationPrompt: {
//                     messages: [createMessageFromContent(FALLBACK_INTENT_CONTENT)],
//                     maxAttempts: 1,
//                   },
//                   priority: 1,
//                   sampleUtterances: utterances
//                     .filter(u => u.variables.some(v => v.name === variable.name))
//                     .map(u => wrapEntitiesWithChar(u.text, "{")),
//                 },
//               }),
//               {}
//             ),
//           }),
//           {}
//         )
//     ).map(([_, values]) => values);
//     return {
//       description: intent.id,
//       // rejectionStatement: {
//       //   messages: [createMessageFromContent(`!${intent.name}`)],
//       // },
//       name: intent.name,
//       version: "2",
//       fulfillmentActivity: { type: "ReturnIntent" },
//       sampleUtterances: intent.utterances.map(({ text }) => wrapEntitiesWithChar(text, "{")),
//       slots: slots.length ? slots : undefined,
//       // confirmationPrompt: {
//       //   messages: [],
//       //   maxAttempts: 1,
//       // },
//       // conclusionStatement: {
//       //   messages: [],
//       //   responseCard: JSON.stringify({ version: 1 }),
//       // },
//     };
//   };
//   await writeJSON(filepath, {
//     metadata: {
//       schemaVersion: "1.0",
//       importType: "LEX",
//       importFormat: "JSON",
//     },
//     resource: {
//       name: name.replace(/\s|-/g, "").toLowerCase(),
//       version: "1",
//       intents: intents.map(mapIntentToResource),
//       slotTypes: entities.map((entity: any) => {
//         return {
//           description: entity.id,
//           name: entity.name.replace(/\s/g, ""),
//           version: "1",
//           enumerationValues: [{ value: entity.name }],
//           valueSelectionStrategy: "ORIGINAL_VALUE",
//         }
//       }),
//       childDirected: false,
//       voiceId: VOICE_ID,
//       locale: LOCALE,
//       idleSessionTTLInSeconds: SESSION_TTL_SECS,
//       description: name,
//       clarificationPrompt: {
//         messages: [createMessageFromContent(FALLBACK_INTENT_CONTENT)],
//         maxAttempts: 2,
//       },
//       abortStatement: {
//         messages: [createMessageFromContent(QUIT_INTENT_CONTENT)],
//       },
//     },
//   }, { spaces: 2, EOL });
// }

// function createMessageFromContent(content: string, contentType: string = "PlainText"): object {
//   return { content, contentType };
// }
