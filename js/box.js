 ;(function() {

    var mBoxy = {};

    mBoxy.regExp = {
        boxTitle : "/*Mboxy-title*/",
        boxContent : "/*Mboxy-content*/"
    };

    mBoxy.framework = function() {
        var obj = document.createElement("table");

        obj.style.display = "none";
        obj.style.opacity = "0";
        obj.style.filter = "alpha(opacity=0)";
        obj.style.zIndex = 9999;
        obj.style.position = "absolute"
        obj.innerHTML = [
            '<tbody class="Mboxy">',
            '<tr><td class="Mboxy-top-left"></td><td class="Mboxy-top"></td><td class="Mboxy-top-right"></td></tr>',
            '<tr><td class="Mboxy-left"></td><td class="Mboxy-inner"><div class="Mboxy-title"><span>' + this.regExp["boxTitle"] + '</span><div class="close">关闭</div></div><div class="Mboxy-content">' + this.regExp["boxContent"] + '</div></td><td class="Mboxy-right"></td></tr>',
            '<tr><td class="Mboxy-bottom-left"></td><td class="Mboxy-bottom"></td><td class="Mboxy-bottom-right"></td></tr>',
            '</tbody>'
        ].join("");
        return obj;
    }

    mBoxy.new = function(options) {
        var box, boxsSize = mBoxy.Box.getBoxSize(), options = options || {};

        options.name = options.name || "mBoxy-" + boxsSize;
        options.hasTitle = options.hasTitle || true;
        options.hasBackground = options.hasBackground || true;

        box = mBoxy.Box.getBox(options.name);
        if(box) return box;
        box = new mBoxy.Box(options);
        return box;
    }

    window.mBoxy = window.mBoxy || mBoxy;

})()

 ;(function(mBoxy) {
    var Box,
        _boxs = {
            _length : 0
        };

    Box = mBoxy.Box = function(options) {
        var boxObject = mBoxy.framework();

        this.getName = function () {
            return options.name;
        };

        this.getBoxObject = function () {
            return boxObject;
        };

        this.hasTitle = function() {
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

    Box.getBackgroundObject = function() {
        var obj = document.createElement("div");

        obj.className = "Mboxy-bg";
        obj.style.zIndex = 999;
        mBoxy.Box.getBackgroundObject = function() {
            return obj;
        }
        return obj;
    }
    
    Box.getBox = function(name) {
        if(!name) return _boxs;
        return _boxs[name];
    }

    Box.getBoxSize = function() {
        return _boxs["_length"];
    }

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

    Box.prototype = Box.events = {};

})(window.mBoxy)

;(function(mBoxy) {
    var events = mBoxy.Box.events, Box = mBoxy.Box;

    events["toggle"] = function(option) {
        if(option === true || option === false) this["_opacity"] = !option;

        if(this["_opacity"]) {
            this.getBoxObject().style.display = "none";
            this.getBoxObject().style.opacity="0";
            this.getBoxObject().style.filter="alpha(opacity=0)";
            if(this.hasBackground()) {
                Box.getBackgroundObject().style.display = "none";
                Box.getBackgroundObject().style.opacity="0";
                Box.getBackgroundObject().style.filter="alpha(opacity=0)";
            }
            this["_opacity"] = false;
        } else {
            this.getBoxObject().style.display = "table";
            this.getBoxObject().style.opacity="1";
            this.getBoxObject().style.filter="alpha(opacity=100)";
            if(this.hasBackground()) {
                Box.getBackgroundObject().style.display = "block";
                Box.getBackgroundObject().style.opacity="0.3";
                Box.getBackgroundObject().style.filter="alpha(opacity=30)";
            }
            this["_opacity"] = true;
        }

        return this;
    }

    events["content"] = function(content) {
        var innerHTML = this.getBoxObject().innerHTML, contentRegExp = this["__content"] || mBoxy.regExp["boxContent"];

        if(!content) return this;
        innerHTML = innerHTML.replace(contentRegExp,content);
        this.getBoxObject().innerHTML = innerHTML;
        this["__content"] = content;
        return this;
    };

    events["trigger"] = function() {
        var i, max;
        for(i = 0, max = arguments.length;i < max ;i++) {
            if(this[arguments[i]]) this[arguments[i]]();
        }
        return this;
    };

    events["show"] = function() {
        this.trigger("insert","position","toggle");
        return this;
    };

    events["hide"] = function() {
        this["toggle"](false);
        return this;
    };

    events["title"] = function(title) {
        var innerHTML = this.getBoxObject().innerHTML, titleRegExp = this["__title"] || mBoxy.regExp["boxTitle"];

        innerHTML = innerHTML.replace(titleRegExp,title);
        this.getBoxObject().innerHTML = innerHTML;
        this["__title"] = title;
        return this;
    };

    events["content"] = function(content) {
        var innerHTML = this.getBoxObject().innerHTML, contentRegExp = this["__content"] || mBoxy.regExp["boxContent"];

        innerHTML = innerHTML.replace(contentRegExp,content);
        this.getBoxObject().innerHTML = innerHTML;
        this["__content"] = content;
        return this;
    };

    events["insert"] = function() {
        if(this["_insert"]) return this;
        document.body.appendChild(this.getBoxObject());
        document.body.appendChild(mBoxy.Box.getBackgroundObject());
        this["_insert"] = true;
        return this;
    };

    events["popup"] = function() {
        var t = 0, b = 0, c = 100, d = 50,
            obj = this.getBoxObject(), 
            bg = mBoxy.Box.getBackgroundObject(),
            hasBackground = this.hasBackground();;

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
            if(t < d) {t++; setTimeout(run,10)}
        }

        this.position();
        obj.style.display = "table";
        bg.style.display = "block";        
        this.trigger("insert");
        run();
    }

    events["popdown"] = function() {
        var t = 0, b = 100, c = -100, d = 50,
            obj = this.getBoxObject(),
            bg = mBoxy.Box.getBackgroundObject(),
            hasBackground = this.hasBackground();

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
            if(t < d) {t++; setTimeout(run,10)}
        }

        obj.style.display = "table";
        bg.style.display = "block";        
        this.trigger("insert");
        run();
    }

    events["remove"] = function() {
        this.hide();
        if(this["_insert"]) {
            document.body.removeChild(this.getBoxObject());
        }
    }

    events["position"] = function(x,y) {
        if(x && y) {
            obj.style.left = parseInt(x,10) + "px";
            obj.style.top = parseInt(y,10) + "px";
        }
        var winWidth = document.documentElement.clientWidth,
            winHeight = document.documentElement.clientHeight,
            obj = this.getBoxObject(),
            objHeight = obj.clientHeight,
            objWidth = obj.clientWidth;

        obj.style.left = Math.ceil((winWidth - objWidth)/2) + "px";
        obj.style.top = Math.ceil((winHeight - objHeight)/2) + "px";
    }

})(window.mBoxy)
