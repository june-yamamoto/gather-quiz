import { Paper, Typography, Box, Chip } from '@mui/material';
import type { PaperProps } from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { getGenreColor } from '../../../helpers/color-helpers';

type QuizCardProps = PaperProps & {
  point: number;
  isAnswered?: boolean;
  isUncreated?: boolean;
  genre?: string | null;
  onClick?: () => void;
};

type StyledQuizCardProps = Omit<QuizCardProps, 'point'>;

const StyledQuizCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isAnswered' && prop !== 'isUncreated',
})<StyledQuizCardProps>(({ theme, isAnswered, isUncreated, onClick }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  width: '100%',
  minHeight: '112px',
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: onClick ? 'pointer' : 'default',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',

  ...(onClick && {
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor: theme.palette.primary.main,
      boxShadow: '0 8px 20px rgba(35,59,52,0.08)',
    },
  }),

  ...(isAnswered
    ? {
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.text.secondary,
      }
    : isUncreated
    ? {
        backgroundColor: theme.palette.background.default,
        border: `2px dashed ${theme.palette.grey[400]}`,
        color: theme.palette.text.secondary,
      }
    : {
        backgroundColor: theme.palette.background.paper,
      }),
}));

export const QuizCard = ({ point, isAnswered, isUncreated, genre, onClick, ...props }: QuizCardProps) => {
  return (
    <StyledQuizCard isAnswered={isAnswered} isUncreated={isUncreated} onClick={onClick} role={onClick ? 'button' : undefined} {...props}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {genre && !isUncreated && (
          <Chip
            label={genre}
            size="small"
            sx={{
              backgroundColor: isAnswered ? undefined : getGenreColor(genre),
              color: isAnswered ? undefined : '#fff',
              fontWeight: 'bold',
              mb: 1,
              maxWidth: '90%',
              opacity: isAnswered ? 0.6 : 1,
            }}
          />
        )}
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {point}
        </Typography>
        {isUncreated && (
          <Typography variant="caption" display="block">
            未作成
          </Typography>
        )}
      </Box>
    </StyledQuizCard>
  );
};
