export type Config = (section: string) => string

export function unquote(s: string): string {
    if (!s) return s
    if (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) {
        return s.substring(1, s.length - 1)
    }
    return s
}
