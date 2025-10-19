import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ParticipantRegistrationPage from '../../pages/ParticipantRegistrationPage';

const meta: Meta<typeof ParticipantRegistrationPage> = {
  title: '画面/参加者登録ページ',
  component: ParticipantRegistrationPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/tournaments/test-reg-id/register']}>
        <Routes>
          <Route path="/tournaments/:id/register" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
