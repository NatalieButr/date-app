export function A11yBundleTestPage() {
  return (
    <div className="p-6 flex flex-col gap-8 max-w-lg mx-auto">
      <section aria-label="NavBar active link">
        <h2 className="text-sm font-semibold mb-3">NavBar — aria-current on active link</h2>
        <nav>
          <a href="#" aria-current="page" className="text-sm font-medium">
            Feed (active)
          </a>
        </nav>
      </section>

      <section aria-label="NavBar matches badge">
        <h2 className="text-sm font-semibold mb-3">NavBar — badge aria-hidden (decorative)</h2>
        <span
          aria-hidden="true"
          className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px]"
        >
          0
        </span>
      </section>

      <section aria-label="DemoLoginButton error">
        <h2 className="text-sm font-semibold mb-3">DemoLoginButton — error role=alert</h2>
        <p role="alert" className="text-destructive text-xs">
          Demo login failed
        </p>
      </section>

      <section aria-label="SendMessageForm send button">
        <h2 className="text-sm font-semibold mb-3">SendMessageForm — send button aria-label</h2>
        <button className="text-sm px-3 py-1 border rounded">Send</button>
        <button
          aria-label="Sending message"
          className="text-sm px-3 py-1 border rounded ml-2"
          disabled
        >
          …
        </button>
      </section>

      <section aria-label="Avatar fallback divs">
        <h2 className="text-sm font-semibold mb-3">Avatar fallback — aria-hidden</h2>
        <div
          aria-hidden="true"
          className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold"
        >
          A
        </div>
      </section>

      <section aria-label="Admin metrics table">
        <h2 className="text-sm font-semibold mb-3">Admin table — aria-label</h2>
        <table aria-label="AI call metrics" className="w-full text-sm border">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Feature</th>
              <th className="px-3 py-2 text-right">Calls</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 font-mono text-xs">onboarding</td>
              <td className="px-3 py-2 text-right">42</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
