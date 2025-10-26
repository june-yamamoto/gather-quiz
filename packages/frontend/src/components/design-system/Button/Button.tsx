import { Button as MuiButton } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import type { LinkProps } from 'react-router-dom';

type CustomButtonProps = ButtonProps & Partial<LinkProps>;

const StyledButton = styled(MuiButton)<CustomButtonProps>(({ theme, variant, color = 'primary' }) => {
  const buttonColor =
    color === 'inherit' || color === 'success' || color === 'error' || color === 'info' || color === 'warning'
      ? 'primary'
      : color;

  return {
    // 共通のスタイル
    borderRadius: '4px',
    padding: '12px 24px',
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: 'none',

    // variantに応じたスタイル
    ...(variant === 'contained' && {
      color: theme.palette.common.white,
      backgroundColor: theme.palette[buttonColor].main,
      '&:hover': {
        backgroundColor: theme.palette[buttonColor].dark,
        boxShadow: 'none',
      },
    }),
    ...(variant === 'outlined' && {
      border: `2px solid ${theme.palette[buttonColor].main}`,
      color: theme.palette[buttonColor].main,
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)', // わずかに背景色を変える
        border: `2px solid ${theme.palette[buttonColor].dark}`,
      },
    }),
    ...(variant === 'text' && {
      color: theme.palette[buttonColor].main,
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    }),
  };
});

export const Button = (props: CustomButtonProps) => {
  return <StyledButton {...props} />;
};
