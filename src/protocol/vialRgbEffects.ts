// VialRGB effect id -> name, ported from vial-gui's editor/rgb_configurator.py
// (VIALRGB_EFFECTS). The ids are QMK's rgb_matrix effect order and are part of
// the wire protocol, so this table must stay in sync with upstream's — a
// firmware reports which of these ids it compiled in via VIALRGB_GET_SUPPORTED,
// and anything it reports that isn't listed here has no name to show.
//
// Unlike keycap labels (kept English to match vial-gui), these are prose shown
// in a dropdown, so they're translated. They live here rather than in i18n.tsx
// because they're one dense table tied to the protocol, not scattered UI copy.

export interface VialRgbEffect {
  id: number;
  en: string;
  zh: string;
  pt: string;
}

export const VIALRGB_EFFECTS: VialRgbEffect[] = [
  { id: 0, en: "Disable", zh: "关闭", pt: "Desativado" },
  { id: 1, en: "Direct Control", zh: "直接控制", pt: "Controle direto" },
  { id: 2, en: "Solid Color", zh: "纯色常亮", pt: "Cor sólida" },
  { id: 3, en: "Alphas Mods", zh: "字母/修饰键双色", pt: "Alfas e modificadores" },
  { id: 4, en: "Gradient Up Down", zh: "上下渐变", pt: "Gradiente vertical" },
  { id: 5, en: "Gradient Left Right", zh: "左右渐变", pt: "Gradiente horizontal" },
  { id: 6, en: "Breathing", zh: "呼吸", pt: "Respiração" },
  { id: 7, en: "Band Sat", zh: "光带(饱和度)", pt: "Faixa (saturação)" },
  { id: 8, en: "Band Val", zh: "光带(亮度)", pt: "Faixa (brilho)" },
  { id: 9, en: "Band Pinwheel Sat", zh: "风车光带(饱和度)", pt: "Faixa cata-vento (saturação)" },
  { id: 10, en: "Band Pinwheel Val", zh: "风车光带(亮度)", pt: "Faixa cata-vento (brilho)" },
  { id: 11, en: "Band Spiral Sat", zh: "螺旋光带(饱和度)", pt: "Faixa espiral (saturação)" },
  { id: 12, en: "Band Spiral Val", zh: "螺旋光带(亮度)", pt: "Faixa espiral (brilho)" },
  { id: 13, en: "Cycle All", zh: "全键盘循环", pt: "Ciclo total" },
  { id: 14, en: "Cycle Left Right", zh: "左右循环", pt: "Ciclo horizontal" },
  { id: 15, en: "Cycle Up Down", zh: "上下循环", pt: "Ciclo vertical" },
  { id: 16, en: "Rainbow Moving Chevron", zh: "彩虹箭头流动", pt: "Arco-íris em seta móvel" },
  { id: 17, en: "Cycle Out In", zh: "由外向内循环", pt: "Ciclo de fora para dentro" },
  { id: 18, en: "Cycle Out In Dual", zh: "由外向内循环(双色)", pt: "Ciclo de fora para dentro (duplo)" },
  { id: 19, en: "Cycle Pinwheel", zh: "风车循环", pt: "Ciclo cata-vento" },
  { id: 20, en: "Cycle Spiral", zh: "螺旋循环", pt: "Ciclo espiral" },
  { id: 21, en: "Dual Beacon", zh: "双灯塔", pt: "Farol duplo" },
  { id: 22, en: "Rainbow Beacon", zh: "彩虹灯塔", pt: "Farol arco-íris" },
  { id: 23, en: "Rainbow Pinwheels", zh: "彩虹风车", pt: "Cata-ventos arco-íris" },
  { id: 24, en: "Raindrops", zh: "雨滴", pt: "Gotas de chuva" },
  { id: 25, en: "Jellybean Raindrops", zh: "彩色雨滴", pt: "Gotas de chuva coloridas" },
  { id: 26, en: "Hue Breathing", zh: "色相呼吸", pt: "Respiração de matiz" },
  { id: 27, en: "Hue Pendulum", zh: "色相摆动", pt: "Pêndulo de matiz" },
  { id: 28, en: "Hue Wave", zh: "色相波浪", pt: "Onda de matiz" },
  { id: 29, en: "Typing Heatmap", zh: "打字热力图", pt: "Mapa de calor de digitação" },
  { id: 30, en: "Digital Rain", zh: "数字雨", pt: "Chuva digital" },
  { id: 31, en: "Solid Reactive Simple", zh: "按键响应(简单)", pt: "Reativo sólido simples" },
  { id: 32, en: "Solid Reactive", zh: "按键响应", pt: "Reativo sólido" },
  { id: 33, en: "Solid Reactive Wide", zh: "按键响应(扩散)", pt: "Reativo sólido amplo" },
  { id: 34, en: "Solid Reactive Multiwide", zh: "按键响应(多点扩散)", pt: "Reativo sólido multi-amplo" },
  { id: 35, en: "Solid Reactive Cross", zh: "按键响应(十字)", pt: "Reativo sólido cruzado" },
  { id: 36, en: "Solid Reactive Multicross", zh: "按键响应(多点十字)", pt: "Reativo sólido multi-cruzado" },
  { id: 37, en: "Solid Reactive Nexus", zh: "按键响应(交汇)", pt: "Reativo sólido nexo" },
  { id: 38, en: "Solid Reactive Multinexus", zh: "按键响应(多点交汇)", pt: "Reativo sólido multi-nexo" },
  { id: 39, en: "Splash", zh: "水波", pt: "Respingo" },
  { id: 40, en: "Multisplash", zh: "多点水波", pt: "Multi-respingo" },
  { id: 41, en: "Solid Splash", zh: "纯色水波", pt: "Respingo sólido" },
  { id: 42, en: "Solid Multisplash", zh: "纯色多点水波", pt: "Multi-respingo sólido" },
  { id: 43, en: "Pixel Rain", zh: "像素雨", pt: "Chuva de pixels" },
  { id: 44, en: "Pixel Fractal", zh: "像素分形", pt: "Fractal de pixels" },
];

/**
 * Effects whose color comes from the animation itself, so the hue/saturation
 * picker has no visible effect on them. Mirrors QMK's rgb_matrix: the "cycle" /
 * "rainbow" / "hue" families sweep the whole hue wheel, and effect 0 is off.
 * Used only to explain the greyed-out color row — never to block a write.
 */
export const RGB_EFFECTS_IGNORING_COLOR = new Set([
  0, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 25, 26, 27, 28, 29, 30,
]);

const BY_ID = new Map(VIALRGB_EFFECTS.map((e) => [e.id, e]));

/**
 * Display name for an effect id, falling back to a bare id for unknown effects.
 * This table carries en/zh/pt names (see the file header); ja/fr fall back
 * to the English name rather than gaining a translated row here.
 */
export function rgbEffectName(id: number, lang: "en" | "zh" | "ja" | "fr" | "pt-BR"): string {
  const effect = BY_ID.get(id);
  if (!effect) return `Effect ${id}`;
  if (lang === "zh") return effect.zh;
  if (lang === "pt-BR") return effect.pt;
  return effect.en;
}
