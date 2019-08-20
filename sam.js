
var Configurator = function(iCollection, submitCallback) {
    let _self = this;
    _self.iCollection = iCollection || [];
    _self.shelf = undefined;
    _self.cage = undefined;
    _self.submitCallback = submitCallback;
    _self.frame = ''
        +'<div class="configurator">'
            +'<div class="front">'
                +'<div class="list">'
                    +'<p>Subtask name(s)</p>'
                    +'<ol id="stn">'
                    +'</ol>'
                +'</div>'
                +'<div class="ctrl">'
                    +'<p>Your input, sir</p>'
                    +'<form id="input-form"><input type="text" placeholder="Subtask\'s name..." /></form>'
                    +'<button id="submit" class="primitive">Save</button>'
                    +'<button id="cancel">Cancel</button>'
                +'</div>'
            +'</div>'
        +'</div>';

    _self.install = function() {
        _self.cage = document.createElement("div");
        _self.cage.innerHTML = _self.frame;
        document.body.appendChild(_self.cage);

        _self.shelf = _self.cage.querySelector("#stn");
        if ( ! _self.shelf) return;
        let len = _self.iCollection.length;
        for (let i = 0; i < len; ++i) {
            _self.putToShelf(_self.iCollection[i]);
        }

        let fr = _self.cage.querySelector("form#input-form");
        if ( ! fr) return;
        let ip = fr.querySelector("input");
        if ( ! ip) return;
        fr.addEventListener("submit", function(e){
            e.preventDefault();
            let val = ip.value;
            _self.add( val );
            ip.value = "";
        });

        let submitTrigger = _self.cage.querySelector("#submit");
        if ( ! submitTrigger) return;
        submitTrigger.addEventListener("click", function(){
            _self.submitCallback && _self.submitCallback(_self.iCollection);
        });

        let cancelTrigger = _self.cage.querySelector("#cancel");
        if ( ! cancelTrigger) return;
        cancelTrigger.addEventListener("click", function(){
            document.body.removeChild(_self.cage);
        });
    };

    _self.putToShelf = function(val) {
        let li = document.createElement("li");
        li.innerHTML = val + " <span>&times;</span>"
        li.className = "isubtask";
        _self.shelf.appendChild(li);

        let trigger = li.querySelector("span");
        if ( ! trigger) return;
        trigger.addEventListener("click", function(e) {
            _self.remove( val, e.target );
        });
    };

    _self.remove = function(val, el) {
        let cc = _self.iCollection;
        _self.iCollection = [];
        let len = cc.length;
        for (let i = 0; i < len; ++i) {
            if (cc[i].toUpperCase() !== val.toUpperCase()) {
                _self.iCollection.push(cc[i]);
            }
        }
        _self.shelf.removeChild(el.parentNode);
    };

    _self.add = function(val) {
        let valTrim = val.trim();
        let len = _self.iCollection.length;
        for (let i = 0; i < len; ++i) {
            if (valTrim.toUpperCase() === _self.iCollection[i].toUpperCase())
                return;
        }
        _self.iCollection.push(valTrim);
        _self.putToShelf(val);
    };
};

var cfg = new Configurator(["Sonar", "Crosscheck"], function(col) { console.log(col) });
cfg.install();

