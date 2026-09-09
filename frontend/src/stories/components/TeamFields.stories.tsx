import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TeamFields } from '../../components/TeamFields';
/** Storybookでも人数と名前を操作できるようにする。 */
const Editable = () => { const [names, setNames] = useState(['赤チーム', '青チーム']); return <TeamFields names={names} onChange={setNames} />; };
const meta = { title: '大会運営/チーム設定', render: () => <Editable /> } satisfies Meta;
export default meta;
export const Default: StoryObj<typeof meta> = {};
