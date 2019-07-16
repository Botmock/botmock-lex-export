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

export type ResourceIntent = {
  description: string;
  rejectionStatement?: { messages: { contentType: string; content: string }[] };
  name: string;
  version: string;
  fulfillmentActivity: { type: string };
  sampleUtterances: string[];
  slots?: any[];
};
