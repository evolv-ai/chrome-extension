function isEvolvLoaded() {
    return !!window.evolv &&
    !!window.evolv.client
}

function sendContext() {
    window.postMessage({
        source: 'evoTools',
        type: 'evolv:context',
        data: evolv.context.remoteContext
    }, '*')
}

function sendEmptyContext() {
    window.postMessage({
        source: 'evoTools',
        type: 'evolv:context',
        data: ('empty')
    }, '*')
}

var pollingSafetyNet = 0;
function poll() {
    if (pollingSafetyNet++ < 50) {
        if (!isEvolvLoaded()) return setTimeout(poll, 100);
        window.evolv.client.on('context.initialized', sendContext);

        window.evolv.client.on('context.changed', sendContext);
    } else {
        // set the remoteContext to `(empty)`
        sendEmptyContext();
    }
};

window.addEventListener('message', (e) => {
    if(typeof e.data !== 'object' || e.data.source !== 'evoTools') {
        return
    }

    switch (e.data.type) {
        case 'evolv:refreshContext':
            if (isEvolvLoaded()) {
                sendContext();
            }
        break
    }
});

poll();