export const waitForElement = async (selector: any, timeout = 5000, interval = 100) => {
	const endTime = performance.now() + timeout;

	const poll = async (resolve: (element: Element | null) => void) => {
		const element = document.querySelector(selector);

		if (element !== null) {
			resolve(element);
		} else if (performance.now() < endTime) {
			setTimeout(() => poll(resolve), interval);
		} else {
			throw new Error(`Timeout waiting for element with selector: ${selector}`);
		}
	};

	return new Promise((resolve) => poll(resolve));
};
