import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TournamentPortalPage from '../../pages/TournamentPortalPage';

const meta: Meta<typeof TournamentPortalPage> = {
  title: '画面/大会ポータルページ',
  component: TournamentPortalPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/test-portal-id']}>
        <Routes>
          <Route path="/tournaments/:id" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};