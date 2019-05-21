'use strict';
(function(){
  var app = function() {
    var _self = this;
    _self.ports = [];
    _self.taskNames = [];
    _self.countDown = 10;
    _self.currentWrapper = {};

    _self.watch = function() {
      _self.ports = document.querySelectorAll('span[data-fieldname="sprintName"]');
      if (_self.ports.length) {
        _self.nail();
      } else {
        _self.countDown--;
        if (_self.countDown < 0) {
          _self.yell("Found no port to mount the trigger!");
        } else {
          setTimeout(_self.watch, 1000);
        }
      }
    };

    _self.yell = function(msg) {
      let closeBtn = document.createElement("span");
      closeBtn.innerHTML = "&times;";
      let ae = document.createElement("DIV")
      ae.className = "alert";
      ae.appendChild(document.createTextNode(msg));
      ae.appendChild(closeBtn);
      closeBtn.addEventListener("click", function(){
        document.body.removeChild(ae);
      });
      document.body.appendChild(ae);
    };

    _self.nail = function() {
      let len = _self.ports.length;
      for (let i = 0; i < len; i++) {
        let btn = document.createElement("btn");
        btn.className = "trigger";
        btn.addEventListener("click", function() {
          _self.fireOn(i);
          _self.nodeUnnail(i, btn);
          _self.currentWrapper = _self.ports[i].parentNode.parentNode.parentNode.parentNode;
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
      let pid = target.parentNode.parentNode.getAttribute("data-sprint-id");
      //let sprintName = target.getAttribute("data-fieldvalue");
      fetch("https://jira.axonivy.com/jira/rest/agile/1.0/sprint/"+pid+"/issue?jql=issueType%3DBug%20or%20issueType%3DStory")
      .then(function(response){
        return response.json();
      })
      .then(function(json){
        let issues = json.issues;
        let len = issues.length;
        for (let i = 0; i < len; i++) {
          let issue = issues[i];
          _self.createTaskOn(issue.fields.project.key, issue.key, targetPortIndex);
        }
      });
    };

    _self.insertSuccessDot = function(container) {
      let dot = document.createElement("i");
      dot.className = "dot success";
      container.appendChild(dot);
    };

    _self.insertFailureDot = function(container) {
      let dot = document.createElement("i");
      dot.className = "dot failure";
      container.appendChild(dot);
    };

    _self.createTaskOn = function(projectKey, issueKey, targetPortIndex) {
      let ik = 'a[href$="' + issueKey + '"]';
      let oe = _self.currentWrapper
              && _self.currentWrapper.querySelector;
      if (oe) {
        oe = _self.currentWrapper.querySelector(ik);
      }
      if (oe) {
        for (let i = 0; i < _self.taskNames.length; i++) {
          fetch("https://jira.axonivy.com/jira/rest/api/2/issue/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: _self.createPayloadToAddIssue(projectKey, issueKey, _self.taskNames[i])
          })
          .then(function(rs){
            if (rs.ok) {
              _self.insertSuccessDot(oe);
            } else {
              _self.insertFailureDot(oe);
            }
          })
          .catch(function(error){
            console.log(error);
            _self.insertFailureDot(oe);
          });
        }
      }
    };

    _self.createPayloadToAddIssue = function(projectKey, issueKey, taskName) {
      return '{"fields":{"project":{"key": "'+projectKey+'"},"parent":{"key": "'+issueKey+'"},"summary":"'+taskName+'","issuetype":{"id":"8"}}}';
    };

    _self.setTasksToCreate = function(taskNames) {
      _self.taskNames = taskNames;
    };

  };

  // load stored configuration
  chrome.storage.local.get(["cfg"], function(storage) {
    var rawCfg = storage.cfg || {};
    var myApp = new app();
    myApp.setTasksToCreate(["Sonar?", "Crosscheck"]);
    myApp.watch();
  });
})();
