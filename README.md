# My Web Components

While working on my [NFO editor for Kodi](https://github.com/clubside/KodiNFOMusicVideos) I ran into an issue when dealing with `fanart` since [Kodi](https://kodi.tv) supports multiple fanart and my simple JavaScript function had no way to broadcast an event back to the main script. I had played with [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) a bit in the past but was usually frustrated by the code. While there are plenty of great resources out there they rarely broke down clearly what I wanted to accomplish so I thought not only was this a great opportunity to learn something new but also pass along some things that might be helpful for others getting into the game.

I'm organizing this similarly to how the MDN examples at [web-components-examples](https://github.com/mdn/web-components-examples) are set up but with each component `.js` file named the way the component is used. There is a sample `html` file to show off the functionality but I definitely need to work on better documentation.

The individual component `.js` files can be downloaded and used as they are sel-contained but there is a full test suite if you download the release:

```bash
npm i
npm start
```

then go to [http://http://localhost:3600/](http://http://localhost:3600/) to test all of the components including for submission support.

## &lt;image-option-group&gt;

An image-based option chooser with `option-group` and `multiple` behavior. Insert `<img>` elements inside the component to generate the options. At a minimum an `id` is necessary to generate each option's `id`. Additionally you can specify both a title and and initial checked state through `dataset` attributes `data-title` and `data-checked` respectively.

### Usage

`<image-option-group multiple><img id="test" src="test.png" data-title="Test" data-checked="false"></image-option-group>`

#### Attributes

- `disabled` indicates the user cannot interact with the component.
- `multiple` to allow selection of multiple options. If not included only a single option within the group may be selected, clicking/tapping another removes the checked status of the others.
- `required` indicates at least one option must be chosen when `multiple` is true, or one option chosen when not.
- `value` is a semi-colon separated list of `id`s that are checked.

#### Events

- `change` is fired everytime the number of selected options changes.

#### Properties

- `disabled` returns or sets the `disabled` attribute as a boolean.
- `multiple` returns or sets the `multiple` attribute as a boolean.
- `required` returns or sets the `required` attribute as a boolean.
- `value` returns an array of `id`s representing which options are checked or passes an array of `id`s to set as checked..

#### Keyboard Support

When focused both `Enter` and `Spacebar` with toggle a non-`disabled` option, and `tab` and `shift-tab` will navigate between options.

#### Appearance

There are a few standard styles all of which can be overwriiten by targeting the approriate part.

##### CSS Parts

- `option` is the container `<div>` element which by default is `display: flex; flex-direction: column;`.
- `image` is the option's `<img>` element.
- `status` is the option's check box which at the moment uses a hard-coded gray-outlined circle to indicate unchecked and a filled-green circle with white checkmark to indicate checked. By default it is `position: absolute; top: 0; right: 0;width: 32px; height: 32px;`I have plans to allow passing the images used to indicate checked status in the future.
- `title` is the optional `<div>` element that contains the title.

#### Form support

The component is fully compatible inside `<form>` elements. Seeting the `required` attribute will deny validity until at least one option has been chosen when the `multiple` attribute is set, .

## &lt;media-upload&gt;

There are many image upload with preview solutions out there, this one is mine. It supports file selection and drag/drop, images and video, add and remove events as well as a simplistic zoom. I hope to make the zoom more full-featured and add crop functionality in the future. The sample page demonstrates adding/removing new instances of the component and a 'Save' button will `console.log()` the current media.

### Usage

`<media-upload types="image/jpeg image/png image/webp" value="sample.png" addable removable>`

#### Attributes

All attributes are optional.

- `addable` indicates the user has the ability to add another instance of the component. You can use `.addEventListener('add', function)` to handle the event.
- `required` indicates a media file must be set before `<form>` validity will be true.
- `removable` indicates the user has the ability to remove that instance of the component. You can use `.addEventListener('remove', remove)` to handle the event.
- `types` are the `MIME` types the component should accept separated by spaces. If none are provided all possible types are set which are `image/avif`, `image/gif`, `image/jpeg`, `image/png`, `image/svg+xml`, `image/webp`, `video/mp4` and `video/webm`. Dropping an unacceptable type produces both `window.alert()` and `console.error()` messages of the dropped `MIME` type and a list of the acceptable types. This should be customizable in the future with a custom event trigger.
- `value` is an existing media reference to show when the component first appears. When saving you can `.getAttribute('value')` or `element.value` to get the current media. Fires `change` event when the value changes, current value can be retrieved from `event.target.value`.

#### Keyboard Support

When focused `Spacebar` will act the same as a `click` event, opening the OS dialog to choose a file.  `Z` or z` will zoom the current media. `Escape` will clear the current media or close zoom. `+` and `-` will trigger the `add` or `remove` events if those attributes are enabled.

#### Appearance

The component has a number of internal styles that I probably need to work on since my pages are based on a full reset. In your own `CSS` you will need to specify dimensions for the component so all the internal elements can scale to that size. The example page shows how using `aspect-ratio` you can hint to the user the dimensions of the image you require. You can style the `border` of the component and hopefully in the future I will support styling the media formats supported icons as well as the buttons.

#### Form support

The component is fully compatible inside `<form>` elements. Seeting the `required` attribute will deny validity until a media file has been set.

## &lt;progress-bar&gt;

A fancy (for me 😜) progress bar as a replacement for the standard `<progress>` element. It uses the same attributes so it can be a drop-in replacement.

### Usage

`<progress-bar value="0" max="100" gradient="linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)" nostripes></progress-bar>`

#### Attributes

- `value` is the current progress of the control. It defaults to 0 and if it exceeds `max` it is set to `max`.
- `max` is the maximum progress. It defaults to 100.
- `gradient` allows a custom CSS `background-image` for the progress bar. This should be in the standard CSS format.
- `nostripes` will disable the animated stripes normally applied to the progress bar.

#### Appearance

Standards are set in terms of the `border-radius` and `background-image` fill gradient which is green-ish. The primary element is filled with an inherited `background-color`. The component scales based on `font-size`.

##### CSS Parts

- `fill` controls the inner bar that indicates progress. Setting `background-image` changes the look (see example) but you can also change `border-radius`, `background` and other styles.

## &lt;star-rating&gt;

Another common pattern, this one was very frustrating owing to how `document.createElement` and `svg` don't play well together. No half-stars here, I'd have to find a different way to render the stars and probably lose the fancy schmancy rounded corners (unless som `CSS` genius wishes to step forward 😀), but Kodi only uses one to five for it's `userrating`. But I'm happy with the live highlight of stars as you hover over the component. Clicking on the current number of stars is how you remove the value.

### Usage

`<star-rating stars="10" value="3"></star-rating>`

#### Attributes

All attributes are optional.

- `stars` is the number of stars to display. The default value is `5` and the minimum is `1`. There is no limit set but, y'know...
- `value` is the number of stars set. Rather than supporting `0` stars excluding this attribute, or selecting the current number of stars, is meant to indicate no value set. Fires `change` event when the value changes, current value can be retrieved from `event.target.value`.

#### Keyboard Support

When focused `ArrowLeft` will decrease `value` until `null`. `ArrowRight` will increase `value` until the value of `stars` then will set as `null` allowing the user to wrap around and continue pressing the key indefinitely.

#### Appearance

You can style the `stroke` and `fill` of the stars at the top level and use `::part` to style the three states of the stars. There are default fill colors: white for unselected stars, yellow for selected stars and gold when hovering. Otherwise it will scale with `font-size` as my use-case is inline but there's no reason you can't put it into a block-level container.

##### CSS Parts

- `star` is the is the default state.
- `star-selected` is for any star equal to or less than the current `value`.
- `star-hover` is for stars when hovering. This is an adaptive state in that the hover styles are only applied to stars equal to or great than the current `value` while `star` is applied to any star greater than the one you're currently hovering over, all stars are set to `star` when you hover over the current `value`, and `star-selected` is applied to any star greater than the one being hovered and less than or equal to `value`. See demo page for how this works.

#### Form support

The component is fully compatible inside `<form>` elements. Seeting the `required` attribute will deny validity until thew number of selected stars is at least one.

## &lt;toggle-switch&gt;

An approximation of the iOS toggle as a replacement for the standard `<input type="checkbox">` form control.

### Usage

`<toggle-switch checked disabled></toggle-switch>`

#### Attributes

All attributes are optional.

- `checked` indicates the component is currently in the `on` state. Using `.getAttribute('checked')` or `element.checked` will return a `boolean` indicating whether the switch is `on` or `off`. Fires `change` event when the checked attribute changes, current value can be retrieved from `event.target.checked`.
- `disabled` indicates whether the control can be toggled by the user.

#### Methods

- `.toggle()` can be used to simulate user interactivity with the component. Calling `element.toggle()` is the same as sending a `click` event which will be ignored if the component currently has the `disabled` attribute set. Using `element.setAttribute(state)` is the only way to change the state regardless of `disabled`.

#### Keyboard Support

When focused both `Enter` and `Spacebar` with toggle a non-`disabled` instance.

#### Appearance

Another opinionated display in terms of colors, using greys for the `off` state background and off-green for `on`. Opacity is used to indicate `disabled`. The component will resize height based on `font-size` of the containing element.

#### Form support

The component is fully compatible inside `<form>` elements.
