const client_manifest = {
  "_Bp2l3kpD.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "Bp2l3kpD.js",
    "name": "game-core"
  },
  "_DvUShIk5.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DvUShIk5.js",
    "name": "jwt-decode.esm"
  },
  "_K4AygAaw.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "K4AygAaw.js",
    "name": "v3",
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ]
  },
  "middleware/auth.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "CgF8D8ta.js",
    "name": "auth",
    "src": "middleware/auth.js",
    "isDynamicEntry": true,
    "imports": [
      "_DvUShIk5.js",
      "node_modules/nuxt/dist/app/entry.js"
    ]
  },
  "node_modules/nuxt/dist/app/components/error-404.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "9__anZIf.js",
    "name": "error-404",
    "src": "node_modules/nuxt/dist/app/components/error-404.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js",
      "_K4AygAaw.js"
    ],
    "css": [
      "error-404.DqZyKpgk.css"
    ]
  },
  "error-404.DqZyKpgk.css": {
    "file": "error-404.DqZyKpgk.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "node_modules/nuxt/dist/app/components/error-500.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "COSCK2a3.js",
    "name": "error-500",
    "src": "node_modules/nuxt/dist/app/components/error-500.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js",
      "_K4AygAaw.js"
    ],
    "css": [
      "error-500.CZqNkBuR.css"
    ]
  },
  "error-500.CZqNkBuR.css": {
    "file": "error-500.CZqNkBuR.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "node_modules/nuxt/dist/app/entry.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "0Y2rBl_W.js",
    "name": "entry",
    "src": "node_modules/nuxt/dist/app/entry.js",
    "isEntry": true,
    "dynamicImports": [
      "middleware/auth.js",
      "node_modules/nuxt/dist/app/components/error-404.vue",
      "node_modules/nuxt/dist/app/components/error-500.vue"
    ]
  },
  "pages/generation.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "C-gpkQpN.js",
    "name": "generation",
    "src": "pages/generation.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "css": [
      "generation.WiEHw4_3.css"
    ]
  },
  "generation.WiEHw4_3.css": {
    "file": "generation.WiEHw4_3.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "pages/login.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "Bus8oG8b.js",
    "name": "login",
    "src": "pages/login.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js",
      "_DvUShIk5.js"
    ],
    "css": [
      "login.GkbQ9C6Y.css"
    ]
  },
  "login.GkbQ9C6Y.css": {
    "file": "login.GkbQ9C6Y.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "pages/not-authorized.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "BEN3aPj-.js",
    "name": "not-authorized",
    "src": "pages/not-authorized.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ]
  },
  "pages/page.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DXeUXL5U.js",
    "name": "page",
    "src": "pages/page.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js",
      "_Bp2l3kpD.js"
    ],
    "css": [
      "page.CrM1ql1z.css"
    ]
  },
  "page.CrM1ql1z.css": {
    "file": "page.CrM1ql1z.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "pages/view.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "CFtjI8aN.js",
    "name": "view",
    "src": "pages/view.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "css": [
      "view.B1zlitIk.css"
    ]
  },
  "view.B1zlitIk.css": {
    "file": "view.B1zlitIk.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  }
};

export { client_manifest as default };
//# sourceMappingURL=client.manifest.mjs.map
