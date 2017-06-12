function DOMUtility() {

}
/**
 * Create HTML Element
 *
 * @param el
 */
DOMUtility.prototype.ce = function (e) {
    return document.createElement(e);
}

/**
 * Get element by ID
 *
 * @param el
 * @return
 */
DOMUtility.prototype.e = function (el) {
    if (typeof el == 'string') {
        return document.getElementById(el);
    }
    return el;
}

/**
 * Remove element
 *
 * @param el
 */
DOMUtility.prototype.r = function (el) {
    var ee = this.e(el);
    ee.parentNode.removeChild(ee);
}

/**
 * Hide element
 *
 * @param el
 */
DOMUtility.prototype.hide = function (el) {
    this.e(el).style.display = 'none';
}

/**
 * Show element
 *
 * @param el
 */
DOMUtility.prototype.s = function (el) {
    this.e(el).style.display = '';
}

/**
 * Bind Event listener
 *
 * @param el
 * @param name
 * @param func
 */
DOMUtility.prototype.bind = function (el, name, func) {
    var ee = this.e(el);
    if (!ee) {
        return;
    }

    if (ee.addEventListener) {
        ee.addEventListener(name, func, null);
    }
    else if (ee.attachEvent) {
        ee.attachEvent('on' + name, func);
    }
}

/**
 * Unbind Event listener
 *
 * @param el
 * @param name
 * @param func
 */
DOMUtility.prototype.unbind = function (el, name, func) {
    var ee = this.e(el);
    if (!ee) {
        return;
    }

    if (ee.removeEventListener) {
        ee.removeEventListener(name, func, null);
    }
    else if (ee.detachEvent) {
        ee.detachEvent('on' + name, func);
    }
}

//exports.DOMUtility = DOMUtility;
module.exports = DOMUtility;
