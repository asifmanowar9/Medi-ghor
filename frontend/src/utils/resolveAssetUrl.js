const normalizeBaseUrl = (url = '') => url.replace(/\/+$/, '');

const backendBaseUrl = normalizeBaseUrl(
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL || ''
    : 'http://localhost:5000'
);

const withBaseUrl = (path) =>
  backendBaseUrl ? `${backendBaseUrl}${path}` : path;

export const resolveAssetUrl = (assetPath, fallbackDirectory = 'uploads') => {
  if (!assetPath) return '';

  if (
    assetPath.startsWith('http') ||
    assetPath.startsWith('blob:') ||
    assetPath.startsWith('data:')
  ) {
    return assetPath;
  }

  if (assetPath.startsWith('/uploads') || assetPath.startsWith('/images')) {
    return withBaseUrl(assetPath);
  }

  if (assetPath.startsWith('/')) {
    return withBaseUrl(assetPath);
  }

  return withBaseUrl(`/${fallbackDirectory}/${assetPath}`);
};