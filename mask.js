
(function(){
    "use strict";
    var activated = false;
    var oldstyle = "";
    window.mask = function() {
        var el = document.getElementById("ghx-pool");
        if ( ! el) {
            return {
                msg: "Pool not available!"
            };
        }
        console.log(el.getAttribute('style'));
        if (activated) {
            activated = false;
            el.setAttribute('style', null);
        } else {
            el.style.position = 'fixed';
            el.style['z-index'] = '2900';
            el.style.top = '0';
            el.style.bottom = '0';
            el.style.left = '0';
            el.style.right = '0';
            el.style.height = 'unset';
            el.style.overflow = 'auto';
            activated = true;
        }
    };
})();

