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