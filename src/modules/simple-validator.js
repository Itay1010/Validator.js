import {_dev_errors_} from "../lang/en";

const obj = {
    init() {
        this.bindListenerFnThisValue()
        this.setInvalidListener()
        this.setCustomValidation()
    },

    setInvalidListener() {
        this.form?.addEventListener('invalid', this.onInvalid, true)
    },

    onInvalid(ev) {
        if(this.hideDefaultInvalid || this.showFeedback) {
            ev.preventDefault()
            const invalids = this.getInvalids()
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
        this.handleValidation({target: el})
    },

    handleValidation({target}) {
        const customInvalid = target.validationMessage === this.customErrorsIdentifier
        target.setCustomValidity('')
        if(!customInvalid && target.validity.valid) {
            this.clearError(target)
        } else {
            this.setError(target)
        }
    },

    setError(el) {
        const key = this.getElementKey(el)
        let validityMsg;
        if(el.dataset?.invalidMessage) {
            validityMsg = el.dataset.invalidMessage;
        } else if(this.fields && this.fields[key]?.invalidMessage) {
            validityMsg = this.fields[key]?.invalidMessage
        } else {
            validityMsg = el.validationMessage;
        }

        if(el.parentElement !== this.form)
            el.parentElement.classList.add(this.containerInvalidClass || '')
        el.setCustomValidity(validityMsg)
        el.classList.add(this.invalidClass || '')
        el.setAttribute('aria-invalid', 'true')
    },

    clearError(el) {
        if(el.parentElement !== this.form)
            el.parentElement.classList.remove(this.containerInvalidClass || '')
        el.classList.remove(this.invalidClass || '')
        el.removeAttribute('aria-invalid')
        el.setCustomValidity('')

    },

    getInvalids() {
        //Get invalids by making a selector from all tags defined on the object
        if(this.tags) {
            return this.form?.querySelectorAll(this.tags.map(tag => tag + ':invalid').join(', '))
        } else {
            return []
        }
    },

    /*
    Functions used in event listener get their "this" value set as the element they were listening to,
    we bind their "this" value to the current object to we can get access to all the properties and functions on it.
    */
    bindListenerFnThisValue() {
        this.handleValidation = this.handleValidation.bind(this)
        this.onInvalid = this.onInvalid.bind(this)
        this.handleCustomValidation = this.handleCustomValidation.bind(this)
        this.onCustomSubmit = this.onCustomSubmit.bind(this)
    },

    getElementKey(el) {
        return el.dataset?.name || el.id || el.name || ''
    },

    setCustomValidation() {
        this.form?.addEventListener('submit', this.onCustomSubmit)
        const formElements = this.form?.querySelectorAll(this.tags.join(', '))
        formElements.forEach(el => {
            const key = this.getElementKey(el)
            const fieldData = (this.fields && this.fields[key]) ? this.fields[key] : {}
            const trigger = (this.changeEvTags?.includes(el.tagName) ? 'change' : 'input')
            el.classList.add(this.invalidClass)
            el.addEventListener(trigger, this.handleCustomValidation)
            this.handleCustomValidation({target: el}, fieldData)
        })
    },

    onCustomSubmit(ev) {
        const formIsValid = this.form.reportValidity()
        if(!formIsValid)
            ev.preventDefault()
        else if(this.submitUserFn && typeof this.submitUserFn === 'function')
            this.submitUserFn(ev)

    },

    handleCustomValidation({target: el}, fieldData = {}) {
        if(!Object.keys(fieldData).length) {
            const key = this.getElementKey(el)
            fieldData = (this.fields && this.fields[key]) ? this.fields[key] : {}
        }

        const invalid = Object.keys(fieldData).some(key => {
            let val = el.value
            let type = 'string'
            const parsedInt = parseFloat(val)
            if(!isNaN(parsedInt)) {
                val = parsedInt
                type = 'number'
            }
            switch (key) {
                case 'min':
                    return (type === 'number') ? (fieldData.min > val) : (fieldData.min > val?.length)
                case 'max':
                    return (type === 'number') ? (val > fieldData.max) : (val?.length > fieldData.max)
                case 'required':
                    return (type === 'number') ? (!val && val !== 0) : !val?.trim()
                case 'pattern':
                    return !this.getPattern(fieldData.pattern).exec(val)?.length
                case 'matches':
                    try {
                        return !fieldData.matches.every(regexKey => this.regexs[regexKey].exec(val)?.length)
                    } catch (e) {
                        throw new Error(_dev_errors_.incorrectMatchesKey)
                    }
                default:
                    return false
            }
        })
        if(invalid) {
            //We need to set something here to mark it as invalid, so we set it to a specific identifier, that way we can know it's not an HTML invalid later.
            el.setCustomValidity(this.customErrorsIdentifier)
        } else {
            el.setCustomValidity('')
        }
    },

    getPattern(pattern) {
        //TODO: add option for preset pattern + pass pattern
        if(!pattern) //Match all if nothing was passed
            return /.*/gmi
        return typeof pattern !== 'RegExp' ? new RegExp(pattern) : pattern
    },

    submit(fn) {
        this.submitUserFn = fn
        this.form.dispatchEvent(new CustomEvent('submit', {cancelable: true}))
    },
}

export default obj