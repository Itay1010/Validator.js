/**
 * The core validator module. Use to be simple but now is kind of a redundant mess. Nevertheless, it works.
 */
import {_default_errors_, _dev_errors_} from "../lang/en";

/**
 This core module is exported as an object and assigned to the instance of the validator to provide the core functionality.
 Without this, the validator will not work.
 */
const obj = {
    // Called by the user to start validating.
    init() {
        // Overwrite this value in functions
        this.bindListenerFnThisValue()
        // Set the basic listener
        this.setInvalidListener()
        // Set validation passed from the "options.fields" object
        this.setCustomValidation()
    },

    /**
     We use the HtmlForm 'invalid' event to catch invalid fields and handle their validation
     */
    setInvalidListener() {
        this.form?.addEventListener('invalid', this.onInvalid, true)
    },

    /**
     Function to run on the HtmlForm 'invalid' event
     */
    onInvalid(ev) {
        //User can set options for hiding default HTML validation, but if we're showing custom feedback then we also want to hide the default validation.
        if(this.hideDefaultInvalid || this.showFeedback) {
            //In both cases we want to preventDefault and handle the feedback on our own.
            ev.preventDefault()
            const invalids = this.getInvalids() //Not performance friendly to call this every time.
            //focus the first invalid input only at the last invalid event
            invalids[invalids.length - 1] !== ev.target || invalids[0]?.focus()
        }
        const el = ev.target
        if(!el)
            return
        if(el.classList.contains(this.trackingClass)) //no need to add another eventListener
            return
        el.classList.add(this.trackingClass)
        const trigger = (this.changeEvTags.includes(el.tagName) ? 'change' : 'input')
        el.addEventListener(trigger, this.handleValidation)
        this.handleValidation({target: el}) //Passing the element like so allows for using the function both here and ds an event handler.
    },

    /**
     * Function to validate and re-validate the input on change/input events.
     */
    handleValidation({target}) {
        const fieldsKeys = Object.keys(this.fields || {})
        if(!fieldsKeys.length || !fieldsKeys.includes(this.getElementKey(target)))
            target.setCustomValidity('')

        if(target.validity.valid) {
            this.clearError(target)
        } else {
            this.setError(target)
        }
    },

    /**
     * Set the error state of the input. When an input is invalid this is want we want to do to it.
     */
    setError(el) {
        const key = this.getElementKey(el)
        let validityMsg;
        if(el.dataset?.invalidMessage) {
            validityMsg = el.dataset.invalidMessage
        } else if(this.fields && this.fields[key]?.invalidMessage) {
            validityMsg = this.fields[key]?.invalidMessage
        } else {
            validityMsg = el.validationMessage
        }

        if(!validityMsg)
            throw new Error(_dev_errors_.noValidationMessage)
        if(el.parentElement !== this.form)
            el.parentElement.classList.add(this.containerInvalidClass || '')
        el.setCustomValidity(validityMsg)
        el.classList.add(this.invalidClass || '')
        el.setAttribute('aria-invalid', 'true')
    },

    /**
     * Clear what we set in setError.
     */
    clearError(el) {
        if(el.parentElement !== this.form)
            el.parentElement.classList.remove(this.containerInvalidClass || '')
        el.classList.remove(this.invalidClass || '')
        el.removeAttribute('aria-invalid')
        el.setCustomValidity('')

    },

    /**
     * Get invalid fields.
     * I'm of the opinion that keeping the view as fresh as possible is more imported than saving a few milliseconds,
     * but this function uses "querySelectorAll" and is used itself quite a few times,
     * so it might be worth coming back and changing it to work in-memory instead of through the DOM.
     */
    getInvalids() {
        //Get invalids by making a selector from all tags defined on the object
        if(this.tags) {
            return this.form?.querySelectorAll(this.tags.map(tag => tag + ':invalid').join(', '))
        } else {
            return []
        }
    },

    /**
     * Functions used in event listener get their "this" value set as the element they were listening to.
     * We bind their "this" value to the current object to we can get access to all the properties and functions on it.
     */
    bindListenerFnThisValue() {
        this.handleValidation = this.handleValidation.bind(this)
        this.onInvalid = this.onInvalid.bind(this)
        this.handleCustomValidation = this.handleCustomValidation.bind(this)
        this.onCustomSubmit = this.onCustomSubmit.bind(this)
    },

    /**
     * The key must match the one used in "options.fields", we can set this from either the elements dataset, id, or name.
     * This function gets that key, if that wasn't clear.
     */
    getElementKey(el) {
        return el.dataset?.name || el.id || el.name || ''
    },

    /**
     * Inputs defined in the "options.fields" are considered valid by the HTML form.
     * To change them to invalid we need to check which fields are defined in the "options.fields",
     * add a listener when their interacted with, and add a listen to the submit event so we can prevent default on invalid and run the user defined submit function.
     */
    setCustomValidation() {
        this.form?.addEventListener('submit', this.onCustomSubmit)
        const customValidationElementsKeys = Object.keys(this.fields || {})
        customValidationElementsKeys.forEach(key => {
            const el = document.querySelector(`[data-name="${key}"],#${key},[name="${key}"]`) //Same as what getElementKey does but in revers.
            if(!this.fields || !this.fields[key] || Object.keys(this.fields[key]).length < 1) //No need to go over empty fields or if there are no fields set.
                return
            const fieldData = this.fields[key]
            const trigger = (this.changeEvTags?.includes(el.tagName) ? 'change' : 'input')
            el.addEventListener(trigger, this.handleCustomValidation)
            this.handleCustomValidation({target: el}, fieldData)
        })
    },

    /**
     * Handler for anything to do with the "options.fields" fields on submit.
     */
    onCustomSubmit(ev) {
        const formIsValid = this.form.reportValidity()
        if(!formIsValid)
            ev.preventDefault()
        if(this.submitUserFn && typeof this.submitUserFn === 'function')
            this.submitUserFn(ev)

    },

    /**
     * validate a field based on "options.fields".
     */
    handleCustomValidation({target: el}, fieldData = {}) {
        if(!Object.keys(fieldData).length) {
            const key = this.getElementKey(el)
            fieldData = (this.fields && this.fields[key]) ? this.fields[key] : {}
        }
        let invalidMsg = ''
        const invalid = Object.keys(fieldData).some(key => {
            let val = el.value
            let type = 'string'
            const parsedInt = parseFloat(val)
            if(el.type === 'number' && !isNaN(parsedInt)) {
                val = parsedInt
                type = 'number'
            }
            switch (key) {
                case 'min':
                    if((type === 'number') ? (fieldData.min > val) : (fieldData.min > val?.length)) {
                        invalidMsg = _default_errors_.tooShort.replace('[min]', fieldData.min || 'as low as you want').replace('[max]', fieldData.max || 'as high as you want')
                        return true
                    }
                    break
                case 'max':
                    if((type === 'number') ? (val > fieldData.max) : (val?.length > fieldData.max)) {
                        invalidMsg = (_default_errors_.tooLong).replace('[min]', fieldData.min || 'as low as you want').replace('[max]', fieldData.max || 'as high as you want')
                        return true
                    }
                    break
                case 'required':
                    if((type === 'number') ? (!val && val !== 0) : !val?.trim()) {
                        invalidMsg = (_default_errors_.valueMissing)
                        return
                    }
                    break
                case 'pattern':
                    if(!this.getPattern(fieldData.pattern).exec(val)?.length) {
                        invalidMsg = (_default_errors_.typeMismatch[el.type])
                        return
                    }
                    break
                case 'matches':
                    try {
                        if(!fieldData.matches.every(regexKey => this.regexs[regexKey].exec(val)?.length)) {
                            invalidMsg = (_default_errors_.patternMismatch)
                            return true
                        }
                    } catch (e) {
                        throw new Error(_dev_errors_.incorrectMatchesKey)
                    }
                    break
                default:
                    return false
            }
        })
        if(invalid) {
            //We need to set something here to mark it as invalid, so we set it to a specific identifier, that way we can know it's not an HTML invalid later.
            el.setCustomValidity(invalidMsg)
        } else {
            el.setCustomValidity('')
        }
    },

    /**
     * Format the passed pattern as a regex if it isn't already.
     */
    getPattern(pattern) {
        if(!pattern) //Match all if nothing was passed
            return /.*/gmi
        return typeof pattern !== 'RegExp' ? new RegExp(pattern) : pattern
    },

    /**
     * Function for programmatically submitting the form. Has option to pass a function to run on submitting.
     */
    submit(fn = null) {
        if(typeof fn === 'function')
            this.submitUserFn = fn
        this.form.dispatchEvent(new CustomEvent('submit', {cancelable: true}))
    },
}

export default obj