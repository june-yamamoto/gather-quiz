import type { Meta, StoryObj } from '@storybook/react';
import ParticipantRegistrationPage from '../../pages/ParticipantRegistrationPage';

const meta: Meta<typeof ParticipantRegistrationPage> = {
  title: '画面/参加者/参加者登録ページ',
  component: ParticipantRegistrationPage,
  parameters: {
    reactRouter: {
      route: '/tournaments/:id/register',
      path: '/tournaments/test-reg-id/register',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
