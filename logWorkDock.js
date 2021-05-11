
(function(){
    var ready = false;
    var tid = undefined;
    var dock = undefined;
    var vdock = undefined;
    var key = undefined;
    function udock() {
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
    function createDock() {
        var d = document.createElement("DIV");
        d.className = "lwd-dock";
        return d;
    }
    function toDisplay(val) {
        if (val < 10) {
            return '0'+val;
        }
        return ''+val;
    }
    function getTz(ds) {
        return (''+ds).replace(/^.*([+-]\d+)$/, '$1');
    }
    function currentTz() {
        var tz = new Date().getTimezoneOffset();
        var sign = tz <= 0 ? '+' : '-';
        tz = Math.abs(tz);
        var hg = toDisplay(Math.floor(tz/60));
        var mg = toDisplay(tz%60);
        return sign + hg +  mg;
    }
    function t2d() {
        var dobj = new Date();
        var inMil = dobj.getTime() - dobj.getTimezoneOffset()*60000;
        return new Date(inMil).toISOString().substring(0,19);
    }
    function d2t(d, t) {
        if (true) return d + ".000" + t;
        return new Date(d + t).toISOString();
    }
    function setUpDock() {
        var dz = document.createElement("DIV");
        dock.appendChild(dz);
        dz.innerHTML = ''
            +'<div class="ear"></div>'
            +'<div class="line">'
            +   '<label>Time</label>'
            +   '<input type="text" v-model="time"/>'
            +'</div>'
            +'<div class="line">'
            +   '<label>Detail</label>'
            +   '<textarea rows="2" v-model="detail"></textarea>'
            +'</div>'
            +'<div class="line">'
            +   '<label>Begin at</label>'
            +   '<input type="text" v-model="beginAt"/>'
            +   '<span class="dive">{{tz}}</span>'
            +'</div>'
            +'<div class="line">'
            +   '<button v-if="state==\'READY\'" @click="go">OK</button>'
            +   '<button v-if="state==\'DONE\'" class="green">MISSION COMPLETED</button>'
            +   '<button v-if="state==\'FALIED\'" class="red">MISSION FALIED</button>'
            +'</div>'
        ;
        vdock = new Vue({
            el: dz,
            data: {
                time: "",
                detail: "",
                beginAt: "",
                tz: "",
                state: "READY"
            },
            mounted: function(){
                var _this = this;
                function loadBeginAt() {
                    _this.tz = currentTz();
                    _this.beginAt = t2d();
                }
                loadBeginAt();
                /*
                fetch("https://jira.axonivy.com/jira/rest/api/2/issue/"+key+"?fields=updated")
                    .then(function(rs){ return rs.json(); })
                    .then(loadBeginAt)
                    */
            },
            methods: {
                go: function() {
                    var payload = {
                        timeSpent: this.time,
                        comment: this.detail,
                        started: d2t(this.beginAt, this.tz)
                    };
                    var _this = this;
                    this.state = "MOVING";
                    fetch("https://jira.axonivy.com/jira/rest/api/2/issue/"+key+"/worklog", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    })
                        .then(function(rs){
                            if (!rs.ok) return Promise.reject();
                        })
                        .then(function(){
                                _this.state = "DONE";
                                setTimeout(udock, 2000);
                            }, function() {
                                _this.state = "FALIED";
                        });
                }
            }
        });
    }
    document.body.addEventListener("keyup", function(event){
        if (event.key == "Escape") udock();
        if (event.key == "Control") {
            if (ready) {
                if (dock) return;
                var points = document.body.querySelectorAll("[data-column-id='318'] > * > * > *:hover");
                if (points.length != 1) return;
                dock = createDock();
                var target = points[0];
                target.after(dock);
                key = target.getAttribute("data-issue-key");
                setUpDock();
            } else {
                ready = true;
                tid = setTimeout(function(){ ready = false; }, 500);
            }
        }
    });
})();

