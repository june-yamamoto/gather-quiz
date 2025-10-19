import { useState } from 'react';
import { Button, Container, Typography, Box, TextField, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const QuizCreatorPage = () => {
  const [point, setPoint] = useState(10);
  const [questionText, setQuestionText] = useState('');
  const [questionLink, setQuestionLink] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [answerLink, setAnswerLink] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement submission logic with new fields
    console.log({
      point,
      questionText,
      questionLink,
      answerText,
      answerLink,
    });
    alert('問題が作成されました（仮）');
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
                <input type="file" hidden />
              </Button>
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
                <input type="file" hidden />
              </Button>
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
