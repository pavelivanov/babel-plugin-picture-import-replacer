# babel-plugin-transform-picture-imports

Babel plugin for transforming picture imports into variable contains 2x, 3x sizes

**Transforms**

```javascript
// picture x2
import logo from './images/logo.png'
// picture x2 x3
import icon from './images/icon.png'
```

**to** 

```javascript
const logo = (() => {
  const imagePath = "./images/logo.png";
  let src2x = "";
  let src3x = "";
  let srcSet = "";
  const src = require(imagePath);
  src2x = require(imagePath.replace(new RegExp("(.[a-z]+)$"), `@2x$1`));
  srcSet = src;

  if (src2x)
    srcSet += `, ${src2x}`;

  if (src3x)
    srcSet += `, ${src3x}`;

  return {
    src,
    srcSet
  };
})();

const icon = (() => {
  const imagePath = "./images/icon.png";
  let src2x = "";
  let src3x = "";
  let srcSet = "";
  const src = require(imagePath);
  src2x = require(imagePath.replace(new RegExp("(.[a-z]+)$"), `@2x$1`));
  src3x = require(imagePath.replace(new RegExp("(.[a-z]+)$"), `@3x$1`));
  srcSet = src;

  if (src2x)
    srcSet += `, ${src2x}`;

  if (src3x)
    srcSet += `, ${src3x}`;

  return {
    src,
    srcSet
  };
})();
```
