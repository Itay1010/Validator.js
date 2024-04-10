/**
 * The entry point for the validator. Here we set the default settings for the validator and set the options from the user.
 * The strategy for this project was to have a main validator that can be extended by modules if needed, and while there is no proper way to do this as a user,
 * feel free to mess with the source code by adding files to the "modules" folder and using "Object.assign" to add.
 */
import {_dev_errors_} from "./lang/en.js"
import simpleValidator from "./modules/simple-validator";
import {feedback} from "./modules/feedback";

//Default config. values here should not be overwritten.
const defaultConfig = {
    invalidClass: 'invalid', //class to add on invalid fields.
    containerInvalidClass: 'invalid-container', //In case the input is inside a container, we add this calls to the container.
    trackingClass: btoa(Date.now() + ''), //Class to mark field already tracked by the validator.
    tags: ['INPUT', 'SELECT', 'TEXTAREA'], //Html tags we're going to validate.
    changeEvTags: ['SELECT'], //Html tags the use the "change" event instead of the "input" event.
    regexs: {text: /[a-zA-Z]+/gim, number: /\d+/gmi, email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gmi}, //Predefined regex to use if needed.
}

/**
 * Constructor for the validator.
 *
 * This function must be called with the "new" keyword. Returns an instance of the validator configured with the options passed to it.
 * @param {string} selector - The CSS selector to identify the input element.
 * @param {object} options - Options object for configuring the validator behavior.
 * @param {boolean} options.showFeedback - Whether to show custom feedback on invalid inputs.
 * @param {boolean} options.hideDefaultInvalid - Whether to hide default invalid messages.
 * @param {Function} options.submit - The function to call when the form is submitted.
 * @param {object} options.fields - The object containing field configuration.
 * @param {number} options.fields.min - The minimum value allowed for the input. Can be for either a number input or a text input.
 * @param {number} options.fields.max - The maximum value allowed for the input. Can be for either a number input or a text input.
 * @param {boolean} options.fields.required - Whether the input is required or not.
 * @param {boolean} options.fields.noValidate - Whether to skip validation for this input.
 * @param {string} options.fields.invalidMessage - Custom message to display on invalid input.
 * @param {string} options.fields.pattern - Regular expression pattern validating the input.
 * @param {Array} options.fields.matches - Array of predefined regular expression to match the input against. can be any one or more of the following: text, number, email.
 * @returns {void}
 */
export default function Validator(selector, options = {}) {
    if(!new.target)
        throw new TypeError(_dev_errors_.notNew)
    const el = document.querySelector(selector);
    if(!el) {
        throw new Error(_dev_errors_.noTarget);
    }

    // Set instance specific properties
    this.form = el
    this.selector = selector

    // Set default properties on instance
    Object.assign(this, defaultConfig)

    // Set core validator properties
    Object.assign(this, simpleValidator)

    // User specific options come last to overwrite library options
    if(options?.submit) {
        options.submitUserFn = options.submit
        delete options.submit
    }
    Object.assign(this, options)

    if(this.showFeedback) {
        const res = import('./modules/feedback')
        res
            .then(({feedback}) => {
                feedback.init(this)
            })
    }
}