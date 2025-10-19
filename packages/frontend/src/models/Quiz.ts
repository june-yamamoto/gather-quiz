export class Quiz {
  id: string;
  question: string;
  answer: string;
  point: number;

  constructor(id: string, question: string, answer: string, point: number) {
    this.id = id;
    this.question = question;
    this.answer = answer;
    this.point = point;
  }

  /**
   * Type guard and factory for creating a Quiz instance from API data.
   * @param data The unknown data received from the API.
   * @returns A new Quiz instance.
   * @throws If the data is not a valid Quiz object.
   */
  public static fromApi(data: unknown): Quiz {
    if (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      'question' in data &&
      typeof data.question === 'string' &&
      'answer' in data &&
      typeof data.answer === 'string' &&
      'point' in data &&
      typeof data.point === 'number'
    ) {
      // The question field itself might be a JSON string with question and options.
      try {
        const parsed = JSON.parse(data.question);
        if (typeof parsed.question === 'string') {
          return new Quiz(data.id, parsed.question, data.answer, data.point);
        }
      } catch {
        // If parsing fails, it might be an old format with a raw question string.
        // We can proceed with the raw string.
      }
      return new Quiz(data.id, data.question, data.answer, data.point);
    }
    throw new Error('Invalid quiz data format from API');
  }
}
