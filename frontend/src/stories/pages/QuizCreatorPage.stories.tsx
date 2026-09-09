import { quizArgs, quizArgTypes, tournamentArgs, tournamentArgTypes, type QuizControls, type TournamentControls } from '../controls';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import QuizCreatorPage from '../../pages/QuizCreatorPage';
import { pathToQuizCreator } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs, ...tournamentArgs },
  argTypes: { ...quizArgTypes, ...tournamentArgTypes },
  render: () => <QuizCreatorPage />,
  title: '画面/参加者/問題作成',
  parameters: { page: true, route: { path: pathToQuizCreator(':tournamentId', ':participantId'), entry: pathToQuizCreator('t-1', 'p-1') + '?order=1&point=20' } },
} satisfies Meta<QuizControls & TournamentControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const MultipleChoice: Story = { name: '参加者が4択問題を選択', args: { questionSlots: [{ label: '声優', choiceCount: 0 }, { label: '音楽', choiceCount: 0 }, { label: '', choiceCount: 0 }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('出題形式'));
    await userEvent.click(within(canvasElement.ownerDocument.body).getByRole('option', { name: '選択問題' }));
  },
};
export const MultipleChoiceMobile: Story = { ...MultipleChoice, name: '4択問題・スマートフォン', parameters: mobile };
export const MultipleChoiceEdit: Story = { name: '選択肢の再編集', args: { label: '声優', choiceCount: 4, choices: ['花澤香菜', '早見沙織', '悠木碧', '水瀬いのり'], questionSlots: [{ label: '声優', choiceCount: 4 }, { label: '', choiceCount: 0 }, { label: '', choiceCount: 0 }] }, parameters: { route: { path: pathToQuizCreator(':tournamentId', ':participantId'), entry: pathToQuizCreator('t-1', 'p-1') + '?edit=q-1&order=0&point=10' } } };
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Edit: Story = { name: '編集・スマートフォン', parameters: { ...mobile, route: { path: pathToQuizCreator(':tournamentId', ':participantId'), entry: pathToQuizCreator('t-1', 'p-1') + '?edit=q-1&order=0&point=10' } } };
