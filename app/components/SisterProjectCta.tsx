type SisterProjectCtaProps = {
  title: string;
  copy: string;
  href: string;
  linkLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function SisterProjectCta({
  title,
  copy,
  href,
  linkLabel,
  secondaryHref,
  secondaryLabel,
}: SisterProjectCtaProps) {
  return (
    <aside className="sister-project-cta" aria-label="MicrogridModeler sister project">
      <div className="sister-project-copy">
        <p className="sister-project-kicker mono"><span aria-hidden="true" /> Sister project</p>
        <p className="sister-project-brand">Microgrid<span>Modeler</span></p>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      <div className="sister-project-actions">
        <a className="button button-primary" href={href}>{linkLabel} <span aria-hidden="true">↗</span></a>
        {secondaryHref && secondaryLabel ? <a className="text-link text-link-light" href={secondaryHref}>{secondaryLabel} <span aria-hidden="true">→</span></a> : null}
      </div>
    </aside>
  );
}
