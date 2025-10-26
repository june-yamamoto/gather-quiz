import { Paper, Typography } from '@mui/material';
import type { PaperProps } from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

type QuizCardProps = PaperProps & {
  point: number;
  isAnswered?: boolean;
  onClick?: () => void;
};

type StyledQuizCardProps = Omit<QuizCardProps, 'point'>;

const StyledQuizCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isAnswered',
})<StyledQuizCardProps>(({ theme, isAnswered, onClick }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  width: '100%',
  minHeight: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: onClick ? 'pointer' : 'default',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  border: `1px solid ${theme.palette.grey[300]}`,
  boxShadow: 'none',

  ...(onClick && {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4],
    },
  }),

  ...(isAnswered
    ? {
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.text.disabled,
      }
    : {
        backgroundColor: theme.palette.background.paper,
      }),
}));

export const QuizCard = ({ point, isAnswered, onClick, ...props }: QuizCardProps) => {
  return (
    <StyledQuizCard isAnswered={isAnswered} onClick={onClick} role={onClick ? 'button' : undefined} {...props}>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {point}
      </Typography>
    </StyledQuizCard>
  );
};
