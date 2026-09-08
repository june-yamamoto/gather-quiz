import { useState } from 'react';
import { Alert, Box, Button, ButtonBase, Dialog, IconButton, Typography } from '@mui/material';
import { Close, ZoomIn } from '@mui/icons-material';

type Props = { src: string; alt: string; onLoad?: () => void; contained?: boolean };

/** 本文の高さを圧迫せず画像を表示し、細部は独立した画面で確認できるようにする。 */
export const ExpandableQuizImage = ({ src, alt, onLoad, contained = false }: Props) => {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (error) return <Alert severity="warning" action={<Button onClick={() => { setError(false); setAttempt((value) => value + 1); }}>再試行</Button>}>
    {alt}を読み込めませんでした。接続と画像URLを確認してください。
  </Alert>;
  return <>
    <ButtonBase onClick={() => { setZoomed(false); setOpen(true); }} aria-label={`${alt}を拡大`}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: '100%', height: contained ? '100%' : undefined, minHeight: 0, flexShrink: 0, p: 1, borderRadius: 2,
        '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.main' } }}>
      <Box component="img" key={attempt} src={src} alt={alt} onLoad={onLoad} onError={() => { setOpen(false); setError(true); }}
        sx={{ display: 'block', maxWidth: '100%', minHeight: 0, flex: contained ? 1 : undefined, maxHeight: contained ? '100%' : '45dvh', objectFit: 'contain', borderRadius: 1 }} />
      <Typography component="span" variant="body2" sx={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: 0.5 }}><ZoomIn fontSize="small" />画像を拡大</Typography>
    </ButtonBase>
    <Dialog fullScreen open={open} onClose={() => setOpen(false)} PaperProps={{ 'aria-label': '画像の拡大表示' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, flexShrink: 0 }}>
        <Typography>{alt}</Typography>
        <Button onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>{zoomed ? '全体を表示' : '2倍に拡大'}</Button>
        <IconButton aria-label="画像の拡大表示を閉じる" onClick={() => setOpen(false)}><Close /></IconButton>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
        <Box component="img" src={src} alt={`${alt}（拡大）`}
          sx={{ display: 'block', width: zoomed ? '200%' : '100%', maxWidth: 'none', height: 'auto' }} />
      </Box>
    </Dialog>
  </>;
};
