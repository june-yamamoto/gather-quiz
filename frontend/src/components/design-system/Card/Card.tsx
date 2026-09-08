import { Card as MuiCard } from '@mui/material';
import type { CardProps } from '@mui/material/Card';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)<CardProps>(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 8px 28px rgba(35,59,52,0.035)',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

export const Card = (props: CardProps) => {
  return <StyledCard {...props} />;
};
