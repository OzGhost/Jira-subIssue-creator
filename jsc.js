'use strict';
(function(){
    var app = function() {
        var _self = this;
        _self.ports = [];
        _self.taskNames = [];
        _self.countDown = 10;

        _self.watch = function() {
            document.addEventListener("keydown", function(event){
                if (event.code === "KeyF" && event.shiftKey && event.ctrlKey) {
                    _self.ports = document.querySelectorAll('span[data-fieldname="sprintName"]');
                    if (_self.ports.length) {
                        _self.nail();
                    } else {
                        _self.yell("Found no port to mount the trigger!");
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
                _self.ports[targetPortIndex].parentNode.nextSibling.nextSibling);
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
                    _self.createTaskOn(info.prjKey, iKey, iAnchor);
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

        _self.createTaskOn = function(projectKey, issueKey, lightHook) {
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
                        //_self.shift(projectKey, issueKey, missingSubtaskNames[i], lightHook);
                        console.log("simulate: create task "+missingSubtaskNames[i]+" on project "+projectKey+" with issue key "+issueKey);
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

        _self.shift = function(projectKey, issueKey, taskName, lightHook) {
            fetch("https://jira.axonivy.com/jira/rest/api/2/issue/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: _self.createPayloadToAddIssue(projectKey, issueKey, taskName)
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

        _self.createPayloadToAddIssue = function(projectKey, issueKey, taskName) {
            return '{"fields":{"project":{"key": "'+projectKey+'"},"parent":{"key": "'
                +issueKey+'"},"summary":"'+taskName+'","issuetype":{"id":"8"},"customfield_11200":{"id":"10504"}}}';
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

    };

    // load stored configuration
    chrome.storage.local.get(["cfg"], function(storage) {
        var rawCfg = storage.cfg || {};
        var myApp = new app();
        myApp.setTasksToCreate(["Sonar", "Crosscheck"]);
        myApp.watch();
    });

})();
