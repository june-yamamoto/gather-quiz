import type { Meta, StoryObj } from '@storybook/react';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Table, TableContainer } from '../../components/design-system/Table/Table';
import { mobile } from '../fixtures';

const meta = {
  title: 'コンポーネント/Table', component: Table,
  render: () => <TableContainer><Table aria-label="参加者の作成状況">
    <TableHead><TableRow><TableCell>参加者</TableCell><TableCell align="right">作成状況</TableCell></TableRow></TableHead>
    <TableBody>{['あおい', '長い名前の参加者の場合も表示を確認'].map((name) => <TableRow key={name}><TableCell>{name}</TableCell><TableCell align="right">1 / 3 問</TableCell></TableRow>)}</TableBody>
  </Table></TableContainer>,
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
