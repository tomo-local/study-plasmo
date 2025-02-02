import SearchBar from "~components/SearchBar"
import ResultLine from "~components/ResultLine"
import { useEffect, useRef, useState } from "react"

import "~/globals.css"


const Popup = () => {
  const [tabs, setTabs] = useState([])
  const [history, setHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const listRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    handleTabSearch("", 5)

    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  const handleTabSearch = async (query: string, count: number) => {
    const allWindows = await chrome.windows.getAll({
      windowTypes: ["normal"]
    })

    const notFocusedWindowIds = allWindows.map((window) => window.id)

    const currentWindows = await chrome.windows.getCurrent()

    if (currentWindows) {
      notFocusedWindowIds.unshift(currentWindows.id)
    }

    const allTabs = await Promise.all(
      [...new Set(notFocusedWindowIds)].map((windowId) =>
        chrome.tabs.query({ windowId })
      )
    ).then((results) => results.flat())

    if (query === "") {
      setTabs([...allTabs])
      return
    }

    const exactMatches = allTabs.filter((tab) =>
      tab.title.toLowerCase().includes(query.toLowerCase())
    )

    if (exactMatches.length === 0) {
      setTabs([])
      return
    }

    setSelectedIndex(0)

    if (count) {
      setTabs([...exactMatches.slice(0, count)])
      return
    }

    setTabs([...exactMatches])
  }

  const handleHistorySearch = async (query: string) => {
    if (query === "") {
      setHistory([]) // 空文字の場合は履歴を表示しない
      return
    }
    const splitQuery = query.split("|").map((q) => q.trim())

    await Promise.all(
      splitQuery.map((q) =>
        chrome.history.search(
          {
            text: q,
            startTime: new Date().setDate(new Date().getDate() - 30),
            endTime: new Date().getTime(),
            maxResults: 20
          },
          (results) => {
            setHistory((prev) => [
              ...prev,
              ...uniqueObjects(results).filter(
                (result) => !prev.some((item) => item.url === result.url)
              )
            ])
          }
        )
      )
    )
  }

  function uniqueObjects(arr: { title: string; url: string }[]) {
    const seen = new Set()
    const result = []

    for (const obj of arr) {
      const key = obj.title || obj.url // titleまたはurlをキーとして使用

      if (!seen.has(key)) {
        seen.add(key)
        result.push(obj)
      }
    }

    return result
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    handleTabSearch(e.target.value, 10)
    handleHistorySearch(e.target.value) // 入力内容に応じて履歴検索も実行
    setSelectedIndex(-1) // 検索時に選択状態をリセット
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && selectedIndex >= 0) {
      const item = combinedResults[selectedIndex]
      if (item.type === "tab") {
        chrome.tabs.update(item.id, { active: true })
        window.close()
      } else {
        window.open(item.url, "_blank")
      }
      setSelectedIndex(-1) // 選択後、選択状態をリセット
    } else if (e.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, combinedResults.length - 1)
      )
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0))
    }
  }

  const handleMouseEnter = (index: number) => {
    setSelectedIndex(index)
  }

  const getCombinedResults = () => {
    const combined = [
      ...tabs.map((tab) => ({ ...tab, type: "tab" })),
      ...history.map((item) => ({ ...item, type: "history" }))
    ]
    return combined // 候補数制限を削除
  }

  const combinedResults = getCombinedResults()

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedItem = listRef.current.children[selectedIndex]
      selectedItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      })
    }
  }, [selectedIndex])

  return (
    <div className="px-4 pt-2 pb-3 font-sans text-white bg-gray-800 w-[700px]">
      <div className="sticky top-0 border-b border-gray-700 ">
        <SearchBar
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={searchInputRef}
        />
      </div>
      <div className="mt-4 bg-gray-800 rounded">
        <ul
          ref={listRef}
          className="overflow-y-scroll max-h-[400px] hidden-scrollbar">
          {combinedResults.map((item, index) => (
            <ResultLine
              key={item.id}
              item={item}
              index={index}
              selectedIndex={selectedIndex}
              onMouseEnter={handleMouseEnter}
              onClick={() => {
                if (item.type === "tab") {
                  chrome.tabs.update(item.id, { active: true })
                  window.close()
                } else {
                  window.open(item.url, "_blank")
                }
              }}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Popup
