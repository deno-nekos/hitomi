import { Client } from '../mod.ts'

const GALLERY_ID = 1806299

const client = new Client()
const gallery = await client.getGalleryInfo(GALLERY_ID)

console.log(gallery.title.displayTitle + '(' + gallery.id + ') has ' + gallery.files.length + ' images')

for (const file of gallery.files) {
  console.log('ㄴ' + file.url)
}
