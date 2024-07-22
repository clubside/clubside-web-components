'use strict'

class ToggleSwitch extends HTMLElement {
	static define(tag = 'toggle-switch') {
		customElements.define(tag, this)
	}

	static formAssociated = true

	static get observedAttributes() {
		return ['checked', 'disabled', 'value']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			switch (name) {
				case 'checked':
					this.#updateChecked(true)
					break
				case 'disabled':
					this.#updateDisabled()
					break
				case 'value':
					this.#updateValue(newValue)
					break
			}
		}
	}

	get checked() {
		return this.hasAttribute('checked')
	}

	set checked(value) {
		this.toggleAttribute('checked', value)
	}

	get disabled() {
		return this.hasAttribute('disabled')
	}

	set disabled(value) {
		this.toggleAttribute('disabled', value)
	}

	get value() {
		return this.getAttribute('value')
	}

	set value(value) {
		this.setAttribute('value', value)
	}

	toggle = () => {
		if (!this.disabled) {
			this.checked = !this.checked
		}
	}

	get form() {
		return this.#internals.form
	}

	get name() {
		return this.#internals.name
	}

	get validity() {
		return this.#internals.validity
	}

	get validationMessage() {
		return this.#internals.validationMessage
	}

	get willValidate() {
		return this.#internals.willValidate
	}

	checkValidity() {
		return this.#internals.checkValidity()
	}

	reportValidity() {
		return this.#internals.reportValidity()
	}

	#internals
	#onClick
	#onKeyDown
	#toggleSwitchChange = new CustomEvent('change')

	#updateChecked(dispatch = false) {
		this.setAttribute('aria-checked', this.checked.toString())
		this.#updateValue()
		if (dispatch) {
			this.dispatchEvent(this.#toggleSwitchChange)
		}
	}

	#updateDisabled() {
		this.setAttribute('aria-disabled', this.disabled.toString())
	}

	#updateValue() {
		if (this.checked) {
			this.#internals.setFormValue(this.value)
		} else {
			this.#internals.setFormValue(null)
		}
		this.#internals.setValidity({})
	}

	constructor() {
		super()
		this.#internals = this.attachInternals()
		const shadowroot = this.attachShadow({ mode: 'open' })
		shadowroot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					display: inline-flex;
					height: 1em;
					line-height: 0;
					aspect-ratio: 5 / 3;
					background: linear-gradient(90deg, rgb(226 226 227 / 100%) 0%, rgb(232 232 235 / 100%) 100%);
					border-radius: 1em;
					transition: all 0.256s;
					justify-content: start;
					cursor: pointer;
				}
				span {
					height: 1em;
					aspect-ratio: 1 / 1;
					display: inline-flex;
					background: white;
					transition: all 0.256s;
					border-style: solid;
					border-width: 0.075em;
					border-color: #d7d7d8;
					border-radius: 50%;
				}
				:host([checked]) {
					background: linear-gradient(90deg, rgb(60 201 94 / 100%) 0%, rgb(56 194 90 / 100%) 100%);
				}
				:host([checked]) span {
					border-color: #30b651;
					transform: translateX(70%);
				}
				:host([disabled]) {
					cursor: default;
					opacity: 0.5;
				}
			</style>
			<span part="inner"></span>`
	}

	connectedCallback() {
		if (!this.hasAttribute('role')) {
			this.setAttribute('role', 'switch')
		}
		if (!this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0')
		}
		this.#updateChecked(false)
		this.#updateDisabled()
		this.addEventListener('click', this.#onClick = () => {
			this.toggle()
		})
		this.addEventListener('keydown', this.#onKeyDown = (event) => {
			switch (event.key) {
				case ' ':
				case 'Enter':
					event.preventDefault()
					this.toggle()
					break
			}
		})
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.#onClick)
		this.removeEventListener('keydown', this.#onKeyDown)
	}
}

ToggleSwitch.define()
