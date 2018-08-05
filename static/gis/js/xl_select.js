var vector_style, vector_style_select, myFilter, drawings = null, select_feature_control;
var polygonQuery,rectangleQuery,circleQuery;
var macLayer, placeLayer, deviceLayer, kpersonLayer;
var popup;
var vector_style_temporary;
var url2=gisUrl+"/geoserver/wifi/ows";
function initWFS(){

	var place_style = new SuperMap.Style({
		fillColor: '#0000AA',
		fillOpacity: 0.8,
		pointRadius: 8,
		strokeColor: '#aaee77',
		strokeWidth: 3,
		graphicWidth: 32,
    graphicHeight: 32,
    // graphicYOffset: -40,
    //label: "${address}" ,
    externalGraphic:"../gis/image/video_3.png"
	});


	vector_style_select = new SuperMap.Style({
		fillColor: '#0000AA',
		fillOpacity: 0.8,
    pointRadius: 8,
		strokeColor: '#aaee77',
    strokeWidth: 3,
		graphicWidth: 32,
    graphicHeight: 32,
    // graphicYOffset: -40,
		externalGraphic:"../gis/image/select.png"
	});

  vector_style_temporary = new SuperMap.Style({
    fillColor: '#0000AA',
    fillOpacity: 0.8,
    pointRadius: 8,
    strokeColor: '#aaee77',
    strokeWidth: 3,
    graphicWidth: 32,
    graphicHeight: 32,
    // graphicYOffset: -40,
    externalGraphic:"../gis/image/pin_red.png"
  });

	placeLayer = new SuperMap.Layer.Vector("场所", {
		strategies: [new SuperMap.Strategy.Fixed()],
		protocol: new SuperMap.Protocol.WFS({
		version: "1.0.0",
		url: url2,
		featureType: "t_info_place",
		featureNS: gisUrl+"/wifi",
		featurePrefix: "wifi",
		geometryName: "geom"
		}),
		//filter: myFilter,

		styleMap: new SuperMap.StyleMap({
		'default': place_style,
		'select': vector_style_select,
    'temporary':vector_style_temporary
		})
	});

	select_feature_control = new SuperMap.Control.SelectFeature(placeLayer, {
      callbacks: callbacks,
	    multiple:true,
	    clickout:false,
	    toggle:true,
      onSelect: onFeatureSelected,
	    onUnselect:onUnFeatureSelected
	});

	map.addControl(select_feature_control);
	select_feature_control.activate();

	map.addLayer(placeLayer);

	//回显 区域中选中的场所
  placeLayer.events.register("featuresadded", placeLayer, function(){

    var feas=[];
    var lcode=window.parent.vmObj().lastCodes;
    for(var i=0;i<lcode.length;i++){
      var scode=lcode[i];
      var vecs=placeLayer.getFeaturesByAttribute("service_code",scode);
      if(vecs.length>0){
        feas.push(vecs[0]);
      }
    }

    for(var i=0;i<feas.length;i++){
      feas[i].renderIntent="select";
    }

    placeLayer.selectedFeatures=feas;
    placeLayer.redraw();
  });
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

function onFeatureSelected(currentFeature){
	var fea=currentFeature;
	var name=fea.attributes.service_name;
  var code=fea.attributes.service_code;
	//alert("选中："+name);
  window.parent.vmObj().getCoods(name,code,1);

}
function onUnFeatureSelected(currentFeature){
	var fea=currentFeature;
	var name=fea.attributes.service_name;
  var code=fea.attributes.service_code;
	//alert("取消选中："+name);
  window.parent.vmObj().getCoods(name,code,0);
}

//输入查询
function searchPlace(val){

  var feas=placeLayer.features;
  var selFeatures=[];
  for(var i=0;i<feas.length;i++){

    if(val!=""){
      if(feas[i].attributes.service_code.indexOf(val)!=-1||feas[i].attributes.service_name.indexOf(val)!=-1){
        selFeatures.push(feas[i]);
      }
    }

    if(feas[i].renderIntent=="temporary")
      feas[i].renderIntent="default";
  }
  placeLayer.redraw();

  for(var i=0;i<selFeatures.length;i++){
    var sf=selFeatures[i];
    console.log(sf.attributes.service_name);

    sf.renderIntent="temporary";
  }

  placeLayer.redraw();

}
