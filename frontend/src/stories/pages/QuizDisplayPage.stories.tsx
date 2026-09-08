import { quizArgs, quizArgTypes, type QuizControls } from '../controls';
import { imageFixture } from '../fixtures';
import type { Meta, StoryObj } from '@storybook/react';
import QuizDisplayPage from '../../pages/QuizDisplayPage';
import { pathToQuizDisplay } from '../../helpers/route-helpers';
import { mobile } from '../fixtures';

const meta = {
  args: { ...quizArgs },
  argTypes: { ...quizArgTypes },
  render: () => <QuizDisplayPage />,
  title: '画面/大会実施/問題表示',
  parameters: { page: true, route: { path: pathToQuizDisplay(':quizId'), entry: pathToQuizDisplay('q-1') } },
} satisfies Meta<QuizControls>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '通常' };
export const MultipleChoice: Story = { name: '音楽・4択問題', args: { label: '音楽', choiceCount: 4, choices: ['ピアノ', 'バイオリン', 'フルート', 'トランペット'], questionText: '次のうち、弦楽器はどれでしょう？', answerText: '2. バイオリン' } };
export const ChoicesWithLongTextAndImage: Story = {
  name: '4択・長文と画像', args: { ...MultipleChoice.args, questionImage: imageFixture, questionText: '長い問題文と画像があっても選択肢を確認できます。\n'.repeat(30) },
};
export const ChoicesWithVideo: Story = {
  name: '4択・長文と画像と動画', args: { ...ChoicesWithLongTextAndImage.args, questionLink: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
};
export const ChoicesWithAudio: Story = {
  name: '4択・長文と画像と音声', args: { ...ChoicesWithLongTextAndImage.args, questionLink: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg' },
};
export const TwentyLongChoices: Story = {
  name: '20択・長い選択肢・スマートフォン', parameters: mobile,
  args: { ...MultipleChoice.args, choiceCount: 20, choices: Array.from({ length: 20 }, (_, i) => `${i + 1}番の候補：` + '長い説明も折り返して表示します。'.repeat(10)) },
};
export const Mobile: Story = { name: 'スマートフォン', parameters: mobile };
export const Loading: Story = { name: '読み込み中', parameters: { mockScenario: 'loading' } };
export const Failure: Story = { name: '取得失敗', parameters: { mockScenario: 'error' } };
export const WithImage: Story = { name: '画像付き問題', args: { questionImage: imageFixture } };
export const SaveFailure: Story = { name: '既読保存失敗', parameters: { mockScenario: 'saveError' } };
