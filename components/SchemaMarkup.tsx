interface SchemaMarkupProps {
    schema: Record<string, unknown>
}

/**
 * Renders a JSON-LD block.
 *
 * Deliberately NOT given a CSP nonce. `type="application/ld+json"` is a data
 * block the browser never executes, so `script-src` does not apply to it — and
 * because the CSP spec hides the nonce attribute value from the DOM, adding one
 * makes React report a false hydration mismatch on every render.
 *
 * The nonce is only needed on genuinely executable inline scripts (see the
 * ThemeProvider in app/layout.tsx and middleware.ts for how that is wired).
 */
export function SchemaMarkup({ schema }: SchemaMarkupProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
