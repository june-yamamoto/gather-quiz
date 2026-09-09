import { outputs } from './aws.ts';
import { environment } from './config.ts';

/** 同一アカウントの本番環境はdevが所有するGitHub OIDCプロバイダーを共有する。 */
export async function ciProviderArn(): Promise<string> {
  if (process.env.GATHER_OIDC_PROVIDER_ARN) return process.env.GATHER_OIDC_PROVIDER_ARN;
  if (environment === 'dev') return '';
  const arn = (await outputs('gather-quiz-dev-ci')).OidcProviderArn;
  if (!arn) throw new Error('Update dev CI first or set GATHER_OIDC_PROVIDER_ARN');
  return arn;
}
