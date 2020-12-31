import { ClientOption } from '../types/options.ts'
import { ACCEPT, USER_AGENT } from '../consts/headers.ts'
import { GALLERY_INFO, IMAGE_URL } from "../consts/endpoints.ts"
import { GALLERY_INFO_SPLITER } from "../consts/regexps.ts"
import { GalleryData } from "../types/datatypes.ts"
import { GalleryFileM, GalleryInfo, GalleryTagM } from "../types/infotypes.ts"
import { getSubdomainFromHash, hashProcess } from "../utils/imageUtils.ts"

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
    return JSON.parse(res.split(GALLERY_INFO_SPLITER)[1])
  }

  /**
   * fetch gallery infomation(images included) from given id
   * @param id Gallery id for fetching
   */
  public async getGalleryInfo (id: number): Promise<GalleryInfo> {
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
      ...etc }
  }
}
