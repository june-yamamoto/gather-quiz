import type { Meta, StoryObj } from '@storybook/react';
import { Layout } from '../../components/Layout';
import { mobile } from '../fixtures';

const meta = { title: 'コンポーネント/Layout', component: Layout } satisfies Meta<typeof Layout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { parameters: mobile };
export const Immersive: Story = { parameters: { route: { path: '*', entry: '/gather/quizzes/q-1' } } };
