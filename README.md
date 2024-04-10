# ABOUT
Basic form validator written in vanilla JavaScript with options for validating using
HTML attributes or JavaScript options.

This package is not available on NPM because I do not feel there's a need for another form validator on there.

# Content
<!-- TOC -->
* [ABOUT](#about)
* [Content](#content)
* [Quick Start](#quick-start)
* [API Reference](#api-reference)
* [TODO](#todo)
<!-- TOC -->

# Quick Start
To run the validator first download and build it using
``npm run build``.
Then run ``npm link form_validator``.
Import the validator and configure it like so
```javascript
import {Validator} from "form_validator"

const fields = {
    firstName: {min: 1, max: 10, required: true, noValidate: false, invalidMessage: 'Will show on invalid', pattern: 'pattern', matches: []},
}
const submitFn = (ev) => {
    ///Do some things...
}
const validator = new Validator('form', {fields: fields, showFeedback: false, hideDefaultInvalid: false, submit: submitFn})
window.addEventListener("DOMContentLoaded", () => {
    validator.init() //Start the validator
})
```
All the "options.fields" are optional.
If the HTML inputs have validation parameters (min, required, pattern, etc...)
they fill be validated before any custom validations.

# API Reference
**Validator(selector `string`, options? `object`)**
\
Type: `Function` \
Returns: `Object`
\
The constructor for creating an instance of the validator based on the passed options

**selector**\
Type: `string`\
Required: `true`\
Selector for the Html form element to validate.

**options**\
Type: `object`\
Default: `N\A`\
Options object for configuring the validator behavior.

**options.showFeedback**\
Type: `boolean`\
Default: `false`\
Whether to show custom feedback on invalid inputs.

**options.hideDefaultInvalid**\
Type: `boolean`\
Default: `false`\
Whether to hide default invalid messages.

**options.submit**\
Type: `Function`\
Default: `N\A`\
The function to call when the form is submitted.

**options.fields**\
Type: `object`\
Default: `N\A`\
The object containing field configuration.

- **required** `boolean`: Whether the input is required or not.
- **invalidMessage** `string`: Custom message to display on invalid input.
- **min** `number`: The minimum value allowed for the input. Can be for either a number input or a text input.
- **max** `number`: The maximum value allowed for the input. Can be for either a number input or a text input.
- **pattern** `string`: Regular expression pattern validating the input.
- **matches** `Array`: Array of predefined regular expression to match the input against. Can be any one or more of the following: text, number, email.
- **noValidate** `boolean`: Whether to skip validation for this input.

# TODO
* ~~Cleanup code + files~~
* ~~Add option for preset pattern + pass pattern~~
* ~~Add to this readme file~~
* ~~Comments~~
* Try to optimise codebase. It's not am issue but I think I can make it more affective, too many queries to the DOM and calculation in place.
* Maybe add option for extending with more modules? 