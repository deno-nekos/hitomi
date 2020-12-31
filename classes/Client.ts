import { DOMParser } from '../deps.ts'
import { ClientOption } from '../types/options.ts'
import { GalleryData } from "../types/datatypes.ts"
import { ACCEPT, USER_AGENT } from '../consts/headers.ts'
import { getSubdomainFromHash, hashProcess } from "../utils/imageUtils.ts"
import { GALLERY_INFO, GALLERY_PAGE, IMAGE_URL } from "../consts/endpoints.ts"
import { AUTHOR_SELECTOR, GALLERY_INFO_SELECTOR } from "../consts/selectors.ts"
import { AdditionalInfo, GalleryFileM, GalleryInfo, GalleryTagM } from "../types/infotypes.ts"
import { GALLERY_CHARACTERS_SPLITTER, GALLERY_INFO_SPLITTER, GALLERY_URL_SPLITTER } from "../consts/regexps.ts"

export class Client {
  private header: Headers
  constructor (options?: ClientOption) {
    this.header = new Headers({
      'User-Agent': options?.header.get('User-Agent') || USER_AGENT,
      'ACCEPT' : options?.header.get('ACCEPT') || ACCEPT
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
}
