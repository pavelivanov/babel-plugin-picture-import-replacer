# babel-plugin-picture-import-replacer

Babel plugin for transforming picture import into variable contains **`src`** and **`srcSet`**

**Transforms**

```javascript
import picture, { x2, x3 } from './images/icon.png'
```

**to** 

```javascript
const picture = (() => {
  let src2x;
  let src3x;
  
  const src = require("./images/hamburger.svg");
  
  src2x = src.replace(new RegExp("(.[a-z]+)$"), `@2x$1`);
  src3x = src.replace(new RegExp("(.[a-z]+)$"), `@3x$1`);
  
  const srcSet = `${src} ${src2x} ${src3x}`.trim();

  return {
    src,
    srcSet
  };
})();
```
