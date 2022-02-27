// on config.updated, clear the things

// on confirmed, add to confirmed list

window.addEventListener('stateupdate_evolv', function() {
    //SPA CHANGE!
});

window.evolv.client.on('initialized', event => {
    console.info('Initialized: ', event)
});

window.evolv.client.on('context.initialized', event => {
    console.info('Context initialized: ', event)
});

window.evolv.client.on('context.changed', event => {
    console.info('Context changed: ', event)
});

window.evolv.client.on('context.value.removed', event => {
    console.info('Context value removed: ', event)
});

window.evolv.client.on('context.value.added', event => {
    console.info('Context value added: ', event)
});

window.evolv.client.on('context.value.changed', event => {
    console.info('Context value changed: ', event)
});

window.evolv.client.on('context.destroyed', event => {
    console.info('Context destroyed: ', event)
});

window.evolv.client.on('config.request.sent', event => {
    console.info('Config request sent: ', event)
});

window.evolv.client.on('config.request.received', event => {
    console.info('Config request received: ', event)
});

window.evolv.client.on('request.failed', event => {
    console.info('Request failed: ', event)
});

window.evolv.client.on('config.updated', event => {
    console.info('config updated: ', event)
});

window.evolv.client.on('genome.request.sent', event => {
    console.info('Genome request sent: ', event)
});

window.evolv.client.on('genome.updated', event => {
    console.info('Genome updated: ', event)
});

window.evolv.client.on('genome.request.received', event => {
    console.info('Genome request received: ', event)
});

window.evolv.client.on('effective.genome.updated', event => {
    console.info('Effective genome updated: ', event)
});

window.evolv.client.on('store.destroyed', event => {
    console.info('Store destroyed: ', event)
});

window.evolv.client.on('confirmed', event => {
    console.info('Confirmed: ', event)
});

window.evolv.client.on('contaminated', event => {
    console.info('Contaminated: ', event)
});

window.evolv.client.on('event.emitted', (event, event2) => {
    console.info('Event Emitted: ', event2);
});

