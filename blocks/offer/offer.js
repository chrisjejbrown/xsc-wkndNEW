import {
  createOptimizedPicture,
} from '../../scripts/aem.js';

const getMetadata = (name, doc) => {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...doc.head.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((m) => m.content)
    .join(', ');
  return meta || '';
};

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Document} The document
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(path);
    if (resp.ok) {
      const parser = new DOMParser();
      return parser.parseFromString(await resp.text(), 'text/html');
    }
  }
  return null;
}

/**
 * @param {HTMLElement} $block The header block element
 */
export default async function decorate($block) {
  const link = $block.querySelector('a');
  const path = link ? link.getAttribute('href') : $block.textContent.trim();
  const doc = await loadFragment(path);
  if (!doc) {
    return;
  }

  // find metadata
  const title = getMetadata('og:title', doc);
  const desc = getMetadata('og:description', doc);
  const picture = getMetadata('og:image', doc);

  const $pre = document.createElement('p');
  $pre.classList.add('pretitle');
  $pre.textContent = 'Don\'t Miss Out';

  const $h2 = document.createElement('h2');
  $h2.textContent = title;

  const $p = document.createElement('p');
  $p.textContent = desc;

  const $link = document.createElement('div');
  $link.append(link);
  link.textContent = 'Claim Offer Now!';

  const $text = document.createElement('div');
  $text.classList.add('text');
  $text.append($pre, $h2, $p, $link);

  const $image = document.createElement('div');
  $image.classList.add('image');
  // find image
  const $hero = createOptimizedPicture(picture, 'featured article', true);
  if ($hero) {
    $image.append($hero);
  }

  $block.replaceChildren($image, $text);
}
