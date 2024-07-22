'use strict'

class StarRating extends HTMLElement {
	static define(tag = 'star-rating') {
		customElements.define(tag, this)
	}

	static formAssociated = true

	static get observedAttributes() {
		return ['disabled', 'required', 'stars', 'value']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`)
		if (oldValue !== newValue) {
			switch (name) {
				case 'disabled':
					this.#updateDisabled()
					break
				case 'required':
					this.#updateRequired()
					break
				case 'stars':
					this.#updateStars()
					break
				case 'value':
					this.#updateValue(true)
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

	get required() {
		return this.hasAttribute('required')
	}

	set required(value) {
		this.toggleAttribute('required', value)
	}

	get stars() {
		return Number(this.getAttribute('stars'))
	}

	set stars(value) {
		this.setAttribute('stars', Number(value) < 1 ? 5 : value)
	}

	get value() {
		return Number(this.getAttribute('value'))
	}

	set value(value) {
		this.setAttribute('value', Number(value) < 1 || Number(value) > this.stars ? 0 : value)
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
	#connected = false
	#starRating
	#onClick
	#onMouseMove
	#onMouseLeave
	#onKeyDown
	#starRatingChange = new CustomEvent('change')

	#updateDisabled() {
		this.setAttribute('aria-disabled', this.disabled.toString())
	}

	#updateRequired() {
		this.setAttribute('aria-required', this.required.toString())
	}

	#updateStars() {
		if (this.#connected) {
			this.#drawStars()
		}
	}

	#updateValue(dispatch = false) {
		if (this.#connected) {
			this.#drawStars()
			if (dispatch) {
				this.dispatchEvent(this.#starRatingChange)
			}
		}
	}

	#drawStars() {
		this.#starRating.innerHTML = ''
		for (let i = 1; i < Number(this.stars) + 1; i++) {
			let part = 'star'
			let classList = 'star-input'
			if (i <= this.value) {
				part = 'star-selected'
				classList += ' star-selected'
			}
			const star = `<svg id="star-rating-${i}" class="${classList}" data-stars="${i}" part="${part}" viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M8.58737 8.23597L11.1849 3.00376C11.5183 2.33208 12.4817 2.33208 12.8151 3.00376L15.4126 8.23597L21.2215 9.08017C21.9668 9.18848 22.2638 10.0994 21.7243 10.6219L17.5217 14.6918L18.5135 20.4414C18.6409 21.1798 17.8614 21.7428 17.1945 21.3941L12 18.678L6.80547 21.3941C6.1386 21.7428 5.35909 21.1798 5.48645 20.4414L6.47825 14.6918L2.27575 10.6219C1.73617 10.0994 2.03322 9.18848 2.77852 9.08017L8.58737 8.23597Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
			this.#starRating.innerHTML += star
		}
		if (this.value > this.stars) {
			this.setAttribute('value', this.stars)
		}
		this.#internals.setFormValue(this.value)
		if (this.required && !this.disabled) {
			if (this.value === 0) {
				// console.error({ debug: 'setValue', message: 'no checked items' })
				this.#internals.setValidity({ customError: true }, 'Choose at least one star')
			} else {
				// console.log({ debug: 'setValue', message: 'checked items' })
				this.#internals.setValidity({})
			}
		} else {
			// console.log({ debug: 'setValue', message: 'not required' })
			this.#internals.setValidity({})
		}
	}

	#fillStars() {
		for (let i = 1; i < Number(this.stars) + 1; i++) {
			const star = this.shadowRoot.getElementById(`star-rating-${i}`)
			if (i <= this.value) {
				star.classList.add('star-selected')
				star.setAttribute('part', 'star-selected')
			} else {
				star.classList.remove('star-selected')
				star.setAttribute('part', 'star')
			}
			star.classList.remove('star-hover')
		}
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
				}
				:host([disabled]) {
					cursor: default;
					opacity: 0.5;
				}
				:host([disabled]) .star-input {
					cursor: default;
					opacity: 0.5;
				}
				span {
					display: inline-flex;
				}
				.star-input {
					width: 1em;
					height: 1em;
					display: block;
					cursor: pointer;
					stroke: inherit;
					fill: inherit;
					color: inherit;
				}
				.star-selected {
					fill: yellow;
				}
				.star-hover {
					fill: #FFD700;
				}
				#star-rating:focus {
					outline: none;
				}
			</style>
			<span></span>`
	}

	connectedCallback() {
		// console.log('connected')
		if (!this.hasAttribute('stars')) {
			this.setAttribute('stars', '5')
		}
		if (!this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0')
		}
		this.#starRating = this.shadowRoot.querySelector('span')
		this.#connected = true
		this.#starRating.addEventListener('click', this.#onClick = (event) => {
			let parent = event.target
			while (!parent.id) {
				parent = parent.parentNode
			}
			const newValue = Number(parent.dataset.stars)
			if (newValue === this.value) {
				this.removeAttribute('value')
			} else {
				this.setAttribute('value', newValue)
			}
			// console.log(parent)
			this.#fillStars()
		})
		this.#starRating.addEventListener('mousemove', this.#onMouseMove = (event) => {
			if (this.disabled) {
				return
			}
			let parent = this.shadowRoot.elementFromPoint(event.clientX, event.clientY)
			while (!parent.id) {
				parent = parent.parentNode
			}
			const hoverValue = Number(parent.dataset.stars)
			// console.log(hoverValue, this.#stars)
			if (hoverValue === Number(this.value)) {
				for (let i = 1; i < Number(this.stars) + 1; i++) {
					const star = this.shadowRoot.getElementById(`star-rating-${i}`)
					star.classList.remove('star-selected')
					star.classList.remove('star-hover')
					star.setAttribute('part', 'star')
				}
			} else {
				for (let i = 1; i < Number(this.stars) + 1; i++) {
					const star = this.shadowRoot.getElementById(`star-rating-${i}`)
					if (i <= hoverValue) {
						star.classList.add('star-hover')
						star.setAttribute('part', 'star-hover')
					} else {
						star.classList.remove('star-hover')
						if (i <= this.value) {
							star.setAttribute('part', 'star-selected')
						} else {
							star.setAttribute('part', 'star')
						}
					}
				}
			}
		})
		this.#starRating.addEventListener('mouseleave', this.#onMouseLeave = () => {
			if (this.disabled) {
				return
			}
			this.#fillStars()
		})
		this.addEventListener('keydown', this.#onKeyDown = (event) => {
			// console.log(`${this.id} key ${event.key} code ${event.code}`)
			switch (event.key) {
				case 'ArrowLeft':
					if (this.value) {
						this.setAttribute('value', Number(this.value) - 1)
					}
					break
				case 'ArrowRight':
					if (this.value && Number(this.value) < Number(this.stars)) {
						this.setAttribute('value', Number(this.value) + 1)
					} else if (this.value && Number(this.value) === Number(this.stars)) {
						this.removeAttribute('value')
					} else {
						this.setAttribute('value', '1')
					}
					break
			}
		})
		this.#drawStars()
	}

	disconnectedCallback() {
		this.#starRating.removeEventListener('click', this.#onClick)
		this.#starRating.removeEventListener('mousemove', this.#onMouseMove)
		this.#starRating.removeEventListener('mouseleave', this.#onMouseLeave)
		this.removeEventListener('keydown', this.#onKeyDown)
	}
}

StarRating.define()
