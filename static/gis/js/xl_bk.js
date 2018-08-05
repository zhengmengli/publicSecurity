var vector_style, vector_style_select, myFilter, drawings = null, select_feature_control;
var polygonQuery,rectangleQuery,circleQuery;
var popup;
var macLayer, placeLayer, deviceLayer, kpersonLayer;
function initWFS(){


  var feas=window.parent.vmObj().gridData;

  var vectors=new Array();
  for(var i=0;i<feas.length;i++){

    var placeInfo=feas[i].serviceCodeInfo;
    if(placeInfo.length>0){
      var m_style = {
        graphic:true,
        fillColor: '#0000AA',
        fillOpacity: 0.8,
        pointRadius: 8,
        strokeColor: '#aaee77',
        strokeWidth: 3,
        graphicWidth: 32,
        graphicHeight: 32,
        // graphicYOffset: -40,
        //label: placeInfo[0].properties.mac ,
        externalGraphic:"../gis/image/video_1.png"
      };


      var prop=placeInfo[0].properties;
      prop.mac=feas[i].mac;
      prop.maxServiceName=feas[i].maxServiceName;
      prop.maxTime=feas[i].maxTime;

      var point = new SuperMap.Geometry.Point(placeInfo[0].geometry.coordinates[1],placeInfo[0].geometry.coordinates[0]);
      var vec=new SuperMap.Feature.Vector(point,prop,m_style);
      vectors.push(vec);
    }
  }

	var mac_style = new SuperMap.Style({
		fillColor: '#0000AA',
		fillOpacity: 0.8,
		pointRadius: 8,
		strokeColor: '#aaee77',
		strokeWidth: 3,
		graphicWidth: 32,
    graphicHeight: 32,
    // graphicYOffset: -40,
    // label: "${mac}",
    externalGraphic:"../gis/image/video_1.png"
	});


	vector_style_select = new SuperMap.Style({
		fillColor: '#000',
		fillOpacity: 0.9,
		fontColor: '#232323',
		strokeColor: '#ffffff',
		graphicWidth: 32,
    graphicHeight: 32,
    // graphicYOffset: -40,
		externalGraphic:"../gis/image/select.png"
	});

	macLayer = new SuperMap.Layer.Vector("MAC", {
		features:[],// 后台数据  window.parent.vmObj().
		styleMap: new SuperMap.StyleMap({
		'default': mac_style,
		'select': vector_style_select
		})
	});


	var callbacks = {
		    over: function(currentFeature){
		    	var x=currentFeature.geometry.x;
		    	var y=currentFeature.geometry.y;

          var html="";
          var layerName=currentFeature.layer.name;

          html='<a href="javascript:openDetail(\'mac\',\''+currentFeature.attributes.mac+'\');">'+currentFeature.attributes.mac+'</a>' +"<br>"+
            currentFeature.attributes.maxServiceName+"<br>"+
            currentFeature.attributes.maxTime+"<br>" +
            '<a href="javascript:openTrack(\'mac\',\''+currentFeature.attributes.mac+'\');">轨迹</a> ';

				if(popup)
		    		map.removePopup(popup);popup=null;

		    	popup = new SuperMap.Popup("infoWin",
		                new SuperMap.LonLat(x,y),
		                new SuperMap.Size(180,100),
		                html,
		                false);
		    	//popup.closeOnMove = true;
		    	map.addPopup(popup);
		    },
		    out: function(currentFeature){
//		    	if(popup)
//		    		map.removePopup(popup);popup=null;
		    },
		};
	map.events.register("click", map, function(){
		if(popup)
    		map.removePopup(popup);popup=null;
	});

	select_feature_control = new SuperMap.Control.SelectFeature(macLayer, {
	    //onSelect: onFeatureSelected,
	    callbacks: callbacks
	    //hover:true
	});

	map.addControl(select_feature_control);
	select_feature_control.activate();

  macLayer.addFeatures(vectors);
	map.addLayer(macLayer);
	select_feature_control.setLayer([macLayer]);

}
function onFeatureSelected(currentFeature){

}

function clearFeatures() {
	macLayer.removeAllFeatures();

  if(popup)
    map.removePopup(popup);popup=null;
}

//打开轨迹窗口
function openTrack(type,id){

  if(type=='mac'){
    //mac弹窗轨迹
    window.parent.vmObj().macDialogCk(id);
    // window.parent.vmObj().macDialog = true;
    window.parent.vmObj().macDialogActive = '3';
  }else{
    //重点人弹窗轨迹
    window.parent.vmObj().keypDialogCk(id);
    // window.parent.vmObj().keypDialog = true;
    window.parent.vmObj().keypDialogActive = '4';
  }
}

//打开详情窗口
function openDetail(type,id){

  if(type=='mac'){
    //mac弹窗
    window.parent.vmObj().macDialogCk(id);
  }else if(type=='key'){
    //重点人弹窗
    window.parent.vmObj().keypDialogCk(id);
  }else if(type=='device'){
    //设备弹窗
    window.parent.vmObj().equipDialogCk(id);
  }else if(type=='place'){
    //场所弹窗
    window.parent.vmObj().placeDialogCk(id);
  }
}

//定位   供列表定位调用
function listLocation(macinfo){
  var placeInfo=macinfo.serviceCodeInfo;
  if(placeInfo.length>0){

    map.setCenter(new SuperMap.LonLat(placeInfo[0].geometry.coordinates[1], placeInfo[0].geometry.coordinates[0]));
  }
}

//重新设置数据
function resetData(){
  var feas=window.parent.vmObj().macListCoods;
  console.log("resetData",feas)
  if(macLayer)
    macLayer.removeAllFeatures();

  if(popup)
    map.removePopup(popup);popup=null;
  if(feas.length<=0) return;
  var vectors=new Array();
  for(var i=0;i<feas.length;i++){

    var placeInfo=feas[i].serviceCodeInfo;
    if(placeInfo.length>0){
      var m_style = {
        graphic:true,
        fillColor: '#0000AA',
        fillOpacity: 0.8,
        pointRadius: 8,
        strokeColor: '#aaee77',
        strokeWidth: 3,
        graphicWidth: 32,
        graphicHeight: 32,
        // graphicYOffset: -40,
        // label: placeInfo[0].properties.mac ,
        externalGraphic:"../gis/image/video_1.png"
      };


      var prop=placeInfo[0].properties;
      prop.mac=feas[i].mac;
      prop.maxServiceName=feas[i].maxServiceName;
      prop.maxTime=feas[i].maxTime;

      var point = new SuperMap.Geometry.Point(placeInfo[0].geometry.coordinates[1],placeInfo[0].geometry.coordinates[0]);
      var vec=new SuperMap.Feature.Vector(point,prop,m_style);
      vectors.push(vec);
    }
  }

  macLayer.addFeatures(vectors);
}


//打开轨迹窗口
function openTrack(type,id){

  if(type=='mac'){
    //mac弹窗轨迹
    window.parent.vmObj().macDialogCk(id);
    // window.parent.vmObj().macDialog = true;
    window.parent.vmObj().macDialogActive = '3';
  }else{
    //重点人弹窗轨迹
    window.parent.vmObj().keypDialogCk(id);
    // window.parent.vmObj().keypDialog = true;
    window.parent.vmObj().keypDialogActive = '4';
  }
}

//打开详情窗口
function openDetail(type,id){

  if(type=='mac'){
    //mac弹窗
    window.parent.vmObj().macDialogCk(id);
  }else if(type=='key'){
    //重点人弹窗
    window.parent.vmObj().keypDialogCk(id);
  }else if(type=='device'){
    //设备弹窗
    window.parent.vmObj().equipDialogCk(id);
  }else if(type=='place'){
    //场所弹窗
    window.parent.vmObj().placeDialogCk(id);
  }
}
