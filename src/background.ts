import { Stage } from './types';

interface Request {
  type: string;
  stage: Stage;
  envId: string;
  uid?: string;
}

interface Response {
  data?: unknown;
  error?: string;
}

function fetchFromParticipants(url: string, sendMessage: (response: Response) => void) {
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => response.json())
    .then(data => {
      sendMessage({ data });
    })
    .catch(error => {
      sendMessage({ error: error.message });
    });
}

chrome.runtime.onMessage.addListener(({ type, stage, envId, uid }: Request, sender, sendMessage): boolean => {
  if (type === 'evolv:environmentConfig') {
    const envConfigUrl: string = stage === Stage.Development
      ? `https://participants-newdev.evolvdev.com/v1/${envId}`
      : `https://participants${stage}.evolv.ai/v1/${envId}`;

    fetchFromParticipants(envConfigUrl, sendMessage);
  }

  if (type === 'evolv:userConfig') {
    const userConfigUrl: string = stage === Stage.Development
      ? `https://participants-newdev.evolvdev.com/v1/${envId}/${uid}/configuration.json`
      : `https://participants${stage}.evolv.ai/v1/${envId}/${uid}/configuration.json`;

    fetchFromParticipants(userConfigUrl, sendMessage);
  }

  return true;
});
