import { describe, expect, it } from "vitest";
import { normalizeVilKeyOverride, parseVil, serializeVil, type VilSnapshot } from "./vilFile.ts";
import { KEY_OVERRIDE_OPT_ENABLED } from "./keyboard.ts";

const SNAPSHOT: VilSnapshot = {
  uid: 123n,
  viaProtocol: 12,
  vialProtocol: 6,
  layoutOptions: -1,
  layout: [[["KC_A"]]],
  encoderLayout: [],
  keyOverrides: [
    {
      trigger: "KC_BSPACE",
      replacement: "KC_DELETE",
      layers: 0xffff,
      trigger_mods: 0x02,
      negative_mod_mask: 0,
      suppressed_mods: 0,
      options: KEY_OVERRIDE_OPT_ENABLED,
    },
  ],
};

describe("vil key overrides", () => {
  it("exports key_override entries", () => {
    const parsed = JSON.parse(serializeVil(SNAPSHOT));
    expect(parsed.key_override).toEqual(SNAPSHOT.keyOverrides);
  });

  it("parses key_override and doesn't flag it as an unsupported feature", () => {
    const parsed = parseVil(serializeVil(SNAPSHOT));
    expect(parsed.keyOverrides).toEqual(SNAPSHOT.keyOverrides);
    expect(parsed.skippedFeatures).not.toContain("key overrides");
  });

  it("still reports alt repeat keys as unsupported", () => {
    const parsed = parseVil(
      JSON.stringify({
        layout: [[["KC_A"]]],
        alt_repeat_key: [{ options: 1 << 3 }],
      }),
    );
    expect(parsed.skippedFeatures).toContain("alt repeat keys");
  });

  it("rejects malformed key_override arrays", () => {
    expect(() => parseVil(JSON.stringify({ layout: [[["KC_A"]]], key_override: {} }))).toThrow(
      /malformed "key_override"/,
    );
  });

  it("normalizes keycodes and validates numeric masks", () => {
    const unknown = new Set<string>();
    expect(
      normalizeVilKeyOverride(
        {
          trigger: "KC_BSPACE",
          replacement: 0x4c,
          layers: 0xffff,
          trigger_mods: 0x02,
          negative_mod_mask: 0,
          suppressed_mods: 0,
          options: 0x80,
        },
        unknown,
      ),
    ).toMatchObject({ trigger: "KC_BSPACE", replacement: "KC_DELETE" });
    expect(
      normalizeVilKeyOverride(
        {
          trigger: "keeb.unknown",
          replacement: "KC_DELETE",
          layers: 0,
          trigger_mods: 0,
          negative_mod_mask: 0,
          suppressed_mods: 0,
          options: 0,
        },
        unknown,
      ),
    ).toBeNull();
    expect(unknown).toContain("keeb.unknown");
    expect(
      normalizeVilKeyOverride(
        {
          trigger: "KC_A",
          replacement: "KC_B",
          layers: 0x10000,
          trigger_mods: 0,
          negative_mod_mask: 0,
          suppressed_mods: 0,
          options: 0,
        },
        new Set(),
      ),
    ).toBeNull();
  });
});
