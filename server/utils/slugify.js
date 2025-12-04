/**
 * @file slugify.js
 * @description Utility to generate clean, URL-friendly slugs from strings.
 *
 * Example:
 *  slugify("My First Blog Post!") -> "my-first-blog-post"
 */

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')   // replace spaces & non-word chars with -
    .replace(/^-+|-+$/g, '');    // remove leading/trailing -
}

module.exports = slugify;
