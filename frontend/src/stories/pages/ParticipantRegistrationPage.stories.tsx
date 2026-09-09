import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import ParticipantRegistrationPage from '../../pages/ParticipantRegistrationPage';
import { pathToTournamentRegisterParticipant } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  title: '画面/参加者/参加者登録', component: ParticipantRegistrationPage,
  parameters: { page: true, route: { path: pathToTournamentRegisterParticipant(':id'), entry: pathToTournamentRegisterParticipant('t-1') } },
} satisfies Meta<typeof ParticipantRegistrationPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Registered: Story = { name: '登録完了', parameters: mobile,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/表示名/), 'あおい');
    await userEvent.type(canvas.getByLabelText(/^ID/), 'aoi');
    await userEvent.type(canvas.getByLabelText(/^パスワード/), '123456');
    await userEvent.click(canvas.getByRole('button', { name: 'この内容で参加する' }));
    await expect(await canvas.findByText('登録完了！')).toBeVisible();
  },
};
