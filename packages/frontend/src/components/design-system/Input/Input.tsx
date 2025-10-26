import { TextField as MuiTextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(MuiTextField)<TextFieldProps>(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '4px',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.grey[400],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

export const Input = (props: TextFieldProps) => {
  return <StyledTextField {...props} variant="outlined" />;
};
