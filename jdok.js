(function(){
    document.body.addEventListener('keydown', function(ev){
        if (ev.ctrlKey && ev.shiftKey && ev.key == "L") {
            console.log("__[o0] matched");
            mount();
        }
        if (ev.key == "Escape" && ground) {
        }
    });
    var dok = undefined;
    var bar = undefined
    function mount() {
        /**
                <a href="#" title="B(u)lk"><img src="icons/poison_v2.png"/></a>
                <a href="#" title="Cre(a)tor"><img src="icons/water-pollution.png"/></a>
                <a href="#" title="Lw(l)"><img src="icons/smoking.png"/></a>
                <a href="#" title="Cf(g)"><img src="icons/dangerous.png"/></a>
        */
        bar = document.createElement("div");
        bar.className = "jbar";
        bar.appendChild( createAnchor("B(u)lk", "poison_v2.png") );
        bar.appendChild( createAnchor("Cre(a)tor", "water-pollution.png") );
        bar.appendChild( createAnchor("Lw(l)", "smoking.png") );
        bar.appendChild( createAnchor("C(f)g", "dangerous.png") );
        dok = document.createElement("div");
        dok.className = "jdok";
        dok.appendChild(bar);
        document.body.appendChild(dok);
    };
    function createAnchor(title, icon) {
        var anchor = document.createElement("a");
        anchor.href = "/"+title;
        anchor.title = title;
        anchor.innerHTML = '<img src="https://github.com/OzGhost/Jira-subIssue-creator/raw/master/icons/'+icon+'"/>';
        anchor.addEventListener("click", function(ev){
            ev.preventDefault();
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
