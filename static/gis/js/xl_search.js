var vector_style, vector_style_select, myFilter, drawings = null, select_feature_control;
var polygonQuery,rectangleQuery,circleQuery;
var popup;
var macLayer, placeLayer, deviceLayer, kpersonLayer;
var url2=gisUrl+"/geoserver/wifi/ows";
function initWFS(){

  var mac_style = new SuperMap.Style({
    fillColor: '#0000AA',
    fillOpacity: 0.8,
    pointRadius: 8,
    strokeColor: '#aaee77',
    strokeWidth: 3,
    graphicWidth: 32,
    graphicHeight: 32,
    //graphicYOffset: -40,
    //label: "${mac}",
    externalGraphic:"../gis/image/video_4.png"
  });

  var place_style = new SuperMap.Style({
    fillColor: '#0000AA',
    fillOpacity: 0.8,
    pointRadius: 8,
    strokeColor: '#aaee77',
    strokeWidth: 3,
    graphicWidth: 32,
    graphicHeight: 32,
    //graphicYOffset: -40,
    //label: "${address}" ,
    externalGraphic:"../gis/image/video_3.png"
  });

  var device_style = new SuperMap.Style({
    fillColor: '#0000AA',
    fillOpacity: 0.8,
    pointRadius: 8,
    strokeColor: '#aaee77',
    strokeWidth: 3,
    graphicWidth: 32,
    graphicHeight: 32,
    //graphicYOffset: -40,
    //label: "${equipment_num}" ,
    externalGraphic:"../gis/image/video_4.png"
  });

  var kperson_style = new SuperMap.Style({
    fillColor: '#0000AA',
    fillOpacity: 0.8,
    pointRadius: 8,
    strokeColor: '#aaee77',
    strokeWidth: 3,
    graphicWidth: 32,
    graphicHeight: 32,
    //graphicYOffset: -40,
    //label: "${name}" ,
    externalGraphic:"../gis/image/video_4.png"
  });

  vector_style_select = new SuperMap.Style({
    fillColor: '#000',
    fillOpacity: 0.9,
    fontColor: '#232323',
    strokeColor: '#ffffff',
    graphicWidth: 32,
    graphicHeight: 32,
    graphicYOffset: -40,
    externalGraphic:"../gis/image/select.png"
  });
  //初始化查询空
  myFilter = new SuperMap.Filter.Comparison({
    type: SuperMap.Filter.Comparison.EQUAL_TO,
    property: "id",
    value: "-1"
  });


  macLayer = new SuperMap.Layer.Vector("MAC", {
    strategies: [new SuperMap.Strategy.Fixed()],
    protocol: new SuperMap.Protocol.WFS({
      version: "1.0.0",
      url: url2,
      featureType: "t_info_equip",
      featureNS: gisUrl+"/wifi",
      featurePrefix: "wifi",
      geometryName: "geom"
    }),
    filter: myFilter,
    styleMap: new SuperMap.StyleMap({
      'default': mac_style,
      'select': vector_style_select
    })
  });
  macLayer.events.register("featuresadded", macLayer, macLayerAddFeas);


  placeLayer = new SuperMap.Layer.Vector("场所", {
    strategies: [new SuperMap.Strategy.Fixed()],
    protocol: new SuperMap.Protocol.WFS({
      version: "1.0.0",
      // version: "1.1.0",
      srsName: "EPSG:4326",
      url: url2,
      featureType: "t_info_place",
      featureNS: gisUrl+"/wifi",
      featurePrefix: "wifi",
      geometryName: "geom"
    }),
    projection: new SuperMap.Projection("EPSG:4326"),
    filter: myFilter,
    styleMap: new SuperMap.StyleMap({
      'default': place_style,
      'select': vector_style_select
    })
  });

  deviceLayer = new SuperMap.Layer.Vector("设备", {
    strategies: [new SuperMap.Strategy.Fixed()],
    protocol: new SuperMap.Protocol.WFS({
      version: "1.0.0",
      url: url2,
      featureType: "t_info_equip",
      featureNS: gisUrl+"/wifi",
      featurePrefix: "wifi",
      geometryName: "geom"
    }),
    filter: myFilter,
    styleMap: new SuperMap.StyleMap({
      'default': device_style,
      'select': vector_style_select
    })
  });



  deviceLayer.events.register("featuresadded", deviceLayer, function(event){
    var mfeas=deviceLayer.features;
    var vecs=new Array();
    mfeas.forEach(function(value,index,array){

      var sides = 50;
      var origin = value.geometry;
      var degree = 2000 / (2 * Math.PI * 6371004) * 360;//2000米 半径
      var polygon = SuperMap.Geometry.Polygon.createRegularPolygon(origin,degree,sides,360);

      var style = {
        strokeWidth: 5,
        strokeOpacity: 5,
        strokeColor: "green",
        fillColor: "blue",
        fillOpacity: 0.5
      };
      var pf = new SuperMap.Feature.Vector(polygon,null,style);
      vecs.push(pf);
    });

    polygonLayer.addFeatures(vecs);

  });

  kpersonLayer = new SuperMap.Layer.Vector("重点人", {
    strategies: [new SuperMap.Strategy.Fixed()],
    protocol: new SuperMap.Protocol.WFS({
      version: "1.0.0",
      url: url2,
      featureType: "t_info_equip",
      featureNS: gisUrl+"/wifi",
      featurePrefix: "wifi",
      geometryName: "geom"
    }),
    filter: myFilter,
    styleMap: new SuperMap.StyleMap({
      'default': kperson_style,
      'select': vector_style_select
    })
  });

  kpersonLayer.events.register("featuresadded", kpersonLayer, keypersonLayerAddFeas);

  var callbacks = {
    over: function(currentFeature){
      var x=currentFeature.geometry.x;
      var y=currentFeature.geometry.y;

      var html="";
      var layerName=currentFeature.layer.name;
      if(layerName=='MAC')
      {
        if(currentFeature.attributes.equipment_num!=null){
          html='<a href="javascript:openDetail(\'device\',\''+currentFeature.attributes.equipment_num+'\');">'+currentFeature.attributes.equipment_num+'</a>' +"<br>"+
            currentFeature.attributes.install_point+"<br>"+
            currentFeature.attributes.create_time+"<br>" ;
        }else{
          html='<a href="javascript:openDetail(\'mac\',\''+currentFeature.attributes.mac+'\');">'+currentFeature.attributes.mac+'</a>' +"<br>"+
            currentFeature.attributes.lastAppearPlace+"<br>"+
            currentFeature.attributes.lastAppearTime+"<br>" +
            '<a href="javascript:openTrack(\'mac\',\''+currentFeature.attributes.mac+'\');">轨迹</a> ';
        }
      }else if(layerName=='场所'){


        if(currentFeature.attributes.service_name!=null){
          html='<a href="javascript:openDetail(\'place\',\''+currentFeature.attributes.service_name+'\');">'+currentFeature.attributes.service_name+'</a>' +"<br>"+
            currentFeature.attributes.service_code+"<br>"+
            currentFeature.attributes.address+"<br>"+
            currentFeature.attributes.create_time+"<br>" ;
        }else{
          html='<a href="javascript:openDetail(\'place\',\''+currentFeature.attributes.serviceName+'\');">'+currentFeature.attributes.serviceName+'</a>' +"<br>"+
            currentFeature.attributes.serviceCode+"<br>"+
            currentFeature.attributes.address+"<br>"+
            currentFeature.attributes.createTime+"<br>" ;
        }

      }else if(layerName=='设备'){


        if(currentFeature.attributes.equipment_num!=null){
          html='<a href="javascript:openDetail(\'device\',\''+currentFeature.attributes.equipment_num+'\');">'+currentFeature.attributes.equipment_num+'</a>' +"<br>"+
            currentFeature.attributes.install_point+"<br>"+
            currentFeature.attributes.create_time+"<br>" ;
        }else{
          html='<a href="javascript:openDetail(\'device\',\''+currentFeature.attributes.equipmentNum+'\');">'+currentFeature.attributes.equipmentNum+'</a>' +"<br>"+
            currentFeature.attributes.equipmentName+"<br>"+
            currentFeature.attributes.lastConnectTime+"<br>" ;
        }
      }else if(layerName=='重点人'){

        if(currentFeature.attributes.lastAppearTime){
          html='<a href="javascript:openDetail(\'key\',\''+currentFeature.attributes.idc+'\');">'+currentFeature.attributes.name+'</a>' +"<br>"+
            currentFeature.attributes.idc +"<br>"+
            currentFeature.attributes.lastAppearTime +"<br>"+
            "<a href='javascript:openTrack(\"key\",\""+currentFeature.attributes.idc+"\");'>轨迹</a> ";
        }else{
          html='<a href="javascript:openDetail(\'key\',\''+currentFeature.attributes.idc+'\');">'+currentFeature.attributes.name+'</a>' +"<br>"+
            currentFeature.attributes.idc+"<br>"+
            currentFeature.attributes.startTime+"<br>" +
            "<a href='javascript:openTrack(\"key\",\""+currentFeature.attributes.idc+"\");'>轨迹</a> ";
        }
      }

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


  //空间查询
  drawings = new SuperMap.Layer.Vector("画框空间查询");
  map.addLayer(drawings);
  polygonQuery = new SuperMap.Control.DrawFeature(drawings, SuperMap.Handler.Polygon);
  map.addControl(polygonQuery);
  polygonQuery.events.on({featureadded: polygonCompleted});

  rectangleQuery = new SuperMap.Control.DrawFeature(drawings, SuperMap.Handler.RegularPolygon);
  map.addControl(rectangleQuery);
  rectangleQuery.events.on({featureadded: rectangleCompleted});

  circleQuery = new SuperMap.Control.DrawFeature(drawings, SuperMap.Handler.RegularPolygon,{handlerOptions:{sides:50}});
  map.addControl(circleQuery);
  circleQuery.events.on({featureadded: circleCompleted});


  map.addLayer(placeLayer);
  map.addLayer(deviceLayer);
  map.addLayer(kpersonLayer);
  map.addLayer(macLayer);
  // macLayer.setOpacity(0);

  select_feature_control.setLayer([macLayer,placeLayer,deviceLayer,kpersonLayer]);
}
function macLayerAddFeas(event) {
  var mfeas=macLayer.features;

  var deviceIds=[];
  mfeas.forEach(function(value,index,array){
    deviceIds.push(value.attributes.equipment_num);
  });

  //调用后台接口 返回mac的信息
  window.parent.vmObj().getMacByEquip({equipNums:deviceIds.join()});
  // window.parent.vmObj().macAll;
}

function getMacsByDeviceId(macAll){

  var data=macAll.data;
  var vectors=[];

  for(var i=0;i<data.length;i++){
    var res=data[i];
    var macs=res.macs;

    for(var m=0;m<macs.length;m++){
      var point = new SuperMap.Geometry.Point(res.x,res.y);

      var m_style = {
        graphic:true,
        fillColor: '#0000AA',
        fillOpacity: 0.8,
        pointRadius: 8,
        strokeColor: '#aaee77',
        strokeWidth: 3,
        graphicWidth: 32,
        graphicHeight: 32,
        externalGraphic:"../gis/image/video_1.png"
      };

      var prop=new Object();
      prop.mac=macs[m].mac;
      prop.lastAppearPlace=res.equipment_num;
      prop.lastAppearTime=macs[m].startTime;

      var vec=new SuperMap.Feature.Vector(point,prop,m_style);
      vectors.push(vec);
    }
  }

  if(vectors.length>0){
    macLayer.removeAllFeatures();
    macLayer.events.unregister("featuresadded", macLayer, macLayerAddFeas);
    macLayer.addFeatures(vectors);
    macLayer.events.register("featuresadded", macLayer, macLayerAddFeas);
  }

}


function keypersonLayerAddFeas(event) {
  var mfeas=kpersonLayer.features;

  var deviceIds=[];
  mfeas.forEach(function(value,index,array){
    deviceIds.push(value.attributes.equipment_num);
  });

  //调用后台接口 返回重点人的信息
  window.parent.vmObj().getKeyPersonByEquip({equipNums:deviceIds.join()});
  //var macs=window.parent.vmObj().keyAll;
}
function getKeysByDeviceId(keyAll){
  console.log(keyAll);
  var data=keyAll.data;
  var vectors=[];

  for(var i=0;i<data.length;i++){
    var res=data[i];
    var peoples=res.peoples;

    for(var m=0;m<peoples.length;m++){
      var point = new SuperMap.Geometry.Point(res.x,res.y);

      var p_style = {
        graphic:true,
        fillColor: '#0000AA',
        fillOpacity: 0.8,
        pointRadius: 8,
        strokeColor: '#aaee77',
        strokeWidth: 3,
        graphicWidth: 32,
        graphicHeight: 32,
        externalGraphic:"../gis/image/video_2.png"
      };

      var prop=new Object();
      prop.name=peoples[m].name;
      prop.equipment_num=res.equipment_num;
      prop.mac=peoples[m].mac;
      prop.phone=peoples[m].phone;
      prop.idc=peoples[m].idc;
      prop.startTime=peoples[m].startTime;

      var vec=new SuperMap.Feature.Vector(point,prop,p_style);
      vectors.push(vec);
    }
  }

  if(vectors.length>0){
    kpersonLayer.removeAllFeatures();
    kpersonLayer.events.unregister("featuresadded", kpersonLayer, keypersonLayerAddFeas);
    kpersonLayer.addFeatures(vectors);
    kpersonLayer.events.register("featuresadded", kpersonLayer, keypersonLayerAddFeas);
  }
}
function onFeatureSelected(currentFeature){

}
function polygonActive() {
  clearFeatures();
  polygonQuery.activate();
}

function rectangleActive() {
  clearFeatures();
  rectangleQuery.activate();
}

function circleActive() {
  clearFeatures();
  circleQuery.activate();
}

function clearFeatures() {
  cgeometry=null;
  macLayer.removeAllFeatures();
  placeLayer.removeAllFeatures();
  deviceLayer.removeAllFeatures();
  kpersonLayer.removeAllFeatures();
  drawings.removeAllFeatures();
  if(popup)
    map.removePopup(popup);popup=null;
}

//直接加载后台返回的信息
function logicalFilterLayer(){
  removeAllFeatures();
  var type=window.parent.vmObj().tablefalg;
  var tableData;
  var imgUrl="";
  var clayer;
  if(type==1){//mac
    clayer=macLayer;
    tableData=window.parent.vmObj().tableData1;
    imgUrl="../gis/image/video_1.png";

    for(var i=0;i<tableData.length;i++){
      if(tableData[i]==null) continue;

      console.log(tableData[i]);
    }
  }else if(type==2){//place
    clayer=placeLayer;
    tableData=window.parent.vmObj().tableData2;
    imgUrl="../gis/image/video_3.png";
  }else if(type==3){//device
    clayer=deviceLayer;
    tableData=window.parent.vmObj().tableData3;
    imgUrl="../gis/image/video_4.png";
  }else if(type==4){//key
    clayer=kpersonLayer;
    tableData=window.parent.vmObj().tableData4;
    imgUrl="../gis/image/video_2.png";
  }


  var vectors=new Array();
  for(var i=0;i<tableData.length;i++){

    if(tableData[i]==null) continue;
    var place_style = {
      graphic:true,
      fillColor: '#0000AA',
      fillOpacity: 0.8,
      pointRadius: 8,
      strokeColor: '#aaee77',
      strokeWidth: 3,
      graphicWidth: 32,
      graphicHeight: 32,
      //label: feas[i].properties.address ,
      externalGraphic:imgUrl
    };

    var point = new SuperMap.Geometry.Point(tableData[i].geometry.coordinates[1],tableData[i].geometry.coordinates[0]);
    var vec=new SuperMap.Feature.Vector(point,tableData[i].properties,place_style);
    vectors.push(vec);
  }
  macLayer.events.unregister("featuresadded", macLayer, macLayerAddFeas);
  clayer.addFeatures(vectors);
  macLayer.events.register("featuresadded", macLayer, macLayerAddFeas);
}

//根据属性查询 过滤
function logicalFilterLayer2(){

  var fieldName;
  var clayer;
  var type=window.parent.vmObj().tablefalg;
  var tableData;
  if(type==1){//mac
    fieldName='mac';
    clayer=macLayer;
    tableData=window.parent.vmObj().tableData1;
  }else if(type==2){//place
    fieldName='serviceCode';
    clayer=placeLayer;
    tableData=window.parent.vmObj().tableData2;
  }else if(type==3){//device
    fieldName='equipmentNum';
    clayer=deviceLayer;
    tableData=window.parent.vmObj().tableData3;
  }else if(type==4){//key
    fieldName='idc';
    clayer=kpersonLayer;
    tableData=window.parent.vmObj().tableData4;
  }
  //ids=['ec-56-a8-36-23-94','ec-56-a8-36-23-95'];

  if(tableData.length<=0) return;
  var fs=new Array();
  for(var i=0;i<tableData.length;i++){
    var prop=tableData[i].properties;
    var val=prop[fieldName];

    var lyrFieldName="";
    if(type==1) {//mac
      lyrFieldName="mac";
    }else if(type==2) {//place
      lyrFieldName="service_code";
    }else if(type==3) {//device
      lyrFieldName="equipment_num";
    }else if(type==4) {//key
      lyrFieldName="idc";
    }


    var mfilter = new SuperMap.Filter.Comparison({
      type : SuperMap.Filter.Comparison.EQUAL_TO,
      property : lyrFieldName,
      value : val
    });
    fs.push(mfilter);
  }

  var lfilter = new SuperMap.Filter.Logical({
    type : SuperMap.Filter.Logical.OR,
    filters : fs
  });
  clayer.filter = lfilter;
  clayer.refresh({force: true});
}
var cgeometry;
//画图查询
function filterLayer(event){
  var val = $('input[name="dtype"]:checked').val();
  if(val=="0"){

    macLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: event.feature.geometry
    });
    macLayer.refresh({force: true});
  }else if(val=="1"){
    placeLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: event.feature.geometry
    });
    placeLayer.refresh({force: true});
  }else if(val=="2"){
    deviceLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: event.feature.geometry
    });
    deviceLayer.refresh({force: true});
  }else if(val=="3"){
    kpersonLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: event.feature.geometry
    });
    kpersonLayer.refresh({force: true});
  }
  cgeometry=event.feature.geometry;
}


function polygonCompleted(event) {

  filterLayer(event);
  polygonQuery.deactivate();
}

function rectangleCompleted(event) {
  filterLayer(event);
  rectangleQuery.deactivate();
}

function circleCompleted(event) {
  filterLayer(event);
  //vectorLayer.filter = myFilter;
  circleQuery.deactivate();
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

function clickRadio(val){

  if(cgeometry==null) return;
  macLayer.removeAllFeatures();
  placeLayer.removeAllFeatures();
  deviceLayer.removeAllFeatures();
  kpersonLayer.removeAllFeatures();
  polygonLayer.removeAllFeatures();
  if(popup)
    map.removePopup(popup);popup=null;
  if(val=="0"){

    macLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: cgeometry
    });
    macLayer.refresh({force: true});
  }else if(val=="1"){
    placeLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: cgeometry
    });
    placeLayer.refresh({force: true});
  }else if(val=="2"){
    deviceLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: cgeometry
    });
    deviceLayer.refresh({force: true});
  }else if(val=="3"){
    kpersonLayer.filter = new SuperMap.Filter.Spatial({
      type: SuperMap.Filter.Spatial.INTERSECTS,
      value: cgeometry
    });
    kpersonLayer.refresh({force: true});
  }
}

function locationByDeviceId(type,deviceId){
  alert(type+" "+deviceId);
  var vecs;
  if(type=="mac"){
    vecs=macLayer.getFeaturesByAttribute("equipment_num",deviceId);
  }else {
    vecs=kpersonLayer.getFeaturesByAttribute("equipment_num",deviceId);
  }
  if(vecs.length>0){
    map.setCenter(new SuperMap.LonLat(vecs[0].geometry.coordinates[1], vecs[0].geometry.coordinates[0]));
  }

}
