import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// AES-256-GCM encryption for sensitive data at rest (ISN passwords, etc.)
// Format: hex(iv):hex(authTag):hex(ciphertext)

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY env var must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(encoded: string): string {
  const key = getKey()
  const [ivHex, authTagHex, ciphertextHex] = encoded.split(':')
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error('Invalid encrypted format')
  }
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}

// Check if a value looks like it's already encrypted (has the iv:tag:ciphertext format)
export function isEncrypted(value: string): boolean {
  const parts = value.split(':')
  return parts.length === 3 && parts[0].length === 24 && parts[1].length === 32
}
