
window.onload = function(){
    var items = [];
    var autoid = 0;
    var pis = document.createElement("div");
    pis.className = "pis";
    document.getElementById("fr").appendChild(pis);
    
    var shadow = document.createElement("span");
    shadow.className = "shadow";
    pis.appendChild(shadow);
    var inp = document.createElement("input");
    inp.type = "text";
    pis.appendChild(inp);
    inp.focus();

    function resize() {
        shadow.innerText = (inp.value + "").replaceAll(/\s/g, '_');
        var w = shadow.offsetWidth + "px";
        inp.style = "width:" + w;
    };
    inp.addEventListener("input", resize);
    pis.addEventListener("click", function(ev){
        inp.focus();
    });
    function removeBrick(id) {
        var ol = items;
        items = [];
        for (var i = 0; i < ol.length; i++) {
            if (ol[i].id == id) continue;
            items.push(ol[i]);
        }
    }
    function newBrick(text) {
        var t = document.createElement("span");
        t.className = "brick";
        t.appendChild(document.createTextNode(text));
        var x = document.createElement("a");
        t.appendChild(x);
        x.innerHTML = "&times;";
        x.href = "/delete";
        var i = {
            id: autoid++,
            text: text
        };
        x.addEventListener("click", function(ev){
            ev.preventDefault();
            pis.removeChild(t);
            removeBrick(i.id);
        });
        inp.before(t);
        items.push(i);
        return t;
    };
    inp.addEventListener("keydown", function(ev){
        if (ev.key == "Enter") {
            newBrick(inp.value);
            inp.value = "";
            resize();
        } else
        if (ev.key == "Backspace" && !inp.value) {
            if (!items.length) return;
            var i = items.pop();
            pis.removeChild(inp.previousSibling);
            inp.value = i.text;
            resize();
            ev.preventDefault();
        }
    });
    newBrick("Scarlet");
    newBrick("King");
};

