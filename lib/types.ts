export type ProjectResponse = {
  errors?: { error: string }[];
  data: any[];
};

export type ProjectIntent = Readonly<{
  id: string;
  name: string;
  utterances: any[];
  created_at: {};
  updated_at: {};
}>;

type Message = { contentType: string; content: string };

type Slot = {
  name: string;
  description: string;
  slotConstraint: string;
  slotType: string;
  slotTypeVersion: string;
  valueElicitationPrompt: {
    messages: Message[];
    maxAttempts: number;
  };
  priority: number;
  sampleUtterances: string[];
};

export type ResourceIntent = {
  description: string;
  rejectionStatement?: { messages: Message[] };
  name: string;
  version: string;
  fulfillmentActivity: { type: string };
  sampleUtterances: string[];
  slots?: Slot[];
  locale: string;
  idleSessionTTLInSeconds: number;
  clarificationPrompt: {
    messages: Message[];
    maxAttempts: number;
  };
  confirmationPrompt: {
    messages: Message[];
    maxAttempts: number;
  };
  conclusionStatement: {
    messages: Message[];
    responseCard: string;
  };
};
