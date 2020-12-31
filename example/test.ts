import { Client } from '../mod.ts'

const GALLERY_ID = 1806299

const client = new Client()
const gallery = await client.getGalleryInfo(GALLERY_ID)

console.log(gallery.title.displayTitle + '(' + gallery.id + ')')
console.log('ㄴAuthor: ' + gallery.author + ' (' + (gallery.group || 'N/A') + ')')
console.log('ㄴChararchers: ' + (gallery.chararchers || []))
console.log('ㄴhas ' + gallery.files.length + ' images')

for (const file of gallery.files) {
  console.log('  ㄴ' + file.url)
}
