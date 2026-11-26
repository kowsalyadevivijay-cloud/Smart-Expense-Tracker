import { spotlightMove, spotlightTouchEnd, spotlightTouchStart } from '../utils/spotlight';

export default function GlassCard({ id, title, action, className = '', bodyClassName = '', children }) {
  return (
    <section
      id={id}
      onMouseMove={spotlightMove}
      onTouchStart={spotlightTouchStart}
      onTouchMove={spotlightMove}
      onTouchEnd={spotlightTouchEnd}
      onTouchCancel={spotlightTouchEnd}
      className={'glass spotlight p-5 scroll-mt-24 ' + className}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-sm font-semibold t-main tracking-wide">{title}</h2>
          {action}
        </div>
      )}
      {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    </section>
  );
}
