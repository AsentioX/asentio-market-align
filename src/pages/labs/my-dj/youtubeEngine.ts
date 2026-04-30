// YouTube IFrame Player engine — same surface as audioEngine for hot-swap
// Loads the YT IFrame API on demand, mounts a hidden player, controls playback.

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type EngineState = 'stopped' | 'playing';

let apiPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return apiPromise;
}

export class YouTubeEngine {
  private player: any = null;
  private containerId = 'mydj-yt-player';
  private state: EngineState = 'stopped';
  private currentVolume = 0.7; // 0..1
  private onTrackEndCb: (() => void) | null = null;
  private ready = false;
  private pendingVideoId: string | null = null;

  async ensurePlayer() {
    if (this.player) return;
    await loadYouTubeAPI();

    // Mount hidden div if missing
    let host = document.getElementById(this.containerId);
    if (!host) {
      host = document.createElement('div');
      host.id = this.containerId;
      // Off-screen but kept renderable so YT can hand back audio
      host.style.cssText = 'position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;pointer-events:none;';
      document.body.appendChild(host);
    }

    await new Promise<void>((resolve) => {
      this.player = new window.YT.Player(this.containerId, {
        height: '1',
        width: '1',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            this.ready = true;
            this.player.setVolume(Math.round(this.currentVolume * 100));
            if (this.pendingVideoId) {
              const id = this.pendingVideoId;
              this.pendingVideoId = null;
              this.player.loadVideoById(id);
            }
            resolve();
          },
          onStateChange: (e: any) => {
            // YT.PlayerState.ENDED === 0
            if (e.data === 0 && this.onTrackEndCb) this.onTrackEndCb();
          },
          onError: (e: any) => {
            console.warn('YT player error', e?.data);
            // Treat as end → engine will pick a new video
            if (this.onTrackEndCb) this.onTrackEndCb();
          },
        },
      });
    });
  }

  setVolume(v: number) {
    this.currentVolume = Math.max(0, Math.min(1, v));
    if (this.ready && this.player?.setVolume) {
      this.player.setVolume(Math.round(this.currentVolume * 100));
    }
  }

  setOnTrackEnd(cb: () => void) { this.onTrackEndCb = cb; }

  async loadAndPlay(videoId: string) {
    await this.ensurePlayer();
    if (!this.ready) {
      this.pendingVideoId = videoId;
      return;
    }
    try {
      this.player.loadVideoById(videoId);
      // Some browsers need an explicit play kick
      this.player.playVideo?.();
    } catch (err) {
      console.warn('YT loadVideoById failed:', err);
    }
  }

  start() { this.state = 'playing'; }

  stop() {
    this.state = 'stopped';
    if (this.ready && this.player) {
      try { this.player.stopVideo(); } catch {}
    }
  }

  pause() {
    if (this.ready && this.player) {
      try { this.player.pauseVideo(); } catch {}
    }
  }

  resume() {
    if (this.ready && this.player) {
      try { this.player.playVideo(); } catch {}
    }
  }

  getState(): EngineState { return this.state; }

  getCurrentTime(): number {
    if (!this.ready || !this.player?.getCurrentTime) return 0;
    try { return this.player.getCurrentTime() || 0; } catch { return 0; }
  }

  getDuration(): number {
    if (!this.ready || !this.player?.getDuration) return 0;
    try { return this.player.getDuration() || 0; } catch { return 0; }
  }

  dispose() {
    this.stop();
    if (this.player?.destroy) {
      try { this.player.destroy(); } catch {}
    }
    this.player = null;
    this.ready = false;
  }
}

let instance: YouTubeEngine | null = null;
export function getYouTubeEngine(): YouTubeEngine {
  if (!instance) instance = new YouTubeEngine();
  return instance;
}
