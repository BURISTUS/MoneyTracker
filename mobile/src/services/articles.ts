import { apiGet } from './api';
import type { Article } from '../types';
import i18n from '../i18n';

export const articlesService = {
  getAll: () => apiGet<Article[]>(`/articles?lang=${i18n.language}`),
  getOne: (id: string) => apiGet<Article>(`/articles/${id}?lang=${i18n.language}`),
};

export default articlesService;
