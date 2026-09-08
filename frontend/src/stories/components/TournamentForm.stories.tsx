import type { Meta, StoryObj } from '@storybook/react';
import { TournamentForm } from '../../components/TournamentForm';
import { mobile, tournamentFixture } from '../fixtures';
import { tournamentArgs, tournamentArgTypes, type TournamentControls } from '../controls';
import { fn } from '@storybook/test';
import { Tournament } from '../../models/Tournament';
import type { ComponentProps } from 'react';

type Args = Omit<TournamentControls, 'participantCount' | 'createdQuestions'> & {
  isEditMode: boolean; onSubmit: ComponentProps<typeof TournamentForm>['onSubmit'];
};
const { participantCount: _participants, createdQuestions: _created, ...fields } = tournamentArgTypes;
const meta = {
  title: 'コンポーネント/TournamentForm',
  args: { tournamentName: '', points: '10,20,30', regulation: '', genres: '', isEditMode: false, onSubmit: fn() },
  argTypes: { ...fields, isEditMode: { control: 'boolean' }, onSubmit: { control: false } },
  render: (args) => <TournamentForm isEditMode={args.isEditMode} onSubmit={args.onSubmit} tournament={Tournament.fromApi({
    ...tournamentFixture, name: args.tournamentName, points: args.points, questionsPerParticipant: Math.max(1, args.points.split(',').length),
    regulation: args.regulation, genres: args.genres,
  })} />,
  decorators: [(Story) => <div style={{ maxWidth: 720, padding: 16 }}><Story /></div>],
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const Edit: Story = { args: { ...tournamentArgs, isEditMode: true } };
