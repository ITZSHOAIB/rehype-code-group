import Keyboard from "~icons/lucide/keyboard";
import ShieldCheck from "~icons/lucide/shield-check";

export function ProofPoints() {
  return (
    <section aria-label="Project highlights" className="rcg-home-proof">
      <div className="rcg-home-proof-lead">
        <span className="rcg-home-proof-kicker">Used in the wild</span>
        <strong>16k</strong>
        <p>downloads in the last 30 days</p>
      </div>
      <div className="rcg-home-proof-details">
        <article>
          <Keyboard aria-hidden="true" />
          <div>
            <strong>ARIA tabs</strong>
            <p>Keyboard navigation built in</p>
          </div>
          <span>Accessible</span>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>MIT licensed</strong>
            <p>Open source and production-ready</p>
          </div>
          <span>Permissive</span>
        </article>
      </div>
    </section>
  );
}
