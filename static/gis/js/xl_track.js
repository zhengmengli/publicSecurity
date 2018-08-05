
    var points = [];
    // points.push(new SuperMap.Geometry.Point(116.55, 39.78));
    // points.push(new SuperMap.Geometry.Point(116.64, 39.85));
    // points.push(new SuperMap.Geometry.Point(116.66, 39.94));
    // points.push(new SuperMap.Geometry.Point(116.75, 39.89));
    // points.push(new SuperMap.Geometry.Point(116.79, 39.78));

    var pData=window.parent.vmObj().macTable;
	  var car1 = new Image();
    car1.src = "../gis/image/car.png";

    var lineVectorLayer, feature, car, vectorLayerCar, steps = 10, redraw = false, timerid,
    //定义公交线路的样式。
    styleLine = {
        strokeColor: "black",
        strokeWidth: 1,
        fill: false
    };
    function initTrack(){
        /*
         * 不支持canvas的浏览器不能运行该范例
         * android 设备也不能运行该范例*/
        var broz = SuperMap.Util.getBrowser();

        if(!document.createElement('canvas').getContext) {
            alert('您的浏览器不支持 canvas，请升级');
            return;
        } else if (broz.device === 'android') {
            alert('您的设备不支持高性能渲染，请使用pc或其他设备');
            return;
        }


        //初始化公交车路线图层。
        lineVectorLayer = new SuperMap.Layer.Vector("路线图层", {
            styleMap: new SuperMap.StyleMap({
                "default": styleLine})});
        //初始化公交车图层。
        vectorLayerCar = new SuperMap.Layer.Vector("车图层", {renderers: ["Canvas2"]});
        addTrackLayer();
        initData();
    }

    function addTrackLayer() {
        map.addLayers([lineVectorLayer, vectorLayerCar]);
        vectorLayerCar.events.register("featuresadded", vectorLayerCar, addFeaturesCompelte);
    }

    //初始化路径数据
    function initData() {
        vectorLayerCar.removeAllFeatures();
        lineVectorLayer.removeAllFeatures();
        window.clearTimeout(timerid);

        for(var i=0;i<pData.length;i++){
          var x=pData[i].xpoint;
          var y=pData[i].ypoint;

          var pt=new SuperMap.Geometry.Point(y, x);
          points.push(pt);
        }

        if(points.length<=0) return;
        feature = new SuperMap.Feature.Vector(new SuperMap.Geometry.LineString(points));
        lineVectorLayer.addFeatures([feature]);



        var orientation = 1;
        for(var k = 0, len = 1; k < len; k++) {
            car = new SuperMap.Feature.Vector(points[k].clone());
            //定义bus的style。
            car.style = {pointRadius: 15, stroke: false};
            var cargeometry = car.geometry;
            //模拟bus的基本信息。
            car.line = feature;
            car.orientation = orientation;
            car.currentIndex = k;
            if(points[car.currentIndex + car.orientation]) {
                car.nextPoint = points[k + car.orientation];
                var dx = car.nextPoint.x - cargeometry.x;
                var dy = car.nextPoint.y - cargeometry.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                car.speed = parseInt(5) * car.orientation;
//                car.speed = parseInt(Math.random() * 5 + 2) * car.orientation;
                if(car.speed == 0) {car.speed = 10};
                car.moves = distance / (car.speed/10000);
                car.vx = dx / car.moves;
                car.vy = dy / car.moves;
                var angle = Math.atan2(dx, dy);
                car.style.rotation = angle / Math.PI * 180;
                car.style.externalGraphicSource = car1;
                car.style.externalGraphic = car1.src;
                car.stop = false;
            }else{
                car.stop = true;
                car.style.externalGraphicSource = car1;
                car.style.externalGraphic = car1.src;
            }
            orientation *= -1;
        }

        vectorLayerCar.addFeatures([car]);
    }

    var begin=false;

    function start(){
    	if(begin) return;
    	begin=true;
    	monitor();
    }


    function monitor() {

        vectorLayerCar.removeAllFeatures();
        redraw = false;
        var cargeometry = car.geometry;
        if(!car.stop) {
            if(car.moves < 1) {
                cargeometry.x = car.nextPoint.x;
                cargeometry.y = car.nextPoint.y;
                //定义car的信息。
                var feature = car.line, nextP;
                car.currentIndex += car.orientation;
                nextP = feature.geometry.components[car.currentIndex + car.orientation];
                if(nextP) {
                    var dx = nextP.x - cargeometry.x;
                    var dy = nextP.y - cargeometry.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    car.moves = Math.abs(distance / (car.speed/10000));
                    car.vx = dx / car.moves;
                    car.vy = dy / car.moves;
                    var angle = Math.atan2(dx, dy);
                    car.style.rotation = angle / Math.PI * 180;
                    car.nextPoint = nextP;
                }else{
                    car.stop = true;
                    car.style.fillColor = "rgb(150,150,150)";
                }
            }else{
                cargeometry.x += car.vx;
                cargeometry.y += car.vy;
                car.moves--;
            }
            //只要有车移动就需要重绘。
            redraw = true;
        }
        vectorLayerCar.addFeatures([car]);
    }

    //在这个函数里定义重绘，保证每一个都已经被绘制。
    function addFeaturesCompelte(args) {
        if(redraw) {
            timerid = setTimeout(monitor, 50);
        }
    }

    //停止监控
    function stopMonitor() {
        window.clearTimeout(timerid);
        redraw = false;
        begin=false;
    }

    function resetMonitor() {
    	begin=false;
    	stopMonitor();
    	initData();
    }

    //重新设置轨迹数据
    function setTrackData(tdata){

    }
