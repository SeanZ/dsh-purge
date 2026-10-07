import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const bundle = fs.readFileSync(
  new URL("../client.js", import.meta.url),
  "utf8",
);

for (const rewindEnabled of [false, true]) {
  test(`生成的 ModuleLoader IIFE 可加载；rewindEnabled=${rewindEnabled}`, async () => {
    const slots = [];
    const pending = [];
    const cleanup = [];
    const requests = [];
    const react = {
      Component: class {},
      createElement: (...args) => args,
      useState() {},
      useEffect() {},
      useCallback() {},
      useRef() {},
    };
    let plugin;
    const runtime = {
      AbortController,
      URL,
      setTimeout,
      clearTimeout,
      console,
      fetch: async (url) => {
        requests.push(String(url));
        return new Response(
          JSON.stringify({ ok: true, ready: true, rewindEnabled }),
          { status: 200 },
        );
      },
      window: {
        location: { origin: "http://127.0.0.1:3081" },
        setInterval: () => 1,
        clearInterval() {},
        __ModuleLoader__: {
          load: ({ id, factory }) => {
            assert.equal(id, "dsh-purge");
            plugin = factory((name) => {
              assert.equal(name, "react");
              return react;
            });
          },
        },
      },
    };
    vm.runInNewContext(bundle, runtime, { filename: "client.js" });
    assert.equal(plugin.name, "dsh-purge");
    assert.equal(typeof plugin.apply, "function");
    const ctx = {
      sessions: {},
      locale: { register: () => () => {}, bind: () => (key) => key },
      effect: (fn) => {
        const dispose = fn();
        if (typeof dispose === "function") cleanup.push(dispose);
      },
      slots: {
        inject: (_name, fn) => fn(),
        register: (spec) => {
          slots.push(spec.id);
          return () => {};
        },
      },
      inject: (_deps, fn) => {
        pending.push(Promise.resolve(fn(ctx)));
      },
    };
    plugin.apply(ctx);
    await Promise.all(pending);
    assert.ok(slots.includes("dsh-purge"), "设置页正常注册");
    assert.equal(slots.includes("dsh-purge-rewind"), rewindEnabled);
    assert.deepEqual(requests, ["http://127.0.0.1:3081/dsh-purge/status"]);
    for (const dispose of cleanup) dispose();
  });
}
