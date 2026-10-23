import { describe, expect, it } from "vitest";
import {
  KEY_OVERRIDE_OPT_ACTIVATION_TRIGGER_DOWN,
  KEY_OVERRIDE_OPT_ENABLED,
  Keyboard,
  type KeyOverrideEntry,
} from "./keyboard.ts";
import type { Transport } from "./transport.ts";
import { MockHidTransport } from "./demo/mockHidTransport.ts";

function fakeTransport(): { transport: Transport; sent: Uint8Array<ArrayBuffer>[] } {
  const sent: Uint8Array<ArrayBuffer>[] = [];
  const transport: Transport = {
    productName: "test",
    vendorId: 0,
    productId: 0,
    onDisconnect: null,
    onFatal: null,
    async send(cmd) {
      sent.push(cmd);
      return new Uint8Array(new ArrayBuffer(32));
    },
    async close() {},
  };
  return { transport, sent };
}

const ENTRY: KeyOverrideEntry = {
  trigger: "KC_BSPACE",
  replacement: "KC_DELETE",
  layers: 0x0005,
  triggerMods: 0x02,
  negativeModMask: 0x04,
  suppressedMods: 0x08,
  options: KEY_OVERRIDE_OPT_ENABLED | KEY_OVERRIDE_OPT_ACTIVATION_TRIGGER_DOWN,
};

describe("key overrides", () => {
  it("serializes the SET command as little-endian u16 fields followed by u8 masks", async () => {
    const { transport, sent } = fakeTransport();
    const keyboard = new Keyboard(transport);

    await keyboard.setKeyOverride(3, ENTRY);

    expect(sent).toHaveLength(1);
    expect(Array.from(sent[0].subarray(0, 14))).toEqual([
      0xfe,
      0x0d,
      0x06,
      3,
      0x2a,
      0x00,
      0x4c,
      0x00,
      0x05,
      0x00,
      0x02,
      0x04,
      0x08,
      0x81,
    ]);
    expect(keyboard.keyOverrideEntries[3]).toEqual(ENTRY);
  });

  it("loads key overrides from the demo firmware during reload", async () => {
    const keyboard = new Keyboard(new MockHidTransport());
    await keyboard.reload();
    expect(keyboard.keyOverrideCount).toBe(2);
    expect(keyboard.keyOverrideEntries[0]).toMatchObject({
      trigger: "KC_BSPACE",
      replacement: "KC_DELETE",
      layers: 0xffff,
      triggerMods: 0x02,
      options: KEY_OVERRIDE_OPT_ENABLED | KEY_OVERRIDE_OPT_ACTIVATION_TRIGGER_DOWN,
    });
  });

  it("does not send when the entry is unchanged", async () => {
    const { transport, sent } = fakeTransport();
    const keyboard = new Keyboard(transport);
    keyboard.keyOverrideEntries[0] = { ...ENTRY };

    await keyboard.setKeyOverride(0, { ...ENTRY });

    expect(sent).toHaveLength(0);
  });
});
