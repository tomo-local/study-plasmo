import { useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import "../globals.css"

function IndexPopup() {
  const [posts, setPosts] = useState([])

  return (
    <div className="w-96 p-4">
      <button
        onClick={async () => {
          const res = await sendToBackground({
            name: "posts"
          })
          setPosts(res.posts)
        }}>
        Get posts
      </button>

      {posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                marginTop: "20px"
              }}>
              <div>{post.title}</div>
              <div>{post.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default IndexPopup
