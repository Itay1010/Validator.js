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
        const sibling = ev.target.nextElementSibling
        if(!sibling?.classList.contains(this.selectorUnique)) {
            ev.target.insertAdjacentHTML('afterEnd', `<div class="${this.selector} ${this.selectorUnique}">${ev.target.validationMessage}</div>`)
        }
    },

    setCssCustomProps() {
        Object.keys(this.cssProps).forEach(key => {
            this.context.form.style.setProperty('--'+key, this.cssProps[key])
        })
        this.context.form.classList.add(this.selectorForFeedback)
    },
}