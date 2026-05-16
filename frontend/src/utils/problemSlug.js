/** ST.L1.1 + chapter ST → L1.1 for URLs like /challenges/ST/L1.1 */
export function problemToSlug(chapterCode, problemCode) {
    const prefix = `${chapterCode}.`;
    if (problemCode.toUpperCase().startsWith(prefix.toUpperCase())) {
        return problemCode.slice(prefix.length);
    }
    return problemCode;
}

export function slugToProblemCode(chapterCode, slug) {
    return `${chapterCode.toUpperCase()}.${slug}`;
}
