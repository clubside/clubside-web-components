'use strict'

class StarRating extends HTMLElement {
	static define(tag = 'star-rating') {
		customElements.define(tag, this)
	}

	static get observedAttributes() {
		return ['stars', 'value']
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
			</style>
			<div id="star-rating"></div>`
	}

	#connected = false
	#updating = false
	#starRating
	#starCount = 5
	#stars = undefined
	#onSetStars
	#onOverStars
	#onLeaveStars

	#drawStars() {
		this.#starRating.innerHTML = ''
		for (let i = 1; i < this.#starCount + 1; i++) {
			let classList = 'star-input'
			if (i <= this.#stars) {
				classList += ' star-selected'
			}
			const star = `<svg id="star-rating-${i}" class="${classList}" data-stars="${i}" viewBox="0 0 24 24" stroke-width="1.5" fill="none" color="black"><path d="M8.58737 8.23597L11.1849 3.00376C11.5183 2.33208 12.4817 2.33208 12.8151 3.00376L15.4126 8.23597L21.2215 9.08017C21.9668 9.18848 22.2638 10.0994 21.7243 10.6219L17.5217 14.6918L18.5135 20.4414C18.6409 21.1798 17.8614 21.7428 17.1945 21.3941L12 18.678L6.80547 21.3941C6.1386 21.7428 5.35909 21.1798 5.48645 20.4414L6.47825 14.6918L2.27575 10.6219C1.73617 10.0994 2.03322 9.18848 2.77852 9.08017L8.58737 8.23597Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
			this.#starRating.innerHTML += star
		}
	}

	#updateStars() {
		for (let i = 1; i < this.#starCount + 1; i++) {
			const star = this.shadowRoot.getElementById(`star-rating-${i}`)
			if (i <= this.#stars) {
				star.classList.add('star-selected')
			} else {
				star.classList.remove('star-selected')
			}
			star.classList.remove('star-hover')
		}
	}

	connectedCallback() {
		this.#connected = true
		this.#starRating = this.shadowRoot.getElementById('star-rating')
		this.#starRating.addEventListener('click', this.#onSetStars = (event) => {
			this.#updating = true
			let parent = event.target
			while (!parent.id) {
				parent = parent.parentNode
			}
			const newStars = Number(parent.dataset.stars)
			if (newStars === this.#stars) {
				this.#stars = undefined
				this.removeAttribute('value')
			} else {
				this.#stars = newStars
				this.setAttribute('value', this.#stars)
			}
			// console.log(parent)
			this.#updateStars()
			this.#updating = false
		})
		this.#starRating.addEventListener('mousemove', this.#onOverStars = (event) => {
			let parent = this.shadowRoot.elementFromPoint(event.clientX, event.clientY)
			while (!parent.id) {
				parent = parent.parentNode
			}
			const hoverStars = parent.dataset.stars
			// console.log(hoverStars)
			for (let i = 1; i < this.#starCount + 1; i++) {
				const star = this.shadowRoot.getElementById(`star-rating-${i}`)
				if (i <= hoverStars) {
					star.classList.add('star-hover')
				} else {
					star.classList.remove('star-hover')
				}
			}
		})
		this.#starRating.addEventListener('mouseleave', this.#onLeaveStars = () => {
			this.#updateStars()
		})
		this.#drawStars()
	}

	disconnectedCallback() {
		this.#starRating.removeEventListener('click', this.#onSetStars)
		this.#starRating.removeEventListener('mousemove', this.#onOverStars)
		this.#starRating.removeEventListener('mouseleave', this.#onLeaveStars)
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`)
		switch (name) {
			case 'stars':
				if (newValue === '') {
					this.#starCount = 5
				} else {
					try {
						const newStarCount = Number(newValue)
						if (newStarCount < 1) {
							this.#starCount = 5
						} else {
							this.#starCount = newStarCount
						}
					} catch {
						this.#starCount = 5
					}
				}
				if (this.#stars > this.#starCount) {
					this.#stars = this.#starCount
				}
				if (this.#connected && !this.#updating) {
					this.#drawStars()
				}
				break
			case 'value':
				if (newValue === '') {
					this.#stars = undefined
				} else {
					try {
						const newStars = Number(newValue)
						if (newStars < 1 || newStars > this.#stars) {
							this.#stars = undefined
						} else {
							this.#stars = newStars
						}
					} catch {
						this.#stars = undefined
					}
				}
				if (this.#connected && !this.#updating) {
					this.#updateStars()
				}
				break
		}
	}

}

StarRating.define()
