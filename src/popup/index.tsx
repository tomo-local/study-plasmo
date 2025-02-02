import { useMachine } from "@xstate/react"
import React, { useEffect, useState } from "react"
import { createMachine } from "xstate"

import "../globals.css"

// ... (タブ検索、タブ追加、履歴検索のロジックは前回と同様)

const popupMachine = createMachine({
  // ... (xState の設定は前回と同様)
})

const Popup = () => {
  const [state, send] = useMachine(popupMachine)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    send({ type: "SET_SEARCH_TERM", searchTerm })
    // 検索ワードが変わったら自動で検索を実行
    if (searchTerm.length > 0) {
      send(
        state.context.searchType === "tabs" ? "SEARCH_TABS" : "SEARCH_HISTORY"
      )
    } else {
      // 検索ワードが空の場合は検索結果をクリア
      send({ type: "SET_TABS", data: [] })
      send({ type: "SET_HISTORY", data: [] })
    }
  }, [searchTerm, send, state.context.searchType])

  const handleSearchTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    send({ type: "SET_SEARCH_TYPE", searchType: event.target.value })
  }

  const handleTabClick = (tab: Tab) => {
    chrome.tabs.update({ active: true, tabId: tab.id })
    window.close()
  }

  return (
    <div className="p-4 w-80">
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-2 py-1 border border-gray-300 rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="mt-2">
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            className="form-radio"
            value="tabs"
            checked={state.context.searchType === "tabs"}
            onChange={handleSearchTypeChange}
          />
          <span className="ml-2">タブ</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio"
            value="history"
            checked={state.context.searchType === "history"}
            onChange={handleSearchTypeChange}
          />
          <span className="ml-2">履歴</span>
        </label>
      </div>

      {/* ... (検索結果の表示は前回と同様) */}
    </div>
  )
}

export default Popup
