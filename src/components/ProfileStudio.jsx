import { useState } from 'react';
import { Check, Download, Eraser, Sparkles, UserCheck } from 'lucide-react';
import GlassCard from './GlassCard';
import { APP_NAME, AVATAR_EMOJIS, GIF_STICKERS } from '../constants';

export default function ProfileStudio({ profile, onChange, onExport, hasDemo, onClearDemo }) {
  const [name, setName] = useState(profile.name || 'Arjun');
  const [avatar, setAvatar] = useState(profile.avatar || '🚀');
  const [gifMode, setGifMode] = useState(profile.gifMode || 'auto');
  const [savedToast, setSavedToast] = useState(false);

  function handleSave(event) {
    event.preventDefault();
    onChange({
      name: name.trim() || 'Arjun',
      avatar: avatar,
      gifMode: gifMode,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  }

  function selectGif(id) {
    setGifMode(id);
    onChange({
      name: name.trim() || profile.name,
      avatar: avatar,
      gifMode: id,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="reveal lg:col-span-2 [&>*]:h-full" style={{ '--i': 0 }}>
        <GlassCard title="Profile Identity & Custom Emoji Avatar">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border" style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/40 flex items-center justify-center text-4xl shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                {avatar}
              </div>
              <div>
                <p className="text-lg font-bold t-main">{name.trim() || 'Your Name'}</p>
                <p className="text-xs t-muted">{APP_NAME} &bull; Personal Profile Preview</p>
              </div>
            </div>

            <div>
              <label className="text-xs t-muted mb-1 block" htmlFor="prof-name">Your Display Name</label>
              <input
                id="prof-name"
                className="field"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <p className="text-xs t-muted mb-2">Pick Your Avatar Emoji</p>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 p-3 rounded-xl border" style={{ background: 'var(--field)', borderColor: 'var(--glass-border)' }}>
                {AVATAR_EMOJIS.map((em) => {
                  const selectedClass = avatar === em ? 'bg-emerald-500/25 ring-2 ring-emerald-400 scale-110' : 'hover:bg-white/10';
                  return (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAvatar(em)}
                      className={'h-10 rounded-xl text-xl flex items-center justify-center cursor-pointer transition ' + selectedClass}
                    >
                      {em}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button type="submit" className="btn-emerald inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer">
                {savedToast ? <Check className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                {savedToast ? 'Profile Saved!' : 'Save Name & Emoji'}
              </button>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onExport} className="btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Export Full Backup
                </button>
                {hasDemo && (
                  <button type="button" onClick={onClearDemo} className="btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 cursor-pointer">
                    <Eraser className="w-3.5 h-3.5" />
                    Clear Demo Data
                  </button>
                )}
              </div>
            </div>
          </form>
        </GlassCard>
      </div>

      <div className="reveal [&>*]:h-full" style={{ '--i': 1 }}>
        <GlassCard title="Animated GIF Mood Studio" action={<Sparkles className="w-4 h-4 text-emerald-400" />}>
          <p className="text-xs t-muted mb-3">Choose which animated GIF sticker appears on your Dashboard hero banner:</p>
          <div className="space-y-2.5">
            {GIF_STICKERS.map((sticker) => {
              const isSelected = gifMode === sticker.id;
              const cardClass = isSelected
                ? 'border-emerald-500/60 bg-emerald-500/12 shadow-[0_0_20px_rgba(16,185,129,0.16)]'
                : 'btn-ghost';

              return (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => selectGif(sticker.id)}
                  className={'w-full flex items-center gap-3 p-2.5 rounded-xl border text-left cursor-pointer transition ' + cardClass}
                >
                  <img src={sticker.src} alt={sticker.label} className="w-12 h-12 rounded-xl object-contain shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold t-main">{sticker.label}</p>
                    <p className="text-[11px] t-muted leading-snug mt-0.5">{sticker.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
