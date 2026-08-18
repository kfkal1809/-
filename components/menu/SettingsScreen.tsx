"use client";

import { useAudioSettings } from "@/lib/audio/useAudioSettings";
import { audioManager } from "@/lib/audio/audioManager";
import { playSfx } from "@/lib/audio/audioManager";
import { Card } from "@/components/ui/Card";

export function SettingsScreen() {
  const settings = useAudioSettings();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">설정</h1>

      <Card className="flex flex-col gap-4">
        <p className="text-[14px] font-extrabold text-[var(--color-navy)]">사운드</p>

        <ToggleRow
          label="효과음"
          checked={settings.sfxEnabled}
          onChange={(v) => {
            audioManager.setSfxEnabled(v);
            if (v) playSfx("ui-click");
          }}
        />
        <VolumeRow
          disabled={!settings.sfxEnabled}
          value={Math.round(settings.sfxVolume * 100)}
          onChange={(v) => audioManager.setSfxVolume(v)}
          onCommit={() => playSfx("ui-click")}
        />

        <div className="h-px bg-[var(--color-navy)]/10" />

        <ToggleRow label="배경음악" checked={settings.bgmEnabled} onChange={(v) => audioManager.setBgmEnabled(v)} />
        <VolumeRow
          disabled={!settings.bgmEnabled}
          value={Math.round(settings.bgmVolume * 100)}
          onChange={(v) => audioManager.setBgmVolume(v)}
        />
      </Card>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[14px] font-bold text-[var(--color-navy)]">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--color-tab-active)]" : "bg-[var(--color-navy)]/15"}`}
        style={{ overflow: "hidden" }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left]"
          style={{ left: checked ? 24 : 4 }}
        />
      </button>
    </div>
  );
}

function VolumeRow({
  value,
  onChange,
  onCommit,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${disabled ? "opacity-40" : ""}`}>
      <p className="w-10 shrink-0 text-[12px] font-bold text-[var(--color-navy-soft)]">볼륨</p>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        className="h-2 flex-1 accent-[var(--color-tab-active)]"
        aria-label="볼륨"
      />
      <p className="w-10 shrink-0 text-right text-[12px] font-bold text-[var(--color-navy-soft)]">{value}%</p>
    </div>
  );
}
