import type { Meta, StoryObj } from '@storybook/react';
import type { OutlinedTextFieldProps } from '@mui/material';
import { Input } from '../../components/design-system/Input/Input';
import { mobile } from '../fixtures';

const meta = {
  title: 'コンポーネント/Input', component: Input,
  args: { label: 'あなたの名前', placeholder: '例：あおい', fullWidth: true },
  decorators: [(Story) => <div style={{ maxWidth: 720, padding: 24 }}><Story /></div>],
} satisfies Meta<Omit<OutlinedTextFieldProps, 'variant'>>;
export default meta;
type Story = StoryObj<Omit<OutlinedTextFieldProps, 'variant'>>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const Error: Story = { args: { error: true, helperText: '名前を入力してください。' } };
export const Multiline: Story = { args: { label: '問題文', multiline: true, rows: 4 } };
export const Disabled: Story = { args: { disabled: true, value: '10' } };
