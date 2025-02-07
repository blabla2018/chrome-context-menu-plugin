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
  const originalUrl = encodeURIComponent(tab.url);
  let newUrl;

  const urlMappings = {
    'kagi-summarize': `https://kagi.com/summarizer/index.html?target_language=RU&summary=takeaway&url=${originalUrl}`,
    '12ft-io': `https://12ft.io/proxy?q=${originalUrl}`,
    'web-archive': `https://web.archive.org/web/2/${originalUrl}`,
    'freedium': `https://freedium.cfd/${originalUrl}`,
    'redium': tab.url.replace(/(https:\/\/)(?:[a-zA-Z0-9-]+\.)?medium\.com/gi, "$1readmedium.com")
  };

  newUrl = urlMappings[actionId];

  if (actionId === 'archive-is') {
    newUrl = `https://archive.is/${originalUrl}`;
    openAndClickElements(newUrl, ['div[class="THUMBS-BLOCK"] a']);
    return;
  }

  if (actionId === 'yandex') {
    newUrl = `https://yandex.com/search/?text=url:${originalUrl}`;
    openAndClickElements(newUrl, ['span[class~="Icon2"]', 'div[class="ExtralinksPopup-Links"] a']);
    return;
  }

  if (newUrl) {
    chrome.tabs.create({ url: newUrl });
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleAction(info.menuItemId, tab);
});

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      handleAction(command, tabs[0]);
    }
  });
});

function openAndClickElements(newUrl, selectors) {
  chrome.tabs.create({ url: newUrl }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: clickElements,
          args: [selectors]
        });
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
}

// function executeClickScript(tabId, selectors) {
//   chrome.scripting.executeScript({
//     target: { tabId: tabId },
//     func: clickElements,
//     args: [selectors]
//   });
// }

async function clickElements(selectors) {
  for (const selector of selectors) {
    await new Promise(resolve => {
      setTimeout(() => {
        const element = document.querySelector(selector);
        element?.click();
        resolve();
      }, 1000);
    });
  }
}


// DEBUG for browser console
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
//            }, 500); 
//        });
//    }
//})();