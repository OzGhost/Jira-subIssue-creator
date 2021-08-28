(function(){
    var dok = undefined;
    var bar = undefined;
    var tray = undefined;
    var traytime = undefined;
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
        }
    });
    function omodule(name) {
        return function(){
            console.log("__[o0] open " + name + " ...");
            var rs = (typeof window[name] == 'function') && window[name]();
            if (rs && rs.msg) {
                pushMsg(rs.msg);
            }
        };
    };
    function pushMsg(msg) {
        var t = document.createElement("p");
        t.innerHTML = msg;
        tray.appendChild(t);
        clearTimeout(traytime);
        traytime = setTimeout(function(){ tray.innerHTML = "" }, 3000);
    };
    function mount() {
        if (dok) {
            console.log("__[o0] docked !!!");
            return;
        }
        console.log("__[o0] docking ...");
        bar = document.createElement("div");
        bar.className = "jbar";
        bar.appendChild( createAnchor("(B)ulk", "poison_v2", omodule("bulkc")) );
        //bar.appendChild( createAnchor("Cre(a)tor", "water-pollution") );
        bar.appendChild( createAnchor("L(w)l", "smoking", omodule("lwl")) );
        bar.appendChild( createAnchor("(C)fg", "dangerous", omodule("gcf")) );
        dok = document.createElement("div");
        dok.className = "jdok";
        dok.appendChild(bar);
        tray = document.createElement("div");
        tray.className = "jtray";
        dok.appendChild(tray);
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

