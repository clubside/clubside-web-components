'use strict'

class MediaUpload extends HTMLElement {
	static define(tag = 'media-upload') {
		customElements.define(tag, this)
	}

	static get observedAttributes() {
		return ['types', 'src', 'addable', 'removable']
	}

	constructor() {
		super()
		const shadowroot = this.attachShadow({ mode: 'open' })
		shadowroot.innerHTML = `
			<style>
				#media-upload {
					display: flex;
					width: inherit;
					height: inherit;
					aspect-ratio: inherit;
					border: 4px dashed lightblue;
					place-content: center;
					overflow: hidden;
					position: relative;
					cursor: pointer;
				}
				input {
					display: none;
				}
				.media-types {
					display: flex;
					width: 100%;
					height: 100%;
					align-items: center;
					justify-content: center;
					gap: 8px;
				}
				.media-types svg {
					width: 32px;
					height: 32px;
					stroke: lightblue;
					fill: none;
				}
				.media-preview {
					width: 100%;
					aspect-ratio: inherit;
					object-fit: contain;
				}
				.media-actions {
					position: absolute;
					top: 8px;
					right: 8px;
					display: flex;
					flex-direction: column;
					gap: 4px;
				}
				.media-actions button {
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
				.media-actions button svg {
					width: 20px;
					height: 20px;
					stroke: white;
					fill: none;
				}
				.media-actions button:hover {
					background-color: white;
				}
				.media-actions button:hover svg {
					stroke: #777;
				}
				#media-upload.media-upload-hover {
					border-color: lightgreen;
				}
				.media-actions button.hidden,
				.hidden {
					display: none;
				}
			</style>
			<div id="media-upload">
				<input id="media-type" type="text" value="0">
				<input id="media-input" type="file">
				<input id="media-history" type="file">
				<div class="media-types"></div>
				<img class="media-preview hidden" alt="Image Preview">
				<video controls class="media-preview hidden"></video>
				<div class="media-actions hidden">
					<button id="media-clear">
						<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
					</button>
					<button id="media-edit" class="hidden">
						<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
					</button>
					<button id="media-zoom">
						<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M8 11H11M14 11H11M11 11V8M11 11V14" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 17L21 21" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
					</button>
					<button id="media-add" class="hidden">
						<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
					</button>
					<button id="media-remove" class="hidden">
						<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M6 12H18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
					</button>
				</div>
			</div>`
	}

	#connected = false
	#updating = false
	#mediaAccepted = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
	#addable = false
	#removable = false
	#source = undefined
	#imageSource = undefined
	#videoSource = undefined
	#mediaUpload = undefined
	#mediaInput = undefined
	#mediaHistory = undefined
	#mediaType = undefined
	#mediaTypes = undefined
	#mediaImagePreview = undefined
	#mediaVideoPreview = undefined
	#mediaActions = undefined
	#onComponentClick
	#onDragEnter
	#onDragOver
	#onDragLeave
	#onDrop
	#onMediaChanged
	#onMediaClear
	#onMediaZoom
	#onMediaRemove
	#onMediaAdd
	#mediaUploadRemove = new CustomEvent('remove')
	#mediaUploadAdd = new CustomEvent('add')

	#previewMedia(dt) {
		this.#mediaTypes.classList.add('hidden')
		this.#mediaImagePreview.classList.add('hidden')
		this.#mediaVideoPreview.classList.add('hidden')
		let isImage = true
		this.#mediaInput.files = dt.files
		this.#mediaHistory.files = dt.files
		const mediaType = dt.files[0].type
		switch (mediaType) {
			case 'image/jpeg':
				this.#mediaType.value = 1
				break
			case 'image/png':
				this.#mediaType.value = 2
				break
			case 'image/webp':
				this.#mediaType.value = 3
				break
			case 'video/mp4':
				this.#mediaType.value = 51
				isImage = false
				break
			case 'video/webm':
				this.#mediaType.value = 52
				isImage = false
				break
		}
		const reader = new FileReader()
		reader.readAsDataURL(dt.files[0])
		reader.onloadend = () => {
			this.#updating = true
			this.#source = reader.result
			this.setAttribute('src', reader.result)
			if (isImage) {
				this.#imageSource = reader.result
				this.#mediaImagePreview.setAttribute('src', reader.result)
				this.#mediaImagePreview.classList.remove('hidden')
			} else {
				this.#videoSource = reader.result
				this.#mediaVideoPreview.innerHTML = `<source src="${reader.result}" type="${mediaType}">`
				this.#mediaVideoPreview.load()
				this.#mediaVideoPreview.oncanplaythrough = () => {
					this.#mediaVideoPreview.classList.remove('hidden')
				}
			}
			this.#updateActions()
			this.#updating = false
		}
	}

	#zoomMedia() {
		const overlay = document.createElement('div')
		overlay.id = 'media-upload-zoom'
		overlay.setAttribute('style', 'position: fixed; width: 100vw; height: 100vh; inset: 0; background: black; z-index: 9999;')
		overlay.addEventListener('click', () => {
			const zoom = document.getElementById('media-upload-zoom')
			zoom.remove()
		})
		if (this.#imageSource) {
			// console.log(this.#imageSource)
			const img = document.createElement('img')
			img.setAttribute('src', this.#imageSource)
			img.setAttribute('style', 'width: 100vw; height: 100vh; object-fit: contain;')
			overlay.appendChild(img)
		} else if (this.#videoSource) {
			const video = document.createElement('video')
			video.setAttribute('controls', '')
			video.setAttribute('style', 'width: 100vw; height: 100vh; object-fit: contain;')
			video.innerHTML = this.#mediaVideoPreview.innerHTML
			video.load()
			overlay.appendChild(video)
		}
		const close = document.createElement('div')
		close.setAttribute('style', 'position: absolute; top: 16px; right: 16px; width: 48px; height: 48px; border-radius: 50%; background-color: #777; cursor: pointer;')
		close.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" color="white"><path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
		overlay.appendChild(close)
		document.body.appendChild(overlay)
	}

	#updateActions() {
		const mediaClear = this.shadowRoot.getElementById('media-clear')
		// const mediaEdit = this.shadowRoot.getElementById('media-edit')
		const mediaZoom = this.shadowRoot.getElementById('media-zoom')
		const mediaAdd = this.shadowRoot.getElementById('media-add')
		const mediaRemove = this.shadowRoot.getElementById('media-remove')
		// console.log(this.id, this.#addable, this.#removable, this.#source)
		if (this.#source) {
			mediaClear.classList.remove('hidden')
			// mediaEdit.classList.remove('hidden')
			mediaZoom.classList.remove('hidden')
		} else {
			mediaClear.classList.add('hidden')
			// mediaEdit.classList.add('hidden')
			mediaZoom.classList.add('hidden')
		}
		if (this.#addable) {
			mediaAdd.classList.remove('hidden')
		} else {
			mediaAdd.classList.add('hidden')
		}
		if (this.#removable) {
			mediaRemove.classList.remove('hidden')
		} else {
			mediaRemove.classList.add('hidden')
		}
		if (this.#source || this.#addable || this.#removable) {
			this.#mediaActions.classList.remove('hidden')
		} else {
			this.#mediaActions.classList.add('hidden')
		}
	}

	#updateFileTypes() {
		this.#mediaInput.setAttribute('accept', this.#mediaAccepted.join(', '))
		this.#mediaHistory.setAttribute('accept', this.#mediaAccepted.join(', '))
		let image = false
		let video = false
		for (const mediaType of this.#mediaAccepted) {
			switch (mediaType) {
				case 'image/jpeg':
					image = true
					break
				case 'image/png':
					image = true
					break
				case 'image/webp':
					image = true
					break
				case 'video/mp4':
					video = true
					break
				case 'video/webm':
					video = true
					break
			}
		}
		let mediaTypes = ''
		if (image) {
			mediaTypes += '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 16L10 13L21 18" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 10C14.8954 10 14 9.10457 14 8C14 6.89543 14.8954 6 16 6C17.1046 6 18 6.89543 18 8C18 9.10457 17.1046 10 16 10Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
		}
		if (video) {
			mediaTypes += '<svg viewBox="0 0 24 24" stroke-width="1.5" fill="inherit" color="inherit"><path d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.89768 8.51296C9.49769 8.28439 9 8.57321 9 9.03391V14.9661C9 15.4268 9.49769 15.7156 9.89768 15.487L15.0883 12.5209C15.4914 12.2906 15.4914 11.7094 15.0883 11.4791L9.89768 8.51296Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
		}
		this.#mediaTypes.innerHTML = mediaTypes
	}

	#updateSource() {
		let sourceType
		this.#updating = true
		if (this.#source) {
			sourceType = this.#source.substring(this.#source.lastIndexOf('.') + 1)
			switch (sourceType) {
				case 'mp4':
				case 'webm':
					this.#videoSource = this.#source
					break
				default:
					this.#imageSource = this.#source
			}
			this.setAttribute('src', this.#source)
		} else {
			this.#imageSource = undefined
			this.#videoSource = undefined
			this.removeAttribute('src')
		}
		this.#mediaInput.files = null
		this.#mediaHistory.files = null
		this.#mediaType.value = '0'
		if (this.#imageSource) {
			this.#mediaImagePreview.src = this.#imageSource
			this.#mediaImagePreview.classList.remove('hidden')
		} else {
			this.#mediaImagePreview.removeAttribute('src')
			this.#mediaImagePreview.classList.add('hidden')
		}
		if (this.#videoSource) {
			this.#mediaVideoPreview.innerHTML = `<source src="${this.#videoSource}" type="video/${sourceType}">`
			this.#mediaVideoPreview.load()
			this.#mediaVideoPreview.oncanplaythrough = () => {
				this.#mediaVideoPreview.classList.remove('hidden')
			}
		} else {
			this.#mediaVideoPreview.innerHTML = ''
			this.#mediaVideoPreview.classList.add('hidden')
		}
		if (this.#imageSource || this.#videoSource) {
			this.#mediaTypes.classList.add('hidden')
			this.#mediaActions.classList.remove('hidden')
		} else {
			this.#mediaTypes.classList.remove('hidden')
			this.#mediaActions.classList.add('hidden')
		}
		this.#updateActions()
		this.#updating = false
	}

	#setElements() {
		this.#mediaUpload = this.shadowRoot.getElementById('media-upload')
		this.#mediaInput = this.shadowRoot.getElementById('media-input')
		this.#mediaHistory = this.shadowRoot.getElementById('media-history')
		this.#mediaType = this.shadowRoot.getElementById('media-type')
		this.#mediaTypes = this.shadowRoot.querySelector('.media-types')
		this.#mediaImagePreview = this.shadowRoot.querySelector('img')
		this.#mediaVideoPreview = this.shadowRoot.querySelector('video')
		this.#mediaActions = this.shadowRoot.querySelector('.media-actions')
	}

	connectedCallback() {
		console.log('Component connected')
		this.#connected = true
		this.#setElements()
		this.#updateFileTypes()
		this.#updateSource()
		this.#updateActions()
		this.#mediaUpload.addEventListener('click', this.#onComponentClick = () => {
			this.#mediaInput.click()
		})
		this.#mediaUpload.addEventListener('dragenter', this.#onDragEnter = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.#mediaUpload.classList.add('media-upload-hover')
		})
		this.#mediaUpload.addEventListener('dragover', this.#onDragOver = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.#mediaUpload.classList.add('media-upload-hover')
		})
		this.#mediaUpload.addEventListener('dragleave', this.#onDragLeave = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.#mediaUpload.classList.remove('media-upload-hover')
		})
		this.#mediaUpload.addEventListener('drop', this.#onDrop = (event) => {
			event.preventDefault()
			event.stopPropagation()
			console.log('upload drop')
			const dt = event.dataTransfer
			if (dt.files.length > 1) {
				console.error('More than one file dropped')
			} else {
				console.log(dt.files)
				if (this.#mediaAccepted.includes(dt.files[0].type)) {
					this.#previewMedia(dt)
				} else {
					console.error('Invalid media type')
				}
			}
			this.#mediaUpload.classList.remove('media-upload-hover')
		})
		this.#mediaInput.addEventListener('change', this.#onMediaChanged = () => {
			console.log(this.#mediaInput.files)
			if (this.#mediaInput.value.length !== 0) {
				this.#previewMedia(this.#mediaInput)
			} else {
				this.#mediaInput.files = this.#mediaHistory.files
			}
		})
		this.shadowRoot.getElementById('media-clear').addEventListener('click', this.#onMediaClear = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.#source = undefined
			this.#updateSource()
		})
		this.shadowRoot.getElementById('media-zoom').addEventListener('click', this.#onMediaZoom = (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.#zoomMedia()
		})
		this.shadowRoot.getElementById('media-remove').addEventListener('click', this.#onMediaRemove = (event) => {
			event.preventDefault()
			event.stopPropagation()
			console.log('Requested remove')
			this.dispatchEvent(this.#mediaUploadRemove)
		})
		this.shadowRoot.getElementById('media-add').addEventListener('click', this.#onMediaAdd = (event) => {
			event.preventDefault()
			event.stopPropagation()
			console.log('Requested add')
			this.dispatchEvent(this.#mediaUploadAdd)
		})
	}

	disconnectedCallback() {
		this.#mediaUpload.removeEventListener('click', this.#onComponentClick)
		this.#mediaUpload.removeEventListener('dragenter', this.#onDragEnter)
		this.#mediaUpload.removeEventListener('dragover', this.#onDragOver)
		this.#mediaUpload.removeEventListener('dragleave', this.#onDragLeave)
		this.#mediaUpload.removeEventListener('drop', this.#onDrop)
		this.#mediaInput.removeEventListener('change', this.#onMediaChanged)
		this.shadowRoot.getElementById('media-clear').removeEventListener('click', this.#onMediaClear)
		this.shadowRoot.getElementById('media-zoom').removeEventListener('click', this.#onMediaZoom)
		this.shadowRoot.getElementById('media-remove').removeEventListener('click', this.#onMediaRemove)
		this.shadowRoot.getElementById('media-add').removeEventListener('click', this.#onMediaAdd)
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log(`Attribute ${name} has changed from ${typeof oldValue === 'string' && oldValue.length > 32 ? oldValue.substring(0, 32) + '...' : oldValue} to ${typeof newValue === 'string' && newValue.length > 32 ? newValue.substring(0, 32) + '...' : newValue}.`)
		switch (name) {
			case 'types':
				this.#mediaAccepted = newValue.split(' ')
				if (this.#connected) {
					this.#updateFileTypes()
				}
				break
			case 'src':
				if (newValue === '') {
					this.#source = undefined
				} else {
					this.#source = newValue
				}
				if (this.#connected && !this.#updating) {
					this.#updateSource()
				}
				break
			case 'addable':
				if (newValue === '') {
					this.#addable = true
				} else {
					this.#addable = false
				}
				if (this.#connected) {
					this.#updateActions()
				}
				break
			case 'removable':
				if (newValue === '') {
					this.#removable = true
				} else {
					this.#removable = false
				}
				if (this.#connected) {
					this.#updateActions()
				}
				break
		}
	}
}

MediaUpload.define()
