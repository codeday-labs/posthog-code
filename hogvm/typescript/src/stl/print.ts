const escapeCharsMap: Record<string, string> = {
    '\b': '\\b',
    '\f': '\\f',
    '\r': '\\r',
    '\n': '\\n',
    '\t': '\\t',
    '\0': '\\0',
    '\v': '\\v',
    '\\': '\\\\',
}

const singlequoteEscapeCharsMap: Record<string, string> = {
    ...escapeCharsMap,
    "'": "\\'",
}

const backquoteEscapeCharsMap: Record<string, string> = {
    ...escapeCharsMap,
    '`': '\\`',
}

export function escapeString(value: string): string {
    return `'${value
        .split('')
        .map((c) => singlequoteEscapeCharsMap[c] || c)
        .join('')}'`
}

export function escapeIdentifier(identifier: string | number): string {
    if (typeof identifier === 'number') {
        return identifier.toString()
    }
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(identifier)) {
        return identifier
    }
    return `\`${identifier
        .split('')
        .map((c) => backquoteEscapeCharsMap[c] || c)
        .join('')}\``
}

export function printHogValue(obj: any, marked: Set<any> | undefined = undefined): string {
    if (!marked) {
        marked = new Set()
    }
    if (typeof obj === 'object' && obj !== null) {
        if (marked.has(obj)) {
            return 'null'
        }
        marked.add(obj)
        try {
            if (Array.isArray(obj)) {
                if ((obj as any).__isHogTuple) {
                    if (obj.length < 2) {
                        return `tuple(${obj.map((o) => printHogValue(o, marked)).join(', ')})`
                    }
                    return `(${obj.map((o) => printHogValue(o, marked)).join(', ')})`
                }
                return `[${obj.map((o) => printHogValue(o, marked)).join(', ')}]`
            }
            if (obj instanceof Map) {
                return `{${Array.from(obj.entries())
                    .map(([key, value]) => `${printHogValue(key, marked)}: ${printHogValue(value, marked)}`)
                    .join(', ')}}`
            }
            return `{${Object.entries(obj)
                .map(([key, value]) => `${printHogValue(key, marked)}: ${printHogValue(value, marked)}`)
                .join(', ')}}`
        } finally {
            marked.delete(obj)
        }
    } else if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false'
    } else if (obj === null) {
        return 'null'
    } else if (typeof obj === 'string') {
        return escapeString(obj)
    }
    return obj.toString()
}

export function printHogStringOutput(obj: any): string {
    if (typeof obj === 'string') {
        return obj
    }
    return printHogValue(obj)
}
