import {_dev_errors_} from "./lang/en.js"
import simpleValidator from "./modules/simple-validator";
import {feedback} from "./modules/feedback";

const defaultConfig = {
    invalidClass: 'invalid',
    containerInvalidClass: 'invalid-container',
    customErrorsIdentifier: 'customValidation',
    trackingClass: btoa(Date.now() + ''),
    tags: ['INPUT', 'SELECT', 'TEXTAREA'],
    changeEvTags: ['SELECT'],
}

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

    // Set validator type specific properties
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