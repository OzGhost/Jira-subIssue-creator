'use strict';
(function(){
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
        +'  <button class="bc-hollow" @click="extended = !extended"><span class="bc-icon"></span></button>'
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
            subs: []
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
            submit: function() {
                var len = this.subs.length;
                for (var i = 0; i < len; i++) {
                    var isub = this.subs[i];
                    if (isub.stat == 'await' || isub.stat == 'pass') {
                        continue;
                    }
                    (function(){
                        var sub = isub;
                        sub.stat = 'await';
                        setTimeout(function() {
                            if (Math.floor(Math.random()*2) == 0) {
                                sub.stat = "error";
                            } else {
                                sub.stat = "pass";
                            }
                        }, Math.random()*5000);
                    })();
                }
            },
            remove: function(index) {
                this.subs.splice(index, 1);
            }
        }
    });
})();

