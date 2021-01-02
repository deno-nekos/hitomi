export interface ClientOption {
  header: Headers
}

export enum OrderBy {
  recent = 'index',
  popular = 'popular'
}

export interface ListOption {
  page?: number,
  limit?: number,
  language: string,
  checkLang?: boolean
}
