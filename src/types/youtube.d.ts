// YouTube IFrame API type declarations
declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    mute(): void;
    unMute(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    destroy(): void;
  }

  interface PlayerOptions {
    height?: string;
    width?: string;
    videoId?: string;
    playerVars?: Record<string, unknown>;
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { data: number }) => void;
      onError?: (event: { data: number }) => void;
    };
  }

  const PlayerState: {
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}
