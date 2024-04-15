# My Web Components

While working on my [NFO editor for Kodi](https://github.com/clubside/KodiNFOMusicVideos) I ran into an issue when dealing with `fanart` since [Kodi](https://kodi.tv) supports multiple fanart and my simple JavaScript function had no way to broadcast an event back to the main script. I had played with [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) a bit in the past but was usually frustrated by the code. While there are plenty of great resources out there they rarely broke down clearly what I wanted to accomplish so I thought not only was this a great opportunity to learn something new but also pass along some things that might be helpful for others getting into the game.

I'm organizing this the similarly to how the MDN examples at [web-components-examples](https://github.com/mdn/web-components-examples) are set up but with each component `.js` file named the way the element is used. There is a sample `html` file to show off the functionality but I definitely need to work on better documentation.

None of these components currently work with form submission as I use them with `fetch` APIs. At some point I will modify them to follow the `formAssociated` guidelines as seen in [More capable form controls](https://web.dev/articles/more-capable-form-controls).

## media-upload

There are many image upload with preview solutions out there, this one is mine. It supports file selection and drag/drop, images and video, add and remove events as well as a simplistic zoom. I hope to make the zoom more full-featured and add crop functionality in the future. The sample page demonstrates adding/removing new instances of the element and a 'Save' button will `console.log()` the current media.

### Usage

`<media-upload types="image/jpeg image/png image/webp" src="sample.png" addable removable>`

#### Attributes

All attributes are optional.

* `types` are the `MIME` types the element should accept separated by spaces. If none are provided all possible types are set which are `image/jpeg`, `image/png`, `image/webp`, `video/mp4` and `video/webm`. Currently unacceptable types only produce a `console.error()` message.
* `value` is an existing media reference to show when the element first appears. When saving you can `.getAttribute('value')` or `element.value` to get the current media.
* `addable` indicates the user has the ability to add another instance of the element. You can use `.addEventListener('add', function)` to handle the event.
* `removable` indicates the user has the ability to remove that instance of the element. You can use `.addEventListener('remove', remove)` to handle the event.

#### Keyboard Support

When focused `Spacebar` will act the same as a `click` event, opening the OS dialog to choose a file.  `Z` or z` will zoom the current media. `Escape` will clear the current media or close zoom. `+` and `-` will trigger the `add` or `remove` events if those attributes are enabled.

#### Appearance

The element has a number of internal styles that I probably need to work on since my pages are based on a full reset. In your own `CSS` you will need to specify dimensions for the element so all the internal elements can scale to that size.

## star-rating

Another common pattern, this one was very frustrating owing to how `document.createElement` and `svg` don't play well together. No half-stars here, I'd have to find a different way to render the stars and probably lose the fancy schmancy rounded corners (unless som `CSS` genius wishes to step foward 😀), but Kodi only uses one to five for it's `userrating`. But I'm happy with the live highlight of stars as you hover over the component. Clicking on the current number of stars is how you remove the value.

### Usage

`<star-rating stars="10" value="3"></star-rating>`

#### Attributes

All attributes are optional.

* `stars` is the number of stars to display. The default value is `5` and the minimum is `1`. There is no limit set but, y'know...
* `value` is the number of stars set. Rather than supporting `0` stars excluding this attribute, or selecting the current number of stars, is meant to indicate no value set.

#### Keyboard Support

When focused `ArrowLeft` will decrease `value` until `null`. `ArrowRight` will increase `value` until the value of `stars` then will set as `null` allowing the user to wrap around and continue pressing the key indefinitely.

#### Appearance

This is an opinionated display in terms of colors, yellow for the current number of stars, gold when hovering. Otherwise it will scale with `font-size` as my use-case is inline but there's no reason you can't put it into a block-level container.

## toggle-switch

An approximation of the iOS toggle as a replacement for the standard `<input type="checkbox">` form control.

### Usage

`<toggle-switch checked disabled></toggle-switch>`

#### Attributes

All attributes are optional.

* `checked` indicates the componet is currently in the `on` state. Using `.getAttribute('checked')` or `element.checked` will return a `boolean` indicating whether the switch is `on` or `off`. Fires `change` event when the value changes, current value can be retrieved from `event.target.checked`.
* `disabled` indicates whether the control can be toggled by the user.

#### Methods

* `.toggle()` can be used to simulate user interactivity with the component. Calling `element.toggle()` is the same as sending a `click` event which will be ignored if the componet currently has the `disabled` attribute set. Using `element.setAttribute(state)` is the only way to change the state regardless of `disabled`.

#### Keyboard Support

When focused both `Enter` and `Spacebar` with toggle a non-`disabled` instance.

#### Appearance

Another opinionated display in terms of colors, using greys for the `off` state background and off-green for `on`. Opacity is used to indicate `disabled`. The component will resize height based on `font-size` of the containing element.
