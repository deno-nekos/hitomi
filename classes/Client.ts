import { DOMParser } from '../deps.ts'
import { BASEURL } from "../consts/baseURLs.ts"
import { ClientOption, ListOption, OrderBy } from '../types/options.ts'
import { GalleryData } from "../types/datatypes.ts"
import { ACCEPT, USER_AGENT } from '../consts/headers.ts'
import { getSubdomainFromHash, hashProcess } from "../utils/imageUtils.ts"
import { AUTHOR_SELECTOR, GALLERY_INFO_SELECTOR } from "../consts/selectors.ts"
import { AdditionalInfo, GalleryFileM, GalleryInfo, GalleryTagM } from "../types/infotypes.ts"
import { GALLERY_INFO, GALLERY_PAGE, IMAGE_URL, LANGUAGE_SUPPORT_URL, LIST_GALLERIES_URL } from "../consts/endpoints.ts"
import { GALLERY_CHARACTERS_SPLITTER, GALLERY_INFO_SPLITTER, GALLERY_URL_SPLITTER, LANGUAGE_SUPPORT_SPLITTER } from "../consts/regexps.ts"

export class Client {
  private header: Headers
  constructor (options?: ClientOption) {
    this.header = new Headers({
      'User-Agent': options?.header.get('User-Agent') || USER_AGENT,
      'Accept': options?.header.get('ACCEPT') || ACCEPT
    })
  }

  private async _fetch (url: string): Promise<string> {
    return await fetch(url, {
      method: 'GET',
      headers: this.header
    }).then((res) => res.text())
  }

  private async _getGalleryInfo (id: number): Promise<GalleryData> {
    const res = await this._fetch(GALLERY_INFO(id))
    return JSON.parse(res.split(GALLERY_INFO_SPLITTER)[1])
  }

  private async _getAuthorInfo (id: number): Promise<AdditionalInfo> {
    const res = await this._fetch(GALLERY_PAGE(id))
    const url = res.split(GALLERY_URL_SPLITTER)[1].split('"')[0]
    const html = await this._fetch(url)

    const dom = new DOMParser()
    const doc = dom.parseFromString(html, 'text/html')

    const author = doc?.querySelector(AUTHOR_SELECTOR)?.textContent.trim()

    const table = doc?.querySelector(GALLERY_INFO_SELECTOR)

    const group = table?.querySelectorAll('td').item(1).textContent.trim()
    const chararchers =
      table?.querySelectorAll('ul.tags').item(0).textContent.trim()
        .replace(GALLERY_CHARACTERS_SPLITTER, ',').split(',').filter((v) => v.length > 0)

    return { author, group, chararchers }
  }

  private async _blobFetch (url: string, header = {}): Promise<Blob> {
    return await fetch(url, {
      method: 'GET',
      headers: new Headers({
        'User-Agent': USER_AGENT,
        'Accept': ACCEPT,
        ...header
      })
    }).then((res) => res.blob())
  }

  /**
   * fetch support languages from hitomi.la
   */
  public async getSupportLanguages () {
    const res = await this._fetch(LANGUAGE_SUPPORT_URL)
    const obj = JSON.parse(res.split(LANGUAGE_SUPPORT_SPLITTER)[1].split(';')[0])

    return Object.keys(obj)
  }

  /**
   * fetch gallery list
   * @param orderBy 'recent' or 'popular'
   * @param options.page page of results
   * @param options.limit galleries per page
   * @param options.language language for fetch
   * @param options.checkLang check lnguage support
   */
  public async listGalleries (orderBy: OrderBy, options: ListOption = { page: 0, limit: 10, language: 'all', checkLang: true }): Promise<number[]> {
    if (!options.page) options.page = 0
    if (!options.limit) options.limit = 10
    if (!options.language) options.language = 'all'
    if (!options.checkLang) options.checkLang = true

    const galleries: number[] = []

    if (options.checkLang) {
      const supports = ['all', ...await this.getSupportLanguages()]
      if (!supports.includes(options.language))
        throw new Error(options.language + ' is not in support languages, (you can skip this check with options.checkLang)')
    }

    const startByte = options.page * options.limit * 4
    const endByte = startByte + options.limit * 4

    const header: {[key:string]:string} = {}
    header.Range = 'bytes=' + startByte + '-' + endByte

    const blob = await this._blobFetch(LIST_GALLERIES_URL(orderBy, options.language), header)
    const buffer = await blob.arrayBuffer()
    const view = new DataView(buffer)

    const total = view.byteLength / 4
    for (let i = 0; i < (total - 1); i++)
      galleries.push(view.getInt32(i * 4, false))

    return galleries
  }

  /**
   * fetch gallery infomation(images included) from given id
   * @param id Gallery id for fetching
   */
  public async getGalleryInfo (id: number): Promise<GalleryInfo> {
    const { ...addition } = await this._getAuthorInfo(id)

    // deno-lint-ignore camelcase
    const { tags, title, japanese_title, language, language_localname, date, files, ...etc } = await this._getGalleryInfo(id)
    const tagInfo: GalleryTagM[] = []
    const fileInfo: GalleryFileM[] = []
    
    for (const { male, female, ...etctag } of tags) {
      const gender =
        male === 1 ? 'male' :
        female === 1 ? 'female' :
        'none'

      tagInfo.push({ gender, ...etctag })
    }

    for (const { width, height, hasavif, haswebp, hash, ...etcfile } of files) {
      const processedHash = hashProcess(hash)
      const subdomain = getSubdomainFromHash(processedHash)

      fileInfo.push({
        size: { width, height },
        hasavif: hasavif === 1,
        haswebp: haswebp === 1,
        url: IMAGE_URL(subdomain, processedHash.raw),
        hash, ...etcfile })
    }

    return {
      tags: tagInfo,
      title: { displayTitle: title, japaneseTitle: japanese_title },
      language: { displayLanguage: language, localnameLanguage: language_localname },
      date: new Date(date),
      files: fileInfo,
      ...addition, ...etc }
  }

  /**
   * get image blob from given hitomi.la url
   * @param url url from getGalleryInfo()
   */
  public async getImage (url: string) {
    return await this._blobFetch(url, { Referer: BASEURL })
  }
}
