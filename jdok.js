(function(){
    var dok = undefined;
    var bar = undefined
    document.body.addEventListener('keydown', function(ev){
        if (ev.ctrlKey && ev.shiftKey && ev.key == "L") {
            mount();
            return;
        }
        if ( ! dok) {
            return;
        }
        console.log("__[o0] encounter:", ev.key);
        switch (ev.key) {
            case "Escape":
                console.log("__[o0] dedocking ...");
                return umount();
            case "w":
                console.log("__[o0] open lwl ...");
                return window.lwl && window.lwl();
        }
    });
    function mount() {
        if (dok) {
            console.log("__[o0] docked !!!");
            return;
        }
        console.log("__[o0] docking ...");
        bar = document.createElement("div");
        bar.className = "jbar";
        bar.appendChild( createAnchor("(B)ulk", "poison_v2") );
        bar.appendChild( createAnchor("Cre(a)tor", "water-pollution") );
        bar.appendChild( createAnchor("L(w)l", "smoking", function(){ window.lwl && window.lwl(); }) );
        bar.appendChild( createAnchor("(C)fg", "dangerous") );
        dok = document.createElement("div");
        dok.className = "jdok";
        dok.appendChild(bar);
        document.body.appendChild(dok);
    };
    function createAnchor(title, icon, func) {
        var anchor = document.createElement("a");
        anchor.href = "/"+title;
        anchor.title = title;
        var img = document.createElement('img');
        img.src = window.icstore(icon);
        anchor.append(img);
        anchor.addEventListener("click", function(ev){
            ev.preventDefault();
            func && func();
        });
        return anchor;
    };
    function umount() {
        if (dok) {
            document.body.removeChild(dok);
            dok = undefined;
        }
    };
})();
