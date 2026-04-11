"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Pause, SkipForward, ChevronDown, Volume2, VolumeX, Radio } from "lucide-react";
import { t } from "@/lib/dele/translations";

/**
 * Streaming study music player — YouTube IFrame API.
 * Spanish-focused music selection for DELE study sessions.
 */

const TRACKS = [
  { id: "jfKfPfyJRdk", title: "Lofi Hip Hop Radio \u2014 relajar/estudiar", live: true },
  { id: "4xDzrJKXOOY", title: "Synthwave Radio \u2014 chill/concentracion", live: true },
  { id: "rUxyKA_-grg", title: "Lofi Girl \u2014 dormir/relajarse", live: false },
  { id: "5qap5aO4i9A", title: "Lofi Hip Hop Radio \u2014 beats para estudiar", live: true },
  { id: "DWcJFNfaw9c", title: "Cafe Radio \u2014 beats para concentrarse", live: true },
] as const;

const PANEL_RIGHT = 16;
const PANEL_BOTTOM = 72;
const PANEL_WIDTH = 288;
const VIDEO_HEIGHT = Math.round(PANEL_WIDTH * 9 / 16);
const BELOW_VIDEO = 124;

const VIDEO_VISIBLE_STYLE: React.CSSProperties = {
  position: "fixed",
  bottom: PANEL_BOTTOM + BELOW_VIDEO,
  right: PANEL_RIGHT,
  width: PANEL_WIDTH,
  height: VIDEO_HEIGHT,
  overflow: "hidden",
  zIndex: 100,
  borderRadius: "0",
  background: "#000",
};

const VIDEO_HIDDEN_STYLE: React.CSSProperties = {
  position: "fixed",
  left: -9999,
  top: -9999,
  width: PANEL_WIDTH,
  height: VIDEO_HEIGHT,
  overflow: "hidden",
  zIndex: -1,
};

export function DELEStudyPlayer() {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [everStarted, setEverStarted] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);

  const track = TRACKS[trackIdx];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).YT?.Player) { setPlayerReady(true); return; }
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => { if (prev) prev(); setPlayerReady(true); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (!playerReady || !everStarted) return;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }
    const el = document.getElementById("yt-dele-study-player");
    if (!el) return;
    el.innerHTML = "";
    playerRef.current = new (window as any).YT.Player("yt-dele-study-player", {
      height: String(VIDEO_HEIGHT),
      width: String(PANEL_WIDTH),
      videoId: track.id,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin: typeof window !== "undefined" ? window.location.origin : "",
      },
      events: {
        onReady: (e: any) => {
          e.target.playVideo();
          if (muted) e.target.mute(); else e.target.unMute();
          e.target.setVolume(40);
          setPlaying(true);
        },
        onStateChange: (e: any) => {
          if (e.data === 0) nextTrack();
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerReady, everStarted, trackIdx]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playing) { playerRef.current.pauseVideo(); setPlaying(false); }
    else { playerRef.current.playVideo(); setPlaying(true); }
  }, [playing]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (muted) { playerRef.current.unMute(); setMuted(false); }
    else { playerRef.current.mute(); setMuted(true); }
  }, [muted]);

  function nextTrack() {
    setTrackIdx((i) => (i + 1) % TRACKS.length);
    setPlaying(true);
  }

  function handleFloatingClick() {
    if (!everStarted) {
      setEverStarted(true);
      setExpanded(true);
      return;
    }
    togglePlay();
  }

  const showVideo = expanded && everStarted;

  return (
    <>
      <div
        style={showVideo ? VIDEO_VISIBLE_STYLE : VIDEO_HIDDEN_STYLE}
        aria-hidden={!showVideo}
      >
        <div
          id="yt-dele-study-player"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
        {expanded && (
          <div className="w-72 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/95">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-500" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{t.music_study_radio}</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label={t.music_minimize}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div style={{ height: VIDEO_HEIGHT, background: "#000" }} aria-hidden="true" />

            <div className="px-4 py-3">
              <p className={`truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100 ${playing ? "" : "opacity-60"}`}>
                {track.title}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {track.live && (
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-500">LIVE</span>
                )}
                <span className="text-xs text-zinc-400">YouTube</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <button
                onClick={toggleMute}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label={muted ? t.music_unmute : t.music_mute}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700"
                aria-label={playing ? t.music_pause : t.music_play}
              >
                {playing ? <Pause className="h-5 w-5" /> : <Music className="ml-0.5 h-5 w-5" />}
              </button>
              <button
                onClick={nextTrack}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label={t.music_next}
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleFloatingClick}
          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all ${
            playing
              ? "bg-red-600 text-white hover:bg-red-700 ring-4 ring-red-600/20"
              : "bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
          aria-label={!everStarted ? t.music_start : playing ? t.music_pause : t.music_play}
        >
          {!everStarted ? (
            <Music className="h-5 w-5" />
          ) : playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Music className="h-5 w-5" />
          )}
        </button>
      </div>
    </>
  );
}
