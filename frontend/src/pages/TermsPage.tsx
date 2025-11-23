import { Typography, Container } from '@mui/material';

/**
 * 利用規約ページ
 */
const TermsPage = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        利用規約
      </Typography>
      <Typography variant="body1" paragraph>
        この利用規約（以下、「本規約」といいます。）は、GatherQuiz（以下、「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下、「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom>
        第1条（適用）
      </Typography>
      <Typography variant="body1" paragraph>
        本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
      </Typography>
      {/* 以下、必要に応じて規約内容を追加 */}
    </Container>
  );
};

export default TermsPage;
