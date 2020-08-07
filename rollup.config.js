import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import html from "@open-wc/rollup-plugin-html"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import commonjs from "@rollup/plugin-commonjs"
import nodePolyfills from "rollup-plugin-node-polyfills"
import nodeGlobals from "rollup-plugin-node-globals"

export default [
  {
    input: "src/index.ts",
    external: id => {
      return (
        ["three", "ecsy", "ecsy-three", "ecsy-input"].includes(id) || /^three\//.test(id) || /^troika-3d-text\//.test(id) || /^ecsy-three\//.test(id)
      )
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: true }),
      commonjs({
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      }),
      json(),
      nodePolyfills(),
      typescript(),
      // terser(),
      babel({ babelHelpers: "bundled" })
    ],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    output: [
      {
        file: "dist/armada.js",
        format: "esm",
        sourcemap: true
      }
    ]
  },
  {
    input: "server/index.ts",
    output: { file: "dist/armada.server.js", format: "esm", sourcemap: true },
    plugins: [
      typescript(),
      json(),
      resolve(),
      commonjs({
        preferBuiltins: true,
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      }),
      nodeGlobals({
        buffer: false,
        debug: false,
        path: false,
        process: false
      })
    ],
    external: ["mediasoup", "mediasoup-client", "buffer-es6", "buffer", "fs", "debug", "path", "socket.io", "safer", "depd"]
  },
  // Express socket networking server (for local dev)
  {
    input: "examples/networking/server.js",
    output: { dir: "dist/examples/networking/server.js" },
    plugins: [
      json(),
      resolve(),
      commonjs({
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      })
    ]
  },
  {
    input: "examples/webxr/index.html",
    output: { dir: "dist/examples/webxr" },
    plugins: [html(), resolve(), commonjs(), typescript(), json(), babel({ babelHelpers: "bundled" })]
  }
]
