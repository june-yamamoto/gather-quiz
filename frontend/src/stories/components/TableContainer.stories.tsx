import type { Meta, StoryObj } from '@storybook/react';
import { TableContainer } from '../../components/design-system/Table/Table';
import { mobile } from '../fixtures';

const meta = { title: 'コンポーネント/TableContainer', component: TableContainer,
  args: { children: <div style={{ minWidth: 900, padding: 24 }}>幅の広い表は、この領域内を横スクロールできます。</div> },
} satisfies Meta<typeof TableContainer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
