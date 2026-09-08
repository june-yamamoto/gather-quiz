/** ブラウザの標準プレイヤーで扱うアップロード形式。 */
export const MEDIA_TYPES = [
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
];
export const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

/** HTMLや認証情報入りURLを画面へ渡さない。 */
export const safeMediaUrl = (value: string): string | null => {
  if (value.length > 2048 || [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127))
    return null;
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
};

/** 選択直後とアップロード直前に同じ制限を適用する。 */
export const validateMediaFile = (file: Pick<File, 'size' | 'type'>): string | null => {
  if (!MEDIA_TYPES.includes(file.type)) return '対応形式は MP4・WebM（動画）、MP3・M4A・WAV・Ogg・WebM（音声）です。';
  if (file.size <= 0 || file.size > MAX_MEDIA_BYTES)
    return '空のファイルは添付できません。100 MB以下のファイルを選択してください。';
  return null;
};

/** 許可したサービスだけを埋め込み、一般ページは通常のリンクにする。 */
export const resolveMedia = (
  value: string
): { kind: 'video' | 'audio' | 'youtube' | 'link'; url: string; id?: string } | null => {
  const safe = safeMediaUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  let id: string | null | undefined;
  if (url.hostname === 'youtu.be') id = url.pathname.split('/')[1];
  if (
    ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(
      url.hostname
    )
  ) {
    id =
      url.pathname === '/watch'
        ? url.searchParams.get('v')
        : /^\/(?:embed|shorts|live)\/([^/]+)\/?$/.exec(url.pathname)?.[1];
  }
  if (id && /^[\w-]{11}$/.test(id)) return { kind: 'youtube', id, url: safe };
  if (/\.(mp4|webm|ogv)$/i.test(url.pathname)) return { kind: 'video', url: safe };
  if (/\.(mp3|m4a|wav|ogg|oga|weba)$/i.test(url.pathname)) return { kind: 'audio', url: safe };
  return { kind: 'link', url: safe };
};
