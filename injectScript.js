function isEvolvLoaded() {
    return !!window.evolv &&
    !!window.evolv.client
}

function experimentsNameAssigner () {
    const experimentNames = {}

    return async () => {
        const experiments = evolv.context.get('experiments')
        if (!experiments && !experiments.allocations) {
            return;
        }
        const allocations = experiments.allocations;
        const allocationsLength = allocations.length;
        for (let i = 0; i < allocationsLength; i++) {
            const eid = allocations[i].eid;
            if(!experimentNames[eid]) {
                experimentNames[eid] = await evolv.client.getDisplayName('experiments', eid);
            }
        }

        return experimentNames;
    }
}

const addENameToContext = experimentsNameAssigner();

async function sendContext() {
    const experimentNames = await addENameToContext();

    window.postMessage({
        source: 'evoTools',
        type: 'evolv:context',
        data: {
            ...evolv.context.remoteContext,
            experimentNames
        }
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