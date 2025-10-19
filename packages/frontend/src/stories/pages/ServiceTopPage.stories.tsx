import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import ServiceTopPage from '../../pages/ServiceTopPage';

const meta: Meta<typeof ServiceTopPage> = {
  title: '画面/サービスTOPページ',
  component: ServiceTopPage,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};