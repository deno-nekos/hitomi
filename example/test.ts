import { Client } from '../mod.ts'

const GALLERY_ID = 1806299

const client = new Client()
const gallery = await client.getGalleryInfo(GALLERY_ID)

console.log(gallery.title.displayTitle + '(' + gallery.id + ')')
console.log('ㄴAuthor: ' + gallery.author + ' (' + (gallery.group || 'N/A') + ')')
console.log('ㄴChararchers: ' + (gallery.chararchers || []))

const blob = await client.getImage(gallery.files[0].url)
const buffer = await blob.arrayBuffer()
const unit8arr = new Deno.Buffer(buffer).bytes()
Deno.writeFileSync('./example/hentai.webp', unit8arr)
console.log('ㄴthumbnail saved at ./example/hentai.webp')

console.log('ㄴhas ' + gallery.files.length + ' images')
for (const file of gallery.files) {
  console.log('  ㄴ' + file.url)
}
