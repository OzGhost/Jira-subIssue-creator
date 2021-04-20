
(function(){
    var ready = false;
    var tid = undefined;
    var target = undefined;
    var activated = false;
    var dock = undefined;
    function mountOn(){
        var points = document.body.querySelectorAll("[data-column-id='318'] > *");
        for (var i = 0; i < points.length; i++) {
            (function(){
                var p = points[i];
                p.addEventListener("mouseover", function(){
                    target = p;
                });
            })();
        }
    };
    setTimeout(mountOn, 1500);
    document.body.addEventListener("keyup", function(event){
        if (event.key == "Escape") {
            activated = false;
            if (!dock) return;
            dock.remove();
        }
        if (event.key == "Control") {
            if (ready) {
                if (!target) return;
                if (activated) return;
                activated = true;
                dock = document.createElement("DIV");
                dock.className = "lwd-dock";
                target.after(dock);
            } else {
                ready = true;
                tid = setTimeout(function(){ ready = false; }, 200);
            }
        }
    });
})();

