import { useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { Input } from './design-system/Input/Input';
import { MEDIA_TYPES, safeMediaUrl, validateMediaFile } from '../helpers/media';

type Props = {
  label: string;
  url: string;
  file: File | null;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
};

/** ファイルとURLを同じ添付枠として扱い、置き換えや取消を明示する。 */
export const MediaAttachmentField = ({ label, url, file, onUrlChange, onFileChange }: Props) => {
  const [error, setError] = useState('');
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2">{label}の動画・音声・URL</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        ファイルまたはURLを1件設定できます。画像とも併用できます。
      </Typography>
      <Button component="label" variant="outlined" fullWidth>
        動画・音声を選択
        <input
          hidden
          type="file"
          aria-label={`${label}の動画・音声ファイル`}
          accept={MEDIA_TYPES.join(',')}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            event.target.value = '';
            if (!selected) return;
            const message = validateMediaFile(selected);
            setError(message || '');
            if (!message) onFileChange(selected);
          }}
        />
      </Button>
      <Typography variant="caption" display="block" sx={{ my: 1 }}>
        100 MBまで。動画: MP4・WebM ／ 音声: MP3・M4A・WAV・Ogg・WebM
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {file && (
        <Box sx={{ my: 1 }}>
          <Typography variant="body2">選択中のファイル: {file.name}</Typography>
          <Button onClick={() => onFileChange(null)}>ファイル選択を取り消す</Button>
        </Box>
      )}
      <Input
        label={`${label}のURL（参考リンク）`}
        fullWidth
        disabled={!!file}
        value={url}
        inputProps={{ inputMode: 'url', autoCapitalize: 'none', spellCheck: false, maxLength: 2048 }}
        error={!!url.trim() && !safeMediaUrl(url)}
        helperText={
          file
            ? '保存すると選択ファイルでURLを置き換えます。'
            : 'HTTP・HTTPS URL。YouTubeや動画・音声の直接URLは画面内で再生できます。'
        }
        onChange={(event) => onUrlChange(event.target.value)}
      />
      {(file || url) && (
        <Button
          onClick={() => {
            onFileChange(null);
            onUrlChange('');
            setError('');
          }}
        >
          動画・音声・URLを削除
        </Button>
      )}
    </Box>
  );
};
