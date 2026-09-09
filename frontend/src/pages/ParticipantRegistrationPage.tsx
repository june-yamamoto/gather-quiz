import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';
import { pathToParticipantDashboard } from '../helpers/route-helpers';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Input } from '../components/design-system/Input/Input';
import { Button } from '../components/design-system/Button/Button';
import { ApiError } from '../errors/ApiError';
import { Participant } from '../models/Participant';

/** 入力条件を常時表示し、パスワードを登録後に保持・再表示しない。 */
const ParticipantRegistrationPage = () => {
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const [createdParticipant, setCreatedParticipant] = useState<Participant | null>(null);
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();

  /** 二重送信を防ぎ、失敗時には入力を保持する。 */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tournamentId || submitting.current) return;
    if (!name.trim() || name.trim().length > 20 || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$/.test(loginId) || !/^[a-zA-Z0-9]{4,6}$/.test(password)) {
      setError('各項目の入力条件を確認してください。');
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      setCreatedParticipant(await tournamentApiClient.createParticipant(tournamentId, { name: name.trim(), loginId, password }));
      setPassword('');
    } catch (error) {
      setError(error instanceof ApiError && error.status === 409 ? 'そのIDは既に使用されています。別のIDを入力してください。' : '登録に失敗しました。入力内容を確認して再試行してください。');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return <Container maxWidth="sm" sx={{ my: 3 }}>
    <Typography variant="h4" component="h1" gutterBottom>{createdParticipant ? '登録完了！' : '参加者登録'}</Typography>
    {createdParticipant ? <>
      <Typography sx={{ my: 2 }}>表示名: {createdParticipant.name}</Typography>
      <Typography sx={{ my: 2 }}>ID: {createdParticipant.loginId}</Typography>
      <Typography sx={{ mb: 3 }}>再ログインにはこのIDと設定したパスワードを使用します。パスワードの再表示はできません。</Typography>
      <Button variant="contained" fullWidth onClick={() => navigate(pathToParticipantDashboard(tournamentId!, createdParticipant.id))}>ダッシュボードへ移動する</Button>
    </> : <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Input label="表示名" autoComplete="nickname" fullWidth required value={name} onChange={e => setName(e.target.value)} inputProps={{ maxLength: 20 }} helperText={`${name.length}/20文字。ほかの参加者と同じ表示名も使えます`} sx={{ mb: 2 }} />
      <Input label="ID" autoComplete="username" fullWidth required value={loginId} onChange={e => setLoginId(e.target.value)} inputProps={{ minLength: 3, maxLength: 20, pattern: '[a-zA-Z0-9][a-zA-Z0-9_\\-]{2,19}', autoCapitalize: 'none', spellCheck: false }} helperText="3〜20文字の半角英数字・ハイフン・アンダースコア。先頭は英数字。大会内で重複不可、大文字小文字は区別しません" sx={{ mb: 2 }} />
      <Input label="パスワード" type="password" autoComplete="new-password" fullWidth required value={password} onChange={e => setPassword(e.target.value)} inputProps={{ minLength: 4, maxLength: 6, pattern: '[a-zA-Z0-9]{4,6}' }} helperText="半角英数字4〜6文字。数字のみでも登録できます（例: 123456）。ほかのサービスと異なるものを設定してください" sx={{ mb: 3 }} />
      <Button type="submit" variant="contained" fullWidth disabled={saving}>{saving ? '登録中…' : 'この内容で参加する'}</Button>
    </Box>}
  </Container>;
};

export default ParticipantRegistrationPage;
