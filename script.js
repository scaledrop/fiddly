        if (typeof addEventListener !== "undefined") {
            addEvent = function(obj, evt, fn) {
                obj.addEventListener(evt, fn, false);
            };
            removeEvent = function(obj, evt, fn) {
                obj.removeEventListener(evt, fn, false);
            };
        } else if (typeof attachEvent !== "undefined") {
            addEvent = function(obj, evt, fn) {
                var fnHash = "e_" + evt + fn;
                obj[fnHash] = function() {
                    var type = event.type,
                        relatedTarget = null;
                    if (type === "mouseover" || type === "mouseout") {
                        relatedTarget = (type === "mouseover") ? event.fromElement : event.toElement;
                    }
                    fn.call(obj, {
                        target: event.srcElement,
                        type: type,
                        relatedTarget: relatedTarget,
                        _event: event,
                        preventDefault: function() {
                            this._event.returnValue = false;
                        },
                        stopPropagation: function() {
                            this._event.cancelBubble = true;
                        }
                    });
                };
                obj.attachEvent("on" + evt, obj[fnHash]);
            };
        }
        var d = document,
            getId = function(id) {
                return d.getElementById(id);
            },
            // localStorage = {},
            fetch = function(str) {
                // if(checkif.supportLocalStorage())
                return localStorage.getItem(str);
            },
            set = function(str, arg) {
                return localStorage.setItem(str, arg);
            };
        var run = getId("runBtn"),
            reset = getId("resetBtn"),
            hc = getId("html"),
            cc = getId("css"),
            jc = getId("js"),
            fc = getId("outframe"),
            save = getId("saveBtn"),
            help = getId("help"),
            info = getId("info"),
            close = getId("close");
        var createEl = function(name) {
            return d.createElement(name);
        };
        var outst = createEl("style"),
            outjs = createEl("script");
        outjs.type = 'text/javascript';
        var output = {
            // check if iframe
            isFrame: function() {
                var outdoc = fc.contentDocument || fc.contentWindow.d;
                return outdoc;
            },
            // run input code
            elval: function(eh, ec, ej, est, ejs, edoc) {
                var hh = eh.value,
                    ch = ec.value,
                    jh = ej.value.replace(/[\n\t\r]/g,""); // remove tabs or returns if there any
                if (output.isFrame()) {
                    edoc.getElementsByTagName('head')[0].appendChild(est);
                    est.innerHTML = ch;
                    var iFrameBody = edoc.getElementsByTagName('body')[0];
                    iFrameBody.innerHTML = hh;
                    if (iFrameBody) {
                        ejs.innerHTML = jh;
                        iFrameBody.appendChild(ejs);
                        edoc.location.href = "javascript:" + jh;
                    }
                }
            },
            // clear output and inputs
            emval: function(eh, ec, ej, est, ejs, edoc) {
                var hh = eh.value,
                    ch = ec.value,
                    jh = ej.value;
                eh.value = ec.value = ej.value = est.innerHTML = edoc.body.innerHTML = "";
                if (checkif.supportLocalStorage()) {                                    
                    localStorage.clear();
                } else {
                    alert("Your browser doesn't support localStorage. Try either Chrome, Firefox or Safari browser.");
                }
                if (output.isFrame()) {
                    var iFrameScript = edoc.getElementsByTagName('script')[0];
                    if (iFrameScript) {
                        iFrameScript.parentNode.removeChild(iFrameScript);
                    }
                    eh.focus();
                }
            }
        };
        var events = {
            // bind events
            attachEvents: function() {
                output.elval(hc, cc, jc, outst, outjs, output.isFrame());
            },
            // unbind events
            dettachEvents: function() {
                output.emval(hc, cc, jc, outst, outjs, output.isFrame());
            }
        };
        var bindKey = {
            // shortcuts for mac and unix
            bindMUKeys: function(e) {
                var ev = window.event || e;
                var key = ev.charCode || ev.keyCode;
                
                switch (key) {
                        case 13: // ctrl+return
                            ev.ctrlKey ? 
                            events.attachEvents()
                            : false;
                            break;
                        case 69: // ctrl+e
                            ev.ctrlKey ? 
                            events.dettachEvents()
                            : false;
                            break;
                        case 83: // ctrl+s
                            ev.ctrlKey || ev.metaKey ?
                            saveFun.fileLocally()
                            : false;
                            break;
                        case 27: // Escape
                            saveFun.triggerHelp.hide(info)
                            break;
                        default:
                            break;
                    }
            },
            // shortcuts for windows and linux
            bindWLKeys: function(e) {
                var ev = window.event || e;
                var key = ev.charCode || ev.keyCode;
                    switch (key) {
                        case 13: // ctrl+return
                            ev.ctrlKey ? 
                            events.attachEvents()
                            : false;
                            break;
                        case 69: // ctrl+e
                            ev.ctrlKey ? 
                            (function(){
                                events.dettachEvents();
                                ev.preventDefault();
                                return false;
                            })()
                            :
                            false;
                            break;
                        case 83: // ctrl+s
                            ev.ctrlKey || ev.metaKey ?
                            (function() {
                                saveFun.fileLocally();
                                ev.preventDefault();
                                return false;
                            })()
                            :
                            false;
                            break;
                        case 27: // Escape
                            saveFun.triggerHelp.hide(info)
                            break;
                        default:
                            break;
                    }
            }
        };
        var checkif = {
            // test navigator
            isOS: function(os) {
                // mac or unix
                if (os.indexOf("X11") !=-1 || os.indexOf("Mac") !=-1) 
                    return bindKey.bindMUKeys;
                // windows or linux
                if (os.indexOf("Win") !=-1 || os.indexOf("Linux") !=-1) 
                    return bindKey.bindWLKeys;
            },
            supportLocalStorage: function() {
                return typeof(Storage)!== 'undefined';
            }
        };
        var saveFun = {
            // save using localstorage
            fileLocally: function() {
                if (checkif.supportLocalStorage()) {                                    
                    if (hc.value) set("hc", hc.value);
                    if (cc.value) set("cc", cc.value);
                    if (jc.value) set("jc", jc.value);
                    var min_val = hc.value || cc.value || jc.value ;
                    if(min_val) alert("Your code's been saved!");
                } else {
                    alert("Your browser doesn't support localStorage. Try either Chrome, Firefox or Safari browser.");
                }
            },
            fileOnserver: function() {
            },
            getLocalData: function() {
                // hc.value = cc.value = jc.value = "";
                if (checkif.supportLocalStorage()) {
                    // Note: below lines'll stop you to run the whole code if you're using this locally on IE and old Firefox. IE hates it if you try to access localstorage on local file ie- file://
                    // Bug Ref: https://bugzilla.mozilla.org/show_bug.cgi?id=507361
                    // Fix: start your local server
                    fetch("hc") ? hc.value = localStorage.getItem("hc") : "";
                    fetch("cc") ? cc.value = localStorage.getItem("cc") : "";
                    fetch("jc") ? jc.value = localStorage.getItem("jc") : "";
                }else {
                    alert("Your browser doesn't support localStorage. Try either Chrome, Firefox or Safari browser.");
                }
            },
            triggerHelp: {
                show: function(source, target, minimize){
                    if(target.style.display != "block") { target.style.display = "block"; }
                    else target.style.display = "none";
                  }, 
                hide: function(target) {
                    target.style.display = "none"
                } 
                    
            }
        };
        // Add indentation on tab and reurn
        var utilities = {
                indentation: function(e) {
                    var tab = "\t";
                    var tabWidth = tab.length;
                    if (e.keyCode === 9) {
                        e.preventDefault();
                        var start = this.selectionStart,
                            end = this.selectionEnd;
                        if (e.shiftKey === false) {
                            if (!utilities.ifReturn(this)) {
                                this.value = this.value.substring(0, start) + tab + this.value.slice(start);
                                this.selectionStart = start + tabWidth;
                                this.selectionEnd = end + tabWidth;
                            } else {
                                var startIn = utilities.startPoint(this),
                                    l = startIn.length,
                                    newStart = undefined,
                                    newEnd = undefined,
                                    affectedRows = 0;
                                while(l--) {
                                    var _thresold = startIn[l];
                                    if (startIn[l+1] && start != startIn[l+1]) _thresold = startIn[l+1];
                                    if (_thresold >= start && startIn[l] < end) {
                                        this.value = this.value.slice(0, startIn[l]) + tab + this.value.slice(startIn[l]);
                                        newStart = startIn[l];
                                        if (!newEnd) newEnd = (startIn[l+1] ? startIn[l+1] - 1 : 'end');
                                        affectedRows++;
                                    }
                                }
                                this.selectionStart = newStart;
                                this.selectionEnd = (newEnd !== 'end' ? newEnd + (tabWidth * affectedRows) : this.value.length);
                            }
                        } 
                        else {
                            // Shift-Tab reverse indentation
                            if (!utilities.ifReturn(this)) {
                                if (this.value.substr(start - tabWidth, tabWidth) == tab) {
                                    this.value = this.value.substr(0, start - tabWidth) + this.value.substr(start);
                                    this.selectionStart = start - tabWidth;
                                    this.selectionEnd = end - tabWidth;
                                } else if (this.value.substr(start - 1, 1) == "\n" && this.value.substr(start, tabWidth) == tab) {
                                    this.value = this.value.substring(0, start) + this.value.substr(start + tabWidth);
                                    this.selectionStart = start;
                                    this.selectionEnd = end - tabWidth;
                                }
                            } else {
                                var startIn = utilities.startPoint(this),
                                    l = startIn.length, newStart, newEnd,
                                    affectedRows = 0;
                                while(l--) {
                                    var _thresold = startIn[l];
                                    if (startIn[l+1] && start != startIn[l+1]) _thresold = startIn[l+1];
                                    if (_thresold >= start && startIn[l] < end) {
                                        if (this.value.substr(startIn[l], tabWidth) == tab) {
                                            this.value = this.value.slice(0, startIn[l]) + this.value.slice(startIn[l] + tabWidth);
                                            affectedRows++;
                                        } else {}
                                        newStart = startIn[l];
                                        if (!newEnd) newEnd = (startIn[l+1] ? startIn[l+1] - 1 : 'end');
                                    }
                                }
                                this.selectionStart = newStart;
                                this.selectionEnd = (newEnd !== 'end' ? newEnd - (affectedRows * tabWidth) : this.value.length);
                            }
                        }
                    } 
                    else if (e.keyCode === 13 && e.shiftKey === false) {    // Enter, maintain current position
                        var self = utilities,
                            cursorPos = this.selectionStart,
                            startIn = self.startPoint(this),
                            numstartIn = startIn.length,
                            startIndex = 0,
                            endIndex = 0,
                            tabMatch = new RegExp("^" + tab.replace('\t', '\\t').replace(/ /g, '\\s') + "+", 'g'),
                            lineText = '';
                            tabs = null;
                        for(var x=0;x<numstartIn;x++) {
                            if (startIn[x+1] && (cursorPos >= startIn[x]) && (cursorPos < startIn[x+1])) {
                                startIndex = startIn[x];
                                endIndex = startIn[x+1] - 1;
                                break;
                            } else {
                                startIndex = startIn[numstartIn-1];
                                endIndex = this.value.length;
                            }
                        }
                        lineText = this.value.slice(startIndex, endIndex);
                        tabs = lineText.match(tabMatch);
                        if (tabs !== null) {
                            e.preventDefault();
                            var indentText = tabs[0];
                            var indentWidth = indentText.length;
                            var inLinePos = cursorPos - startIndex;
                            if (indentWidth > inLinePos) {
                                indentWidth = inLinePos;
                                indentText = indentText.slice(0, inLinePos);
                            }
                            this.value = this.value.slice(0, cursorPos) + "\n" + indentText + this.value.slice(cursorPos);
                            this.selectionStart = cursorPos + indentWidth + 1;
                            this.selectionEnd = this.selectionStart;
                        }
                    }
            },
            ifReturn: function(el) {
                var val = el.value.slice(el.selectionStart, el.selectionEnd),
                    nlRegex = new RegExp(/\n/);
                if (nlRegex.test(val)) return true;
                else return false;
            },
            startPoint: function(el) {
                var text = el.value,
                    startIn = [],
                    offset = 0;
                while(text.match(/\n/) && text.match(/\n/).length > 0) {
                    offset = (startIn.length > 0 ? startIn[startIn.length - 1] : 0);
                    var lineEnd = text.search("\n");
                    startIn.push(lineEnd + offset + 1);
                    text = text.substring(lineEnd + 1);
                }
                startIn.unshift(0);
                return startIn;
            },
            indent_: function(el) {
                var elem = document.querySelectorAll(el);
                for (var i=0;i<elem.length;i+=1){
                var self = elem[i];
                    if (self.nodeName === 'TEXTAREA') {
                        self.addEventListener('keydown', utilities.indentation);
                    }
                }
            },
            switch: function(ClickHandler, KeyHandler){
                // trigger all events
                saveFun.getLocalData();
                utilities.indent_('.codeBlock');
                
                addEvent(help, ClickHandler, function() {
                    saveFun.triggerHelp.show(help, info, close)
                });
                addEvent(close, ClickHandler, function() {
                    saveFun.triggerHelp.hide(info)
                });
                addEvent(run, ClickHandler, events.attachEvents);
                addEvent(reset, ClickHandler, events.dettachEvents);
                addEvent(save, ClickHandler, function(){ 
                    saveFun.fileLocally();
                });
                addEvent(d, KeyHandler, checkif.isOS(navigator.appVersion));
            }

        }
        
