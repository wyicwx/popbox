#弹出框
简单弹出框
###用法
    var box = mBoxy.new();

    var box = mBoxy.new({
        name : "box-0",
    	hasTitle : true,
    	hasBackground : true
    })

#####mBox对象的api

`Box.getBackgroundObject`
返回背景对象

`Box.getBox`
返回弹出框，弹出框的name为参数

`Box.getBoxSize`
返回框数量

`Box.destroy`
销毁一个弹出框，可以把弹出框对象或者弹出框name作为参数

#####box对象的api

`box.toggle`
对象显示\消失切换，可以传入true\false参数

`box.trigger`
触发对象事件函数，可以传入多个参数

`box.show`
对象显示

`box.hide`
对象隐藏

`box.title`
设置弹出框标题

`box.html`
设置弹出框内html

`box.insert`
将对象插入DOM

`box.popup`
对象淡入

`box.popdown`
对象淡出

`box.remove`
将对象从DOM 中删除

`box.position`
传入两个参数x,y定位弹出框，不传参数默认居中