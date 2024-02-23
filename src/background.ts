import { Stage } from './types';

interface Request {
  type: string;
  stage: Stage;
  envId: string;
}

chrome.runtime.onMessage.addListener(({ type, stage, envId }: Request, sender, sendMessage): boolean => {
  if (type === 'evolv:environmentConfig') {
    const url: string = stage === Stage.Development
      ? `https://participants-newdev.evolvdev.com/v1/${envId}`
      : `https://participants${stage}.evolv.ai/v1/${envId}`;

    fetch(url, {
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

  return true;
});
