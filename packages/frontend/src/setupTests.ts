import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdomではwindow.alertが実装されていないため、テストがクラッシュするのを防ぐためにモックします。
// これにより、alertを呼び出すコンポーネントのテストが可能になります。
vi.spyOn(window, 'alert').mockImplementation(() => {});
