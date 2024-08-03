let sharedData = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'set') {
        sharedData[message.key] = message.value;
        sendResponse({ status: 'success' });
    } else if (message.type === 'get') {
        sendResponse({ value: sharedData[message.key] });
    }
});
