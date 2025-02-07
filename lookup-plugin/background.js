chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'main-menu',
    title: '@Look up',
    contexts: ['selection']
  });

  // Остальной код создания подпунктов остается без изменений
  const subItems = [
      { id: 'spanish-dict', title: 'SpanishDict' },
      { id: 'spanish-dict-verb', title: 'SpanishDict (conjugate)' },
      { id: 'cambridge-dict', title: 'Cambridge dictionary' },
      { id: 'perplexity', title: 'Perplexity' },
      { id: 'kagi', title: 'Kagi' },
      { id: 'youtube', title: 'YouTube' }
  ];

  subItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      parentId: 'main-menu',
      title: item.title,
      contexts: ['selection']
    });
  });
});


// Общая функция обработки
function handleAction({actionId, tab, selectionText}) {
  let newUrl;
  const originalUrl = encodeURIComponent(tab.url);

  switch(actionId) {
    case 'spanish-dict':
        newUrl = `https://www.spanishdict.com/translate/${encodeURIComponent(selectionText)}`;
      break;

    case 'spanish-dict-verb':
        newUrl = `https://www.spanishdict.com/conjugate/${encodeURIComponent(selectionText)}`;
      break;

    case 'cambridge-dict':
        newUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(selectionText)}`;
      break;

    case 'kagi':
        newUrl = `https://kagi.com/search?q=l${encodeURIComponent(selectionText)}`;
      break;

    case 'perplexity':
        newUrl = `https://www.perplexity.ai/?q=${encodeURIComponent(selectionText)}`;
      break;

    case 'youtube':
        newUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(selectionText)}`;
      break;
  }

  if (newUrl) {
    try {
      new URL(newUrl);
      chrome.tabs.create({ url: newUrl });
    } catch(error) {
      console.error('Invalid URL:', newUrl, error);
    }
  }
}

// Обработка кликов в меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleAction({actionId: info.menuItemId, tab, selectionText: info.selectionText});
});

//// Обработка шорткатов
//chrome.commands.onCommand.addListener((command) => {
//  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//    if (tabs[0]) {
//      // Для шорткатов получаем выделенный текст отдельно
//      chrome.scripting.executeScript({
//        target: {tabId: tabs[0].id},
//        func: () => window.getSelection().toString()
//      }, ([result]) => {
//        handleAction({
//          actionId: command,
//          tab: tabs[0],
//          selectionText: result?.result
//        });
//      });
//    }
//  });
//});