// api/src/core/hash.js
import crypto from 'crypto';

export function hashContent(content) {
  return crypto
    .createHash('sha1')
    .update(content)
    .digest('hex');
}

export function hashObject(type, content) {
  const data = `${type} ${content.length}\0${content}`;
  return hashContent(data);
}