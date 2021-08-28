(function(){
    "use strict";
    var did = undefined;
    var uid = undefined;
    var ground = undefined;
    var logs = undefined;
    var msgs = undefined;
    var ss = undefined;
    var as = undefined;
    var ps = undefined;
    var hook = undefined;
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
    function toLog(sub) {
        var sid = sub.key;
        var desc = sub.fields.description || '';
        var comment = sub.fields.summary;
        var barrierIdx = desc.toUpperCase().indexOf("PARTICIPANT");
        var timep = "";
        if (barrierIdx >= 0) {
            if (desc.indexOf(uid) == -1) {
                msgs.push("__[o0] Absent during: " + sid + " | " + comment);
                console.log("__[o0] Absent sub: ", sub);
                return;
            }
        }
        var matched = desc.match(/(\d{4}-\d\d-\d\d):\s*(\d+(?:\.\d+)?[mh]?)/);
        if ( ! matched) {
            msgs.push("__[o0] no time found: " + sid + " | " + comment);
            return;
        }
        logs.push({
            time: matched[1],
            duration: toSeconds(matched[2]),
            last: matched[2],
            comment: comment,
            sid: sid
        });
    };
    function toJson(rs) { return rs.json() };
    function picks(subs) {
        for (var i = 0; i < subs.length; i++) {
            var sub = subs[i];
            var comment = (sub.fields.summary + "").trim();
            if ( ! comment.startsWith("[Meeting]") && ! comment.startsWith("[Code review]")) continue;
            var stat = sub.fields.status.name;
            if (stat != "Resolved") continue;
            toLog(sub);
        }
    };
    function formatDuration(d) {
        return Math.round((d / 3600)) + 'h' + Math.round((d%3600)/60) + 'm';
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
        var goner = document.createElement("a");
        goner.innerHTML = "&times;";
        goner.href = "/dismiss";
        goner.className = "lwl-goner";
        goner.addEventListener("click", function(ev) {
            ev.preventDefault();
            document.body.removeChild(ground);
            ground = undefined;
            console.log("__[o0] dismiss lwl ...");
        });
        ground.childNodes[0].appendChild(goner);
    };
    function prune(sid) {
        return function(rs) {
            var records = rs.worklogs;
            for (var i = 0; i < records.length; i++) {
                var r = records[i];
                if (r.author.displayName != did) {
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
    function listAll(ids) {
        msgs.push("__[o0] # story found: " + ids.length);
        var i = 0;
        var idps = [];
        for (var i = 0; i < ids.length; i++) {
            (function(){
                var id = ids[i];
                var worklogUrl = "https://axonivy.atlassian.net/rest/api/2/issue/"+id+"/worklog";
                //var subsUrl = "https://axonivy.atlassian.net/rest/api/2/issue/"+id+"/subtask"; 
                idps[i] = fetch(worklogUrl)
                            .then(toJson)
                            .then(prune(id));
                            //.then(function(){ return fetch(subsUrl); })
                            //.then(toJson)
                            //.then(picks(id));
            })();
        }
        Promise.all(idps).then(renderLogs, function(err){ console.log("__[xx] crashed: ", err); });
    };
    function prepareGround() {
        if (ground) document.body.removeChild(ground);
        ground = document.createElement("div");
        ground.className = "lwl-ground";
        ground.innerHTML = "<span class='lwl-gears'></span>";
        document.body.appendChild(ground);
        logs = [];
        msgs = [];
    }
    function list(el) {
        prepareGround();
        var frame = el.parentNode.parentNode.parentNode;
        var idHolders = frame.querySelectorAll("a[href^='/jira/browse']");
        var ids = [];
        for (var i = 0; i < idHolders.length; i++) {
            ids.push( idHolders[i].getAttribute("title") );
        }
        listAll(ids);
    };
    function mount() {
        var sprints = document.body.querySelectorAll("div.ghx-name");
        console.log("__[o0] sprint name count: ", sprints.length);
        var i = 0;
        var sprint = undefined;
        var clever = undefined;
        for (i = 0; i < sprints.length; i++) {
            sprint = sprints[i];
            clever = document.createElement("a");
            clever.className = "lwl-lever";
            clever.href = "#";
            clever.addEventListener("click", function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                list(ev.target);
            });
            sprint.appendChild(clever);
        }
    };

    window.lwl = function() {
        if (typeof window.gcfpull != 'function') {
            return { msg: "Cfg module is mising!" };
        }
        window.gcfpull()
            .then(function(cfg){
                var lwl = cfg.lwl || {};
                did = lwl.displayName;
                uid = lwl.shortName;
                init();
            });
    };

    function init() {
        var qry = window.location.search;
        var args = {};
        if (qry.length) {
            qry = qry.substring(1).split('&');
            for (var i = 0; i < qry.length; i++) {
                args[qry[i]] = true;
            }
        }
        if (args["rapidView=85"] && args["view=planning.nodetail"]) {
            mount();
        }
        (function(){
            if (ss) {
                createHook();
                return;
            }
            ss = [];
            function next(rs) {
                var url = "https://axonivy.atlassian.net/rest/agile/1.0/board/16/sprint?startAt=";
                if (rs) {
                    console.log("__[o0] next ...");
                    url += (rs.maxResults + rs.startAt);
                    for (var i = 0; i < rs.values.length; i++) {
                        var item = rs.values[i];
                        ss.unshift({id: item.id, name: item.name});
                        if (item.state == 'active') {
                            as = {id: item.id, name: item.name};
                            ps = as;
                        }
                    }
                    if (rs.isLast) {
                        createHook();
                        return;
                    }
                } else {
                    url += 140;
                }
                fetch(url).then(toJson).then(next, function(){ console.error("__[xx]"); });
            };
            next();
        })();
    };
    function createHook() {
        if (hook) return;
        var opening = false;
        ps = as;
        var h = document.createElement("div");
        hook = h;
        var ali = undefined;
        var u = document.createElement("ul");
        var p = document.createElement("a");
        p.href = "/pick";
        p.className = "selection";
        p.innerText = (as && as.name) || "Pick a sprint, please!";
        p.addEventListener("click", function(ev){
            ev.preventDefault();
            opening = !opening;
            u.className = opening ? "open" : "";
        });
        for (var j = 0; j < ss.length; j++) {
            (function(){
                var ci = ss[j];
                var li = document.createElement("li");
                li.innerText = ci.name;
                if (as && ci.id == as.id) {
                    li.className = "light";
                    ali = li;
                }
                li.addEventListener("click", function(ev) {
                    if (ali) {
                        ali.className = "";
                    }
                    ali = ev.target;
                    ali.className = "light";
                    ps = ci;
                    p.innerText = ci.name;
                    u.className = "";
                    opening = false;
                });
                u.appendChild(li);
            })();
        }
        var g = document.createElement("a");
        g.href = "/go";
        g.className = "action";
        g.innerText = "Go";
        g.addEventListener("click", function(ev){
            ev.preventDefault();
            opening = false;
            u.className = "";
            fetchPickedSprint();
        });
        var d = document.createElement("a");
        d.href = "/dismiss";
        d.innerHTML = "&times;";
        d.addEventListener("click", function(ev){
            ev.preventDefault();
            document.body.removeChild(h);
            hook = undefined;
        });
        var i = document.createElement("input");
        i.id = "lwl-hook-picker";
        i.type = "checkbox";

        h.className = "lwl-hook";
        h.appendChild(p);
        h.appendChild(g);
        h.appendChild(d);
        h.appendChild(u);
        document.body.appendChild(h);
    };
    function fetchPickedSprint() {
        console.log("__[o0] ps: ", ps);
        if ( ! ps) return;
        prepareGround();
        var url = "https://axonivy.atlassian.net/rest/agile/1.0/sprint/"+ps.id+"/issue?fields=issuetype,description,summary,status";
        var total = 0;
        var count = 0;
        var ids = [];
        var subs = [];
        fetch(url)
        .then(toJson)
        .then(function(rs){
            total = rs.total;
            count += rs.issues.length;
            function collect(items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].fields.issuetype.subtask) {
                        if (items[i].fields.description) {
                            subs.push(items[i]);
                        }
                    } else {
                        ids.push(items[i].key);
                    }
                }
            }
            collect(rs.issues);
            var times = Math.floor(rs.total / rs.maxResults);
            if (times * rs.maxResults != rs.total) times++;
            var fps = [];
            for (var i = 1; i < times; i++) {
                fps[i] = fetch(url + "&startAt=" + (i*rs.maxResults))
                .then(toJson)
                .then(function(x){
                    count += x.issues.length;
                    console.log("__[o0] count: ", count, total);
                    collect(x.issues);
                });
            }
            Promise.all(fps).then(function(){
                listAll(ids);
                picks(subs);
            });
        });
    }
})();

