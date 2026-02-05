/**
 * Copies text to the clipboard, handling both secure and insecure contexts.
 * Fallback to document.execCommand('copy') if navigator.clipboard is unavailable.
 * 
 * @param text The text to copy
 * @returns Promise<boolean> indicating success or failure
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    // 1. Try modern API (works in secure contexts - HTTPS/Localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('navigator.clipboard.writeText failed, trying fallback', err);
        }
    }

    // 2. Fallback for insecure contexts (HTTP)
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure it's not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        return successful;
    } catch (err) {
        console.error('Fallback copy method failed', err);
        return false;
    }
}
