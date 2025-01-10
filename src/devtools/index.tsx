import myPanelHTML from "url:~/src/devtools/index.html"

chrome.devtools.panels.create("My Panel", "", myPanelHTML)

function IndexDevtools() {
  return <></>
}

export default IndexDevtools
