'use strict'

class StarRating extends HTMLElement {
	static define(tag = 'star-rating') {
		customElements.define(tag, this)
	}

	static get observedAttributes() {
		return ['stars', 'value']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`)
		if (oldValue !== newValue) {
			this[name] = newValue
		}
	}

	get stars () {
		return this.getAttribute('stars')
	}

	set stars (value) {
		let setStars = Number(this.getAttribute('stars'))
		let oldStars = Number(this.getAttribute('stars'))
		const newStars = Number(value)
		const setValue = Number(this.getAttribute('value'))
		// console.log('set stars', this.stars, setStars, newStars, setValue)
		if (newStars) {
			if (newStars < 1) {
				setStars = 5
			} else {
				setStars = newStars
			}
		} else {
			setStars = 5
		}
		if (setValue > setStars) {
			this.setAttribute('value', setStars)
		}
		this.setAttribute('stars', setStars)
		if (this.#connected && oldStars === newStars) {
			// console.log('drawing')
			this.#drawStars()
		}
	}

	get value () {
		return this.getAttribute('value')
	}

	set value (value) {
		let setValue = Number(this.getAttribute('value'))
		let oldValue = Number(this.getAttribute('value'))
		const newValue = Number(value)
		const setStars = Number(this.getAttribute('stars'))
		// console.log('set value', this.value, setValue, newValue, setStars)
		if (newValue < 1 || newValue > setStars) {
			setValue = null
		} else {
			setValue = newValue
		}
		if (newValue) {
			this.setAttribute('value', setValue)
		} else {
			this.removeAttribute('value')
		}
		if (this.#connected && oldValue === newValue) {
			// console.log('updating')
			this.#updateStars()
		}
	}

	#connected = false
	#starRating
	#onClick
	#onMouseMove
	#onMouseLeave
	#onKeyDown

	#drawStars() {
		this.#starRating.innerHTML = ''
		for (let i = 1; i < Number(this.stars) + 1; i++) {
			let classList = 'star-input'
			if (i <= this.value) {
				classList += ' star-selected'
			}
			const star = `<svg id="star-rating-${i}" class="${classList}" data-stars="${i}" viewBox="0 0 24 24" stroke-width="1.5" fill="none" color="black"><path d="M8.58737 8.23597L11.1849 3.00376C11.5183 2.33208 12.4817 2.33208 12.8151 3.00376L15.4126 8.23597L21.2215 9.08017C21.9668 9.18848 22.2638 10.0994 21.7243 10.6219L17.5217 14.6918L18.5135 20.4414C18.6409 21.1798 17.8614 21.7428 17.1945 21.3941L12 18.678L6.80547 21.3941C6.1386 21.7428 5.35909 21.1798 5.48645 20.4414L6.47825 14.6918L2.27575 10.6219C1.73617 10.0994 2.03322 9.18848 2.77852 9.08017L8.58737 8.23597Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
			this.#starRating.innerHTML += star
		}
	}

	#updateStars() {
		for (let i = 1; i < Number(this.stars) + 1; i++) {
			const star = this.shadowRoot.getElementById(`star-rating-${i}`)
			if (i <= this.value) {
				star.classList.add('star-selected')
			} else {
				star.classList.remove('star-selected')
			}
			star.classList.remove('star-hover')
		}
	}

	constructor() {
		super()
		const shadowroot = this.attachShadow({ mode: 'open' })
		shadowroot.innerHTML = `
			<style>
				#star-rating {
					display: inline-flex;
				}
				.star-input {
					width: 1em;
					height: 1em;
					display: block;
					cursor: pointer;
					stroke: black;
					fill: none;
					color: black;
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
			<div id="star-rating" tabindex="0"></div>`
		}

	connectedCallback() {
		// console.log('connected')
		if (!this.hasAttribute('stars')) {
			this.setAttribute('stars', '5')
		}
		this.#connected = true
		this.#starRating = this.shadowRoot.getElementById('star-rating')
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
			this.#updateStars()
		})
		this.#starRating.addEventListener('mousemove', this.#onMouseMove = (event) => {
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
				}
			} else {
				for (let i = 1; i < Number(this.stars) + 1; i++) {
					const star = this.shadowRoot.getElementById(`star-rating-${i}`)
					if (i <= hoverValue) {
						star.classList.add('star-hover')
					} else {
						star.classList.remove('star-hover')
					}
				}
			}
		})
		this.#starRating.addEventListener('mouseleave', this.#onMouseLeave = () => {
			this.#updateStars()
		})
		this.#starRating.addEventListener('keydown', this.#onKeyDown = (event) => {
			// console.log(`${this.id} keycode ${event.keyCode}`)
			switch (event.keyCode) {
				case 37:
					if (this.value) {
						this.setAttribute('value', Number(this.value) - 1)
					}
					break
				case 39:
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
		this.#starRating.removeEventListener('keydown', this.#onKeyDown)
	}

}

StarRating.define()
