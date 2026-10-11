// Ported from src/index.js of The Monospace Web by Oskar Wickström (MIT).

/** Size of one character cell: 1ch wide, one line tall. */
function gridCellDimensions() {
	const element = document.createElement('div');
	element.style.position = 'fixed';
	element.style.height = 'var(--line-height)';
	element.style.width = '1ch';
	document.body.appendChild(element);
	// The computed size is exact; getBoundingClientRect() snaps to 1/64px, which adds up over a long page.
	const { width, height } = getComputedStyle(element);
	document.body.removeChild(element);
	return { width: parseFloat(width), height: parseFloat(height) };
}

const IGNORED_TAGS = new Set(['THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH']);

/** Marks every element that doesn't start on a (half) line with `.off-grid`; returns them. */
export function checkOffsets(): Element[] {
	const half = gridCellDimensions().height / 2;
	const offGrid: Element[] = [];
	for (const element of document.querySelectorAll('body :not(.debug-grid, .debug-toggle)')) {
		if (IGNORED_TAGS.has(element.tagName)) continue;
		// Inline boxes are sized by font metrics rather than the line box, so they never line up;
		// out-of-flow boxes (e.g. screen-reader-only text) don't take part in the layout at all.
		const { display, position } = getComputedStyle(element);
		if (display === 'inline' || position === 'absolute' || position === 'fixed') continue;
		const rect = element.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) continue;
		const remainder = (rect.top + window.scrollY) % half;
		// Line heights like 1.2rem are fractional pixels and browsers lay out in 1/64px steps,
		// so allow for the rounding that accumulates down the page.
		const isOff = remainder > 1 && half - remainder > 1;
		element.classList.toggle('off-grid', isOff);
		if (isOff) offGrid.push(element);
	}
	return offGrid;
}
