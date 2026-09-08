import { Button as MuiButton } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import type { LinkProps } from 'react-router-dom';

type CustomButtonProps = ButtonProps & Partial<LinkProps>;

/** リンクにも使える共通ボタン。状態色と操作サイズはテーマへ集約する。 */
export const Button = (props: CustomButtonProps) => <MuiButton {...props} />;
