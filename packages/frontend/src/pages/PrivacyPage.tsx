import { Typography, Container } from '@mui/material';

/**
 * プライバシーポリシーページ
 */
const PrivacyPage = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        プライバシーポリシー
      </Typography>
      <Typography variant="body1" paragraph>
        GatherQuiz（以下、「本サービス」といいます。）は、ユーザーの個人情報保護の重要性について認識し、個人情報の保護に関する法律（以下、「個人情報保護法」といいます。）を遵守すると共に、以下のプライバシーポリシー（以下、「本プライバシーポリシー」といいます。）に従い、適切な取扱い及び保護に努めます。
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom>
        第1条（個人情報の定義）
      </Typography>
      <Typography variant="body1" paragraph>
        本プライバシーポリシーにおいて、個人情報とは、個人情報保護法第2条第1項により定義された個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含みます。）を意味するものとします。
      </Typography>
      {/* 以下、必要に応じてポリシー内容を追加 */}
    </Container>
  );
};

export default PrivacyPage;
