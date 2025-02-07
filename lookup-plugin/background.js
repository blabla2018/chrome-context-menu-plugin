chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'main-menu',
    title: '@Look up',
    contexts: ['selection']
  });

  const subItems = [
    { id: 'spanish-dict', title: 'SpanishDict' },
    { id: 'spanish-dict-verb', title: 'SpanishDict (conjugate)' },
    { id: 'cambridge-dict', title: 'Cambridge dictionary' },
    { id: 'perplexity', title: 'Perplexity' },
    { id: 'kagi', title: 'Kagi' },
    { id: 'youtube', title: 'YouTube' }
  ];

  subItems.forEach(({ id, title }) => {
    chrome.contextMenus.create({
      id,
      parentId: 'main-menu',
      title,
      contexts: ['selection']
    });
  });
});

function handleAction({ actionId, tab, selectionText }) {
  const urls = {
    'spanish-dict': `https://www.spanishdict.com/translate/${encodeURIComponent(selectionText)}`,
    'spanish-dict-verb': `https://www.spanishdict.com/conjugate/${encodeURIComponent(selectionText)}`,
    'cambridge-dict': `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(selectionText)}`,
    'kagi': `https://kagi.com/search?q=${encodeURIComponent(selectionText)}`,
    'perplexity': `https://www.perplexity.ai/?q=${encodeURIComponent(selectionText)}`,
    'youtube': `https://www.youtube.com/results?search_query=${encodeURIComponent(selectionText)}`
  };

  const newUrl = urls[actionId];
  chrome.tabs.create({ url: newUrl });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleAction({ actionId: info.menuItemId, tab, selectionText: info.selectionText });
});

// Uncomment and modify the following code if you want to handle shortcuts
// chrome.commands.onCommand.addListener((command) => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs[0]) {
//       chrome.scripting.executeScript({
//         target: { tabId: tabs[0].id },
//         func: () => window.getSelection().toString()
//       }, ([result]) => {
//         handleAction({
//           actionId: command,
//           tab: tabs[0],
//           selectionText: result?.result
//         });
//       });
//     }
//   });
// });