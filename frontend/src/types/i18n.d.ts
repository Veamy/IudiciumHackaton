import 'i18next';
import { default as eng } from '../locales/eng/translation.json';
import { default as ukr } from '../locales/ukr/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      eng: typeof eng;
      ukr: typeof ukr;
    };
  }
}