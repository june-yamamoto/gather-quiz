import { MediaAttachmentField } from '../components/MediaAttachmentField';
import { safeMediaUrl } from '../helpers/media';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { pathToParticipantDashboard } from '../helpers/route-helpers';
import { uploadApiClient } from '../api/UploadApiClient';
import { quizApiClient } from '../api/QuizApiClient';
import { tournamentApiClient } from '../api/TournamentApiClient';
import { Input } from '../components/design-system/Input/Input';
import { Button } from '../components/design-system/Button/Button';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  height: '100%',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) },
}));

const QuizCreatorPage = () => {
  const navigate = useNavigate();
  const { tournamentId, participantId } = useParams();
  const [searchParams] = useSearchParams();

  const editQuizId = searchParams.get('edit');
  const initialPoint = Number(searchParams.get('point')) || 0;
  const order = Number(searchParams.get('order')) || 0;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEdit, setIsFetchingEdit] = useState(!!editQuizId);
  const [editError, setEditError] = useState(false);
  const [editAttempt, setEditAttempt] = useState(0);
  const [saveError, setSaveError] = useState('');
  const submitting = useRef(false);
  const [questionMediaFile, setQuestionMediaFile] = useState<File | null>(null);
  const [answerMediaFile, setAnswerMediaFile] = useState<File | null>(null);
  const [point, setPoint] = useState(initialPoint);
  const [genre, setGenre] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [editOrder, setEditOrder] = useState<number | null>(null);
  
  const [questionText, setQuestionText] = useState('');
  const [questionLink, setQuestionLink] = useState('');
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [existingQuestionImageUrl, setExistingQuestionImageUrl] = useState<string | null>(null);
  
  const [answerText, setAnswerText] = useState('');
  const [answerLink, setAnswerLink] = useState('');
  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);
  const [existingAnswerImageUrl, setExistingAnswerImageUrl] = useState<string | null>(null);

  const [isRegulationOpen, setIsRegulationOpen] = useState(false);

  // Fetch Tournament Info
  const { data: tournament, error: tournamentError } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => {
      if (!tournamentId) {
        throw new Error('Tournament ID is not defined');
      }
      return tournamentApiClient.get(tournamentId);
    },
    enabled: !!tournamentId,
  });

  const slot = tournament?.questionSlots?.[editOrder ?? order];
  const choiceCount = slot?.choiceCount || 0;

  // Fetch Quiz Info if editing
  useEffect(() => {
    let cancelled = false;
    if (editQuizId) {
      /** 古い取得結果が別の問題の編集内容を上書きしないようにする。 */
      const fetchQuiz = async () => {
        setIsFetchingEdit(true);
        setEditError(false);
        try {
          const quiz = await quizApiClient.get(editQuizId);
          if (cancelled) return;
          setPoint(quiz.point);
          setEditOrder(quiz.order);
          setChoices(quiz.choices || []);
          setGenre(quiz.genre || '');
          setQuestionText(quiz.questionText || '');
          setQuestionLink(quiz.questionLink || '');
          setExistingQuestionImageUrl(quiz.questionImage || null);
          setAnswerText(quiz.answerText || '');
          setAnswerLink(quiz.answerLink || '');
          setExistingAnswerImageUrl(quiz.answerImage || null);
        } catch {
          if (!cancelled) setEditError(true);
        } finally {
          if (!cancelled) setIsFetchingEdit(false);
        }
      };
      fetchQuiz();
    } else {
      setIsFetchingEdit(false);
      setPoint(initialPoint);
    }
    return () => { cancelled = true; };
  }, [editQuizId, initialPoint, editAttempt]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current || isFetchingEdit || editError || !tournament) return;
    setSaveError('');
    if (choiceCount && Array.from({ length: choiceCount }, (_, i) => choices[i] || '').some(c => !c.trim())) {
      setSaveError(`${choiceCount}個すべての選択肢を入力してください。`);
      return;
    }
    if ((!questionMediaFile && questionLink.trim() && !safeMediaUrl(questionLink)) || (!answerMediaFile && answerLink.trim() && !safeMediaUrl(answerLink))) {
      setSaveError('HTTPまたはHTTPSの有効なURLを入力してください。');
      return;
    }

    if (!questionText.trim() && !questionImageFile && !existingQuestionImageUrl && !questionMediaFile && !questionLink.trim()) {
      setSaveError('問題には文章・画像・動画・音声・URLのいずれかが必要です。');
      return;
    }
    if (!answerText.trim() && !answerImageFile && !existingAnswerImageUrl && !answerMediaFile && !answerLink.trim()) {
      setSaveError('解答には文章・画像・動画・音声・URLのいずれかが必要です。');
      return;
    }

    try {
      submitting.current = true;
      setIsLoading(true);
      const tId = tournamentId || '';
      const pId = participantId || '';

      const questionImageUrl = questionImageFile
        ? await uploadApiClient.uploadImage(questionImageFile, tId, pId)
        : existingQuestionImageUrl;
      setExistingQuestionImageUrl(questionImageUrl);
      setQuestionImageFile(null);

      const answerImageUrl = answerImageFile 
        ? await uploadApiClient.uploadImage(answerImageFile, tId, pId) 
        : existingAnswerImageUrl;
      setExistingAnswerImageUrl(answerImageUrl);
      setAnswerImageFile(null);

      // 一部の転送後に保存が失敗しても、転送済みファイルは再利用する。
      const savedQuestionLink = questionMediaFile ? await uploadApiClient.uploadMedia(questionMediaFile, tId, pId) : questionLink.trim();
      setQuestionLink(savedQuestionLink);
      setQuestionMediaFile(null);
      const savedAnswerLink = answerMediaFile ? await uploadApiClient.uploadMedia(answerMediaFile, tId, pId) : answerLink.trim();
      setAnswerLink(savedAnswerLink);
      setAnswerMediaFile(null);
      const quizData = {
        point: Number(tournament.points.split(',')[editOrder ?? order]) || point,
        order: editOrder ?? order,
        choices: choiceCount ? choices.slice(0, choiceCount).map(c => c.trim()) : [],
        genre: genre || null,
        questionText,
        questionImage: questionImageUrl,
        questionLink: savedQuestionLink,
        answerText,
        answerImage: answerImageUrl,
        answerLink: savedAnswerLink,
        tournamentId: tId,
        participantId: pId,
      };

      if (editQuizId) {
        await quizApiClient.update(editQuizId, quizData);
        alert('問題が更新されました！');
      } else {
        await quizApiClient.create(quizData);
        alert('問題が作成されました！');
      }

      navigate(pathToParticipantDashboard(tId, pId));
    } catch (error) {
      console.error(error);
      setSaveError(error instanceof Error ? error.message : '保存に失敗しました。再試行してください。');
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  const genres = tournament?.genres
    ? tournament.genres
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g !== '')
    : [];

  if (tournamentError) return <StyledContainer maxWidth="md"><Alert severity="error">大会設定を取得できませんでした。再読み込みしてください。</Alert></StyledContainer>;
  if (isFetchingEdit || !tournament) {
     return (
       <StyledContainer maxWidth="md" sx={{ textAlign: 'center' }}>
         <CircularProgress />
       </StyledContainer>
     );
  }
  if (editQuizId && editError) return <StyledContainer maxWidth="md">
    <Alert severity="error" action={<Button onClick={() => setEditAttempt((value) => value + 1)}>再試行</Button>}>
      クイズ情報を取得できませんでした。既存の添付を保護するため、取得できるまで編集できません。
    </Alert>
  </StyledContainer>;

  return (
    <StyledContainer maxWidth="md">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {editQuizId ? '問題の編集' : '新しい問題の作成'}
        </Typography>
        {tournament && (
          <Button variant="outlined" size="small" onClick={() => setIsRegulationOpen(true)}>
            大会ルールを確認
          </Button>
        )}
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
        <Box component="fieldset" disabled={isLoading} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography fontWeight="bold">{slot?.label || `第${(editOrder ?? order) + 1}問`} · {choiceCount ? `${choiceCount}択の選択問題` : '通常問題'}</Typography>
            </Grid>
            <Grid item>
                <Input
                label="配点"
                type="number"
                required
                value={Number(tournament.points.split(',')[editOrder ?? order]) || point}
                // 配点はURLパラメータから指定されるため変更不可とする
                inputProps={{ readOnly: true }}
                sx={{ width: '100px' }}
                />
            </Grid>
            {genres.length > 0 && (
                <Grid item xs>
                     <Input
                        select
                        label="ジャンル"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        fullWidth
                        helperText="この問題のジャンルを選択してください（任意）"
                    >
                        <MenuItem value="">
                            <em>選択しない</em>
                        </MenuItem>
                        {genres.map((g) => (
                            <MenuItem key={g} value={g}>
                                {g}
                            </MenuItem>
                        ))}
                    </Input>
                </Grid>
            )}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledSection>
              <Typography variant="h6" gutterBottom>
                問題の作成
              </Typography>
              <Input
                label="問題文"
                fullWidth
                multiline
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                添付画像を選択
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                  onChange={(e) => setQuestionImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {questionImageFile ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {questionImageFile.name}
                </Typography>
              ) : existingQuestionImageUrl ? (
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  （設定済みの画像あり）
                </Typography>
              ) : null}
              {(questionImageFile || existingQuestionImageUrl) && <Button onClick={() => { setQuestionImageFile(null); setExistingQuestionImageUrl(null); }}>問題画像を削除</Button>}
              <MediaAttachmentField label="問題" url={questionLink} file={questionMediaFile} onUrlChange={setQuestionLink} onFileChange={setQuestionMediaFile} />
              {choiceCount > 0 && <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>選択肢（{choiceCount}択）</Typography>
                {Array.from({ length: choiceCount }, (_, index) => <Input key={index} label={`選択肢${index + 1}`} required fullWidth multiline inputProps={{ maxLength: 500 }} value={choices[index] || ''} onChange={e => setChoices(prev => Array.from({ length: choiceCount }, (_, i) => i === index ? e.target.value : prev[i] || ''))} sx={{ mb: 2 }} />)}
              </Box>}
            </StyledSection>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledSection>
              <Typography variant="h6" gutterBottom>
                解答の作成
              </Typography>
              {choiceCount > 0 && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>正解の選択肢番号や内容、解説を解答欄に入力してください。</Typography>}
              <Input
                label="解答文"
                fullWidth
                multiline
                rows={4}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                添付画像を選択
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                  onChange={(e) => setAnswerImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {answerImageFile ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {answerImageFile.name}
                </Typography>
              ) : existingAnswerImageUrl ? (
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  （設定済みの画像あり）
                </Typography>
              ) : null}
              {(answerImageFile || existingAnswerImageUrl) && <Button onClick={() => { setAnswerImageFile(null); setExistingAnswerImageUrl(null); }}>解答画像を削除</Button>}
              <MediaAttachmentField label="解答" url={answerLink} file={answerMediaFile} onUrlChange={setAnswerLink} onFileChange={setAnswerMediaFile} />
            </StyledSection>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: 'center', position: 'sticky', bottom: 0, py: 2, pb: 'max(16px, env(safe-area-inset-bottom))', bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', zIndex: 1 }}>
          <Button type="submit" variant="contained" color="primary" size="large" disabled={isLoading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {editQuizId ? 'この内容で更新する' : 'この内容で問題を保存する'}
          </Button>
        </Box>
        </Box>
      </Box>

      {/* レギュレーション表示ダイアログ */}
      <Dialog
        open={isRegulationOpen}
        onClose={() => setIsRegulationOpen(false)}
        aria-labelledby="regulation-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="regulation-dialog-title">大会ルール (レギュレーション)</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ whiteSpace: 'pre-wrap' }}>
            {tournament?.regulation || 'レギュレーションは設定されていません。'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRegulationOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default QuizCreatorPage;
