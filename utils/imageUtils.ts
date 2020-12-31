import { HASH_PROCESSER } from "../consts/regexps.ts"
import { ProcessedHash } from "../types/infotypes.ts"

/**
 * convert raw hash string to processed hash
 * @param hash raw hash string
 */
export function hashProcess (hash: string): ProcessedHash {
  const raw = hash.replace(HASH_PROCESSER, '$2/$1/' + hash)
  const data = raw.split('/')

  return {
    h1: data[0],
    h2: data[1],
    hash: data[2],
    raw
  }
}

/**
 * fetch subdomain from processed image hash
 * (idk how it work)
 * 
 * @param hash processed image hash for fetch
 */
export function getSubdomainFromHash (hash: ProcessedHash) {
  let a = 3
  let b = parseInt(hash.h2, 16)

  if (b < 0x30) a = 2
  if (b < 0x09) b = 1

  return String.fromCharCode(97 + (b % a))
}
