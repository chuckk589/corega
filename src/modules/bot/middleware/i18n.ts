import { I18n, pluralize } from '@grammyjs/i18n';
import path from 'path';

const i18n = new I18n({
  directory: path.resolve(__dirname, '../locales'),
  defaultLanguage: 'en',
  useSession: true,
  allowMissing: true,
  templateData: {
    pluralize,
    uppercase: (value: string) => value.toUpperCase(),
  },
});

export default i18n;
