import { GalleryType } from "./datatypes.ts";

export interface GalleryInfo {
  type: GalleryType,
  tags: GalleryTagM[],
  id: string,
  title: Title,
  language: Language,
  date: Date,
  files: GalleryFileM[]
  author?: string,
  group?: string,
  chararchers?: string[]
}

export interface GalleryTagM {
  gender: 'male' | 'female' | 'none',
  url: string,
  tag: string
}

export interface AdditionalInfo {
  author?: string,
  group?: string,
  chararchers?: string[]
}

export interface Title {
  displayTitle: string,
  japaneseTitle: string | null
}

export interface Language {
  displayLanguage: string,
  localnameLanguage?: string
}

export interface GalleryFileM {
  size: Size
  name: string,
  haswebp: boolean,
  hasavif: boolean,
  hash: string,
  url: string
}

export interface Size {
  width: number,
  height: number
}

export interface ProcessedHash {
  h1: string,
  h2: string,
  hash: string,
  raw: string
}
