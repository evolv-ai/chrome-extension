function isEvolvLoaded() {
    return window.evolv !== undefined &&
        window.evolv.context !== undefined &&
        window.evolv.context.remoteContext !== undefined &&
        window.evolv.context.remoteContext.confirmations !== undefined &&
        window.evolv.context.remoteContext.experiments !== undefined &&
        window.evolv.context.remoteContext.experiments.allocations !== undefined;
}

let pollingSafetyNet = 0;

function processConfirmations() {
    function poll() {
        if (pollingSafetyNet++ < 50) {
            if (!isEvolvLoaded()) {
                return setTimeout(poll, 50);
            }
        } else {
            console.log('EvoTools: Evolv not loaded.');
            window.dispatchEvent(new Event('flush_evotools_data'));
            return;
        }

        window.dispatchEvent(new Event('flush_evotools_data'));

        // set the updated allocations
        window.sessionStorage.setItem("evolv:allocations", JSON.stringify(window.evolv.context.remoteContext.experiments.allocations));

        // set the updated confirmations
        window.sessionStorage.setItem("evolv:confirmations", JSON.stringify(window.evolv.context.remoteContext.confirmations));

        setTimeout(function () {
            // tell contentScript.js that we're ready for it to run
            window.dispatchEvent(new Event('run_content_script'));
            window.runContentScript = true;
        }, 0);
    }

    poll();

    /**
     * Handle SPA transitions
     */
    // window.addEventListener('locationchange', function () {
    //     pollingSafetyNet = 0;
    //     poll();
    // });

    // history.pushState = (f => function pushState() {
    //     var ret = f.apply(this, arguments);
    //     window.dispatchEvent(new Event('pushState'));
    //     window.dispatchEvent(new Event('locationchange'));
    //     return ret;
    // })(history.pushState);

    // history.replaceState = (f => function replaceState() {
    //     var ret = f.apply(this, arguments);
    //     window.dispatchEvent(new Event('replaceState'));
    //     window.dispatchEvent(new Event('locationchange'));
    //     return ret;
    // })(history.replaceState);

    // window.addEventListener('popstate', () => {
    //     window.dispatchEvent(new Event('locationchange'))
    // });
};

module.exports = processConfirmations;