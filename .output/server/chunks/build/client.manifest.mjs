const client_manifest = {
  "_Bp2l3kpD.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "Bp2l3kpD.js",
    "name": "game-core"
  },
  "_DVfUjFCo.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DVfUjFCo.js",
    "name": "v3",
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ]
  },
  "_DvUShIk5.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DvUShIk5.js",
    "name": "jwt-decode.esm"
  },
  "middleware/auth.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "CEM6jpGS.js",
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
    "file": "B8BCIFMI.js",
    "name": "error-404",
    "src": "node_modules/nuxt/dist/app/components/error-404.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js",
      "_DVfUjFCo.js"
    ],
    "css": [
      "error-404.DE9dtNuv.css"
    ]
  },
  "error-404.DE9dtNuv.css": {
    "file": "error-404.DE9dtNuv.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "node_modules/nuxt/dist/app/components/error-500.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "Cyg01rFC.js",
    "name": "error-500",
    "src": "node_modules/nuxt/dist/app/components/error-500.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js",
      "_DVfUjFCo.js"
    ],
    "css": [
      "error-500.JESWioAZ.css"
    ]
  },
  "error-500.JESWioAZ.css": {
    "file": "error-500.JESWioAZ.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "node_modules/nuxt/dist/app/entry.js": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DVNOL9sH.js",
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
    "file": "Bjul-qab.js",
    "name": "generation",
    "src": "pages/generation.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "css": [
      "generation.JHZWmgFU.css"
    ]
  },
  "generation.JHZWmgFU.css": {
    "file": "generation.JHZWmgFU.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "pages/login.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "D8aYDLaF.js",
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
    "file": "DSrQmudB.js",
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
    "file": "4HjY2acL.js",
    "name": "page",
    "src": "pages/page.vue",
    "isDynamicEntry": true,
    "imports": [
      "_Bp2l3kpD.js",
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "css": [
      "page.Dkk8GCJv.css"
    ]
  },
  "page.Dkk8GCJv.css": {
    "file": "page.Dkk8GCJv.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  },
  "pages/view.vue": {
    "resourceType": "script",
    "module": true,
    "prefetch": true,
    "preload": true,
    "file": "DC7h5pMP.js",
    "name": "view",
    "src": "pages/view.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.js"
    ],
    "css": [
      "view.rIOfVIhd.css"
    ]
  },
  "view.rIOfVIhd.css": {
    "file": "view.rIOfVIhd.css",
    "resourceType": "style",
    "prefetch": true,
    "preload": true
  }
};

export { client_manifest as default };
//# sourceMappingURL=client.manifest.mjs.map
