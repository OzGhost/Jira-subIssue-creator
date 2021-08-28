'use strict';
(function(){
    window.gcf = function(){
        var id = "gcf-frame";
        if (document.getElementById(id)) {
            return { msg: "Cfg mounted ..." };
        }
        var frame = document.createElement("div");
        frame.id = id;
        document.body.appendChild(frame);
        function umount() {
            document.body.removeChild(frame);
        };
        function newTag(name) {
            var t = document.createElement(name);
            frame.appendChild(t);
            return t;
        };
        var t = undefined;
        t = newTag("h2");
        t.className = "head";
        t.innerHTML = "Lwl configuration";
        t = newTag("label");
        t.innerHTML = "Short name";
        var sname = newTag("input");
        sname.type = "text";
        t = newTag("label");
        t.innerHTML = "Display name";
        var dname = newTag("input");
        dname.type = "text";
        newTag("br");
        t = newTag("button");
        t.innerHTML = "Save";
        t.addEventListener("click", function(){
            var cfg = {
                lwl: {
                    shortName: sname.value,
                    displayName: dname.value
                }
            };
            chrome.storage.local.set({"gcf": cfg}, function() {
                umount();
            });
        });
        t = newTag("button");
        t.innerHTML = "Reset";
        function reset() {
            getCfg()
                .then(function(cfg){
                    var lwl = cfg.lwl || {};
                    sname.value = lwl.shortName || '';
                    dname.value = lwl.displayName || '';
                });
        };
        t.addEventListener("click", reset);
        reset();
    };
    function getCfg() {
        return new Promise(function(resolve, reject){
            chrome.storage.local.get(["gcf"], function(storage) {
                var rawCfg = storage.gcf || {};
                resolve(rawCfg);
            });
        });
    };
    window.gcfpull = getCfg;
})();

