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
  "use strict";

  const waitForElement = async (selector) => {
    while (document.querySelector(selector) === null) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return document.querySelector(selector);
  };

  // set the allocations in localStorage
  waitForElement('script[src*="participants.evolv.ai/v1/"]').then((el) => {
    let allocations =
      window.evolv.client.context.remoteContext.experiments.allocations;
    let allocationsJSON = JSON.stringify(allocations);
    window.sessionStorage.setItem("evolv:allocations", allocationsJSON);
  });
})();
