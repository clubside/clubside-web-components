'use strict'

class ToggleSwitch extends HTMLElement {
	static define(tag = 'toggle-switch') {
		customElements.define(tag, this)
	}

	static get observedAttributes() {
		return ['checked', 'disabled', 'value']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`)
		if (oldValue !== newValue) {
			this[name] = newValue
		}
	}

	get checked () {
		return this.hasAttribute('checked')
	}

	set checked (value) {
		// console.log(this.id, 'checked', this.hasAttribute('checked'), value, value === null)
		if (this.#connected && value !== null && value !== '') {
			console.log(this.id, 'toggle checked')
			this.toggleAttribute('checked', value)
		}
	}

	get disabled () {
		return this.hasAttribute('disabled')
	}

	set disabled (value) {
		// console.log(this.id, 'disabled', this.hasAttribute('disabled'), value, value === null)
		if (this.#connected && value !== null && value !== '') {
			console.log(this.id, 'toggle disabled')
			this.toggleAttribute('disabled', value)
		}
	}

	get value () {
		return this.getAttribute('value')
	}

	set value (value) {
		console.log(this.id, 'value', this.getAttribute('value'), value, value === null)
	}

	toggle = () => {
        if (!this.disabled) {
            this.checked = !this.checked
        }
    }


	#connected = false
	#onClick
	#onKeyDown

	constructor() {
		super()
		const shadowroot = this.attachShadow({ mode: 'open' })
		shadowroot.innerHTML = `
			<style>
				:host {
					box-sizing: border-box;
					display: inline-block;
					width: 1.6em;
					height: 1em;
					padding: 0.075em;
					background: linear-gradient(90deg, rgb(226 226 227 / 100%) 0%, rgb(232 232 235 / 100%) 100%);
					border-radius: 1em;
					transition: all 0.256s;
					justify-content: start;
					cursor: pointer;
				}
				span {
					width: 60%;
					height: 100%;
					display: inline-block;
					background: white;
					transition: all 0.256s;
					border-radius: 50%;
				}
				:host([checked]) {
					background: linear-gradient(90deg, rgb(60 201 94 / 100%) 0%, rgb(56 194 90 / 100%) 100%);
				}
				:host([checked]) span {
					transform: translateX(70%);
				}
				:host([disabled]) {
					cursor: default;
					opacity: 0.5;
				}
			</style>
			<span></span>`
	}

	connectedCallback() {
		// console.log('connected')
		if (!this.hasAttribute('role')) {
			this.setAttribute('role', 'switch')
		}
		if (!this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0')
		}
		this.#connected = true
		this.addEventListener('click', this.#onClick = () => {
			// console.log(this.hasAttribute('checked'))
			this.toggle()
		})
		this.addEventListener('keydown', this.#onKeyDown = (event) => {
			// console.log(`${this.id} key ${event.key} code ${event.code}`)
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
