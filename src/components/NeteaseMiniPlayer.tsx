import { Component, onMount } from "solid-js"

export const NeteaseMiniPlayer: Component = () => {
  onMount(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href =
      "https://api.hypcvgm.top/NeteaseMiniPlayer/netease-mini-player-v2.css"
    document.head.appendChild(link)
    const script = document.createElement("script")
    script.src =
      "https://api.hypcvgm.top/NeteaseMiniPlayer/netease-mini-player-v2.js"
    script.async = true
    document.body.appendChild(script)
  })

  return (
    <div
      class="netease-mini-player"
      data-playlist-id="28575553"
      data-embed="false"
      data-position="bottom-right"
      data-lyric="true"
      data-theme="auto"
    />
  )
}
