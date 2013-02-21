// 滑动实例化。

define(function(require,exports){
    var touch = require('touch');
    var animation = require('../animation.js');


    /** 扩展对象，仅适用在单层的扩展中
     * @param {Object} merge 来源对象
     * @param {Object} tar 扩展的目标对象
     * @param {Boolean} safe 是否进行安全的扩展，只扩展目标对象中已有的属性
     */
    function extend (merge, tar, safe) {
        var already;
        if (!safe) {
            already = function () { return true; };
        }
        else {
            already = function (obj, proper) {
                return obj.hasOwnProperty(proper);
            }
        }
        if (merge != null && tar != null) {
            var src, copy, name;
            for (name in merge) {
                if (merge.hasOwnProperty(name)) {
                    copy = merge[name];
                    if (tar === copy) {
                        continue;
                    }
                    //只覆盖已定义的属性？
                    if (copy !== undefined && already(tar, name)) {
                        tar[name] = copy;
                    }
                } //if-END
            } //for-END
            return tar;
        } //if-END
    }

    /** 使用原型链接来创建新对象
     * @param {Object} obj 要赋予原型的对象
     */
    function pro (obj) {
        var Func = function () { };
        Func.prototype = obj;
        return new Func();
    } //var pro - END


    //outer :外部容器
    // inner : 内部容器 改变transform
    // fix : 滑动后需要修正的单位值
    // inertia : 是否具有惯性
    function iSlider(param){
        var defP = {
            outer : false,
            inner : false,
            atTop  : false,
            spacing : false,
            atEnd : false,
            moving : false,
            buffer : 40,
            fix : null,
            index : 0,
            count : false,
            inertia : false
        };
        var newFun = pro(Fn);
        extend(param, defP, true);
        extend(defP, newFun);
        newFun.init();
        return newFun;
    }

    var Fn = {
        init:function(){
            var self = this;
            //检测是不是存在outer 和 element .如果没有则返回
            this.lastMoved = null;
            if(!this.outer || !this.inner){
                return false;
            }

            this.plant = null;
            var ua = navigator.userAgent.toLocaleLowerCase();
            if(ua.indexOf("iphone") > -1){
                this.plant = "iphone";
            }else if(ua.indexOf("android") > -1){
                this.plant = "android";
            }

            //为元素设置样式.
            this.setStyle();

            //加入touch事件
            touch({
                element : self.outer,
                start   : function(e){
                    self.start(e);
                },
                move    : function(e,dir,disX,disY,x,y){
                    self.move(e,dir,disX,disY,x,y);
                },
                end : function(){
                    self.end();
                },
                sliceEnd:function(v){
                    self.sliceEnd(v);
                },
                prevent : 'all',
                multiple : false
            });
        },

        setStyle : function(){
            var inner = this.inner,
                outer = this.outer,
                prefix = this.prefix;

            outer.style['overflow'] = 'hidden';
            outer.style['position'] = outer.style['position'] ? outer.style['position'] : 'relative';

            inner.style['webkitTransformStyle'] = 'preserve-3d';
            inner.style['webkitTransform'] = 'translateX(0)';
        },

        start : function(e){
            this.touchstartX = parseFloat(this.inner.style['webkitTransform'].replace('translateX(',''));
            this.movedDis = 0;
        },

        move : function(e,dir,disX,disY,x,y){
            var _iw = this.inner.clientWidth;
            var _ow = this.outer.clientWidth;
            if(_iw < _ow){return false;}
            // if(!this.lastMoved){this.lastMoved = x}
            // || (dir === 'lr' && x < this.lastMoved) || (dir === 'rl' && x > this.lastMoved)
            if(this.touchstartX == null ){
                this.start();
                this.movedDis = disX;
                return;
            }
            var _pos = disX - this.movedDis + this.touchstartX;
            // this.lastMoved = x;
            this.move2Pos(_pos);
        },

        end : function(){

            this.movedDis = 0;
            this.touchstartX = null;
            this.lastMoved = null;

            var _iw = this.inner.clientWidth;
            var _ow = this.outer.clientWidth;
            if(_iw < _ow){return false;}

            var self = this;
            var _buf = this.buffer;
            var _x = parseFloat(this.inner.style['webkitTransform'].replace('translateX(',''));

            var _iw = this.inner.clientWidth;
            var _ow = this.outer.clientWidth;
            var _mw = -_iw + _ow;
            if(_x > 0 ){
                animation.sin(_x,0,200,function(_mid){
                    self.move2Pos(_mid);
                },function(){
                    self.move2Pos(0);
                    self.atTop && self.atTop.apply(null);
                    if(!!self.fix){
                        self.index = 0;
                        self.count && self.count.apply(null,[self.index]);
                    }
                });
            }else if(_x < _mw){
                animation.sin(_x,_mw,200,function(_mid){
                    self.move2Pos(_mid);
                },function(){
                    self.move2Pos(_mw);
                    self.atEnd && self.atEnd.apply(null);
                    if(!!self.fix){
                        self.index = ~~(Math.abs(_mw)/self.fix);
                        self.count && self.count.apply(null,[self.index]);
                    }
                });
            }else{
                if(!!this.fix){
                    var _absx = Math.abs(_x);
                    var _fix = this.fix;
                    var n = ~~(_absx/ _fix);
                    if((_absx % _fix) > (_fix * 0.5)){n++;}
                    animation.sin(_x,-_fix*n,200,function(_mid){
                        self.move2Pos(_mid);
                    },function(){
                        self.index = n;
                        self.move2Pos(-_fix*n);
                        self.count && self.count.apply(null,[self.index]);
                    });
                }
            }
        },

        // 快速滑动
        // todo: 调试效果。
        // todo: 加入加速度换算。
        sliceEnd: function(v){
            var _iw = this.inner.clientWidth;
            var _ow = this.outer.clientWidth;
            if(_iw < _ow){return false;}

            var self = this;
            var _vx = v.x;
            var _absvx = Math.abs(v.x);
            var _x = parseFloat(this.inner.style['webkitTransform'].replace('translateX(',''));
            var _absx = Math.abs();

            if(!!this.fix && _absvx > 1){
                var _fixIndex = this.index - _vx/_absvx;
                if(_fixIndex < 0 || _fixIndex >= ~~(_iw/self.fix)){return false;}
                var _mw = -(_fixIndex*this.fix);
                animation.sin(_x,_mw,200,function(_mid){
                    self.move2Pos(_mid);
                },function(){
                    self.move2Pos(_mw);
                    self.index = _fixIndex;
                    self.count && self.count.apply(null,[self.index]);
                });
            }

            if(this.inertia && _absvx > 1){                
                animation.slowdown(_x,_vx,function(_mid){
                    self.move2Pos(_mid);
                });
            }
        },

        move2Pos : function(_pos,hasBuffer){
            if(hasBuffer == undefined){hasBuffer = true;}
            var _buf =hasBuffer ? this.buffer : 0;
            if(_pos > _buf){
                _pos = _buf;
            }

            var _iw = this.inner.clientWidth;
            var _ow = this.outer.clientWidth;
            var _mw = -_iw + _ow - _buf;
            if(_pos < _mw){
                _pos = _mw;
            }

            this.moving && this.moving.apply(null,[Math.abs(_pos)]);
            this.inner.style['webkitTransform'] =  'translateX(' + _pos + 'px)'
        }
}

//--------view model----------->>
return iSlider
});