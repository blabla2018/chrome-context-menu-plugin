chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'main-menu',
    title: '@Redirect',
    contexts: ['page', 'selection']
  });

  // Остальной код создания подпунктов остается без изменений
  const subItems = [
     { id: 'freedium', title: 'Freedium', documentUrlPatterns: ["*://*.medium.com/*"] },
     { id: 'redium', title: 'Redium', documentUrlPatterns: ["*://*.medium.com/*"] },
     { id: 'kagi-summarize', title: 'Kagi summarize' },
     { id: '12ft-io', title: 'Clean up in 12ft.io' },
     { id: 'web-archive', title: 'Wayback Machine' },
     { id: 'archive-is', title: 'archive.today' },
     { id: 'yandex', title: 'Yandex' }
  ];

  subItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      parentId: 'main-menu',
      title: item.title,
      contexts: ['page', 'selection'],
      documentUrlPatterns: item.documentUrlPatterns ? item.documentUrlPatterns : null
    });
  });
});


// Общая функция обработки
function handleAction(actionId, tab) {
  let newUrl;
  const originalUrl = encodeURIComponent(tab.url);

  switch(actionId) {
    case 'kagi-summarize':
      newUrl = `https://kagi.com/summarizer/index.html?target_language=RU&summary=takeaway&url=${originalUrl}`;
      break;

    case '12ft-io':
      newUrl = `https://12ft.io/proxy?q=${originalUrl}`;
      break;

    case 'web-archive':
      newUrl = `https://web.archive.org/web/2/${originalUrl}`;
      break;

    case 'archive-is':
      newUrl = `https://archive.is/${originalUrl}`;
      handleArchiveIs(newUrl, ['div[class="THUMBS-BLOCK"] a']);
      return;

    case 'yandex':
      newUrl = `https://yandex.com/search/?text=url:${originalUrl}`;
      handleArchiveIs(newUrl,  [ 'span[class~="Icon2"]', 'div[class="ExtralinksPopup-Links"] a']);
      return;


    case 'freedium':
        newUrl = `https://freedium.cfd/${originalUrl}`;
      break;

    case 'redium':
        newUrl = tab.url.replace(/(https:\/\/)(?:[a-zA-Z0-9-]+\.)?medium\.com/gi, "$1readmedium.com");
      break;
  }

chrome.tabs.create({ url: newUrl });
//  if (newUrl) {
//    try {
//      new URL(newUrl);
//
//      //chrome.tabs.create({ url: newUrl });
//    } catch(error) {
//      console.error('Invalid URL:', newUrl, error);
//    }
//  }

//const newTab = chrome.tabs.create({url: newUrl});
////  if (actionId.equals("archive-is")) {
////  console.error("archive-is")
//  chrome.scripting.executeScript({
//          target: { tabId: newTab.id },
//          func: clickThumbsBlock,
//        }).catch(error => {
//          console.error('Script injection failed:', error);
//        });
//   //     }
}

// Обработка кликов в меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleAction(info.menuItemId, tab);
});


// Обработка шорткатов
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      handleAction(command, tabs[0]);
    }
  });
});

function handleArchiveIs(newUrl, selectors) {
  chrome.tabs.create({ url: newUrl }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
            func: async (items) => {
              for (const selector of items) {
                await new Promise(resolve => {
                  setTimeout(() => {
                    const element = document.querySelector(selector);
                    element?.click();
                    resolve();
                  }, 1000); // Фиксированная задержка 1 сек
                });
              }
            },
          args: [selectors]
        });
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
}

//function handleArchiveIs(newUrl, selectors) {
//  chrome.tabs.create({ url: newUrl }, (tab) => {
//    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
//      if (tabId === tab.id && changeInfo.status === 'complete') {
//        chrome.scripting.executeScript({
//          target: { tabId: tabId },
//          func: (items) => {  // Используем параметр 's' как селектор
//
//            items.forEach(item => {
//            const element = document.querySelector(item);
//            if (element) {
//             setTimeout(() => {}, 500);
//              element.click();
//
//            }
//            })
//          },
//          args: [selectors]  // Передаем селектор как аргумент
//        });
//        chrome.tabs.onUpdated.removeListener(listener);
//      }
//    });
//  });
//}

//// Функция для клика по элементу
//function clickThumbsBlock() {
//  return new Promise((resolve, reject) => {
//    const selector = 'div[class="THUMBS-BLOCK"] a';
//    let attempts = 0;
//
//    const tryClick = () => {
//      const element = document.querySelector(selector);
//
//      if (element) {
//        element.click();
//        resolve();
//      } else if (attempts < 10) { // 10 попыток с интервалом 500ms
//        attempts++;
//        setTimeout(tryClick, 500);
//      } else {
//        reject(new Error('Element not found'));
//      }
//    };
//
//    tryClick();
//  });
//}

// Обработка шорткатов
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
//});(function() {


// DEBUG


//(async function() {
//    const selectors = [
//        'span[class~="Icon2"]',
//        'div[class="ExtralinksPopup-Links"] a'
//    ];
//
//    for (const selector of selectors) {
//        await new Promise(resolve => {
//            setTimeout(() => {
//                const element = document.querySelector(selector);
//                element?.click();
//                resolve();
//            }, 500); // Фиксированная задержка 1 сек между всеми шагами
//        });
//    }
//})();