export const waitForElement = async (selector: any, timeout = 5000) => {
	const startTime = Date.now();

	while (document.querySelector(selector) === null) {
		if (Date.now() - startTime > timeout) {
			throw new Error(`Timeout waiting for element with selector: ${selector}`);
		}

		await new Promise((resolve) => requestAnimationFrame(resolve));
	}

	return document.querySelector(selector);
};
