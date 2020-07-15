'use strict';
(function(){
    var Configurator = function(iCollection, submitCallback) {
        let _self = this;
        _self.iCollection = iCollection || [];
        _self.shelf = undefined;
        _self.cage = undefined;
        _self.submitCallback = submitCallback;
        _self.frame = ''
                +'<div class="configurator">'
                    +'<div class="front">'
                        +'<div class="list">'
                            +'<p>Subtask name(s)</p>'
                            +'<ol id="stn">'
                            +'</ol>'
                        +'</div>'
                        +'<div class="ctrl">'
                            +'<p>Your input, sir</p>'
                            +'<input id="stn-input" type="text" placeholder="Subtask\'s name..." />'
                            +'<button id="submit" class="primitive">Save</button>'
                            +'<button id="cancel">Cancel</button>'
                        +'</div>'
                    +'</div>'
                +'</div>';

        _self.install = function() {
            let oCol = _self.iCollection;
            let len = oCol.length;
            _self.iCollection = [];
            for (let i = 0; i < len; ++i) {
                _self.iCollection.push( oCol[i] );
            }

            _self.cage = document.createElement("div");
            _self.cage.innerHTML = _self.frame;
            document.body.appendChild(_self.cage);

            _self.shelf = _self.cage.querySelector("#stn");
            if ( ! _self.shelf) return;
            len = _self.iCollection.length;
            for (let i = 0; i < len; ++i) {
                _self.putToShelf(_self.iCollection[i]);
            }

            let ip = _self.cage.querySelector("#stn-input");
            if ( ! ip) return;
            ip.addEventListener("keydown", function(e){
                if (e.code == "Enter") {
                    let val = ip.value;
                    _self.add( val );
                    ip.value = "";
                }
            });

            let submitTrigger = _self.cage.querySelector("#submit");
            if ( ! submitTrigger) return;
            submitTrigger.addEventListener("click", function(){
                _self.submitCallback && _self.submitCallback(_self.iCollection);
            });

            let cancelTrigger = _self.cage.querySelector("#cancel");
            if ( ! cancelTrigger) return;
            cancelTrigger.addEventListener("click", function(){
                document.body.removeChild(_self.cage);
            });
        };

        _self.putToShelf = function(val) {
            let li = document.createElement("li");
            li.innerHTML = val + " <span>&times;</span>"
            li.className = "isubtask";
            _self.shelf.appendChild(li);

            let trigger = li.querySelector("span");
            if ( ! trigger) return;
            trigger.addEventListener("click", function(e) {
                _self.remove( val, e.target );
            });
        };

        _self.remove = function(val, el) {
            let cc = _self.iCollection;
            _self.iCollection = [];
            let len = cc.length;
            for (let i = 0; i < len; ++i) {
                if (cc[i].toUpperCase() !== val.toUpperCase()) {
                    _self.iCollection.push(cc[i]);
                }
            }
            _self.shelf.removeChild(el.parentNode);
        };

        _self.add = function(val) {
            let valTrim = val.trim();
            if ( ! valTrim.length) return;
            let len = _self.iCollection.length;
            for (let i = 0; i < len; ++i) {
                if (valTrim.toUpperCase() === _self.iCollection[i].toUpperCase())
                    return;
            }
            _self.iCollection.push(valTrim);
            _self.putToShelf(val);
        };
    };

    var JSC = function() {
        var _self = this;
        _self.ports = [];
        _self.taskNames = [];

        _self.watch = function() {
            document.addEventListener("keydown", function(event){
                if (event.shiftKey && event.ctrlKey) {
                    if (event.code === "KeyF") {
                        _self.ports = document.querySelectorAll('span[data-fieldname="sprintName"]');
                        if (_self.ports.length) {
                            _self.nail();
                        } else {
                            _self.yell("Found no port to mount the trigger!");
                        }
                    } else if (event.code === "KeyE") {
                        _self.openConfigurator();
                    } else if (event.code === "KeyV") {
                        _self.ports = document.querySelectorAll('span[data-fieldname="sprintName"]');
                        if (_self.ports.length) {
                            _self.poisonMark();
                        } else {
                            _self.yell("Found no port to mount the trigger!");
                        }
                    }
                }
            });
        };

        _self.yell = function(msg) {
            let closeBtn = document.createElement("span");
            closeBtn.innerHTML = "&times;";
            let ae = document.createElement("DIV")
            ae.className = "alert";
            ae.appendChild(document.createTextNode(msg));
            ae.appendChild(closeBtn);
            document.body.appendChild(ae);

            let dismissCallback = function() {
                document.body.removeChild(ae);
            };

            //closeBtn.addEventListener("click", dismissCallback);
            setTimeout(dismissCallback, 3000);
        };

        _self.nail = function() {
            let len = _self.ports.length;
            for (let i = 0; i < len; i++) {
                let btn = document.createElement("btn");
                btn.className = "trigger";
                btn.addEventListener("click", function() {
                    _self.fireOn(i);
                    _self.nodeUnnail(i, btn);
                });
                _self.nodeNail(i, btn);
            }
        };

        _self.nodeNail = function(targetPortIndex, node) {
            _self.ports[targetPortIndex].parentNode.parentNode.insertBefore(
                node,
                _self.ports[targetPortIndex].parentNode.nextSibling.nextSibling
            );
        };

        _self.nodeUnnail = function(targetPortIndex, node) {
            _self.ports[targetPortIndex].parentNode.parentNode.removeChild(node);
        };

        _self.fireOn = function(targetPortIndex) {
            let target = _self.ports[targetPortIndex];
            let backlogContainer = _self.findBacklogContainer(target);
            let issueAnchors = backlogContainer.querySelectorAll("a.js-key-link");
            let len = issueAnchors.length;
            for (let i = 0; i < len; i++) {
                let iAnchor = issueAnchors[i];
                let iKey = iAnchor.title;
                _self.insertCalmDot(iAnchor);
                _self.loadRequiredInfo(iKey, function(info){
                    _self.createTaskOn(info, iKey, iAnchor);
                });
            }
            return;
        };

        _self.findBacklogContainer = function(node) {
            let headerHit = false;
            let scanningNode = node;
            while (scanningNode != null) {
                if (scanningNode.getAttribute("data-sprint-id")) {
                    if (headerHit) {
                        return scanningNode;
                    }
                    headerHit = true;
                }
                scanningNode = scanningNode.parentNode;
            }
            return undefined;
        };

        _self.loadRequiredInfo = function(iKey, riConsumer) {
            fetch("https://jira.axonivy.com/jira/rest/agile/1.0/issue/" + iKey)
                .then(function(e){ return e.json(); })
                .then(function(rs){
                    let info = {};
                    info.id = rs.id;
                    info.prjKey = rs.fields.project.key;
                    info.teamId = rs.fields.customfield_11200.id;
                    info.teamName = rs.fields.customfield_11200.value;
                    riConsumer(info);
                })
                .catch(function(e) {
                    console.error(e);
                });
        };

        _self.createTaskOn = function(info, issueKey, lightHook) {
            fetch("https://jira.axonivy.com/jira/rest/api/2/issue/"+issueKey+"/subtask")
                .then(function(rs){ return rs.json(); })
                .then(function(body) {
                    let currentSubtaskNames = _self.extractSubtaskNames(body);
                    let missingSubtaskNames = _self.collectMissingSubtaskNames(currentSubtaskNames);
                    let len = missingSubtaskNames.length;
                    if ( ! len) {
                        _self.insertNoopDot(lightHook);
                    }
                    for (let i = 0; i < len; i++) {
                        _self.shift(info, issueKey, missingSubtaskNames[i], lightHook);
                        //console.log("simulate: create task "+missingSubtaskNames[i]+" on project "+info.prjKey+" with issue key "+issueKey);
                    }
                })
                .catch(function(error){
                    console.error(error);
                    _self.insertFailureDot(lightHook);
                });
        };

        _self.extractSubtaskNames = function(response) {
            let subtaskNames = [];
            for (let i = 0; i < response.length; i++) {
                subtaskNames.push(response[i].fields.summary);
            }
            return subtaskNames;
        };

        _self.collectMissingSubtaskNames = function(existingSubtaskNames) {
            let missingSubtaskNames = [];
            for (let i = 0; i < _self.taskNames.length; i++) {
                let checkingTaskName = _self.taskNames[i];
                let checkingTaskNameCooked = _self.cook(checkingTaskName);
                let found = false;
                for (let j = 0; j < existingSubtaskNames.length; j++) {
                    if (_self.cook( existingSubtaskNames[j] ).includes( checkingTaskNameCooked )) {
                        found = true;
                        break;
                    }
                }
                if ( ! found) {
                    missingSubtaskNames.push(checkingTaskName);
                }
            }
            return missingSubtaskNames;
        };

        _self.cook = function(input) {
            return input.toUpperCase().replace(/\s/g, '');
        };

        _self.shift = function(info, issueKey, taskName, lightHook) {
            fetch("https://jira.axonivy.com/jira/rest/api/2/issue/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: _self.createPayloadToAddIssue(info, issueKey, taskName)
            })
                .then(function(rs){
                    if (rs.ok) {
                        _self.insertSuccessDot(lightHook);
                    } else {
                        _self.insertFailureDot(lightHook);
                    }
                })
                .catch(function(error){
                    console.error(error);
                    _self.insertFailureDot(lightHook);
                });
        };

        _self.createPayloadToAddIssue = function(info, issueKey, taskName) {
            return '{"fields":{"project":{"key": "'+info.prjKey+'"},"parent":{"key": "'
                +issueKey+'"},"summary":"'+taskName+'","issuetype":{"id":"8"},"customfield_11200":{"id":"'+info.teamId+'"}}}';
        };

        _self.insertFailureDot = function(container) {
            _self.insertDot(container, "failure");
        };

        _self.insertSuccessDot = function(container) {
            _self.insertDot(container, "success");
        };

        _self.insertNoopDot = function(container) {
            _self.insertDot(container, "noop");
        };

        _self.insertCalmDot = function(container) {
            _self.insertDot(container, "calm");
        };

        _self.insertDot = function(container, type) {
            let leave = container.childNodes;
            let len = leave.length;
            for (let i = 0; i < len; ++i) {
                if (leave[i].className === "dot calm") {
                    container.removeChild(leave[i]);
                    break;
                }
            }
            let dot = document.createElement("i");
            dot.className = "dot " + type;
            container.appendChild(dot);
        };

        _self.setTasksToCreate = function(taskNames) {
            _self.taskNames = taskNames;
        };

        _self.openConfigurator = function() {
            new Configurator(_self.taskNames, function(iCollection){
                chrome.storage.local.set({"cfg": iCollection}, function() {
                    window.location.reload();
                });
            }).install();
        };
        
        _self.poisonMark = function() {
            let len = _self.ports.length;
            for (let i = 0; i < len; i++) {
                let ready = false;
                let btn = document.createElement("btn");
                btn.className = "poisonmark";
                btn.addEventListener("click", function() {
                    if (ready) {
                        _self.nodeUnnail(i, btn);
                    } else {
                        btn.className = "poisonmark active";
                        _self.bulkMark(i);
                    }
                    ready = true;
                    //_self.fireOn(i);
                });
                _self.nodeNail(i, btn);
            }
        };

        _self.bulkMark = function(targetPortIndex) {
            let target = _self.ports[targetPortIndex];
            let backlogContainer = _self.findBacklogContainer(target);
            let issueAnchors = backlogContainer.querySelectorAll("a.js-key-link");
            let len = issueAnchors.length;
            for (let i = 0; i < len; i++) {
                let iAnchor = issueAnchors[i];
                let iKey = iAnchor.title;
                let icon = _self.imark(iAnchor);
                icon.addEventListener("click", function(e){
                    e && e.preventDefault();
                    e && e.stopPropagation();
                    iAnchor.removeChild(icon);
                    _self.insertStick(iAnchor, "calm");
                });
                //_self.loadRequiredInfo(iKey, function(info){
                    //_self.createTaskOn(info, iKey, iAnchor);
                //});
            }
            return;
        };

        _self.imark = function(container) {
            let t = document.createElement("btn");
            t.className = "poisonmark active sub";
            container.appendChild(t);
            return t;
        };

        _self.insertStick = function(container, type) {
            let dot = document.createElement("i");
            dot.className = "stick " + type;
            container.appendChild(dot);
        };
    };

    // load stored configuration
    chrome.storage.local.get(["cfg"], function(storage) {
        var rawCfg = storage.cfg || {};
        var myApp = new JSC();
        myApp.setTasksToCreate(rawCfg);
        myApp.watch();
    });

})();
