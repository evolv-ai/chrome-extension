// ==UserScript==
// @name         EvoTools Helper
// @namespace    *verizon*
// @version      0.1
// @description  This script sets the Evolv allocations object in session storage in order to expose the allocations to the EvoTools Chrome extension.
// @author       Brian Norman
// @include      *
// @icon         https://imgur.com/zuOEoAT.png
// @grant        none
// ==/UserScript==

;(function () {
  "use strict"

  function run() {
    let confirmedAllocations = [];
    (function poll() {
      if (!(window.evolv &&
          window.evolv.context &&
          window.evolv.context.remoteContext &&
          window.evolv.context.remoteContext.confirmations)) {
        return setTimeout(poll, 50);
      }

      let allocations = window.evolv.context.remoteContext.experiments.allocations;
      let confirmations = window.evolv.context.remoteContext.confirmations;

      for (let i = 0; i < allocations.length; i++) {
        let allocation = allocations[i];
        let allocationCID = allocation.cid;

        for (let j = 0; j < confirmations.length; j++) {
          let confirmationCID = confirmations[j].cid;
          if (allocationCID === confirmationCID) {
            confirmedAllocations.push(allocation);
          }
        }
      }

      let allocationsJSON = JSON.stringify(confirmedAllocations);
      window.sessionStorage.setItem("evolv:allocations", allocationsJSON);
      window.dispatchEvent(new Event('run_content_script'));
    })();
  }

  /**
   * Handle SPA transitions
   */
  window.addEventListener('locationchange', function () {
    run();
  });

  history.pushState = (f => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('pushState'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  })(history.pushState);

  history.replaceState = (f => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('replaceState'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  })(history.replaceState);

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'))
  });
})();