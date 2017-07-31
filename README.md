# babel-plugin-picture-import-replacer

Babel plugin for transforming picture import into variable contains **`src`** and **`srcSet`**

**Transforms**

```javascript
import picture, { x2, x3 } from './images/icon.png'
```

**to** 

```javascript
const picture = (() => {
  const imagePath = './images/icon.png';
    
  let src2x = "";
  let src3x = "";
  
  const src = require(imagePath);
  let srcSet = src;
  
  src2x = require(imagePath.replace(new RegExp("(.[a-z]+)$"), `@2x$1`));
  src3x = require(imagePath.replace(new RegExp("(.[a-z]+)$"), `@3x$1`));
  
  if (src2x) srcSet += `, ${src2x}` 
  if (src3x) srcSet += ` ${src3x}` 
  
  return {
    src,
    srcSet
  };
})();
```
