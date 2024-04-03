import '../assets/scss/feedback.scss'

export const feedback = {
    selector: 'feedback',
    selectorUnique: 'feedback-' + btoa(Date.now() + ''),
    selectorForFeedback: 'feedback-form-selector',
    get cssProps() {
        return {'feedback-selector': this.selectorUnique, 'error-color': 'red'}
    },
    init(context) {
        this.context = context
        this.bindListenerFnThisValue()
        this.listeners()
        this.setCssCustomProps()
    },

    bindListenerFnThisValue() {
        this.onInvalid = this.onInvalid.bind(this)
    },

    listeners() {
        this.context.form.addEventListener('invalid', this.onInvalid, true)
    },

    onInvalid(ev) {
        const {target} = ev
        const sibling = target.nextElementSibling
        //Timeout 0 used to keep the value of "target.validationMessage" up to date
        setTimeout(() => {
            if(!sibling?.classList.contains(this.selectorUnique)) {
                target.insertAdjacentHTML('afterEnd', `<div class="${this.selector} ${this.selectorUnique}">${target.validationMessage}</div>`)
            }
        }, 0)
    },

    setCssCustomProps() {
        Object.keys(this.cssProps).forEach(key => {
            this.context.form.style.setProperty('--' + key, this.cssProps[key])
        })
        this.context.form.classList.add(this.selectorForFeedback)
    },
}