const defaultUid = "23682490";
const endpoint = `/api/acfun-card/${defaultUid}`;
const readmeSnippet = `<a href="https://www.acfun.cn/u/${defaultUid}">
  <img alt="AcFun Card" src="https://acfun-card-vercel.vercel.app${endpoint}" width="520">
</a>`;

export default function Home() {
  return (
    <main className="shell">
      <section className="tool">
        <div className="intro">
          <p className="eyebrow">AcFun Card</p>
          <h1>Dynamic README card</h1>
          <p className="summary">
            Serve this SVG endpoint from Vercel and use it as a GitHub README image.
          </p>
        </div>

        <div className="preview-grid">
          <div className="preview light">
            <img src={endpoint} width="520" alt="AcFun card light preview" />
          </div>
          <div className="preview dark">
            <img src={endpoint} width="520" alt="AcFun card dark preview" />
          </div>
        </div>

        <div className="snippet-row">
          <div>
            <label htmlFor="endpoint">Endpoint</label>
            <input id="endpoint" readOnly value={endpoint} />
          </div>
          <a className="button" href={endpoint} target="_blank" rel="noreferrer">
            Open SVG
          </a>
        </div>

        <div className="code-block">
          <label htmlFor="readme">README snippet</label>
          <textarea id="readme" readOnly value={readmeSnippet} />
        </div>

        <p className="note">
          Responses are cached for one hour.
        </p>
      </section>
    </main>
  );
}
