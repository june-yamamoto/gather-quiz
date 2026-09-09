import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

/** 選択肢を番号付きカードにし、長文でも本文のスクロール領域内に収める。 */
export const QuizChoices = ({ choices }: { choices: string[] }) => (
  <Box component="ol" aria-label="選択肢" sx={{
    display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
    gap: '2vmin', width: '100%', maxWidth: '100%', listStyle: 'none', m: 0, px: '2vmin', py: '2vmin', boxSizing: 'border-box',
  }}>
    {choices.map((choice, index) => (
      <Box component="li" key={index} sx={theme => ({
        display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'start', gap: '2vmin',
        minWidth: 0, p: '2.5vmin', borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.25),
        bgcolor: alpha(theme.palette.primary.main, 0.06), boxShadow: `0 3px 0 ${alpha(theme.palette.primary.main, 0.12)}`,
      })}>
        <Box aria-hidden="true" data-number={index + 1} sx={{
          '&::before': { content: 'attr(data-number)' },
          display: 'grid', placeItems: 'center', width: '1.8em', height: '1.8em', borderRadius: '50%',
          bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800, fontSize: 'clamp(18px, 2.8vmin, 36px)',
        }} />
        <Typography component="span" sx={{
          fontSize: 'clamp(20px, 3vmin, 44px)', lineHeight: 1.5, fontWeight: 600, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
        }}>{choice}</Typography>
      </Box>
    ))}
  </Box>
);
