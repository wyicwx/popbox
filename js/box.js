 ;(function() {

    var mBoxy = {};

    //标题和内容标识符
    mBoxy.regExp = {
        boxTitle : "<!-- Mboxy-title -->",
        boxContent : "<!-- Mboxy-content -->"
    };

    //弹出框主题框架
    mBoxy.framework = function(options) {
        var obj = document.createElement("div");

        obj.id = options.name;
        obj.style.display = "none";
        obj.style.opacity = "0";
        obj.style.filter = "alpha(opacity=0)";
        obj.style.zIndex = 9999;
        obj.style.position = "absolute"
        obj.innerHTML = [
            '<table><tbody class="Mboxy">',
            '<tr><td class="Mboxy-top-left"></td><td class="Mboxy-top"></td><td class="Mboxy-top-right"></td></tr>',
            '<tr><td class="Mboxy-left"></td><td class="Mboxy-inner"><!--title--><div class="Mboxy-title"><span>' + this.regExp["boxTitle"] + this.regExp["boxTitle"] + '</span><div id="j-close" class="close">关闭</div></div><!--/title--><div class="Mboxy-content">' + this.regExp["boxContent"] + this.regExp["boxContent"] + '</div></td><td class="Mboxy-right"></td></tr>',
            '<tr><td class="Mboxy-bottom-left"></td><td class="Mboxy-bottom"></td><td class="Mboxy-bottom-right"></td></tr>',
            '</tbody></table>'
        ].join("");//使用join提升性能
        if(!options.hasTitle) obj.innerHTML = obj.innerHTML.replace(/<!--title-->.*<!--\/title-->/,"");
        return obj;
    }

    //生成新窗口函数，主函数
    mBoxy.newBox = function(options) {
        var box, boxsSize = mBoxy.Box.getBoxSize(), options = options || {};

        options.name = options.name || "mBoxy-" + boxsSize;
        if(options.hasTitle === false) options.hasTitle = false; else options.hasTitle = true;
        if(options.hasBackground === false) options.hasBackground = false; else options.hasBackground = true;

        box = mBoxy.Box.getBox(options.name);
        if(box) return box;
        box = new mBoxy.Box(options);
        box.event = new mBoxy.Box.Event(box);
        if(options.hasTitle) {
            box.bind("click","#j-close",function(event,obj) { obj.hide()})
        }
        return box;
    }

    //弹出框类（抽象类）
    mBoxy.Box = function() {
        throw "abstract function";
    }

    window.mBoxy = window.mBoxy || mBoxy;

})()

;(function(mBoxy) {
    var Box,
        _boxs = {
            _length : 0
        };

    //弹出框类
    Box = mBoxy.Box = function(options) {
        var boxObject = mBoxy.framework(options);

        this.getName = function () {
            return options.name;
        };

        this.getBoxObject = function () {
            return boxObject;
        };

        this.hasTitle = function() {//一个弹出框是否带有标题，在生成窗口后不可修改
            return options.hasTitle;
        }

        this.hasBackground = function(selection) {
            if(selection === true) {
                options.hasBackground = true;
            } else if(selection === false) {
                options.hasBackground = false;
            }
            return options.hasBackground;
        }

        _boxs[options.name] = this;
        _boxs._length += 1;
    }

    //弹出框背景
    Box.getBackgroundObject = function() {
        var obj = document.createElement("div");

        obj.className = "Mboxy-bg";
        obj.style.zIndex = 999;
        obj.style.height = document.body.scrollHeight + "px";
        obj.style.width = document.body.scrollWidth + "px";
        mBoxy.Box.getBackgroundObject = function() {
            return obj;
        }
        return obj;
    }
    
    //获取弹出窗对象
    Box.getBox = function(name) {
        if(!name) return _boxs;
        return _boxs[name];
    }

    //获取弹出框数量
    Box.getBoxSize = function() {
        return _boxs["_length"];
    }

    //销毁一个窗口对象，参数可以是窗口名或者窗口对象
    Box.destroy = function(option) {
        var boxObj;

        if(typeof option === "String") {
            boxObj = mBoxy.Box.getBox(option);
        } else {
            if(!option instanceof mBoxy.Box) return false;
            boxObj = option;
        }

        if(!boxObj) return false;
        boxObj.remove();
        delete _boxs[boxObj.getName()];
        return true;
    }

    //事件系统（抽象类）
    Box.Event = function() {
        throw "abstract function";
    }

    Box.prototype = Box.events = {};

})(window.mBoxy)

;(function(mBoxy) {
    //mBoxy.Box.events 弹出窗原型函数
    var events = mBoxy.Box.events, Box = mBoxy.Box;

    events["toggle"] = function(option) {
        if(option === true || option === false) this["_opacity"] = !option;

        if(this["_opacity"]) {
            this.getBoxObject().style.display = "none";
            this.getBoxObject().style.opacity="0";
            this.getBoxObject().style.filter="alpha(opacity=0)";
            
            Box.getBackgroundObject().style.display = "none";
            Box.getBackgroundObject().style.opacity = "0";
            Box.getBackgroundObject().style.filter = "alpha(opacity=0)";

            this["_opacity"] = false;
        } else {
            this.getBoxObject().style.display = "block";
            this.getBoxObject().style.opacity="1";
            this.getBoxObject().style.filter="alpha(opacity=100)";
            if(this.hasBackground()) {
                Box.getBackgroundObject().style.display = "block";
                Box.getBackgroundObject().style.opacity = "0.3";
                Box.getBackgroundObject().style.filter = "alpha(opacity=30)";
            } else {
                Box.getBackgroundObject().style.display = "none";
                Box.getBackgroundObject().style.opacity = "0";
                Box.getBackgroundObject().style.filter = "alpha(opacity=0)";
            }
            this["_opacity"] = true;
        }
        if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
        return this;
    }

    events["trigger"] = function() {
        var i, max;
        for(i = 0, max = arguments.length;i < max ;i++) {
            if(this[arguments[i]]) this[arguments[i]]();
        }
        return this;
    };

    events["show"] = function(timeout) {
        var that = this;

        this.trigger("insert","position");
        this["toggle"](true);
        if(timeout > 0) {
            clearTimeout(that["_timeout"]);
            that["_timeout"] = setTimeout(function() {that.hide()},timeout);
        }
        return this;
    };

    events["hide"] = function() {
        this["toggle"](false);
        if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
        return this;
    };

    events["title"] = function(title) {
        var innerHTML = this.getBoxObject().innerHTML, titleRegExp;

        if(!this.hasTitle) return this;
        titleRegExp = new RegExp(mBoxy.regExp["boxTitle"] + ".*" + mBoxy.regExp["boxTitle"]);
        innerHTML = innerHTML.match(/.*/g).join("");
        innerHTML = innerHTML.replace(titleRegExp,mBoxy.regExp["boxTitle"]+title+mBoxy.regExp["boxTitle"]);
        this.getBoxObject().innerHTML = innerHTML;
        if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
        return this;
    };

    events["html"] = function(html) {
        var innerHTML = this.getBoxObject().innerHTML, contentRegExp;

        contentRegExp = new RegExp(mBoxy.regExp["boxContent"] + ".*" + mBoxy.regExp["boxContent"]);
        innerHTML = innerHTML.match(/.*/g).join("");
        innerHTML = innerHTML.replace(contentRegExp,mBoxy.regExp["boxContent"]+html+mBoxy.regExp["boxContent"]);
        this.getBoxObject().innerHTML = innerHTML;
        if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
        return this;
    };

    //TODO
    // events["text"] = function(text) {
    //     var innerHTML = this.getBoxObject().innerHTML, contentRegExp = this["__text"] || mBoxy.regExp["boxContent"];

    //     innerHTML = innerHTML.replace(contentRegExp,text);
    //     this.getBoxObject().innerHTML = innerHTML;
    //     this["__content"] = text;
    //     if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
    //     return this;
    // };

    events["insert"] = function() {
        if(this["_insert"]) return this;
        document.body.appendChild(this.getBoxObject());
        document.body.appendChild(mBoxy.Box.getBackgroundObject());
        this["_insert"] = true;
        if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
        return this;
    };

    events["popup"] = function(timeout) {
        var t = 0, b = 0, c = 100, d = 50,
            obj = this.getBoxObject(), 
            bg = mBoxy.Box.getBackgroundObject(),
            hasBackground = this.hasBackground(),
            that = this,ar = arguments;

        function SinusoidalEaseIn (t,b,c,d){
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        }

        function LinearEaseIn (t,b,c,d){
           return c*(t/=d)*t + b;
        }

        function run() {
            var bgstep = Math.ceil(SinusoidalEaseIn(t,b,c,d));
                step = Math.ceil(LinearEaseIn(t,b,c,d));

            obj.style.opacity = step/100;
            obj.style.filter = "alpha(opacity="+ step +")";
            if(hasBackground) {
                bg.style.opacity = 3*bgstep/1000;
                bg.style.filter = "alpha(opacity="+ 3*bgstep/10 +")";
            }
            if(t < d) {t++; setTimeout(run,10)} else {

                if(timeout > 0) {
                    clearTimeout(that["_timeout"]);
                    that["timeout"] = setTimeout(function() {
                        that.popdown();
                        if(ar[ar.length - 1] instanceof Function) ar[ar.length - 1](that);
                    },timeout);
                } else {
                    if(ar[ar.length - 1] instanceof Function) ar[ar.length - 1](that);
                }
            }
        }

        this.trigger("insert","position");
        obj.style.display = "block";
        bg.style.display = "block";
        this.trigger("insert");
        run();
    }

    events["popdown"] = function() {
        var t = 0, b = 100, c = -100, d = 50, that = this,
            obj = this.getBoxObject(),
            bg = mBoxy.Box.getBackgroundObject(),
            hasBackground = this.hasBackground(),
            ar = arguments, that = this;

        function SinusoidalEaseOut (t,b,c,d){
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        }

        function LinearEaseOut (t,b,c,d){
           return -c *(t/=d)*(t-2) + b;
        }

        function run() {
            var bgstep = Math.ceil(SinusoidalEaseOut(t,b,c,d));
                step = Math.ceil(LinearEaseOut(t,b,c,d));

            obj.style.opacity = step/100;
            obj.style.filter = "alpha(opacity="+ step +")";
            if(hasBackground) {
                bg.style.opacity = 3*bgstep/1000;
                bg.style.filter = "alpha(opacity="+ 3*bgstep/10 +")";
            }
            if(t < d) {
                t++; setTimeout(run,10)
            } else {
                that.hide();
                if(ar[ar.length - 1] instanceof Function) ar[ar.length - 1](that);
            }
        }

        obj.style.display = "block";
        bg.style.display = "block";
        this.trigger("insert");
        run();
    }

    events["remove"] = function() {
        this.hide();
        if(this["_insert"]) {
            document.body.removeChild(this.getBoxObject());
        }
        if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
        return this;
    }

    events["position"] = function(x,y) {
        if(x && y) {
            obj.style.left = parseInt(x,10) + "px";
            obj.style.top = parseInt(y,10) + "px";
            return;
        }
        var winWidth = document.documentElement.clientWidth,
            winHeight = document.documentElement.clientHeight,
            obj = this.getBoxObject(),
            display = obj.style.display;

            obj.style.display = "block";
            objHeight = obj.clientHeight;
            objWidth = obj.clientWidth;
            obj.style.display = display;

        obj.style.left = Math.ceil((winWidth - objWidth)/2) + "px";
        obj.style.top = window.scrollY + Math.ceil((winHeight - objHeight)/2) + "px";
        if(arguments[arguments.length - 1] instanceof Function) arguments[arguments.length - 1](this);
        return this;
    }

    events["bind"] = function(eventType,element,callback) {
        this.event.registerListener(eventType,element,callback);
        if(arguments[arguments.length - 1] instanceof Function && arguments.length > 3) arguments[arguments.length - 1](this);
        return this;
    }

    events["unbind"] = function(eventType,element,callback) {
        this.event.unregisterListener(eventType,element,callback);
        if(arguments[arguments.length - 1] instanceof Function&& arguments.length > 3) arguments[arguments.length - 1](this);
        return this;
    }

})(window.mBoxy)


;(function(mBoxy) {
    var Event,
        eventOP;

    //事件系统
    Event = mBoxy.Box.Event = function(obj) {
        // obj.events = {
        //     "click":{
        //       "#mBoxy":[function() {},function() {}]
        //      }
        // }
        this.box = obj;
        this.events = {};
    }

    eventOP = Event.prototype;

    eventOP["_createEvent"] = function(obj,identity,handler) {
        obj[identity] = new Array();
        if(handler) obj[identity].push(handler);
        return obj;
    }

    //注册事件类型
    eventOP["registerType"] = function(name,identity,handler) {
        if(this.events[name]) return this;  //防止重复事件类型，覆盖注册
        this.events[name] = {};

        if(identity) {
            this._createEvent(this.events[name],identity,handler);
        }

        this._addListener(name);
    }

    //添加监听者
    eventOP["registerListener"] = function(name,identity,handler) {
        var eventList = this.events[name],hasIdentity = false,  //标识监听者是否存在
            i;

        if(!eventList) {
            this.registerType(name,identity,handler);
            return this;
        }

        for(i in eventList) {
            if(i == identity) {
                eventList[i].push(handler);
                hasIdentity = true;
                break;
            }
        }

        if(!hasIdentity) {
            this._createEvent(eventList,identity,handler);
        }
    }

    //删除监听者
    eventOP["unregisterListener"] = function(name,identity,handler) {
        var eventList = this.events[name],i;

        if(!eventsList) return this;

        if(!eventsList[identity]) return this;

        for(i in eventsList[identity]) {
            if(eventsList[identity][i] == handler) eventsList[identity].split(i,1);
        }
        return this;
    }

    //处理了兼容性的事件绑定函数
    eventOP["_addListener"] = function(type) {
        var obj = this.box.getBoxObject(),
            callback = this._callback(type);

        if(window.addEventListener) {
            obj.addEventListener(type,callback,false); 
        } else if (window.attachEvent) {
            obj['__' + type + callback] = callback;
            obj[type + callback] = function() {
                obj['__' + type + callback](window.event);
            }
            obj.attachEvent("on" + type, obj[type + callback]);
        }
    }

    //封装不同监听者的callback函数
    eventOP["_callback"] = function(type) {
        var eventList = this.events[type], type = type ,obj = this.box;

        function compare(type,id,classes) {
            var i, identity, ident, j;

            for(i in eventList) {
                identity = i.slice(0,1);
                ident = i.slice(1,i.length);
                switch(identity) {
                    case "#": 
                        if(id == ident) return i;
                        break;
                    case ".":
                        for(j in classes) {
                            if(classes[j] == ident) return i;
                        }
                        break;
                }
            }
            return false;
        }

        return function(e) {
            var eventTag = e.target || e.srcElement,
                tagId = eventTag.id,
                tagClass = eventTag.className.split(" "),
                result,i;

            result = compare(type,tagId,tagClass);
            if(result) {
                for(i in eventList[result]) eventList[result][i](e,obj);
            }
        }
    }

})(window.mBoxy)
