(function (root) {
    var TwiWebChat = root.TwiWebChat || function TwiWebChat() {};

    // Polyfill for Object.assign for IE browsers
    if (typeof Object.assign !== 'function') {
        (function iife() {
            var ObjectHasOwnProperty = Object.prototype.hasOwnProperty;

            /**
             * Copy the values of all enumerable own properties from one source
             * object to a target object. It will return the target object.
             * @param  {Object}  target  The target object.
             * @param  {Object}  source  The source object.
             * @return  {Object}  The target object.
             */
            function shallowAssign(target, source) {
                if (target === source) return target;
                Object.keys(source).forEach(function (key) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (ObjectHasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                });
                return target;
            }

            /**
             * Copy the values of all enumerable own properties from one source
             * object to a target object. It will return the target object.
             * @param  {Object}  target  The target object.
             * @param  {Object}  source  The source object.
             * @return  {Object}  The target object.
             */
            Object.assign = function assign(target) {
                if (target === null || target === undefined) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    sources[_key - 1] = arguments[_key];
                }

                sources.forEach(function (source) {
                    if (source !== null) {
                        // Skip over if undefined or null
                        shallowAssign(Object(target), Object(source));
                    }
                });
                return target;
            };
        })();
    }

    Object.assign(TwiWebChat, require('./twilio-chat-v1'));
    root.TwiWebChat = TwiWebChat;

})(typeof window != 'undefined' ? window : global);
