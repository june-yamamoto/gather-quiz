export const environment = process.env.GATHER_ENV || 'dev';
if (!['dev', 'prod'].includes(environment)) throw new Error('GATHER_ENV must be dev or prod');
export const region = process.env.AWS_REGION || 'ap-northeast-1';
export const stack = process.env.GATHER_STACK || `gather-quiz-${environment}`;
export const domain = process.env.GATHER_DOMAIN || (environment === 'prod' ? 'gather-quiz.june-yamamoto.com' : 'dev.gather-quiz.june-yamamoto.com');
export const zoneId = process.env.GATHER_ZONE_ID || 'Z0280224KVZ4XR4VQX92';
