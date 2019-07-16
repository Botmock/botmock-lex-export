import fetch from "node-fetch";

interface ProjectVariables {
  projectId?: string;
  boardId?: string;
  teamId?: string;
  token: string;
}

const BOTMOCK_API_URL = "https://app.botmock.com/api";
const INTENTS = "intents";
const ENTITIES = "entities";
const PROJECT = "";

export default async function getProjectData({
  projectId,
  boardId,
  teamId,
  token,
}: ProjectVariables) {
  const baseUrl = `${BOTMOCK_API_URL}/teams/${teamId}/projects/${projectId}`;
  // collect project data from endpoints
  const data = await Promise.all(
    [INTENTS, ENTITIES, `boards/${boardId}`, PROJECT].map(async path => {
      const res = await fetch(`${baseUrl}/${path}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status} response on Botmock API fetch request`);
      }
      const json = await res.json();
      return json.hasOwnProperty("board") ? json.board.messages : json;
    })
  );
  return {
    data: data.filter(d => !d.hasOwnProperty("error")),
    errors: data.filter(d => d.hasOwnProperty("error")),
  };
}
