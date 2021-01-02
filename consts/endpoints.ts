import { OrderBy } from "../types/options.ts"
import { BASEURL, IMG_BASEURL, LTN_BASEURL } from './baseURLs.ts'

export const LANGUAGE_SUPPORT_URL =
  LTN_BASEURL + '/language_support.js'

export const GALLERY_PAGE = (id: number) =>
  BASEURL + '/galleries/' + id + '.html'

export const GALLERY_INFO = (id: number) =>
  LTN_BASEURL + '/galleries/' + id + '.js'

export const IMAGE_URL = (subdomain: string, hash: string) =>
  'https://' + subdomain + IMG_BASEURL + '/webp/' + hash + '.webp'

export const LIST_GALLERIES_URL = (orderBy: OrderBy, language: string) =>
  LTN_BASEURL + '/' + orderBy + '-' + language + '.nozomi'
