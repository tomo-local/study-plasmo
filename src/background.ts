chrome.commands.onCommand.addListener(function (command) {
  if (command === "open-search") {
    chrome.action.openPopup()
  }
})
