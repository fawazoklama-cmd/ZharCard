import React, { useState } from 'react';
import { Download, RotateCcw, Save, ZoomIn, ZoomOut } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useGame } from '../context/GameContext';
import type { Card, CardTemplate, ElementType, Rarity } from '../types/zhar';
import { RARITY_ORDER } from '../utils/gameLogic';
import { ZharCardTile } from '../components/ZharCardTile';
import { downloadCardAsPng } from '../utils/exportCardPng';

const ARTWORK_PRESETS = [
  { label: 'Sky Seraph', url: '/src/assets/images/card_sky_seraph_1795133632808.jpg' },
  { label: 'Crystal Dragon', url: '/src/assets/images/card_crystal_dragon_1795133633088.jpg' },
  { label: 'Portal Mage', url: '/src/assets/images/card_portal_mage_1795133633848.jpg' },
  { label: 'Thunder Valkyrie', url: '/src/assets/images/card_thunder_valkyrie_1795133633128.jpg' },
  { label: 'Mystic Phoenix', url: '/src/assets/images/card_mystic_phoenix_1795133632474.jpg' },
];

const TEMPLATE_PRESETS: Record<
  CardTemplate,
  { element: ElementType; rarity: Rarity; hp: number; atk: number; def: number; art: string; skill: string }
> = {
  'Fantasy Hero': {
    element: 'Light',
    rarity: 'RARE',
    hp: 210,
    atk: 68,
    def: 52,
    art: ARTWORK_PRESETS[2].url,
    skill: 'Radiant Slash',
  },
  'Sky Guardian': {
    element: 'Wind',
    rarity: 'EPIC',
    hp: 245,
    atk: 74,
    def: 66,
    art: ARTWORK_PRESETS[0].url,
    skill: 'Cloud Citadel Shield',
  },
  Dragon: {
    element: 'Ice',
    rarity: 'LEGENDARY',
    hp: 290,
    atk: 88,
    def: 64,
    art: ARTWORK_PRESETS[1].url,
    skill: 'Crystal Storm Breath',
  },
  Angel: {
    element: 'Light',
    rarity: 'EPIC',
    hp: 240,
    atk: 76,
    def: 60,
    art: ARTWORK_PRESETS[0].url,
    skill: 'Halo Sanctuary',
  },
  Demon: {
    element: 'Dark',
    rarity: 'EPIC',
    hp: 225,
    atk: 86,
    def: 46,
    art: ARTWORK_PRESETS[2].url,
    skill: 'Abyssal Portal',
  },
  'Mystic Creature': {
    element: 'Fire',
    rarity: 'MYTHIC',
    hp: 280,
    atk: 90,
    def: 58,
    art: ARTWORK_PRESETS[4].url,
    skill: 'Aurora Rebirth',
  },
  'Cyber Warrior': {
    element: 'Thunder',
    rarity: 'RARE',
    hp: 220,
    atk: 80,
    def: 50,
    art: ARTWORK_PRESETS[3].url,
    skill: 'Volt Overdrive',
  },
};

export function CardCreatorPage() {
  const { t } = useI18n();
  const { profile, saveCustomCard } = useGame();

  const [template, setTemplate] = useState<CardTemplate>('Sky Guardian');
  const [name, setName] = useState('Caelum Penjaga Awan');
  const [description, setDescription] = useState('Prajurit kristal pelindung gerbang ZharWorld.');
  const [imageUrl, setImageUrl] = useState(ARTWORK_PRESETS[0].url);
  const [rarity, setRarity] = useState<Rarity>('EPIC');
  const [element, setElement] = useState<ElementType>('Wind');
  const [hp, setHp] = useState(245);
  const [attack, setAttack] = useState(74);
  const [defense, setDefense] = useState(66);
  const [skillName, setSkillName] = useState('Cloud Citadel Shield');
  const [skillDescription, setSkillDescription] = useState('Memantulkan serangan energi dengan perisai kristal langit.');
  const [frameStyle, setFrameStyle] = useState<Card['frameStyle']>('sky-crystal');
  const [bgStyle, setBgStyle] = useState<Card['bgStyle']>('cloud-citadel');
  const [borderStyle, setBorderStyle] = useState<Card['borderStyle']>('clean');
  const [effectStyle, setEffectStyle] = useState<Card['effectStyle']>('shimmer');
  const [typographyStyle, setTypographyStyle] = useState<Card['typographyStyle']>('display');
  const [isHolographic, setIsHolographic] = useState(true);
  const [accentColor, setAccentColor] = useState('#75C9FF');
  const [zoomed, setZoomed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const previewCard: Card = {
    id: 'preview_custom',
    name: name.trim() || 'Untitled Card',
    description: description.trim() || 'Custom ZharWorld card',
    imageUrl,
    rarity,
    element,
    hp,
    attack,
    defense,
    skillName: skillName.trim() || 'Sky Strike',
    skillDescription: skillDescription.trim() || 'Deals elemental damage.',
    template,
    frameStyle,
    bgStyle,
    borderStyle,
    effectStyle,
    typographyStyle,
    accentColor,
    isHolographic,
    isOfficial: false,
    moderationStatus: 'pending',
    creatorId: profile.uid,
    creatorName: profile.username,
  };

  const applyTemplate = (tmpl: CardTemplate) => {
    const preset = TEMPLATE_PRESETS[tmpl];
    setTemplate(tmpl);
    setElement(preset.element);
    setRarity(preset.rarity);
    setHp(preset.hp);
    setAttack(preset.atk);
    setDefense(preset.def);
    setImageUrl(preset.art);
    setSkillName(preset.skill);
  };

  const handleReset = () => {
    applyTemplate('Sky Guardian');
    setName('Caelum Penjaga Awan');
    setDescription('Prajurit kristal pelindung gerbang ZharWorld.');
    setSkillDescription('Memantulkan serangan energi dengan perisai kristal langit.');
    setFrameStyle('sky-crystal');
    setIsHolographic(true);
    setAccentColor('#75C9FF');
    setStatusMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (
      name.trim().length < 2 ||
      description.trim().length < 4 ||
      skillName.trim().length < 2 ||
      skillDescription.trim().length < 4
    ) {
      setStatusMsg({ type: 'err', text: t.creator.validationError });
      return;
    }

    setSaving(true);
    try {
      await saveCustomCard({
        name: name.trim().slice(0, 60),
        description: description.trim().slice(0, 400),
        imageUrl: imageUrl.trim().slice(0, 1000),
        rarity,
        element,
        hp: Math.max(20, Math.min(5000, Number(hp) || 100)),
        attack: Math.max(5, Math.min(2000, Number(attack) || 30)),
        defense: Math.max(0, Math.min(2000, Number(defense) || 20)),
        skillName: skillName.trim().slice(0, 60),
        skillDescription: skillDescription.trim().slice(0, 240),
        template,
        frameStyle,
        bgStyle,
        borderStyle,
        effectStyle,
        typographyStyle,
        accentColor,
        isHolographic,
      });
      setStatusMsg({ type: 'ok', text: t.creator.savedSuccess });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : t.common.errorGeneric,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#101C32] dark:text-white">
          {t.creator.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.creator.subtitle}
        </p>
      </div>

      {/* Templates Strip */}
      <div className="rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/30 p-4 space-y-2.5">
        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
          {t.creator.templatesLabel}
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TEMPLATE_PRESETS) as CardTemplate[]).map((tmpl) => (
            <button
              key={tmpl}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                template === tmpl
                  ? 'bg-[#2377B9] text-white'
                  : 'bg-[#DDF3FF]/70 dark:bg-[#101C32] text-[#101C32] dark:text-slate-200 hover:bg-[#BDEBFF] dark:hover:bg-slate-800'
              }`}
            >
              {tmpl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 p-6 space-y-6"
        >
          <div className="space-y-4">
            <h2 className="font-display font-bold text-base text-[#2377B9] dark:text-[#75C9FF]">
              {t.creator.infoSection}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cc-name" className="block text-xs font-semibold mb-1">
                  {t.creator.cardName}
                </label>
                <input
                  id="cc-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
                />
              </div>

              <div>
                <label htmlFor="cc-art" className="block text-xs font-semibold mb-1">
                  {t.creator.imageChoice}
                </label>
                <select
                  id="cc-art"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
                >
                  {ARTWORK_PRESETS.map((art) => (
                    <option key={art.url} value={art.url}>
                      {art.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cc-desc" className="block text-xs font-semibold mb-1">
                {t.creator.cardDesc}
              </label>
              <textarea
                id="cc-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={400}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label htmlFor="cc-rarity" className="block text-xs font-semibold mb-1">
                  {t.creator.rarity}
                </label>
                <select
                  id="cc-rarity"
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as Rarity)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs"
                >
                  {RARITY_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cc-el" className="block text-xs font-semibold mb-1">
                  {t.creator.element}
                </label>
                <select
                  id="cc-el"
                  value={element}
                  onChange={(e) => setElement(e.target.value as ElementType)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs"
                >
                  {(['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark', 'Ice', 'Thunder'] as ElementType[]).map(
                    (el) => (
                      <option key={el} value={el}>
                        {el}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="cc-hp" className="block text-xs font-semibold mb-1">
                  {t.creator.hp}
                </label>
                <input
                  id="cc-hp"
                  type="number"
                  min={20}
                  max={5000}
                  value={hp}
                  onChange={(e) => setHp(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs font-mono"
                />
              </div>
              <div>
                <label htmlFor="cc-atk" className="block text-xs font-semibold mb-1">
                  {t.creator.attack}
                </label>
                <input
                  id="cc-atk"
                  type="number"
                  min={5}
                  max={2000}
                  value={attack}
                  onChange={(e) => setAttack(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs font-mono"
                />
              </div>
              <div>
                <label htmlFor="cc-def" className="block text-xs font-semibold mb-1">
                  {t.creator.defense}
                </label>
                <input
                  id="cc-def"
                  type="number"
                  min={0}
                  max={2000}
                  value={defense}
                  onChange={(e) => setDefense(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cc-skill" className="block text-xs font-semibold mb-1">
                  {t.creator.skillName}
                </label>
                <input
                  id="cc-skill"
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  maxLength={60}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
                />
              </div>
              <div>
                <label htmlFor="cc-skill-desc" className="block text-xs font-semibold mb-1">
                  {t.creator.skillDesc}
                </label>
                <input
                  id="cc-skill-desc"
                  type="text"
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  maxLength={240}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-display font-bold text-base text-[#2377B9] dark:text-[#75C9FF]">
              {t.creator.designSection}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="cc-frame" className="block text-xs font-semibold mb-1">
                  {t.creator.frameLabel}
                </label>
                <select
                  id="cc-frame"
                  value={frameStyle}
                  onChange={(e) => setFrameStyle(e.target.value as Card['frameStyle'])}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs"
                >
                  <option value="sky-crystal">Sky Crystal</option>
                  <option value="gold-celestial">Gold Celestial</option>
                  <option value="obsidian-void">Obsidian Void</option>
                  <option value="aurora-prism">Aurora Prism</option>
                </select>
              </div>
              <div>
                <label htmlFor="cc-bg" className="block text-xs font-semibold mb-1">
                  {t.creator.bgLabel}
                </label>
                <select
                  id="cc-bg"
                  value={bgStyle}
                  onChange={(e) => setBgStyle(e.target.value as Card['bgStyle'])}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs"
                >
                  <option value="cloud-citadel">Cloud Citadel</option>
                  <option value="starlight-navy">Starlight Navy</option>
                  <option value="sunset-portal">Sunset Portal</option>
                  <option value="ice-sanctum">Ice Sanctum</option>
                </select>
              </div>
              <div>
                <label htmlFor="cc-border" className="block text-xs font-semibold mb-1">
                  {t.creator.borderLabel}
                </label>
                <select
                  id="cc-border"
                  value={borderStyle}
                  onChange={(e) => setBorderStyle(e.target.value as Card['borderStyle'])}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs"
                >
                  <option value="clean">Clean</option>
                  <option value="ornate">Ornate</option>
                  <option value="cyber">Cyber</option>
                  <option value="prism">Prism</option>
                </select>
              </div>
              <div>
                <label htmlFor="cc-fx" className="block text-xs font-semibold mb-1">
                  {t.creator.effectLabel}
                </label>
                <select
                  id="cc-fx"
                  value={effectStyle}
                  onChange={(e) => setEffectStyle(e.target.value as Card['effectStyle'])}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F4FBFF] dark:bg-[#101C32] text-xs"
                >
                  <option value="none">None</option>
                  <option value="shimmer">Shimmer</option>
                  <option value="aurora">Aurora</option>
                  <option value="lightning">Lightning</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHolographic}
                  onChange={(e) => setIsHolographic(e.target.checked)}
                  className="w-4 h-4 accent-[#2377B9]"
                />
                {t.creator.holoToggle}
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                {t.creator.accentColor}
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-6 rounded border-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {statusMsg && (
            <div
              role="status"
              className={`p-3 rounded-xl text-xs font-medium border ${
                statusMsg.type === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-800 dark:text-rose-200'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {t.creator.saveBtn}
            </button>
            <button
              type="button"
              onClick={() => void downloadCardAsPng(previewCard)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DDF3FF] dark:bg-[#101C32] border border-[#75C9FF]/50 text-[#101C32] dark:text-white font-semibold text-sm hover:bg-[#BDEBFF] dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t.creator.downloadPng}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
              {t.creator.resetBtn}
            </button>
          </div>
        </form>

        {/* Live Preview Stage */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#162644] border border-[#75C9FF]/35 p-6 space-y-5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#101C32] dark:text-white">
              {t.creator.livePreview}
            </h2>
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DDF3FF]/70 dark:bg-[#101C32] text-xs font-semibold text-[#2377B9] dark:text-[#75C9FF]"
            >
              {zoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
              {t.creator.zoomPreview}
            </button>
          </div>

          <div className="flex justify-center py-4">
            <div className="w-64">
              <ZharCardTile card={previewCard} zoom={zoomed ? 1.12 : 1} />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {t.creator.customBadgeNote}
          </p>
        </div>
      </div>
    </div>
  );
}
