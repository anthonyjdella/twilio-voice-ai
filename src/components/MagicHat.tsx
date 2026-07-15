"use client";

export function MagicHat() {
  return (
    <>
      <style>{CSS}</style>
      <div className="magic-hat" aria-label="Built by the Twilio Magician">
        <svg className="magic-hat-svg" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="54" rx="28" ry="5" fill="#0A0A0A" />
          <ellipse cx="32" cy="52" rx="26" ry="3.5" fill="#1C1C1C" />
          <path
            d="M14 52 L14 20 Q14 14 20 14 L44 14 Q50 14 50 20 L50 52 Z"
            fill="#0A0A0A"
          />
          <path
            d="M14 52 L14 20 Q14 14 20 14 L44 14 Q50 14 50 20 L50 52 Z"
            fill="url(#magicHatShine)"
            opacity="0.35"
          />
          <rect x="14" y="44" width="36" height="6" fill="#EF223A" />
          <rect x="14" y="44" width="36" height="1.5" fill="#A81025" />
          <path
            d="M18 18 L18 46"
            stroke="#2A2A2A"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <defs>
            <linearGradient id="magicHatShine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <span className="magic-hat-sparkle mh1">&#10023;</span>
        <span className="magic-hat-sparkle mh2">&#10022;</span>
        <span className="magic-hat-sparkle mh3">&#10023;</span>
        <div className="magic-hat-bubble">
          <strong>Built by the Twilio Magician</strong>
          <a href="https://twil.io/magic" target="_blank" rel="noopener noreferrer">
            &rarr; twil.io/magic
          </a>
          <div className="slack">Slack: Anthony Dellavecchia</div>
        </div>
      </div>
    </>
  );
}

const CSS = `
:root { --magic-gold: #E9C46A; --magic-purple: #6B3FA0; }
@keyframes magic-hat-wobble { 0%,100% { transform: rotate(-4deg) scale(1.1); } 50% { transform: rotate(4deg) scale(1.1); } }
@keyframes magic-hat-sparkle-rise {
  0% { opacity: 0; transform: translate(0,0) scale(.4); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--hx,0), -34px) scale(1.1); }
}
.magic-hat {
  position: fixed; bottom: 16px; left: 16px;
  width: 72px; height: 72px;
  cursor: pointer; z-index: 60;
}
.magic-hat-svg {
  width: 56px; height: 56px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.35))
          drop-shadow(0 0 8px rgba(239,34,58,.55))
          drop-shadow(0 0 22px rgba(239,34,58,.4));
  transform-origin: 50% 90%;
  transition: transform .4s cubic-bezier(.2,.9,.3,1.2), filter .4s ease;
}
.magic-hat:hover .magic-hat-svg {
  animation: magic-hat-wobble .6s ease-in-out;
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,.35))
          drop-shadow(0 0 10px rgba(239,34,58,.85))
          drop-shadow(0 0 28px rgba(239,34,58,.65));
}
.magic-hat-sparkle {
  position: absolute; color: var(--magic-gold, #E9C46A);
  font-size: 12px; pointer-events: none; opacity: 0; top: 6px;
  text-shadow: 0 0 8px rgba(233,196,106,.9);
}
.magic-hat:hover .magic-hat-sparkle { animation: magic-hat-sparkle-rise .9s ease-out forwards; }
.magic-hat-sparkle.mh1 { left: 14px; --hx: -10px; animation-delay: .05s; }
.magic-hat-sparkle.mh2 { left: 26px; --hx: 0px; animation-delay: .15s; }
.magic-hat-sparkle.mh3 { left: 38px; --hx: 12px; animation-delay: .25s; }
.magic-hat-bubble {
  position: absolute; bottom: 6px; left: 64px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid rgba(107,63,160,.35);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0,0,0,.12), 0 0 20px rgba(107,63,160,.12);
  opacity: 0;
  transform: translateX(-10px) scale(.9);
  transform-origin: left bottom;
  transition: opacity .3s ease .05s, transform .35s cubic-bezier(.2,.9,.3,1.2) .05s;
  pointer-events: none;
  min-width: 230px; white-space: nowrap;
}
.magic-hat-bubble::before {
  content: ""; position: absolute; left: -7px; bottom: 18px;
  width: 13px; height: 13px;
  background: #ffffff;
  border-left: 1px solid rgba(107,63,160,.35);
  border-bottom: 1px solid rgba(107,63,160,.35);
  transform: rotate(45deg);
}
.magic-hat-bubble strong {
  display: block; font-size: 13px; margin-bottom: 4px;
  color: #171717; font-weight: 700;
}
.magic-hat-bubble a {
  display: block; margin-top: 2px; font-size: 12px;
  color: #2188EF; text-decoration: none;
}
.magic-hat-bubble a:hover { text-decoration: underline; }
.magic-hat-bubble .slack {
  margin-top: 4px; font-size: 12px; color: #737373;
}
.magic-hat:hover .magic-hat-bubble { opacity: 1; transform: translateX(0) scale(1); pointer-events: auto; }
@media (max-width: 640px) { .magic-hat { width: 60px; height: 60px; } .magic-hat-svg { width: 46px; height: 46px; } }
`;
