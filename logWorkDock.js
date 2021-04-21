
(function(){
    var ready = false;
    var tid = undefined;
    var dock = undefined;
    var vdock = undefined;
    var key = undefined;
    function createDock() {
        var d = document.createElement("DIV");
        d.className = "lwd-dock";
        return d;
    }
    function setUpDock() {
        var dz = document.createElement("DIV");
        dock.appendChild(dz);
        dz.innerHTML = ''
            +'<div class="ear"></div>'
            +'<div class="line">'
            +   '<label>Time</label>'
            +   '<input type="text" />'
            +'</div>'
            +'<div class="line">'
            +   '<label>Detail</label>'
            +   '<textarea rows="2"></textarea>'
            +'</div>'
            +'<div class="line">'
            +   '<label>Begin at</label>'
            +   '<input type="text" />'
            +'</div>'
        ;
        vdock = new Vue({
            el: dz,
            data: {
                msg: "noYou"
            }
        });
    }
    document.body.addEventListener("keyup", function(event){
        if (event.key == "Escape") {
            key = undefined;
            if (vdock) {
                vdock.$destroy();
                vdock = undefined;
            }
            if (dock) {
                dock.remove();
                dock = undefined;
            }
        }
        if (event.key == "Control") {
            if (ready) {
                if (dock) return;
                var points = document.body.querySelectorAll("[data-column-id='318'] > *:hover");
                if (points.length != 1) return;
                dock = createDock();
                var target = points[0];
                target.after(dock);
                key = target.childNodes[0].childNodes[0].getAttribute("data-issue-key");
                // https://jira.axonivy.com/jira/rest/api/2/issue/AF-65466?fields=issuetype&fields=updated
                setUpDock();
            } else {
                ready = true;
                tid = setTimeout(function(){ ready = false; }, 200);
            }
        }
    });
})();

