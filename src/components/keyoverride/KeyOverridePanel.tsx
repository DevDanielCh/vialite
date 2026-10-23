import { useState } from "react";
import { Icon } from "@iconify/react";
import { useI18n, type MessageKey } from "../../contexts/i18n.tsx";
import {
  KEY_OVERRIDE_OPT_ACTIVATION_NEGATIVE_MOD_UP,
  KEY_OVERRIDE_OPT_ACTIVATION_REQUIRED_MOD_DOWN,
  KEY_OVERRIDE_OPT_ACTIVATION_TRIGGER_DOWN,
  KEY_OVERRIDE_OPT_ENABLED,
  KEY_OVERRIDE_OPT_NO_REREGISTER_TRIGGER,
  KEY_OVERRIDE_OPT_NO_UNREGISTER_ON_OTHER_KEY_DOWN,
  KEY_OVERRIDE_OPT_ONE_MOD,
  type Keyboard,
  type KeyOverrideEntry,
} from "../../protocol/keyboard.ts";
import { useToast } from "../../contexts/toast.tsx";
import { HelpIcon } from "../common/HelpIcon.tsx";
import { KeySlot } from "../common/KeySlot.tsx";
import { RenumberPicker } from "../common/RenumberPicker.tsx";
import { ConfirmDialog } from "../common/ConfirmDialog.tsx";
import { clearOldSlotAfterMove } from "../common/moveSlot.ts";
import { useWriteError } from "../../hooks/useWriteError.ts";

interface Props {
  keyboard: Keyboard;
}

const EMPTY_ENTRY: KeyOverrideEntry = {
  trigger: "KC_NO",
  replacement: "KC_NO",
  layers: 0,
  triggerMods: 0,
  negativeModMask: 0,
  suppressedMods: 0,
  options: 0,
};

function defaultEntry(layerCount: number): KeyOverrideEntry {
  return {
    ...EMPTY_ENTRY,
    layers: (1 << Math.min(layerCount, 16)) - 1,
    options: KEY_OVERRIDE_OPT_ENABLED,
  };
}

const isUsed = (entry: KeyOverrideEntry): boolean =>
  entry.trigger !== "KC_NO" ||
  entry.replacement !== "KC_NO" ||
  entry.layers !== 0 ||
  entry.triggerMods !== 0 ||
  entry.negativeModMask !== 0 ||
  entry.suppressedMods !== 0 ||
  entry.options !== 0;

const MOD_BITS = ["LCtrl", "LShift", "LAlt", "LGui", "RCtrl", "RShift", "RAlt", "RGui"];

const OPTIONS: { bit: number; labelKey: MessageKey }[] = [
  { bit: KEY_OVERRIDE_OPT_ACTIVATION_TRIGGER_DOWN, labelKey: "keyOverrideOptionTriggerDown" },
  { bit: KEY_OVERRIDE_OPT_ACTIVATION_REQUIRED_MOD_DOWN, labelKey: "keyOverrideOptionRequiredModDown" },
  { bit: KEY_OVERRIDE_OPT_ACTIVATION_NEGATIVE_MOD_UP, labelKey: "keyOverrideOptionNegativeModUp" },
  { bit: KEY_OVERRIDE_OPT_ONE_MOD, labelKey: "keyOverrideOptionOneMod" },
  { bit: KEY_OVERRIDE_OPT_NO_REREGISTER_TRIGGER, labelKey: "keyOverrideOptionNoReregister" },
  {
    bit: KEY_OVERRIDE_OPT_NO_UNREGISTER_ON_OTHER_KEY_DOWN,
    labelKey: "keyOverrideOptionNoUnregisterOther",
  },
];

function ModMaskField({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {MOD_BITS.map((label, bit) => (
        <label key={label} className="label cursor-pointer justify-start gap-1.5 p-0">
          <input
            type="checkbox"
            className="checkbox checkbox-xs"
            checked={(value & (1 << bit)) !== 0}
            onChange={(e) => onChange(e.target.checked ? value | (1 << bit) : value & ~(1 << bit))}
          />
          <span className="text-xs">{label}</span>
        </label>
      ))}
    </div>
  );
}

export function KeyOverridePanel({ keyboard }: Props) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const onWriteError = useWriteError();
  const [active, setActive] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  if (keyboard.keyOverrideCount === 0 || keyboard.keyOverrideEntries.length === 0) {
    return <p className="text-brand-on-surface-variant">{t("keyOverrideNone")}</p>;
  }

  const entry = keyboard.keyOverrideEntries[active] ?? keyboard.keyOverrideEntries[0];
  const usedCount = keyboard.keyOverrideEntries.filter(isUsed).length;
  const usedIndices = new Set(keyboard.keyOverrideEntries.flatMap((e, i) => (isUsed(e) ? [i] : [])));
  const visible = keyboard.keyOverrideEntries
    .map((_, i) => i)
    .filter((i) => isUsed(keyboard.keyOverrideEntries[i]) || i === active);
  const layerCount = Math.min(keyboard.layers, 16);

  const updateAt = async (idx: number, patch: Partial<KeyOverrideEntry>) => {
    try {
      await keyboard.setKeyOverride(idx, { ...keyboard.keyOverrideEntries[idx], ...patch });
    } catch (err) {
      onWriteError(err);
    }
  };

  const update = (patch: Partial<KeyOverrideEntry>) => void updateAt(active, patch);

  const handleAdd = async () => {
    const freeIdx = keyboard.keyOverrideEntries.findIndex((e) => !isUsed(e));
    if (freeIdx === -1) {
      showToast(t("keyOverrideFull"));
      return;
    }
    try {
      await keyboard.setKeyOverride(freeIdx, defaultEntry(keyboard.layers));
      setActive(freeIdx);
    } catch (err) {
      onWriteError(err);
    }
  };

  const moveTo = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const src = keyboard.keyOverrideEntries[fromIdx];
    try {
      await keyboard.setKeyOverride(toIdx, { ...src });
    } catch (err) {
      onWriteError(err);
      return;
    }
    setActive(toIdx);
    if (isUsed(src)) {
      await clearOldSlotAfterMove(
        () => keyboard.setKeyOverride(fromIdx, { ...EMPTY_ENTRY }),
        onWriteError,
        t("keyOverrideMoveDuplicated", { from: fromIdx, to: toIdx }),
      );
    }
  };

  const allLayers = layerCount >= 16 ? 0xffff : (1 << layerCount) - 1;
  const options = entry.options;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <progress
          className="progress h-3 w-64"
          value={usedCount}
          max={Math.max(keyboard.keyOverrideCount, 1)}
        />
        <span className="text-xs text-brand-on-surface-variant">
          {t("keyOverrideUsed", { used: usedCount, total: keyboard.keyOverrideCount })}
        </span>
        <HelpIcon text={t("keyOverrideUsedHelp")} />
        <button type="button" className="btn btn-primary btn-sm ml-auto" onClick={() => void handleAdd()}>
          <Icon icon="mdi:plus" className="h-4 w-4" />
          {t("keyOverrideAdd")}
        </button>
      </div>

      <div
        role="tablist"
        aria-label={t("keyOverrideSlots")}
        className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(4.5rem,1fr))]"
      >
        {visible.map((i) => {
          const isActive = i === active;
          const configured =
            keyboard.keyOverrideEntries[i].trigger !== "KC_NO" ||
            keyboard.keyOverrideEntries[i].replacement !== "KC_NO";
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`btn btn-sm relative isolate justify-start gap-1.5 ${
                isActive ? "btn-primary" : "btn-outline border-base-300"
              }`}
            >
              {configured && !isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-[inherit] bg-brand-secondary/15"
                />
              )}
              <Icon icon="mdi:swap-horizontal" className="h-4 w-4 shrink-0" />
              <span>{i}</span>
              {configured && !isActive && (
                <span className="ml-auto inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-secondary" />
              )}
            </button>
          );
        })}
      </div>

      <div key={active} className="tab-panel-appear flex flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <RenumberPicker
            index={active}
            count={keyboard.keyOverrideCount}
            usedIndices={usedIndices}
            icon="mdi:swap-horizontal"
            title={t("keyOverrideRenumber")}
            onMove={(toIdx) => void moveTo(active, toIdx)}
          />
          <label className="label ml-auto cursor-pointer justify-start gap-2 p-0">
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={(options & KEY_OVERRIDE_OPT_ENABLED) !== 0}
              onChange={(e) =>
                update({
                  options: e.target.checked
                    ? options | KEY_OVERRIDE_OPT_ENABLED
                    : options & ~KEY_OVERRIDE_OPT_ENABLED,
                })
              }
            />
            <span className="text-sm font-medium">{t("keyOverrideEnabled")}</span>
          </label>
          <button
            type="button"
            className="btn btn-ghost btn-sm px-2 hover:text-error"
            title={t("delete")}
            onClick={() => setPendingDelete(active)}
          >
            <Icon icon="mdi:trash-can-outline" className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <section className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
            <span className="text-xs font-medium tracking-wide uppercase opacity-60">
              {t("keyOverrideTrigger")}
            </span>
            <KeySlot
              qmkId={entry.trigger}
              keyboard={keyboard}
              emptyLabel={t("fieldAddRegularKey")}
              className="btn btn-outline min-h-12 w-full justify-between py-1 text-xs"
              onChange={(qmkId) => update({ trigger: qmkId })}
            />
          </section>
          <section className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
            <span className="text-xs font-medium tracking-wide uppercase opacity-60">
              {t("keyOverrideReplacement")}
            </span>
            <KeySlot
              qmkId={entry.replacement}
              keyboard={keyboard}
              emptyLabel={t("fieldAddRegularKey")}
              className="btn btn-outline min-h-12 w-full justify-between py-1 text-xs"
              onChange={(qmkId) => update({ replacement: qmkId })}
            />
          </section>
        </div>

        <section className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium tracking-wide uppercase opacity-60">
              {t("keyOverrideLayers")}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => update({ layers: allLayers })}
            >
              {t("keyOverrideAllLayers")}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => update({ layers: 0 })}
            >
              {t("keyOverrideNoLayers")}
            </button>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: layerCount }, (_, layer) => (
              <label key={layer} className="label cursor-pointer justify-start gap-1.5 p-0">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={(entry.layers & (1 << layer)) !== 0}
                  onChange={(e) =>
                    update({
                      layers: e.target.checked
                        ? entry.layers | (1 << layer)
                        : entry.layers & ~(1 << layer),
                    })
                  }
                />
                <span className="text-xs">{layer}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-3">
          <section className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
            <span className="text-xs font-medium tracking-wide uppercase opacity-60">
              {t("keyOverrideTriggerMods")}
            </span>
            <ModMaskField value={entry.triggerMods} onChange={(triggerMods) => update({ triggerMods })} />
          </section>
          <section className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
            <span className="text-xs font-medium tracking-wide uppercase opacity-60">
              {t("keyOverrideNegativeMods")}
            </span>
            <ModMaskField
              value={entry.negativeModMask}
              onChange={(negativeModMask) => update({ negativeModMask })}
            />
          </section>
          <section className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
            <span className="text-xs font-medium tracking-wide uppercase opacity-60">
              {t("keyOverrideSuppressedMods")}
            </span>
            <ModMaskField
              value={entry.suppressedMods}
              onChange={(suppressedMods) => update({ suppressedMods })}
            />
          </section>
        </div>

        <section className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium tracking-wide uppercase opacity-60">
              {t("keyOverrideOptions")}
            </span>
            <HelpIcon text={t("keyOverrideOptionsHelp")} />
          </div>
          <div className="grid gap-1 md:grid-cols-2">
            {OPTIONS.map(({ bit, labelKey }) => (
              <label key={bit} className="label cursor-pointer justify-start gap-2 p-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={(options & bit) !== 0}
                  onChange={(e) =>
                    update({ options: e.target.checked ? options | bit : options & ~bit })
                  }
                />
                <span className="text-sm">{t(labelKey)}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {pendingDelete !== null && (
        <ConfirmDialog
          message={t("keyOverrideDeleteConfirm")}
          onConfirm={() => {
            void updateAt(pendingDelete, EMPTY_ENTRY);
            if (pendingDelete === active) {
              const next = keyboard.keyOverrideEntries.findIndex((e, i) => i !== active && isUsed(e));
              setActive(next === -1 ? active : next);
            }
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
