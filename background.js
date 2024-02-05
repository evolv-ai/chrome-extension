chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'evolv:environmentConfig') {
    const url = 'https://participants.evolv.ai/v1/' + request.envId;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(data => {
        sendResponse({ data });
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
  }

  return true;
});
