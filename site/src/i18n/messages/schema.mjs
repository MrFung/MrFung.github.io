export function validateMessageShape(reference, candidate, path = 'messages') {
  if (typeof reference === 'string') {
    return typeof candidate === 'string' && candidate.trim() ? [] : [path];
  }

  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate) || candidate.length !== reference.length) {
      return [path];
    }
    return reference.flatMap((item, index) =>
      validateMessageShape(item, candidate[index], `${path}[${index}]`)
    );
  }

  if (!reference || typeof reference !== 'object') return [];
  if (!candidate || typeof candidate !== 'object') return [path];

  const referenceKeys = Object.keys(reference).sort();
  const candidateKeys = Object.keys(candidate).sort();
  if (referenceKeys.join('|') !== candidateKeys.join('|')) return [path];

  return referenceKeys.flatMap((key) =>
    validateMessageShape(reference[key], candidate[key], `${path}.${key}`)
  );
}
