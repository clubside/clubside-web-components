'use strict'

class FileUpload extends HTMLElement {
	static define(tag = 'file-upload') {
		customElements.define(tag, this)
	}

	static formAssociated = true

	static get observedAttributes() {
		return ['addable', 'lookup-types', 'placeholder', 'removable', 'required', 'types']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log(`Attribute ${name} has changed from ${typeof oldValue === 'string' && oldValue.length > 32 ? oldValue.substring(0, 32) + '...' : oldValue} to ${typeof newValue === 'string' && newValue.length > 32 ? newValue.substring(0, 32) + '...' : newValue}.`)
		if (oldValue !== newValue) {
			switch (name) {
				case 'addable':
					this.#updateAddable()
					break
				case 'lookup-types':
					this.#updateTypes()
					break
				case 'placeholder':
					this.#updatePlaceholder()
					break
				case 'removable':
					this.#updateRemovable()
					break
				case 'required':
					this.#updateRequired()
					break
				case 'types':
					this.#updateTypes()
					break
			}
		}
	}

	get addable() {
		return this.hasAttribute('addable')
	}

	set addable(value) {
		this.toggleAttribute('addable', value)
	}

	get lookupTypes() {
		return this.getAttribute('lookup-types')
	}

	set lookupTypes(value) {
		this.setAttribute('lookup-types', value)
		this.#setFileTypes()
	}

	get placeholder() {
		return this.getAttribute('placeholder')
	}

	set placeholder(value) {
		this.setAttribute('placeholder', value)
	}

	get removable() {
		return this.hasAttribute('removable')
	}

	set removable(value) {
		this.toggleAttribute('removable', value)
	}

	get required() {
		return this.hasAttribute('required')
	}

	set required(value) {
		this.toggleAttribute('required', value)
	}

	get types() {
		return this.getAttribute('types')
	}

	set types(value) {
		this.setAttribute('types', value)
		this.#setFileTypes()
	}

	get value() {
		return this.getAttribute('value')
	}

	set value(value) {
		this.setAttribute('value', value)
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

	#connected = false
	#fileActions = undefined
	#fileInput = undefined
	/**
	 * File type the component supports
	 * @typedef fileType
	 * @property {string} type - file pattern or MIME type
	 * @property {string} icon - optional icon to display when the file matches the type
	 * */
	/** @type {fileType[]} */
	#fileTypes = []
	#fileUploadAdd = new CustomEvent('add')
	#fileUploadChange = new CustomEvent('change')
	#fileUploadRemove = new CustomEvent('remove')
	#internals
	#onAdd
	/** @type {fileType[]} */
	#lookupTypes = []
	#onChange
	#onClear
	#onClick
	#onDragEnter
	#onDragOver
	#onDragLeave
	#onDrop
	#onKeyDown
	#onRemove
	#placeholder = undefined

	#readFile(dt) {
		this.classList.add('file-upload-wait')
		const reader = new FileReader()
		const file = dt.files[0]
		console.log({ file })
		reader.readAsDataURL(file)
		reader.onloadend = () => {
			this.setAttribute('value', `${file.name};${reader.result}`)
			this.#updateSource()
			this.classList.remove('file-upload-wait')
		}
	}

	#setElements() {
		this.#fileInput = this.shadowRoot.getElementById('file-input')
		this.#placeholder = this.shadowRoot.querySelector('.placeholder')
		this.#fileActions = this.shadowRoot.querySelector('.file-actions')
	}

	#setFileTypes() {
		/** @type {fileType[]} */
		this.#fileTypes = []
		const types = this.types.split(' ')
		for (const type of types) {
			const typeParts = type.split('|')
			/** @type {fileType} */
			const typeItem = {
				type: typeParts[0],
				icon: null
			}
			if (typeParts[1]) {
				typeItem.icon = typeParts[1]
			}
			this.#fileTypes.push(typeItem)
		}
		if (this.lookupTypes) {
			/** @type {fileType[]} */
			this.#lookupTypes = []
			const lookupTypes = this.lookupTypes.split(' ')
			for (const type of lookupTypes) {
				const typeParts = type.split('|')
				/** @type {fileType} */
				const typeItem = {
					type: typeParts[0],
					icon: null
				}
				if (typeParts[1]) {
					typeItem.icon = typeParts[1]
				}
				this.#lookupTypes.push(typeItem)
			}
		}
		// console.log({ fileTypes: this.#fileTypes, lookupTypes: this.#lookupTypes })
	}

	#updateActions() {
		// console.log({ debug: '#updateActions', addable: this.addable, removable: this.removable, value: this.value })
		const fileClear = this.shadowRoot.getElementById('file-clear')
		const fileAdd = this.shadowRoot.getElementById('file-add')
		const fileRemove = this.shadowRoot.getElementById('file-remove')
		// console.log(this.id, this.addable, this.removable, this.value)
		if (this.value) {
			fileClear.classList.remove('hidden')
		} else {
			fileClear.classList.add('hidden')
		}
		if (this.addable) {
			fileAdd.classList.remove('hidden')
		} else {
			fileAdd.classList.add('hidden')
		}
		if (this.removable) {
			fileRemove.classList.remove('hidden')
		} else {
			fileRemove.classList.add('hidden')
		}
		if (this.value || this.addable || this.removable) {
			this.#fileActions.classList.remove('hidden')
		} else {
			this.#fileActions.classList.add('hidden')
		}
	}

	#updateAddable() {
		if (this.#connected) {
			this.#updateActions()
		}
	}

	#updateFileTypes() {
		// console.log(`${this.id} updateFileTypes()`)
		if (!this.types) {
			this.setAttribute('types', '*.*')
		}
		this.#setFileTypes()
		const fileTypes = this.#fileTypes.map((item) => item.type)
		this.#fileInput.setAttribute('accept', fileTypes.join(', '))
		this.#updatePlaceholder()
	}

	#updatePlaceholder() {
		if (this.#connected) {
			if (this.value) {
				const endOfFilename = this.value.indexOf(';')
				const endOfType = this.value.indexOf(';', endOfFilename + 1)
				const extractedType = this.value.substring(endOfFilename + 6, endOfType)
				console.log({ definition: this.value.substring(0, endOfType), extractedType })
				let fileType = this.#fileTypes.find(({ type }) => type === extractedType)
				if (!fileType) {
					fileType = this.#lookupTypes.find(({ type }) => type === extractedType)
					if (!fileType) {
						fileType = this.#fileTypes.find(({ type }) => type === '*.*')
					}
				}
				if (fileType && fileType.icon) {
					this.#placeholder.innerHTML = `<img src="${fileType.icon}" part="file-image"><span part="file-name" title="${this.value.substring(0, this.value.indexOf(';'))}">${this.value.substring(0, this.value.indexOf(';'))}</span>`
				} else {
					this.#placeholder.innerHTML = `<span part="file-name">${this.value.substring(0, this.value.indexOf(';'))}</span>`
				}
			} else {
				this.#placeholder.innerHTML = `<span part="file-name">${this.placeholder}</span>`
			}
		}
	}

	#updateRemovable() {
		if (this.#connected) {
			this.#updateActions()
		}
	}

	#updateRequired() {
		this.setAttribute('aria-required', this.required.toString())
	}

	#updateSource() {
		console.log({ debug: '#updateSource', value: this.value })
		this.#updatePlaceholder()
		this.#updateActions()
		this.#updateValue()
		this.dispatchEvent(this.#fileUploadChange)
	}

	#updateTypes() {
		if (this.#connected) {
			this.#updateFileTypes()
		}
	}

	#updateValue() {
		this.#internals.setFormValue(this.value)
		console.log({ debug: 'updateSource', required: this.required, value: this.value })
		if (this.required) {
			if (this.value) {
				// console.log({ debug: 'updateSource', message: 'source set' })
				this.#internals.setValidity({})
			} else {
				// console.error({ debug: 'updateSource', message: 'no source set' })
				this.#internals.setValidity({ customError: true }, 'Please provide a file')
			}
		} else {
			// console.log({ debug: 'updateSource', message: 'not required' })
			this.#internals.setValidity({})
		}
	}

	#validateType(droppedtype) {
		const matchedType = this.#fileTypes.find(({ type }) => type === droppedtype)
		const universalType = this.#fileTypes.find(({ type }) => type === '*.*')
		// console.log({ fileTypes: this.#fileTypes, droppedtype, matchedType, universalType })
		if (matchedType || universalType) {
			return true
		} else {
			console.error(`Invalid file type. You dropped a '${droppedtype}' but this element only supports ${this.#fileTypes.map((item) => `'${item.type}'`).join(', ')}`)
			window.alert(`Invalid file type. You dropped a '${droppedtype}' but this element only supports ${this.#fileTypes.map((item) => `'${item.type}'`).join(', ')}`)
			return false
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
					align-items: center;
					gap: 16px;
					width: inherit;
					height: inherit;
					aspect-ratio: inherit;
					border: 4px dashed lightblue;
					place-content: center;
					overflow: hidden;
					padding: 8px;
					cursor: pointer;
				}
				input {
					display: none;
				}
				.placeholder {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					text-align: center;
					text-wrap: balance;
					word-break: break-word;
				}
				.placeholder img {
					width: 48px;
					height: 48px;
					object-fit: contain;
				}
				.file-actions {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 4px;
				}
				.file-actions button {
					width: 32px;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #777;
					border: none;
					border-radius: 50%;
					cursor: pointer;
				}
				.file-actions button svg {
					width: 20px;
					height: 20px;
					stroke: white;
					fill: none;
				}
				.file-actions button:hover {
					background-color: white;
				}
				.file-actions button:hover svg {
					stroke: #777;
				}
				:host(.file-upload-hover) {
					border-color: lightgreen;
				}
				:host(.file-upload-wait) {
					cursor: wait;
				}
				.file-actions button.hidden,
				.hidden {
					display: none;
				}
			</style>
			<input id="file-input" type="file">
			<div class="placeholder" part="file"></div>
			<div class="file-actions hidden" part="actions">
				<button id="file-clear" tabindex="-1">
					<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</button>
				<button id="file-add" class="hidden" tabindex="-1">
					<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</button>
				<button id="file-remove" class="hidden" tabindex="-1">
					<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6 12H18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
				</button>
			</div>`
	}

	connectedCallback() {
		// console.log('Component connected')
		if (!this.hasAttribute('placeholder')) {
			this.setAttribute('placeholder', 'Choose or drop a file')
		}
		if (!this.hasAttribute('types')) {
			this.setAttribute('types', '*.*')
		}
		if (!this.hasAttribute('tabindex')) {
			this.setAttribute('tabindex', '0')
		}
		this.#connected = true
		this.#setElements()
		this.#updateFileTypes()
		this.#updateRequired()
		this.#updateAddable()
		this.#updateRemovable()
		this.#updateValue()
		this.addEventListener('click', this.#onClick = () => {
			this.#fileInput.click()
		})
		this.addEventListener('dragenter', this.#onDragEnter = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.classList.add('file-upload-hover')
		})
		this.addEventListener('dragover', this.#onDragOver = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.classList.add('file-upload-hover')
		})
		this.addEventListener('dragleave', this.#onDragLeave = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.classList.remove('file-upload-hover')
		})
		this.addEventListener('drop', this.#onDrop = (event) => {
			event.preventDefault()
			event.stopPropagation()
			// console.log('upload drop')
			const dt = event.dataTransfer
			if (dt.files.length !== 1) {
				console.error(dt.files.length > 1 ? 'More than one file dropped' : 'Invalid drop')
			} else {
				// console.log(dt.files)
				const droppedtype = dt.files[0].type
				if (this.#validateType(droppedtype)) {
					this.#readFile(dt)
				}
			}
			this.classList.remove('file-upload-hover')
			this.focus()
		})
		this.#fileInput.addEventListener('change', this.#onChange = () => {
			// console.log(this.#fileInput.files)
			if (this.#fileInput.value.length !== 0) {
				const dt = this.#fileInput
				const droppedtype = dt.files[0].type
				if (this.#validateType(droppedtype)) {
					this.#readFile(this.#fileInput)
				}
			}
		})
		this.shadowRoot.getElementById('file-add').addEventListener('click', this.#onAdd = (event) => {
			event.preventDefault()
			event.stopPropagation()
			// console.log('Requested add')
			this.dispatchEvent(this.#fileUploadAdd)
		})
		this.shadowRoot.getElementById('file-clear').addEventListener('click', this.#onClear = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.removeAttribute('value')
			this.#updateSource()
		})
		this.shadowRoot.getElementById('file-remove').addEventListener('click', this.#onRemove = (event) => {
			event.preventDefault()
			event.stopPropagation()
			// console.log('Requested remove')
			this.dispatchEvent(this.#fileUploadRemove)
		})
		this.addEventListener('keydown', this.#onKeyDown = (event) => {
			// console.log(`${this.id} key ${event.key} code ${event.code}`)
			switch (event.key) {
				case ' ':
					this.#fileInput.click()
					break
				case '-':
					if (this.removable !== null) {
						this.dispatchEvent(this.#fileUploadRemove)
					}
					break
				case '+':
					if (this.addable !== null) {
						this.dispatchEvent(this.#fileUploadAdd)
					}
					break
			}
		})
	}

	disconnectedCallback() {
		this.removeEventListener('click', this.#onClick)
		this.removeEventListener('dragenter', this.#onDragEnter)
		this.removeEventListener('dragover', this.#onDragOver)
		this.removeEventListener('dragleave', this.#onDragLeave)
		this.removeEventListener('drop', this.#onDrop)
		this.#fileInput.removeEventListener('change', this.#onChange)
		this.shadowRoot.getElementById('file-add').removeEventListener('click', this.#onAdd)
		this.shadowRoot.getElementById('file-clear').removeEventListener('click', this.#onClear)
		this.shadowRoot.getElementById('file-remove').removeEventListener('click', this.#onRemove)
		this.removeEventListener('keydown', this.#onKeyDown)
	}
}

FileUpload.define()
