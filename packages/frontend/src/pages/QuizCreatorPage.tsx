import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { TextField, Button, Container, Typography, Box, Grid } from '@mui/material';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const QuizCreatorPage = () => {
  const navigate = useNavigate();
  const { tournamentId, participantId } = useParams();

  const [point, setPoint] = useState(10);
  const [questionText, setQuestionText] = useState('');
  const [questionLink, setQuestionLink] = useState('');

  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [questionImageUrl] = useState<string | null>(null);

  const [answerText, setAnswerText] = useState('');
  const [answerLink, setAnswerLink] = useState('');

  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);
  const [answerImageUrl] = useState<string | null>(null);

  // TODO: クイズ編集モードが必要な場合は、既存のクイズ情報を読み込むロジックをここに実装する

  const uploadImageToS3 = async (file: File): Promise<string | null> => {
    try {
      // 1. バックエンドにリクエストを送り、S3へのアップロードに必要な署名付きURLを取得する
      const getSignedUrlRes = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!getSignedUrlRes.ok) {
        throw new Error('Failed to get signed URL');
      }
      const { signedUrl, objectUrl } = await getSignedUrlRes.json();

      // 2. 取得した署名付きURLに対して、実際の画像ファイルをPUTリクエストでアップロードする
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to S3');
      }

      return objectUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('画像のアップロードに失敗しました。');
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let finalQuestionImageUrl = questionImageUrl;
    if (questionImageFile) {
      finalQuestionImageUrl = await uploadImageToS3(questionImageFile);
      // 画像アップロードが失敗した場合は、フォームの送信を中断する
      if (!finalQuestionImageUrl) return;
    }

    let finalAnswerImageUrl = answerImageUrl;
    if (answerImageFile) {
      finalAnswerImageUrl = await uploadImageToS3(answerImageFile);
      // 画像アップロードが失敗した場合は、フォームの送信を中断する
      if (!finalAnswerImageUrl) return;
    }

    const submission = {
      point,
      questionText,
      questionImage: finalQuestionImageUrl,
      questionLink,
      answerText,
      answerImage: finalAnswerImageUrl,
      answerLink,
      tournamentId,
      // URLのパスパラメータから取得した参加者IDを利用する
      participantId,
    };

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error('問題の作成に失敗しました。');
      }

      alert('問題が作成されました！');
      // TODO: 問題作成後は、参加者ダッシュボードに戻るか、フォームをクリアするなど、UXを考慮した実装が必要
      navigate(`/tournaments/${tournamentId}/participants/${participantId}`);
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        問題作成・編集
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          label="配点"
          variant="outlined"
          type="number"
          required
          value={point}
          onChange={(e) => setPoint(Number(e.target.value))}
          sx={{ mb: 3, width: '150px' }}
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Section>
              <Typography variant="h6" gutterBottom>
                問題の作成
              </Typography>
              <TextField
                label="問題文"
                variant="outlined"
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
                  accept="image/*"
                  onChange={(e) => setQuestionImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {questionImageFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {questionImageFile.name}
                </Typography>
              )}
              {questionImageUrl && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  アップロード済みURL: {questionImageUrl}
                </Typography>
              )}
              <TextField
                label="参考リンク"
                variant="outlined"
                fullWidth
                value={questionLink}
                onChange={(e) => setQuestionLink(e.target.value)}
              />
            </Section>
          </Grid>

          <Grid item xs={12} md={6}>
            <Section>
              <Typography variant="h6" gutterBottom>
                解答の作成
              </Typography>
              <TextField
                label="解答文"
                variant="outlined"
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
                  accept="image/*"
                  onChange={(e) => setAnswerImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </Button>
              {answerImageFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  選択中のファイル: {answerImageFile.name}
                </Typography>
              )}
              {answerImageUrl && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  アップロード済みURL: {answerImageUrl}
                </Typography>
              )}
              <TextField
                label="参考リンク"
                variant="outlined"
                fullWidth
                value={answerLink}
                onChange={(e) => setAnswerLink(e.target.value)}
              />
            </Section>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" size="large">
            この内容で問題を保存する
          </Button>
        </Box>
      </Box>
    </StyledContainer>
  );
};

export default QuizCreatorPage;
