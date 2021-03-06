/*!
 * LoopRoll v1.0.0
 * Copyright (c) 2013, in shenzhen. luzhao@xunlei.com
 */

(function( window ) {

	/*
	需要滚动的元素最好不要有id属性，因为循环滚动会clone相应的滚动元素，
	如果有id会造成id重复
	*/

	var requestAnimationFrame = window.requestAnimationFrame 
		|| window.mozRequestAnimationFrame 
		|| window.webkitRequestAnimationFrame 
		|| window.msRequestAnimationFrame 
		|| window.oRequestAnimationFrame 
		|| function(callback) { setTimeout(callback, 1000 / 60); };

	var noop = function(){};
	var DIRECTION = ["up" , "down", "left", "right"];

	if( !Array.prototype.indexOf ) {
		Array.prototype.indexOf = function( value ) {
			for( var i = 0, j = this.length; i < j; i++ ) {
				if( this[i] === value ) {
					return i;
				}
			}
			return -1;
		}
	}

	function animate( run, end, duration ) {
		var startTime = new Date().getTime(),
		run = run || noop;
		end = end || noop;
		duration = duration || 500;

		function go() {
			var timestamp = new Date().getTime();
			var progress = timestamp - startTime;
			if( progress >= duration ) {
				if( util.isFunction(run) ) {
					run(1);
				}
				if( util.isFunction(end) ) {
					end();
				}
				return;
			}
			if( util.isFunction(run) ) {
				run( progress / duration );
			}
			requestAnimationFrame( go );
		}
		requestAnimationFrame( go );
	}

	var LoopRoll = function( options ) {
		if( !options.container || !options.rollElement || !util.isElement( options.container ) || !util.isElement( options.rollElement ) ) {
			throw new Error("Missing parameter");
			return this;
		}

		if( !( this instanceof LoopRoll ) ) {
			var obj = new LoopRoll( options );
			return obj;
		}

		this._container = options.container;
		this._rollElement = options.rollElement;
		this._speed = options.speed || 100;
		this._delay = options.delay || 0;
		this._direction = DIRECTION.indexOf( options.direction ) != -1 ? options.direction : "up";
		this._rollPixel = options.rollPixel || ( this._delay != 0 ? ( this.getRollType() == "H" ? this._container.clientWidth : this._container.clientHeight ) : 1 );
		this._callback = util.bind( this._delay == 0 ? noop : ( options.callback || noop ), this );

		//间隔播放的时候判断是否要暂停播放的标志
		this._isStopLoop = false;

		//间隔播放的时候标志是处于滚动状态还是间隔状态，为true表示正在滚动
		this._isRolling = false;

		//轮播的时候最多只能滚动容器的宽度或者高度那么多像素
		if( ["up", "down"].indexOf(this._direction) != -1 && this._delay != 0 ) {
			this._rollPixel = this._rollPixel > this._container.clientHeight ? this._container.clientHeight : this._rollPixel;
		}

		if( ["left", "right"].indexOf(this._direction) != -1 && this._delay != 0 ) {
			this._rollPixel = this._rollPixel > this._container.clientWidth ? this._container.clientWidth : this._rollPixel;
		}
		
		this._init();
	};

	LoopRoll.prototype._init = function() {
		if( util.getComputedStyle( this._container, "position" ) == "static" ) {
			this._container.style.position = "relative";
		}

		if( util.getComputedStyle( this._rollElement, "position" ) == "static" ) {
			this._rollElement.style.position = "absolute";
		}

		//marquee为循环滚动的处理函数，循环滚动意味着中途不会暂停
		var marquee = util.bind( this._marquee, this );

		//rollPlay为轮播的处理函数，轮播是指中间会暂定一下然后循环
		var rollPlay = util.bind( this._rollPlay, this );

		this._rollElementClone = this._rollElement.cloneNode( true );
		this._container.style.overflow = "hidden";
		this._container.appendChild( this._rollElementClone );

		if( ["up", "down"].indexOf( this._direction ) != -1 ) {
			//this._rollElement.style.top = "0px";
			this._rollElementClone.style.top = this._rollElement.offsetHeight + "px";
		}

		if( ["left", "right"].indexOf(this._direction) != -1 ) {
			//this._rollElement.style.left = "0px";
			this._rollElementClone.style.left = this._rollElement.offsetWidth + "px";
		}
		
		if( this._direction == "up" ) {
			this._container.scrollTop = 0;
		}
		else if ( this._direction == "down" ) {
			this._container.scrollTop = this._rollElement.offsetHeight;
		}
		else if( this._direction == "left" ) {
			this._container.scrollLeft = 0;
		}
		else if( this._direction == "right" ) {
			this._container.scrollLeft = this._rollElement.offsetWidth;
		}
		
		if( this._delay == 0 ) {
			this._timerId = setInterval( marquee, this._speed );
		}
		else {
			this._timerId = setTimeout( rollPlay, this._delay );
		}
		
		util.addEvent( this._container, "mouseover", util.bind( function() {
			if( this._delay == 0 ) {
				clearInterval( this._timerId );
			}
			else {
				this._isStopLoop = true;
				clearTimeout( this._timerId );
			}
			this._timerId = null;
		}, this ) );

		util.addEvent( this._container, "mouseout", util.bind( function() {
			if( this._delay == 0 ) {
				this._timerId = setInterval( marquee, this._speed );
			}
			else {
				this._isStopLoop = false;
				this._timerId = setTimeout( rollPlay, this._delay );
			}
		}, this ) );
	}

	LoopRoll.prototype._marquee = function() {
		if( this._direction == "up" ) {
			var scrollEnd = this._container.scrollTop + this._rollPixel;
			if( scrollEnd >= this._rollElement.offsetHeight ) {
				this._container.scrollTop = scrollEnd - this._rollElement.offsetHeight;
			}
			else {
				this._container.scrollTop = scrollEnd;
			}
		}
		else if ( this._direction == "down" ) {
			var scrollEnd = this._container.scrollTop - this._rollPixel;
			if( scrollEnd <= 0 ) {
				this._container.scrollTop = scrollEnd + this._rollElement.offsetHeight;
			}
			else {
				this._container.scrollTop = scrollEnd;
			}
		}
		else if( this._direction == "left" ) {
			var scrollEnd = this._container.scrollLeft + this._rollPixel;
			if( scrollEnd >= this._rollElement.offsetWidth ) {
				this._container.scrollLeft = scrollEnd - this._rollElement.offsetWidth;
			}
			else {
				this._container.scrollLeft = scrollEnd;
			}
		}
		else if ( this._direction == "right" ) {
			var scrollEnd = this._container.scrollLeft - this._rollPixel;
			if( scrollEnd <= 0 ) {
				this._container.scrollLeft = scrollEnd + this._rollElement.offsetWidth;
			}
			else {
				this._container.scrollLeft = scrollEnd;
			}
		}
	}

	LoopRoll.prototype._rollPlay = function( direction ) {
		direction = direction || this._direction;
		var end = util.bind( function() {
			this._isRolling = false;
			this._callback();
			if( !this._isStopLoop ) {
				this._timerId = setTimeout( util.bind( this._rollPlay, this ), this._delay );
			}
		}, this );

		if( direction == "up" ) {
			var top = this._container.scrollTop;
			var run = util.bind( function (progress) {
				this._isRolling = true;
				this._container.scrollTop = ( top + parseInt( progress * this._rollPixel , 10 ) ) % this._rollElement.offsetHeight;
			}, this);

			animate( run, end, this._speed );
		}
		else if( direction == "down" ) {
			var top = this._container.scrollTop;
			var run = util.bind( function (progress) {
				this._isRolling = true;
				var scrollEnd = ( top - parseInt( progress * this._rollPixel , 10 ) ) % this._rollElement.offsetHeight;
				this._container.scrollTop = scrollEnd <= 0 ? scrollEnd + this._rollElement.offsetHeight : scrollEnd;
			}, this);

			animate( run, end, this._speed );
		}
		else if( direction == "left" ) {
			this._isRolling = true;
			var left = this._container.scrollLeft;
			var run = util.bind( function (progress) {
				this._container.scrollLeft = ( left + parseInt( progress * this._rollPixel , 10 ) ) % this._rollElement.offsetWidth;
			}, this);

			animate( run, end, this._speed );
		}
		else if( direction == "right" ) {
			this._isRolling = true;
			var left = this._container.scrollLeft;
			var run = util.bind( function (progress) {
				var scrollEnd = ( left - parseInt( progress * this._rollPixel , 10 ) ) % this._rollElement.offsetWidth;
				this._container.scrollLeft = scrollEnd <= 0 ? scrollEnd + this._rollElement.offsetWidth : scrollEnd;
			}, this);

			animate( run, end, this._speed );
		}
	}

	//获取当前滚动的位置
	LoopRoll.prototype.getRollPosition = function() {
		if( ["up", "down"].indexOf( this._direction ) != -1 ) {
			return this._container.scrollTop;
		}

		if( ["left", "right"].indexOf(this._direction) != -1 ) {
			return this._container.scrollLeft;
		}
	}

	//获取滚动的类型，V表示垂直滚动，H表示水平滚动
	LoopRoll.prototype.getRollType = function() {
		if( ["up", "down"].indexOf( this._direction ) != -1 ) {
			return "V";
		}

		if( ["left", "right"].indexOf(this._direction) != -1 ) {
			return "H";
		}
	}

	LoopRoll.prototype.previous = function() {
		var direction = "";
		if( this._delay != 0 ) {
			if( this.getRollType() == "V" ) {
				direction = "down";
			}
			else {
				direction = "right";
			}

			if( !this._isRolling ) {
				clearTimeout( this._timerId );
				this._timerId = null;
				this._rollPlay( direction );
			}
		}
		return this;
	}

	LoopRoll.prototype.next = function() {
		var direction = "";
		if( this._delay != 0 ) {
			if( this.getRollType() == "V" ) {
				direction = "up";
			}
			else {
				direction = "left";
			}

			if( !this._isRolling ) {
				clearTimeout( this._timerId );
				this._timerId = null;
				this._rollPlay( direction );
			}		
		}
		return this;
	}

	var util = {
		isElement: function( obj ) {
			return ( obj && obj.nodeType && obj.nodeType === 1 ) ? true : false;
		},

		isFunction: function( obj ) {
			return Object.prototype.toString.call(obj) == "[object Function]";
		},

		bind: function(func, context){
			if (Function.prototype.bind) {
				return func.bind(context);
			}
			else {
				return function(){
					return func.apply(context, Array.prototype.slice.call(arguments, 0));
				};
			}
		},

		addEvent: function(elem, type, func) {
			if(elem.attachEvent){
				elem.attachEvent("on" + type, func);
			}
			else if(elem.addEventListener){
				elem.addEventListener(type, func, false);
			}
		},
		
		removeEvent: function(elem, type, func) {
			if(elem.attachEvent){
				elem.detachEvent("on" + type, func);
			}
			else if(elem.removeEventListener){
				elem.removeEventListener(type, func);
			}
		},

		getComputedStyle: function( el, name ) {
			if( el.style && el.style[name] ){
				return el.style[name];
			}
			else if( el.currentStyle ) {
				return el.currentStyle[name];
			}
			else if( document.defaultView && document.defaultView.getComputedStyle ){
				var rupper = /([A-Z]|^ms)/g;
				name = name.replace( rupper, "-$1" ).toLowerCase();
				var ret = document.defaultView.getComputedStyle( el, null );
				return ret && ret.getPropertyValue( name );
			}
			return null;
		},

		css: function( elem, name, value ) {
			if( value !== undefined ) {
				elem.style[name] = value;
			}
			else{
				var result = this.getComputedStyle( elem, name );
				var IntValue = ["top", "left", "bottom", "right"];
				return IntValue.indexOf(name) != -1 ? parseInt( result, 10 ) : result;
			}
		}
	}

	window["LoopRoll"] = window.LoopRoll || LoopRoll; 
})( window );