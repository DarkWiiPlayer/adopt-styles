class StylesEvent extends Event {
	constructor() {
		super("styles", { bubbles: true })
	}
}

const styleSelector = `style, link[rel="stylesheet"]`

/** @param {Element} node */
const isStyleNode = node => node.matches(styleSelector) || node.querySelector(styleSelector)

/** @param {MutationRecord} mutation */
const isStyleMutation = mutation =>
	(mutation.target instanceof Element) && isStyleNode(mutation.target)
	|| (mutation.target instanceof Text) && isStyleNode(mutation.target.parentElement)
	|| [...mutation.removedNodes].find(isStyleNode)

const StylesObserver = new MutationObserver(mutations => {
	[...mutations].forEach(console.log)
	for (const {target} of [...mutations].filter(isStyleMutation)) {
		target.dispatchEvent(new StylesEvent())
	}
})

StylesObserver.observe(document.head, {
	subtree: true,
	characterData: true,
	childList: true,
	attributes: true,
	attributeFilter: ["rel", "href"],
})

/**
* @param {string} href
* @param {string} layer
*/
function importRule(href, layer) {
	if (layer)
		return `@import url("${href}") layer(${layer});`
	else
		return `@import url("${href}");`
}

/**
* @param {string} css
* @param {string|undefined} layer
*/
function wrapLayer(css, layer) {
	if (layer)
		return `@layer ${layer} { ${css} }`
	else
		return css
}

class RuleCollection {
	layer
	/** @type {string[]} */
	imports = []
	/** @type {string[]} */
	inlined = []

	/** @param {string} layer */
	constructor(layer) { this.layer = layer }

	/** @param {HTMLStyleElement} styleSheet */
	copyInto(styleSheet) {
		for (const href of this.imports)
			styleSheet.innerHTML += importRule(href, this.layer)
		for (const block of this.inlined)
			styleSheet.innerHTML += wrapLayer(block, this.layer)
	}
}

/**
* @param {CSSStyleSheet} sheet
* @param {RuleCollection} target
*/
function collectStyles(sheet, target) {
	if (sheet.ownerRule) {
		// TODO
	} else {
		const node = sheet.ownerNode
		if (node instanceof HTMLLinkElement) {
			target.imports.push(node.href)
		} else if (node instanceof HTMLStyleElement) {
			target.inlined.push(node.innerHTML)
		} else {
			console.log(node)
		}
	}
}

export default class AdoptStyles extends HTMLElement {
	static observedAttributes = ["adopt", "layer"]

	attributeChangedCallback() {
		this.adoptStyles()
	}

	/**
	* @param {string} adopt What to adopt
	* @param {string|undefined} layer What CSS layer to wrap the external styles in
	*/
	adoptStyles(adopt=this.adopt, layer=this.layer) {
		if (adopt == "all") {
			this.replaceChildren(document.createElement("style"))
			const rules = new RuleCollection(layer)
			for (const sheet of document.styleSheets) {
				collectStyles(sheet, rules)
			}
			rules.copyInto(this.sheet)
			console.log(this.sheet.innerText)
		} else if (adopt != undefined) {
			throw new Error("Adopt must be empty or 'all'")
		}
	}

	get sheet() { return this.querySelector("style") }
	get adopt() { return this.getAttribute("adopt") }
	get layer() { return this.getAttribute("layer") }

	connectedCallback() {
		this.abortController = new AbortController()
		document.addEventListener("styles", () => {
			this.adoptStyles()
		})
	}

	disconnectedCallback() {
		this.abortController.abort()
	}
}
