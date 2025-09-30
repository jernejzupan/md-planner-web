# 2025-09-22

I asked copilot, if I can use custom elements inside a text box.

It said no and then I asked if I can create custom cursor.

That worked but it was a lot of code just for moving the cursor with arrows and clicks. Handling spaces and word wrapping would be a huge effort.

In the end it turned out that you can simply use:
`contenteditable="true"`

This works perfectly:
- it supports all text editing operations
- it handles `&nbsp` correctly
- it handles html elements `<span>, <b>, <em>, <br>, ...`

It's interesting,... turns out youn can ask the "wrong" question.

I wasn't sure if it was a mistake to have parser.
But I think it's probably going to be useful.

There's one caveat. I plan to pars the plan and then style the text accordingly. I don't want to loose the cursor position.
Copilot gave me this:
```js
function getCaretCharacterOffsetWithin(element) {
  const selection = window.getSelection();
  let caretOffset = 0;
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
}

function setCaretPositionByOffset(element, offset) {
  let currentOffset = 0;
  let nodeStack = [element];
  let node, found = false;

  while (nodeStack.length && !found) {
    node = nodeStack.pop();

    if (node.nodeType === Node.TEXT_NODE) {
      const nextOffset = currentOffset + node.length;
      if (offset <= nextOffset) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        found = true;
      } else {
        currentOffset = nextOffset;
      }
    } else {
      // Add child nodes in reverse order for correct traversal
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }
}

setTimeout(()=>{
	const line = document.getElementsByClassName("line")[0];
	const caretOffset = getCaretCharacterOffsetWithin(line)
    line.innerText = "2 fuu"
	restoreCaret(savedRange);
},5000)
```

It worked when the I saved the position from the line.
It when I provided the entire plan div.
I think I will still need a separate html parser.
I'm not exactly sure how all of this will work.
But the tricky part will probably be keeping track of cursor position, when additional data is inserted.

# 2025-09-19

I started this project for generating png sprites.
But it's pretty bare bone so I'll just use it for md-planner-web.
Basically I'm using copilot to convert the python project to js.
I have some unit tests so I think it makes sense to also convert those.
```sh
npm install -D vitest
```

This actually worked pretty well.
It took 2h. To get to a useful product.

# 2025-04-11
```sh
npm create vue@latest
cd md-planner-web
npm install
npm install vite-plugin-singlefile --save-dev
npm run format
npm run dev
```

Modified `vite.config.js`:
```js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
```