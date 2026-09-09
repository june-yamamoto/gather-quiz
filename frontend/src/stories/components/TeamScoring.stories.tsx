import type { Meta, StoryObj } from '@storybook/react';
import { RankingReveal } from '../../components/RankingReveal';
import { mobile } from '../fixtures';
const meta = { title: '大会運営/順位発表', component: RankingReveal, args: { result: { tournamentName: '週末のクイズ大会', rankings: [{ id: 'a', name: '赤チーム', rank: 1, score: 50 }, { id: 'b', name: '青チーム', rank: 2, score: 30 }, { id: 'c', name: '緑チーム', rank: 2, score: 30 }] } } } satisfies Meta<typeof RankingReveal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
