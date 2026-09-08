import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { resolveMedia } from '../helpers/media';
import { loadYouTubeApi, type YouTubePlayer } from '../api/YouTubePlayer';

type Props = { url: string; label: string; onPlayed?: () => void };

/** URL変更時はプレイヤーを作り直し、前の音声やエラー状態を持ち越さない。 */
export const QuizMedia = (props: Props) => <MediaPlayer key={props.url} {...props} />;

/** 読み込み失敗を通知し、再試行と外部で開く操作を常に用意する。 */
const MediaPlayer = ({ url, label, onPlayed }: Props) => {
  const media = resolveMedia(url);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!media && media.kind !== 'link');
  const host = useRef<HTMLDivElement>(null);
  const played = useRef(onPlayed);
  played.current = onPlayed;
  const kind = media?.kind;
  const id = media?.id;

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setError('読み込みに時間がかかっています。接続を確認して再試行してください。');
    }, 20000);
    return () => clearTimeout(timer);
  }, [loading, attempt]);

  useEffect(() => {
    if (!kind || kind === 'link') return;
    let cancelled = false;
    let player: YouTubePlayer | undefined;

    if (kind === 'youtube' && id && host.current) {
      const container = host.current;
      const mount = document.createElement('div');
      container.appendChild(mount);
      void loadYouTubeApi()
        .then((api) => {
          if (cancelled) return;
          player = new api.Player(mount, {
            videoId: id,
            host: 'https://www.youtube-nocookie.com',
            playerVars: { origin: window.location.origin, playsinline: 1, autoplay: 0 },
            events: {
              onReady: () => {
                if (!cancelled) {
                  setLoading(false);
                  setError('');
                }
              },
              onError: () => {
                if (!cancelled) {
                  setLoading(false);
                  setError('YouTubeを再生できません。動画の公開状態や埋め込み許可を確認してください。');
                }
              },
              onStateChange: ({ data }) => {
                if (cancelled) return;
                if (data === 3) setLoading(true);
                if (data === 1) {
                  setLoading(false);
                  setError('');
                  played.current?.();
                }
                if (data === 0 || data === 2) setLoading(false);
              },
            },
          });
        })
        .catch(() => {
          if (!cancelled) {
            setLoading(false);
            setError('YouTubeを読み込めませんでした。接続やブラウザの設定を確認してください。');
          }
        });
      return () => {
        cancelled = true;
        player?.destroy();
        container.replaceChildren();
      };
    }
    return () => {
      cancelled = true;
    };
  }, [kind, id, attempt]);

  if (!media) return <Alert severity="error">無効なURLです。HTTPまたはHTTPSのURLに編集してください。</Alert>;
  /** 手動再試行時に再生要素と待機時間をリセットする。 */
  const retry = () => {
    setError('');
    setLoading(true);
    setAttempt((value) => value + 1);
  };
  /** 実際のメディア読み込み成功後は待機状態を解除する。 */
  const loaded = () => {
    setLoading(false);
    setError('');
  };
  /** 未対応コーデック・404・ネットワーク障害を共通表示する。 */
  const failed = () => {
    setLoading(false);
    setError('メディアを読み込めませんでした。URL・接続・ファイル形式を確認してください。');
  };
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 800,
        my: 1,
        '& video, & audio, & iframe': { display: 'block', width: '100%', maxWidth: '100%' },
        '& video, & iframe': { aspectRatio: '16 / 9', minHeight: 200, border: 0 },
      }}
    >
      {kind === 'video' && (
        <video
          key={attempt}
          aria-label={label}
          src={media.url}
          controls
          playsInline
          preload="metadata"
          onLoadedData={loaded}
          onLoadedMetadata={loaded}
          onPlaying={() => {
            loaded();
            played.current?.();
          }}
          onError={failed}
          onWaiting={() => setLoading(true)}
          onStalled={() => setLoading(true)}
          onCanPlay={loaded}
        />
      )}
      {kind === 'audio' && (
        <audio
          key={attempt}
          aria-label={label}
          src={media.url}
          controls
          preload="metadata"
          onLoadedMetadata={loaded}
          onPlaying={() => {
            loaded();
            played.current?.();
          }}
          onError={failed}
          onWaiting={() => setLoading(true)}
          onStalled={() => setLoading(true)}
          onCanPlay={loaded}
        />
      )}
      {kind === 'youtube' && <Box ref={host} aria-label={`${label} YouTube`} />}
      {loading && (
        <Typography role="status" variant="body2">
          メディアを読み込み中…
        </Typography>
      )}
      {error && (
        <Alert
          severity="warning"
          action={
            <Button sx={{ whiteSpace: 'nowrap', minWidth: 72 }} onClick={retry}>
              再試行
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      <Link
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'block', overflowWrap: 'anywhere', mt: 1 }}
      >
        {kind === 'link' ? `参考リンク: ${media.url}` : 'メディアを別のタブで開く'}
      </Link>
      {kind === 'youtube' && <Typography variant="caption">再生できない場合は別のタブで開いてください。</Typography>}
    </Box>
  );
};
