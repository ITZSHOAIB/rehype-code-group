import Keyboard from "~icons/lucide/keyboard";
import ShieldCheck from "~icons/lucide/shield-check";

export function ProofPoints() {
  return (
    <section aria-label="Project highlights" className="rcg-home-proof">
      <a
        aria-label="View rehype-code-group download statistics on npm"
        className="rcg-home-proof-lead"
        href="https://www.npmjs.com/package/rehype-code-group"
      >
        <span className="rcg-home-proof-kicker">Used in the wild</span>
        <strong>16k</strong>
        <p>downloads in the last 30 days</p>
      </a>
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
