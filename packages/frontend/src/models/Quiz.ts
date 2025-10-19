export class Quiz {
  id: string;
  point: number;
  questionText?: string | null;
  questionImage?: string | null;
  questionLink?: string | null;
  answerText?: string | null;
  answerImage?: string | null;
  answerLink?: string | null;

  constructor(data: {
    id: string;
    point: number;
    questionText?: string | null;
    questionImage?: string | null;
    questionLink?: string | null;
    answerText?: string | null;
    answerImage?: string | null;
    answerLink?: string | null;
  }) {
    this.id = data.id;
    this.point = data.point;
    this.questionText = data.questionText;
    this.questionImage = data.questionImage;
    this.questionLink = data.questionLink;
    this.answerText = data.answerText;
    this.answerImage = data.answerImage;
    this.answerLink = data.answerLink;
  }

  public static fromApi(data: unknown): Quiz {
    if (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      'point' in data &&
      typeof data.point === 'number'
    ) {
      return new Quiz(data as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    throw new Error('Invalid quiz data format from API');
  }
}
