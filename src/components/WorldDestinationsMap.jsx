import { useI18n } from "../i18n/I18nContext";
import { WORLD_LAND_PATH } from "./worldMapPath";

function WorldMapSvg({ litId, cities, patternId = "global-map-dots" }) {
  return (
    <svg className="global-map-svg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.1" fill="#c9a84a" />
        </pattern>
        <radialGradient id={`${patternId}-glow`} cx="52%" cy="42%" r="68%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.1)" />
          <stop offset="45%" stopColor="rgba(212,175,55,0.035)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id={`${patternId}-aura`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,220,120,0.8)" />
          <stop offset="28%" stopColor="rgba(212,175,55,0.4)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <rect width="1000" height="500" fill={`url(#${patternId}-glow)`} />
      <path d={WORLD_LAND_PATH} fill="rgba(212,175,55,0.07)" />
      <path d={WORLD_LAND_PATH} fill={`url(#${patternId})`} opacity="0.78" />

      {cities.map((city) => {
        const lit = city.id === litId;
        return (
          <circle
            key={`aura-${city.id}`}
            className={`global-map-aura${lit ? " is-lit" : ""}`}
            cx={(city.x / 100) * 1000}
            cy={(city.y / 100) * 500}
            r={lit ? 58 : 34}
            fill={`url(#${patternId}-aura)`}
          />
        );
      })}
    </svg>
  );
}

function FeaturedCityPin({ city, lit, t, onEnter, onLeave }) {
  return (
    <div
      className={`global-city${lit ? " is-lit" : ""}`}
      style={{ left: `${city.x}%`, top: `${city.y}%` }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <button
        type="button"
        className="global-city-hit"
        aria-pressed={lit}
        aria-label={`${t(`airportTransfer.cities.${city.id}.city`)}, ${t(`airportTransfer.cities.${city.id}.country`)}`}
      />
      <svg className="global-city-leader" viewBox="-160 -160 320 320" aria-hidden="true">
        <line x1="0" y1="0" x2={city.cardDx} y2={city.cardDy} pointerEvents="stroke" strokeWidth="18" stroke="transparent" />
        <line x1="0" y1="0" x2={city.cardDx} y2={city.cardDy} />
      </svg>
      <span className="global-city-dot" aria-hidden="true" />
      <div
        className="global-city-card"
        style={{
          transform: `translate(calc(-50% + ${city.cardDx}px), calc(-50% + ${city.cardDy}px))`,
        }}
      >
        <strong>{t(`airportTransfer.cities.${city.id}.city`)}</strong>
        <span>{t(`airportTransfer.cities.${city.id}.country`)}</span>
      </div>
    </div>
  );
}

function ModalCityPin({ city, lit, t, onEnter, onLeave }) {
  return (
    <div
      className={`destinations-pin${lit ? " is-lit" : ""}`}
      style={{ left: `${city.x}%`, top: `${city.y}%` }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <button
        type="button"
        className="destinations-pin-hit"
        aria-pressed={lit}
        aria-label={`${t(`airportTransfer.cities.${city.id}.city`)}, ${t(`airportTransfer.cities.${city.id}.country`)}`}
      />
      <span className="destinations-pin-dot" aria-hidden="true" />
      <div className="destinations-pin-label">
        <strong>{t(`airportTransfer.cities.${city.id}.city`)}</strong>
        <span>{t(`airportTransfer.cities.${city.id}.country`)}</span>
      </div>
    </div>
  );
}

export default function WorldDestinationsMap({
  cities,
  litId,
  variant = "featured",
  patternId = "global-map-dots",
  onCityEnter,
  onCityLeave,
  ariaLabel,
}) {
  const { t } = useI18n();
  const Pin = variant === "featured" ? FeaturedCityPin : ModalCityPin;

  return (
    <div className={`global-map-stage${variant === "modal" ? " global-map-stage--modal" : ""}`} aria-label={ariaLabel}>
      <WorldMapSvg litId={litId} cities={cities} patternId={patternId} />
      {cities.map((city) => {
        const lit = city.id === litId;
        return (
          <Pin
            key={city.id}
            city={city}
            lit={lit}
            t={t}
            onEnter={() => onCityEnter?.(city.id)}
            onLeave={onCityLeave}
          />
        );
      })}
    </div>
  );
}
