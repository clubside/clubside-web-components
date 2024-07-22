'use strict'

// https://stackoverflow.com/questions/68475272/when-can-we-access-the-children-elements-of-a-custom-component-using-javascript
class ImageOptionGroup extends HTMLElement {
	static define(tag = 'image-option-group') {
		customElements.define(tag, this)
	}

	static formAssociated = true

	#checked = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI1NiAyNTYiPgogIDxjaXJjbGUgY3g9IjEyOCIgY3k9IjEyOCIgcj0iMTI4IiBmaWxsPSIjNDNhMDQ3IiBzdHJva2Utd2lkdGg9IjAiLz4KICA8cGF0aCBkPSJNMTc0LjEsNTkuNmwtNTkuNCw4NS4yLTQxLTMwLjUtMjAuNywyOC43LDY5LjksNTMuMyw4MC4xLTExNC44LTI4LjktMjEuOVoiIGZpbGw9IiNmZmYiIHN0cm9rZS13aWR0aD0iMCIvPgo8L3N2Zz4='
	#unchecked = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI1NiAyNTYiPgogIDxwYXRoIGQ9Ik0xMjgsMjUyYy02OC40LDAtMTI0LTU1LjYtMTI0LTEyNFM1OS42LDQsMTI4LDRzMTI0LDU1LjYsMTI0LDEyNC01NS42LDEyNC0xMjQsMTI0WiIgZmlsbD0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwIi8+CiAgPHBhdGggZD0iTTEyOCw4YzMyLjEsMCw2Mi4yLDEyLjUsODQuOSwzNS4xLDIyLjcsMjIuNywzNS4xLDUyLjgsMzUuMSw4NC45cy0xMi41LDYyLjItMzUuMSw4NC45Yy0yMi43LDIyLjctNTIuOCwzNS4xLTg0LjksMzUuMXMtNjIuMi0xMi41LTg0LjktMzUuMWMtMjIuNy0yMi43LTM1LjEtNTIuOC0zNS4xLTg0LjlzMTIuNS02Mi4yLDM1LjEtODQuOWMyMi43LTIyLjcsNTIuOC0zNS4xLDg0LjktMzUuMU0xMjgsMEM1Ny4zLDAsMCw1Ny4zLDAsMTI4czU3LjMsMTI4LDEyOCwxMjgsMTI4LTU3LjMsMTI4LTEyOFMxOTguNywwLDEyOCwwaDBaIiBmaWxsPSIjYzhjOGM4IiBzdHJva2Utd2lkdGg9IjAiLz4KPC9zdmc+'

	addImageOption(element) {
		// console.log({ id: element.id, src: element.src })
		const optionElement = document.createElement('div')
		optionElement.setAttribute('id', element.id)
		optionElement.setAttribute('part', 'option')
		optionElement.setAttribute('class', 'image-option')
		optionElement.setAttribute('tabindex', '0')
		optionElement.dataset.checked = element.dataset.checked || 'false'
		const imgElement = document.createElement('img')
		imgElement.setAttribute('src', element.src)
		imgElement.setAttribute('part', 'img')
		optionElement.appendChild(imgElement)
		if (element.dataset.title) {
			const optionTitle = document.createElement('span')
			optionTitle.setAttribute('part', 'title')
			optionTitle.innerHTML = element.dataset.title
			optionElement.appendChild(optionTitle)
		}
		const optionStatus = document.createElement('img')
		optionStatus.setAttribute('id', `${element.id}-checked`)
		optionStatus.setAttribute('part', 'status')
		optionStatus.setAttribute('class', 'option-status')
		if (element.dataset.checked === 'true') {
			optionStatus.setAttribute('src', this.#checked)
		} else {
			optionStatus.setAttribute('src', this.#unchecked)
		}
		optionElement.appendChild(optionStatus)
		optionElement.addEventListener('click', (event) => {
			let element = event.target
			if (element.nodeName !== 'DIV') {
				element = element.parentElement
			}
			console.log({ id: element.id, checked: element.dataset.checked })
			const checkStatus = this.shadowRoot.getElementById(`${element.id}-checked`)
			// console.log(checkStatus)
			if (element.dataset.checked === 'true') {
				if (this.multiple) {
					element.dataset.checked = 'false'
					checkStatus.setAttribute('src', this.#unchecked)
					this.dispatchEvent(this.#imageCheckedChange)
				}
			} else {
				if (this.multiple) {
					element.dataset.checked = 'true'
					checkStatus.setAttribute('src', this.#checked)
					this.dispatchEvent(this.#imageCheckedChange)
				} else {
					const options = this.shadowRoot.querySelectorAll('.image-option')
					for (const option of options) {
						option.dataset.checked = 'false'
						const optionChecked = this.shadowRoot.getElementById(`${option.id}-checked`)
						optionChecked.setAttribute('src', this.#unchecked)
					}
					element.dataset.checked = 'true'
					checkStatus.setAttribute('src', this.#checked)
					this.dispatchEvent(this.#imageCheckedChange)
				}
			}
			this.#setValue()
		})
		optionElement.addEventListener('keyup', (event) => {
			if (event.key === ' ' || event.key === 'Enter') {
				let element = event.target
				if (element.nodeName !== 'DIV') {
					element = element.parentElement
				}
				console.log({ id: element.id, checked: element.dataset.checked })
				const checkStatus = this.shadowRoot.getElementById(`${element.id}-checked`)
				// console.log(checkStatus)
				if (element.dataset.checked === 'true') {
					if (this.multiple) {
						element.dataset.checked = 'false'
						checkStatus.setAttribute('src', this.#unchecked)
						this.dispatchEvent(this.#imageCheckedChange)
					}
				} else {
					if (this.multiple) {
						element.dataset.checked = 'true'
						checkStatus.setAttribute('src', this.#checked)
						this.dispatchEvent(this.#imageCheckedChange)
					} else {
						const options = this.shadowRoot.querySelectorAll('.image-option')
						for (const option of options) {
							option.dataset.checked = 'false'
							const optionChecked = this.shadowRoot.getElementById(`${option.id}-checked`)
							optionChecked.setAttribute('src', this.#unchecked)
						}
						element.dataset.checked = 'true'
						checkStatus.setAttribute('src', this.#checked)
						this.dispatchEvent(this.#imageCheckedChange)
					}
				}
				this.#setValue()
			}
		})
		this.shadowRoot.appendChild(optionElement)
		element.remove()
	}

	observeMutations() {
		const callback = (mutationList, observer) => {
			for (const mutation of mutationList) {
				if (mutation.type === 'childList') {
					if (mutation.addedNodes) {
						if (mutation.addedNodes[0] instanceof HTMLImageElement) {
							// console.log('A child node has been added:')
							// console.log(mutation.addedNodes[0])
							this.addImageOption(mutation.addedNodes[0])
						}
					}
				}
			}
		}
		const observer = new MutationObserver(callback)
		this.observer = observer
		const config = { childList: true, subtree: true }
		observer.observe(this, config)
	}

	static get observedAttributes() {
		return ['disabled', 'multiple', 'required', 'value']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			switch (name) {
				case 'disabled':
					this.#updateDisabled()
					break
				case 'multiple':
					this.#updateMultiple()
					break
				case 'required':
					this.#updateRequired()
					break
				case 'value':
					this.#updateValue(newValue)
					break
			}
		}
	}

	get disabled() {
		return this.hasAttribute('disabled')
	}

	set disabled(value) {
		this.toggleAttribute('disabled', value)
	}

	get multiple() {
		return this.hasAttribute('multiple')
	}

	set multiple(value) {
		this.toggleAttribute('multiple', value)
	}

	get required() {
		return this.hasAttribute('required')
	}

	set required(value) {
		this.toggleAttribute('required', value)
	}

	get value() {
		const checked = []
		const options = this.shadowRoot.querySelectorAll('.image-option')
		for (const option of options) {
			if (option.dataset.checked === 'true') {
				checked.push(option.id)
			}
		}
		return checked
	}

	set value(value) {
		if (Array.isArray(value)) {
			const options = this.shadowRoot.querySelectorAll('.image-option')
			for (const option of options) {
				if (value.includes(option.id)) {
					option.dataset.checked = 'true'
				} else {
					option.dataset.checked = 'false'
				}
			}
			this.#setValue()
		} else {
			throw new Error('Value must be an array.')
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
	#imageCheckedChange = new CustomEvent('change')

	#updateDisabled() {
		this.setAttribute('aria-disabled', this.disabled.toString())
	}

	#updateMultiple() {
		if (this.multiple) {
			this.setAttribute('role', 'group')
		} else {
			this.setAttribute('role', 'radiogroup')
		}
	}

	#updateRequired() {
		this.setAttribute('aria-required', this.required.toString())
	}

	#setValue() {
		const checked = []
		const options = this.shadowRoot.querySelectorAll('.image-option')
		for (const option of options) {
			if (option.dataset.checked === 'true') {
				checked.push(option.id)
			}
		}
		this.#internals.setFormValue(checked.join(';'))
		// console.log({ debug: 'setValue', required: this.required, disabled: this.disabled, checked, form: this.#internals.value })
		if (this.required && !this.disabled) {
			if (checked.length === 0) {
				// console.error({ debug: 'setValue', message: 'no checked items' })
				this.#internals.setValidity({ customError: true }, this.multiple ? 'Choose an option' : 'Choose at least one option')
			} else {
				// console.log({ debug: 'setValue', message: 'checked items' })
				this.#internals.setValidity({})
			}
		} else {
			// console.log({ debug: 'setValue', message: 'not required' })
			this.#internals.setValidity({})
		}
	}

	#updateValue(newValue) {
		const ids = newValue.split(';')
		const options = this.shadowRoot.querySelectorAll('.image-option')
		for (const option of options) {
			if (ids.includes(option.id)) {
				option.dataset.checked = 'true'
			} else {
				option.dataset.checked = 'false'
			}
		}
		this.#setValue()
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
					cursor: pointer;
				}
				:host([disabled]) {
					cursor: default;
					opacity: 0.5;
				}
				div {
					position: relative;
					display: flex;
					flex-direction: column;
					cursor: pointer;
				}
				.option-status {
					position: absolute;
					top: 0;
					right: 0;
					width: 32px;
					height: 32px;
				}
			</style>`
		this.observeMutations()
	}

	connectedCallback() {
		if (!this.hasAttribute('role')) {
			this.setAttribute('role', 'switch')
		}
		if (!this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0')
		}
		this.#updateDisabled()
		this.#updateMultiple()
		this.#updateRequired()
		this.#setValue()
	}

	disconnectedCallback() {
		this.observer.disconnect()
	}
}

ImageOptionGroup.define()
