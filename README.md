LoopRoll
========

#简介
一个循环滚动插件，支持上下左右4个方向不间隔滚动和间隔滚动。

#使用
	var loop = new LoopRoll( options );
或者

    var loop = LoopRoll( options );

这两种方式都会返回一个new出来的对象。

#选项设置
构造函数中要求传入一个对象，有如下参数可以设置：
	
	optinons = {
		container    : 必选，Element节点类型，包裹滚动元素的容器
		rollElement  : 必选，Element节点类型，需要滚动的元素
		speed        : 可选，Number类型，默认为100，滚动速速，以毫秒为单位
		delay        : 可选，Number类型，默认为0，如果设置为0，表示不间断一直滚动，不为0表示每次滚动直接的间隔
		rollPixel    : 可选，Number类型，每次需要滚动的像素，delay == 0 默认值是1个像素，delay != 0 的时候默认值为容器的宽或者高，最大值也不能超过容器的宽高，超过了会默认为容器的宽高
		direction    : 可选，String类型，滚动的方向，有up,down,rigth,left四个可选参数
		callback     : 可选，Function类型，delay == 0会忽略此参数，delay != 0 表示每次移动完一组元素之后会调用此函数
	}

#例子
请查看项目文件中src/LoopRoll.html文件
