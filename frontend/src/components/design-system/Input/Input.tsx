import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';

/** スマートフォンでも拡大せず入力できる共通フィールド。 */
export const Input = (props: TextFieldProps) => <TextField {...props} variant="outlined" />;
