// Root-level 404 — rendered when no route matches outside locale segments.
// Provides a full HTML document since the passthrough layout adds no structure.
export default function RootNotFound() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Page not found — Silver14</title>
      </head>
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#fff',
          color: '#111',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem' }}>404</h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            The page you are looking for does not exist.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              background: '#000',
              color: '#fff',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}
