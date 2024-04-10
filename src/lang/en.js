export const _dev_errors_ = {
    noTarget: 'Root form element can\'t be found',
    notNew: 'Function must be called with a the "new" keyword',
    incorrectMatchesKey: 'Some or all of the provided values of the option "matches" are not supported',
    noValidationMessage: 'Custom validation not coming from HTML Form must have an error message. Please set an error message from the constructor or the element\'s "data-" attribute. ',
}

export const _default_errors_ = {
    badInput:  "Please fill out this field",
    valueMissing: 'Please fill out this field',
    patternMismatch:  "Please match the requested format",
    rangeOverflow:  "Value must be between [min] and [max]",
    rangeUnderflow:  "Value must be between [min] and [max]",
    stepMismatch:  "Please enter a valid value",
    tooLong:  "Input must be between [min] and [max] characters",
    tooShort:  "Input must be between [min] and [max] characters",
    typeMismatch:  {
        email: 'Please enter a valid email address',
        tal: 'Please enter a valid phone number',
        number: 'Please enter a valid number',
        file: 'Unsupported file type. Please select a valid file type',
        date: 'Please enter a valid date',

    },
}