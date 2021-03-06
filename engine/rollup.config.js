import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import commonjs from "@rollup/plugin-commonjs"
import nodePolyfills from "rollup-plugin-node-polyfills"
import nodeGlobals from "rollup-plugin-node-globals"
import injectProcessEnv from "rollup-plugin-inject-process-env"
export default [
  {
    input: "src/index.ts",
    external: id => {
      return (
        ["three", "socket.io", "socket.io-client", "mediasoup", "mediasoup-client"].includes(id) ||
        /^three\//.test(id) ||
        /^troika-3d-text\//.test(id)
      )
    },
    plugins: [
      json(),
      resolve({ browser: true, preferBuiltins: true }),
      commonjs({
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      }),
      injectProcessEnv({
        NODE_ENV: "production"
      }),
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
  // // HTML Example Page
  // {
  //   input: "examples/index.html",
  //   output: { dir: "dist/examples/" },
  //   plugins: [
  //     html(),
  //     resolve({ browser: true, preferBuiltins: false }),
  //     commonjs(),
  //     json(),
  //     injectProcessEnv({
  //       NODE_ENV: "production"
  //     }),
  //     typescript(),
  //     babel({ babelHelpers: "bundled" })
  //   ]
  // },
  // Server
  {
    input: "src/server.ts",
    output: { file: "dist/armada.server.js", format: "esm", sourcemap: true },
    plugins: [
      typescript(),
      json(),
      resolve({ browser: false, preferBuiltins: true }),
      commonjs({
        include: ["node_modules/**/*"], // Default: undefined
        transformMixedEsModules: true
      }),
      injectProcessEnv({
        NODE_ENV: "production"
      }),
      nodeGlobals({
        buffer: false,
        debug: false,
        path: false,
        process: false
      })
    ],
    external: ["mediasoup", "utf-8-validate", "mediasoup-client", "buffer-es6", "debug", "socket.io", "safer", "depd"]
  }
]
