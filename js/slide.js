/**
 * Created by Administrator on 2018/10/18.
 */
function SlideScroll(options){
    this.config = {
        containerCls: '#contaniner', // 外层容器
        contentCls: '#content', // 滚动内容容器
        wrapBarCls: '#wrapBar', // 滚动条容器
        barCls: '#bar', // 滚动条
        sMoveDis: 100, // 鼠标单击
        isVertical: false, // 是否是垂直滚动条(垂直滚动条true)
        isHiddenScroll: false, // 滚动区域默认隐藏(true为隐藏)
        delta: 0
    }

    this.cache = {
        disX: 0,
        disY: 0
    }

    this.init(options);
}

// 只处理了垂直滚动条的状态
SlideScroll.prototype = {
    init: function(options){
        this.config = $.extend(this.config, options || {});

        var self = this,
            _config = self.config,
            _cache = self.cache;

        /*
         * 判断是否是垂直或横向滚动条
         * 分别对横向滚动条或者垂直滚动条初始化宽度或高度
         */
        if(!_config.isVertical){
            // 垂直滚动条
            var containerHeight = $(_config.containerCls).height(), // 外容器高度
                contentWidth = $(_config.contentCls).height(), // 内容高度
                $container = document.getElementById('contaniner');

            // 设置滚动条按钮的高度（容器的高度 * 容器的高度 / 内容的高度）
            var barHeight = containerHeight * containerHeight / contentWidth;
            $(_config.barCls).height(barHeight);
            // 鼠标滚动事件($container为最外框，此参数必是id对象，不然会报Cannot read property 'addEventListener' of undefined)
            self._initMouseWheel($container);
            // 滚动条单击事件
            self._clickScroll();
            // 拖动滚动条事件
            self._dragScroll();

        }else{
            // 横向滚动条
        }

        // 判断是否隐藏滚动条
        if(_config.isHiddenScroll){
            !$(_config.wrapBarCls).hasClass('hidden') && $(_config.wrapBarCls).addClass('hidden');

            // 判断鼠标经过容器，滚动条则显示
            $(_config.containerCls).hover(function(){
                // _animate($wrapBarCls, {
                //     opacity: 0
                // });
                $(_config.wrapBarCls).hasClass('hidden') && $(_config.wrapBarCls).removeClass('hidden')
            },function(){
                // self._animate($wrapBarCls, {
                //     opacity: 1
                // });
                !$(_config.wrapBarCls).hasClass('hidden') && $(_config.wrapBarCls).addClass('hidden');
            });

        }
    },
    _clickScroll: function(){
        var self = this,
            _config = self.config,
            _cache = self.cache;

        $(_config.wrapBarCls).mousedown(function(e){
            if(!_config.isVertical){
                // 垂直滚动
                var tagParent = $(e.target).closest(_config.containerCls),
                    resDisY = e.pageY - $(this, tagParent).offset().top;
                /**
                 *  relDisX = 鼠标相对于文档的上边缘的位置- 目标上侧相对于文档的位置
                 *  $(_config.scrollBarCls,tagParent).position().top  指元素相对于父元素的偏移位置
                 *  $(_config.scrollBarCls,tagParent).width() 当前滚动条的高度
                 */
                if(resDisY > $(_config.barCls, tagParent).position().top + $(_config.barCls, tagParent).height()){
                    if(_config.sMoveDis <=resDisY){
                        self._fnChangePos($(_config.barCls, tagParent).position().top + _config.sMoveDis, tagParent);
                    }else{
                        self._fnChangePos($(_config.barCls, tagParent).position().top + resDisY, tagParent);
                    }
                }else if(resDisY < $(_config.barCls, tagParent).position().top){
                    self._fnChangePos($(_config.barCls, tagParent).position().top - _config.sMoveDis, tagParent);
                }
            }
        });
    },
    _dragScroll: function(){
        var self = this,
            _config = self.config,
            _cache = self.cache;
        if(!_config.isVertical){
            // 垂直
            $(_config.barCls).mousedown(function(e){
                _cache.disY = e.pageY - $(this).position().top;
                if(this.setCapture){
                    $(this).mousemove(function(event){
                        var tagParent = $(event.target).closest(_config.containerCls);
                        self._fnChangePos(event.pageY - _cache.disY, tagParent);
                    });
                    this.setCapture(); // 设置捕获范围

                    $(this).mouseup(function(){
                       $(this).unbind('mousemove mouseup');
                       this.releaseCapture(); // 取消捕获范围
                    });
                }else{
                    $(document).mousemove(function(event){
                        var tagParent = $(event.target).closest(_config.containerCls);
                        self._fnChangePos(event.pageY - _cache.disY, tagParent);
                    });
                    $(document).mouseup(function(){
                       $(document).unbind('mousemove mouseup');
                    });
                }
                return false;
            })
        }
    },
    /*
     * 鼠标滚动事件
     */
    _initMouseWheel: function(dom){
        var self = this,
            _config = self.config,
            _cache = self.cache;

        var dis_bar = $(_config.wrapBarCls).height() - $(_config.barCls).height();
        var wheelEvent = self._addEvent();
        wheelEvent(dom, "mousewheel", function(event){
            var bar_top = parseInt($(_config.barCls).css('top'));

            var wheelDelta = _config.delta;
            if(wheelDelta < 0){
                // 向下滑动
                if(bar_top >= dis_bar) return;
                if(!_config.isVertical){
                    self._fnChangePos($(_config.barCls, dom).position().top + _config.sMoveDis, dom);
                }
            }else{
                // 向上滑动
                if(bar_top <= 0) return;
                if(!_config.isVertical){
                    self._fnChangePos($(_config.barCls, dom).position().top - _config.sMoveDis, dom);
                }
            }
        })
    },
    /*
     *内容移动距离
     *@param xy {string} 移动的距离
     * @param tagParent {object} 父节点
     * 移动距离的方法 (内容的宽度/高度 - 容器的宽度/高度) * 移动的距离 / (容器的宽度/高度 - 滚动条的宽度/高度)
     */
    _fnChangePos: function(disXY, tagParent){
        var self = this,
            _config = self.config;

        // 判断是垂直或横向
        if(!_config.isVertical){
            // 垂直
            if(disXY < 0){
                disXY = 0;
            }else if(disXY > $(tagParent).height() - $(_config.barCls, tagParent).height()){
                disXY = $(tagParent).height() - $(_config.barCls,tagParent).height();
            }
            // 设置滚动条按钮bar的滑动
            $(_config.barCls, tagParent).css("top", disXY);

            // 设置内容框的滑动
            var top = ($(_config.contentCls, tagParent).height() - $(tagParent).height()) * disXY / ($(tagParent).height() - $(_config.barCls, tagParent).height());
            $(_config.contentCls, tagParent).css("top", -top);
        }
    },
    /*
     * 对游览器滚轮事件作了兼容处理
     * 通过调用函数 判断 event.detail 是否大于还是小于0 判断是向上滚动还是向下滚动
     * win7 火狐游览器判断是向下 是通过event.detail这个属性判断 如果是-3的话 那么向下 或者如果是3的话 那么向上
     * win7 其他游览器是通过event.wheelDelta来判断 如果是-120的话 那么向下 否则120的话 是向上
     */
    _addEvent: function(){
        var self = this,
            _config = self.config;
        var _eventCompat=function(event){
            // event.type不同浏览器值不同
            // 在IE，谷歌浏览器下是mousewheel，e.wheelDelta单次滚动值120，为负是向下滚，为正是向上滚
            // 在火狐下是DOMMouseScroll，e.detail单次滚动值3，为正是向下滚，为负是向上滚
            var type = event.type;
            if(type == 'DOMMouseScroll' || type == 'mousewheel'){
                // 单次滚轮的距离重新赋值
                _config.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
            }

            if(event.srcElement && !event.target){
                // 兼容IE，IE下event.target不存在，但srcElement存在
                event.target=event.srcElement;
            }

            if(!event.preventDefault && event.returnValue !==undefined){
                // 兼容IE，IE下event.preventDefault=undefined,event.returnValue=true
                // 重新给event.preventDefault赋值
                event.preventDefault=function(){
                    event.returnValue=false;
                }
            }
            /*
             ...其他一些兼容处理
             */

            return event;
        };

        // 对addEventListener兼容判断
        if(window.addEventListener){
            return function(el, type, fn, capture){
                if(type=='mousewheel' && document.mozFullScreen != undefined){

                    // 火狐浏览器下，type为DOMMouseScroll
                    type='DOMMouseScroll';
                }
                el.addEventListener(type, function(event){
                    event = event || window.event;
                    fn.call(this, _eventCompat(event));
                }, capture || false);
            }
        }else if(window.attachEvent){
            return function(el, type, fn, capture){
                el.attachEvent('on'+type, function(event){
                    event = event || window.event;
                    fn.call(el,  _eventCompat(event));
                });
            }
        }
    },
    _animate: function(el, options, time, fn){
        if(time == undefined){ // 默认的切换频率
            time = 10;
        }

        // dom.timer : 为每个运动添加一个属于自己的线程标志
        clearInterval(el.timer);
        el.timer = setInterval(function(){ // 创建一个定时器，实现运动
            el.isOver = true; // 是否可以停止定时器
            for(var property in options){
                // 改变样式，区分透明度和其他样式改变不一样
                if(property == 'opacity'){
                    var currentValue = parseInt(getStylePropertyValue(el, property) * 100);
                }else{
                    var currentValue = parseInt(getStylePropertyValue(el, property));
                }

                // 速度
                var speed = (options[property] - currentValue) / 10;

                // 三目运算
                speed = currentValue > options[property] ? Math.floor(speed) : Math.ceil(speed);

                // 改变样式属性的值
                currentValue += speed;

                if(property == 'opacity'){
                    el.style.opacity = currentValue / 100;
                    el.style.filter = 'alpha(opacity='+currentValue+')';
                }else{
                    el.style[property] = currentValue + 'px';
                }

            }

            if(el.isOver){
                clearInterval(el.timer);
                if(fn){ // 执行参数回调函数
                    fn();
                }
            }
        }, time);
    },
    // 获取指定样式属性值，兼容
    _getStylePropertyValue: function(el, property){
        if(window.getComputedStyle){ // 标准浏览器,IE8及以下不支持
            return getComputedStyle(el, null)[property];
        }else{ // IE8及以下支持
            return el.currentStyle[property];
        }
    }

}

$(function(){
    new SlideScroll();
})

