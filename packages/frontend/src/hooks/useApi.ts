import { useState, useEffect, useCallback } from 'react';

/**
 * API呼び出しの状態を管理するためのカスタムフックの戻り値の型
 * @template T - APIから返されるデータの型
 */
interface UseApiReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * API呼び出しをラップし、データ、ローディング状態、エラーを管理するカスタムフック
 * @template T - APIから返されるデータの型
 * @param {() => Promise<T>} apiCall - 実行するAPI呼び出し関数
 * @returns {UseApiReturn<T>} データ、エラー、ローディング状態を含むオブジェクト
 */
export const useApi = <T>(apiCall: () => Promise<T>): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    // 依存配列内のapiCallが変更された際に再取得するため、
    // データを取得する前は必ずローディング状態をtrueに設定する
    setIsLoading(true);
    try {
      const result = await apiCall();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading };
};
