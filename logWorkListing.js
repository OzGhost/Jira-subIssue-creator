(function(){
    var uid = "nhduc";
    var qry = window.location.search;
    var args = {};
    if (qry.length) {
        qry = qry.substring(1).split('&');
        for (var i = 0; i < qry.length; i++) {
            args[qry[i]] = true;
        }
    }
    if (!args["rapidView=85"] || !args["view=planning.nodetail"]) {
        console.log("__[o0] NOT the page");
        return;
    }
    console.log("__[o0] ready");
    var ground = undefined;
    var logs = undefined;
    var msgs = undefined;
    function printMsgs() {
        return msgs.join("\n");
    };
    function toSeconds(d){
        var lastIdx = d.length - 1;
        var unit = d.charAt(lastIdx);
        var scale = 60;
        switch(unit) {
            case "h":
                scale = 3600;
            case "m":
                return scale * d.substring(0, lastIdx);
            default:
                return 3600 * d;
        }
    };
    function toLog(sid) {
        return function(sub) {
            var desc = sub.fields.description;
            var comment = sub.fields.summary;
            var barrierIdx = desc.toUpperCase().indexOf("PARTICIPANT");
            var timep = "";
            if (barrierIdx < 0) {
                timep = desc;
            } else {
                if (desc.indexOf("[~" + uid + "]") == -1) {
                    msgs.push("__[o0] Absent during: " + sid + " | " + comment);
                    return;
                }
                timep = desc.substring(0, barrierIdx);
            }
            barrierIdx = timep.indexOf(":");
            if (timep.length < 12 || barrierIdx < 10) {
                msgs.push("__[o0] Unsufficient timep <" + timep + ">: " + sid + " | " + comment);
                return;
            }
            var duration = timep.substring(barrierIdx+1, timep.length).trim();
            if ( ! /^\d+(?:\.\d+)?[hm]?$/.test(duration)) {
                msgs.push("__[o0] Unsufficient duration in <" + timep + ">: " + sid + " | " + comment);
                return;
            }
            logs.push({
                time: timep.substring(0, barrierIdx).trim(),
                duration: toSeconds(duration),
                last: duration,
                comment: comment,
                sid: sid
            });
        };
    };
    function toJson(rs) { return rs.json() };
    function picks(sid) {
        return function(subs) {
            var subps = [];
            for (var i = 0; i < subs.length; i++) {
                var sub = subs[i];
                var comment = (sub.fields.summary + "").trim();
                if ( ! comment.startsWith("[Meeting]") && ! comment.startsWith("[Code review]")) continue;
                var stat = sub.fields.status.name;
                if (stat != "Resolved") continue;
                var ps = fetch(sub.self + "?fields=description,summary")
                        .then(toJson)
                        .then(toLog(sid));
                subps.push(ps);
            }
            return Promise.all(subps);
        };
    };
    function formatDuration(d) {
        return ( + (d / 3600).toFixed(3)) + 'h';
    };
    function toCid(timestring) {
        return timestring.substring(0, 10);
    };
    function renderLogs() {
        var clusters = {};
        for (var i = 0; i < logs.length; i++) {
            var log = logs[i];
            var cid = toCid(log.time);
            var cluster = clusters[cid] || [];
            cluster.push(log);
            clusters[cid] = cluster;
        }
        var cids = Object.keys(clusters);
        cids.sort(function(a, b){ return b.localeCompare(a); });
        var output = "";
        var stotal = 0;
        for (i = 0; i < cids.length; i++) {
            cid = cids[i];
            cluster = clusters[cid];
            var ctotal = 0;
            var details = "<ul>";
            for (var j = 0; j < cluster.length; j++) {
                var d = cluster[j];
                var dc = d.sid + " | " + d.last + " : " + d.comment;
                details += '<li><p title="' + dc + '">' + dc + '</p></li>';
                ctotal += d.duration;
            }
            details += '</ul>';
            stotal += ctotal;
            var ccontent = ''
                    +'<li class="lwl-cluster">'
                        +'<div>'
                            +'<p>' + cid + '</p>'
                            +'<p>' + formatDuration(ctotal) +  '</p>'
                        +'</div>'
                        +details
                    +'</li>';
            output += ccontent;
        }
        output = '<div class="lwl-frame"><h1>- Total: '
                + formatDuration(stotal)
                + ' -</h1><pre>'
                + printMsgs()
                + '</pre><ul class="lwl-clusters">'
                + output
                +  '</ul></div>';
        ground.innerHTML = output;
    };
    function prune(sid) {
        return function(rs) {
            var records = rs.worklogs;
            for (var i = 0; i < records.length; i++) {
                var r = records[i];
                if (r.author.key != uid) {
                    continue;
                }
                logs.push({
                    time: r.started,
                    duration: r.timeSpentSeconds,
                    last: r.timeSpent,
                    comment: r.comment,
                    sid: sid
                });
            }
        };
    };
    function list(el) {
        ground = document.createElement("div");
        ground.className = "lwl-ground";
        ground.innerHTML = "<span class='lwl-gears'></span>";
        document.body.appendChild(ground);
        logs = [];
        msgs = [];

        var frame = el.parentNode.parentNode.parentNode;
        var idHolders = frame.querySelectorAll("a[href^='/jira/browse']");
        msgs.push("__[o0] # story found: " + idHolders.length);
        var i = 0;
        var id = undefined;
        var idps = [];
        for (; i < idHolders.length; i++) {
            (function(){
                id = idHolders[i].getAttribute("title");
                var worklogUrl = "https://jira.axonivy.com/jira/rest/api/2/issue/"+id+"/worklog";
                var subsUrl = "https://jira.axonivy.com/jira/rest/api/2/issue/"+id+"/subtask"; 
                idps[i] = fetch(worklogUrl)
                            .then(toJson)
                            .then(prune(id))
                            .then(function(){ return fetch(subsUrl); })
                            .then(toJson)
                            .then(picks(id));
                })();
        }
        Promise.all(idps).then(renderLogs);
    };
    function mount() {
        var sprints = document.body.querySelectorAll("div.ghx-name");
        console.log("__[o0] sprint name count: ", sprints.length);
        var i = 0;
        var sprint = undefined;
        var clever = undefined;
        for (i = 0; i < sprints.length; i++) {
            sprint = sprints[i];
            clever = document.createElement("span");
            clever.className = "lwl-lever";
            clever.addEventListener("click", function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                list(ev.target);
            });
            sprint.appendChild(clever);
        }
    };
    document.body.addEventListener("keydown", function(ev){
        if (ev.ctrlKey && ev.shiftKey && ev.key == "L") {
            mount();
        } else if (ev.key == "Escape" && ground) {
            document.body.removeChild(ground);
            ground = undefined;
            console.log("__[o0] release!");
        }
    });
})();
