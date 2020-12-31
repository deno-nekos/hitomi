export interface GalleryData {
  type: GalleryType,
  tags: GalleryTag[],
  id: string,
  title: string,
  japanese_title: string | null,
  language: string,
  language_localname: string,
  date: string,
  files: GalleryFile[]
}

export type GalleryType = 'doujinshi' | 'manga' | 'artistcg' | 'gamecg' | 'anime'

export interface GalleryTag {
  male: "" | 1,
  female: "" | 1,
  url: string,
  tag: string
}

export interface GalleryFile {
  haswebp: number,
  width: number,
  height: number,
  name: string,
  hasavif: number,
  hash: string
}
