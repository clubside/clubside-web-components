# My Web Components

While working on my [NFO editor for Kdoi](https://github.com/clubside/KodiNFOMusicVideos) I ran into an issue when dealing with `fanart` since [Kodi](https://kodi.tv) supports multiple fanart and my simple JavaScript function had no way to broadcast an event back to the main script. I had played with [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) a bit in the past but was usually frustrated by the code. While there are plenty of great resources out there they rarely broke down clearly what I wanted to accomplish so I thought not only was this a great opportunity to learn something new but also pass along some things that might be helpful for others getting into the game.

I'm organizing this the similarly to how the MDN examples at [web-components-examples](https://github.com/mdn/web-components-examples) are set up but with each component `.js` file named the way the element is used. There is a sample `html` file to show off the functionality but I definitely need to work on better documentation.

## media-upload

There are many image upload with preview solutions out there, this one is mine. It supports file selection and drag/drop, images and video, add and remove events as well as a simplistic zoom. I hope to make the zoom more full-featured and add crop functionality in the future. The sample page demonstrates adding/removing new instances of the element and a 'Save' button will `console.log()` the current media.

### Usage

`<media-upload types="image/jpeg image/png image/webp" src="sample.png" addable removable>`

#### Attributes

All attributes are optional.

* `types` are the `MIME` types the element should accept separated by spaces. If none are provided all possible types are set which are `image/jpeg`, `image/png`, `image/webp`, `video/mp4` and `video/webm`. Currently unacceptable types only produce a `console.error()` message.
* `src` is an existing media reference to show when the element first appears. When saving you can `.getAttribute('src')` to get the current media.
* `addable` indicates the user has the ability to add another instance of the element. You can use `.addEventListener('add', function)` to handle the event.
* `removable` indicates the user has the ability to remove that instance of the element. You can use `.addEventListener('remove', remove)` to handle the event.

#### Appearance

The element has a number of internal styles that I probably need to work on since my pages are based on a full reset. In your own `CSS` you will need to specify dimensions for the element so all the internal elements can scale to that size.
