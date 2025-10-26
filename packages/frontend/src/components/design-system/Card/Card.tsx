import { Card as MuiCard } from '@mui/material';
import type { CardProps } from '@mui/material/Card';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)<CardProps>(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

export const Card = (props: CardProps) => {
  return <StyledCard {...props} />;
};
