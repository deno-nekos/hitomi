import { BASEURL, IMG_BASEURL, LTN_BASEURL } from './baseURLs.ts'

export const GALLERY_PAGE = (id: number) =>
  BASEURL + '/galleries/' + id + '.html'

export const GALLERY_INFO = (id: number) =>
  LTN_BASEURL + '/galleries/' + id + '.js'

export const IMAGE_URL = (subdomain: string, hash: string) =>
  'https://' + subdomain + IMG_BASEURL + '/webp/' + hash + '.webp'
