/**
 * Generates a required field validation message.
 * Displays error message for empty required form fields.
 * @returns {string} HTML string containing required field validation span element
 */
function getFieldRequiredInfo() {
    return /*html*/ `<span id="required-mobile" class="required required--before"> This field is required</span>`
}