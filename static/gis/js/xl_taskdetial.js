var vector_style, vector_style_select, myFilter, drawings = null, select_feature_control;
var polygonQuery,rectangleQuery,circleQuery;
var macLayer, placeLayer, deviceLayer, kpersonLayer;
var popup;
function initWFS(){

  var feas=null;
  if(window.parent.vmObj().placeMap!=null)
  {
    feas=window.parent.vmObj().placeMap.features;
  }else {

    feas=window.parent.vmObj().currentAreaMes;
  }

  var vectors=new Array();
  for(var i=0;i<feas.length;i++){

    if(feas[i]==null) continue;
    var place_style = {
      graphic:true,
      fillColor: '#0000AA',
      fillOpacity: 0.8,
      pointRadius: 8,
      strokeColor: '#aaee77',
      strokeWidth: 3,
      graphicWidth: 32,
      graphicHeight: 32,
      // graphicYOffset: -40,
      // label: feas[i].properties.address ,
      externalGraphic:"../gis/image/video_3.png"
    };

    var point = new SuperMap.Geometry.Point(feas[i].geometry.coordinates[1],feas[i].geometry.coordinates[0]);
    var vec=new SuperMap.Feature.Vector(point,feas[i].properties,place_style);
    vectors.push(vec);
  }
	placeLayer = new SuperMap.Layer.Vector("场所", {
		features:[]//需要后台传参
	});

  placeLayer.addFeatures(vectors);

	map.addLayer(placeLayer);

	if(vectors.length==1){
	  var pnt=vectors[0].geometry;
    var lonlat=new SuperMap.LonLat(pnt.x,pnt.y);
	  map.setCenter(lonlat);
  }

  select_feature_control = new SuperMap.Control.SelectFeature(placeLayer, {
    callbacks: callbacks
  });

  map.addControl(select_feature_control);
  select_feature_control.activate();
}
//重新设置数据
function resetData(){

  var feas=window.parent.vmObj().currentAreaMes;
  placeLayer.removeAllFeatures();
  if(feas.length<=0) return;
  var vectors=new Array();
  for(var i=0;i<feas.length;i++){

    if(feas[i]==null) continue;
    var place_style = {
      graphic:true,
      fillColor: '#0000AA',
      fillOpacity: 0.8,
      pointRadius: 8,
      strokeColor: '#aaee77',
      strokeWidth: 3,
      graphicWidth: 32,
      graphicHeight: 32,
      // graphicYOffset: -40,
      // label: feas[i].properties.address ,
      externalGraphic:"../gis/image/video_3.png"
    };

    var point = new SuperMap.Geometry.Point(feas[i].geometry.coordinates[1],feas[i].geometry.coordinates[0]);
    var vec=new SuperMap.Feature.Vector(point,feas[i].properties,place_style);
    vectors.push(vec);
  }

  placeLayer.addFeatures(vectors);
}


var callbacks = {
  over: function(currentFeature){
    var x=currentFeature.geometry.x;
    var y=currentFeature.geometry.y;

    var html="";
    html=currentFeature.attributes.service_name +"<br>"+
      // currentFeature.attributes.service_code+"<br>"+
      currentFeature.attributes.address+"<br>";
    // currentFeature.attributes.create_time+"<br>" ;

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
    if(popup)
      map.removePopup(popup);popup=null;
  },
};
