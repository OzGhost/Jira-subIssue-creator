'use strict';
window.bulkc = function(){
    if ( ! /\/browse\/[A-Z]+-[0-9]+/.test(window.location.href)) return { msg: "Only work on story browsing page ..." };
    if (document.getElementById("bc-frame")) {
        return { msg: "Bulk mounted ..." };
    }
    var prj = "";
    var issue = "";
    function trigger(){
        var prjAnchor = document.getElementById("jira-issue-header").querySelectorAll("a")[1];
        if (prjAnchor && prjAnchor.href) {
            var href = prjAnchor.href;
            prj = href.substring(href.lastIndexOf('/')+1);
        }
        var path = window.location.pathname;
        issue = path.substring(path.lastIndexOf('/')+1);
    };
    trigger();
    if ( !prj || !issue ) {
        return { msg: "Either project name or issue name cannot be found!" };
    }
    var idGen = (function(){
        var cid = 0;
        return function(){
            return cid++;
        };
    })();
    var tag = document.createElement('DIV');
    document.body.appendChild(tag);
    function umount(){ document.body.removeChild(tag) };
    tag.id = 'bc-frame';
    tag.innerHTML = ''
        +'<div id="batch-creator">'
        +'  <div class="bc-screen" :class="{ghost: ghostMode}">'
        +'      <div class="i-head">'
        +'          <p>'
        +'              Ready sub(s)'
        +'              <button class="kmi" :class="{on: killMode}" @click="onModeSwitch">KILL MODE</button>'
        +'              <button @click="ghostMode = !ghostMode">(@ @)</button>'
        +'          </p>'
        +'      </div>'
        +'      <div class="i-tray">'
        +'          <p class="i-empty" v-if="!killMode && subs.length == 0">You are out of sub!</p>'
        +'          <p class="i-empty" v-if="killMode && vics.length == 0">No vic to go!</p>'
        +'          <transition-group name="bar" tag="div" v-if="!killMode">'
        +'              <div class="i-set-shell" v-for="(sub,index) in subs" :key="sub.id">'
        +'                  <div class="i-set">'
        +'                      <input class="s-display" type="text" v-model="sub.name"/>'
        +'                      <span class="bc-btn s-stat" :class="sub.stat"></span>'
        +'                      <span class="bc-btn s-rm" @click="remove(index)">Kill</span>'
        +'                  </div>'
        +'              </div>'
        +'          </transition-group>'
        +'          <transition-group name="bar" tag="div" v-else>'
        +'              <div class="i-set-shell" v-for="(vic,index) in vics" :key="vic.id">'
        +'                  <div class="i-set" @click="killvic(vic)">'
        +'                      <p class="vic">'
        +'                          <span class="vic__id">{{ vic.id }}</span>'
        +'                          {{ vic.name }}'
        +'                          <span class="s-stat" :class="vic.stat"></span>'
        +'                      </p>'
        +'                  </div>'
        +'              </div>'
        +'          </transition-group>'
        +'      </div>'
        +'      <div class="i-ctl" v-if="!killMode">'
        +'          <input class="m-input" type="text" placeholder="Task\'s name" @keydown="keystroke"/>'
        +'          <button class="bc-btn m-close" @click="release">Close</button>'
        +'          <button class="bc-btn m-dismiss" @click="dismiss">Dismiss</button>'
        +'          <button class="bc-btn m-submit" @click="submit">Submit</button>'
        +'      </div>'
        +'  </div>'
        +'</div>'
    ;
    
    var cfg = {
        el: tag.childNodes[0],
        data: {
            error: false,
            subs: [],
            vics: [],
            killMode: false,
            ghostMode: false
        },
        methods: {
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
            release: function() {
                umount();
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
                        fetch("https://axonivy.atlassian.net/rest/api/2/issue/", {
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
                    })();
                }
            },
            _createPayload: function(subName) {
                return '{"fields":{"project":{"key": "'
                    +prj+'"},"parent":{"key": "'
                    +issue+'"},"summary":"'+subName+'","issuetype":{"id":"10029"},"customfield_10049":{"id":"10071"}}}';
            },
            remove: function(index) {
                this.subs.splice(index, 1);
            },
            onModeSwitch: function() {
                this.killMode = !this.killMode;
                if (this.killMode) {
                    this.vics = [];
                    var ctx = this;
                    fetch("https://axonivy.atlassian.net/rest/api/2/issue/"+issue+"?fields=subtasks")
                        .then(function(rs) {
                            if (rs.ok) {
                                return rs.json();
                            } else {
                                console.error("rs.!ok");
                            }
                        })
                        .then(function(data){
                            ctx.vics = data.fields.subtasks.map(function(vic){
                                return {
                                    id: vic.key,
                                    name: vic.fields.summary,
                                    stat: 'still' // still | await | error
                                };
                            });
                        })
                        .catch(function(er){
                            console.error(er);
                        });
                }
            },
            killvic: function(vic) {
                if (vic.stat == 'await') {
                    return;
                }
                vic.stat = 'await';
                var ctx = this;
                fetch("https://axonivy.atlassian.net/rest/api/2/issue/"+vic.id, { method: "DELETE" })
                    .then(function(rs){
                        if (rs.ok) {
                            ctx.vics = ctx.vics.filter(function(v){
                                return v.id != vic.id;
                            });
                        } else {
                            vic.stat = 'error';
                        }
                    })
                    .catch(function(e){
                        console.log(e);
                        vic.stat = 'error';
                    });
            }
        }
    };
    new Vue(cfg);
};

