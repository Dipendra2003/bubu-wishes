import React, { useEffect, useRef } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  playing?: boolean;
  autoPlay?: boolean;
  className?: string;
  onStateChange?: (isPlaying: boolean) => void;
}

export function YouTubeEmbed({
  videoId,
  playing = false,
  autoPlay = false,
  className = '',
  onStateChange
}: YouTubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isLoadedRef = useRef(false);

  // Send play/pause postMessage commands to YouTube IFrame API
  useEffect(() => {
    if (!isLoadedRef.current || !iframeRef.current?.contentWindow) return;

    const command = playing ? 'playVideo' : 'pauseVideo';
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: '' }),
      '*'
    );
  }, [playing]);

  // Listen to messages from YouTube to sync playing state if user taps play inside iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange') {
            // YT.PlayerState.PLAYING is 1, PAUSED is 2, ENDED is 0
            if (data.info === 1) onStateChange?.(true);
            else if (data.info === 2 || data.info === 0) onStateChange?.(false);
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStateChange]);

  const shouldAutoplay = playing || autoPlay;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=${shouldAutoplay ? 1 : 0}&playsinline=1&rel=0${originParam}`;

  return (
    <iframe
      ref={iframeRef}
      key={videoId}
      src={embedUrl}
      title="YouTube Music"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      onLoad={() => {
        isLoadedRef.current = true;
        if (playing) {
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
              '*'
            );
          }, 300);
        }
      }}
      className={className || "w-full h-full border-0"}
    />
  );
}
