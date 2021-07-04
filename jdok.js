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
        bar.appendChild( createAnchor("(B)ulk", "poison_v2.png") );
        bar.appendChild( createAnchor("Cre(a)tor", "water-pollution.png") );
        bar.appendChild( createAnchor("L(w)l", "smoking.png", function(){ window.lwl && window.lwl(); }) );
        bar.appendChild( createAnchor("(C)fg", "dangerous.png") );
        dok = document.createElement("div");
        dok.className = "jdok";
        dok.appendChild(bar);
        document.body.appendChild(dok);
    };
    function createAnchor(title, icon, func) {
        var anchor = document.createElement("a");
        anchor.href = "/"+title;
        anchor.title = title;
        anchor.innerHTML = '<img src="https://github.com/OzGhost/Jira-subIssue-creator/raw/master/icons/'+icon+'"/>';
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
