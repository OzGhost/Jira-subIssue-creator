'use strict';
(function(){
    if ( ! /jira\/browse\/[A-Z]+-[0-9]+/.test(window.location.href)) return;
    var idGen = (function(){
        var cid = 0;
        return function(){
            return cid++;
        };
    })();
    var tag = document.createElement('DIV');
    document.body.appendChild(tag);
    tag.id = 'bc-frame';
    tag.innerHTML = ''
        +'<div id="batch-creator">'
        +'  <button class="bc-hollow" @click="trigger"><span class="bc-icon"></span></button>'
        +'  <p class="bc-error-shell" v-if="error">'
        +'      <span class="bc-error-panel">Found projectKey=[{{ prj }}] and issueKey=[{{ issue }}]. Maybe something went wrong with one of them!</span>'
        +'  </p>'
        +'  <div class="bc-ground" v-if="extended"></div>'
        +'  <div class="bc-screen" v-if="extended">'
        +'      <div class="i-tray">'
        +'          <p class="i-tray-title">Ready sub(s)</p>'
        +'          <p class="i-empty" v-if="subs.length == 0">You are out of sub!</p>'
        +'          <div class="i-set" v-for="(sub,index) in subs" :key="sub.id">'
        +'              <input class="s-display" type="text" v-model="sub.name"/>'
        +'              <span class="bc-btn s-stat" :class="sub.stat"></span>'
        +'              <span class="bc-btn s-rm" @click="remove(index)">Kill</span>'
        +'          </div>'
        +'      </div>'
        +'      <div class="i-ctl">'
        +'          <input class="m-input" type="text" placeholder="Task\'s name" @keydown="keystroke"/>'
        +'          <button class="bc-btn m-close" @click="extended = false">Close</button>'
        +'          <button class="bc-btn m-dismiss" @click="dismiss">Dismiss</button>'
        +'          <button class="bc-btn m-submit" @click="submit">Submit</button>'
        +'      </div>'
        +'  </div>'
        +'</div>'
    ;
    
    new Vue({
        el: '#batch-creator',
        data: {
            extended: false,
            error: false,
            subs: [],
            prj: "",
            issue: ""
        },
        methods: {
            trigger: function(){
                this.prj = "";
                this.issue = "";
                if (this.extended) {
                    this.extended = false;
                } else {
                    var prjAnchor = document.getElementById('project-name-val');
                    var href = "";
                    if (prjAnchor && prjAnchor.nodeName == 'A' && prjAnchor.href) {
                        href = prjAnchor.href;
                        this.prj = href.substring(href.lastIndexOf('/')+1);
                    }
                    var issueAnchor = document.getElementById('key-val');
                    if (issueAnchor && issueAnchor.nodeName == 'A' && issueAnchor.href) {
                        href = issueAnchor.href;
                        this.issue = href.substring(href.lastIndexOf('/')+1);
                    }
                    if (this.prj && this.issue) {
                        this.extended = true;
                        this.error = false;
                    } else {
                        if (!this.error) {
                            this.error = true;
                            var ctx = this;
                            setTimeout(function(){
                                ctx.error = false;
                            }, 3000);
                        }
                    }
                }
            },
            keystroke: function(e){
                if (e.code == 'Enter') {
                    this.subs.push({
                        id: idGen(),
                        name: e.target.value,
                        stat: "still" // still | await | pass | error
                    });
                    e.target.value = null;
                }
            },
            dismiss: function() {
                this.subs = [];
            },
            submit: function() {
                var len = this.subs.length;
                var ctx = this;
                for (var i = 0; i < len; i++) {
                    var isub = this.subs[i];
                    if (isub.stat == 'await' || isub.stat == 'pass') {
                        continue;
                    }
                    (function(){
                        var sub = isub;
                        sub.stat = 'await';
                        fetch("https://jira.axonivy.com/jira/rest/api/2/issue/", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: ctx._createPayload(sub.name)
                        })
                        .then(function(rs){
                            if (rs.ok) {
                                sub.stat = "pass";
                            } else {
                                sub.stat = "error";
                            }
                        })
                        .catch(function(error){
                            console.error(error);
                            sub.stat = "error";
                        });
                        /*
                        setTimeout(function() {
                            if (Math.floor(Math.random()*2) == 0) {
                                sub.stat = "error";
                            } else {
                                sub.stat = "pass";
                            }
                        }, Math.random()*5000);
                        */
                    })();
                }
            },
            _createPayload: function(subName) {
                return '{"fields":{"project":{"key": "'
                    +this.prj+'"},"parent":{"key": "'
                    +this.issue+'"},"summary":"'+subName+'","issuetype":{"id":"8"},"customfield_11200":{"id":"10504"}}}';
            },
            remove: function(index) {
                this.subs.splice(index, 1);
            }
        }
    });
})();
