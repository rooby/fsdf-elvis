/**
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}angular.module("common.baselayer.control",["geo.maphelper","geo.map","common.slider"]).directive("commonBaselayerControl",["mapHelper","mapService",function(e,t){var n={maxZoom:12};return{template:'<slider ui-tooltip="hide" min="0" max="1" step="0.1" ng-model="slider.opacity" updateevent="slideStop"></slider>',scope:{maxZoom:"="},link:function(r,a){"undefined"==typeof r.maxZoom&&(r.maxZoom=n.maxZoom),r.slider={opacity:-1,visibility:!0,lastOpacity:1},e.getPseudoBaseLayer().then(function(e){r.layer=e,r.slider.opacity=e.options.opacity}),r.$watch("slider.opacity",function(e,n){n<0||t.getMap().then(function(e){e.eachLayer(function(e){e.pseudoBaseLayer&&e.setOpacity(r.slider.opacity)})})})}}}]);var versions={3:{version:"3.0",link:"https://creativecommons.org/licenses/by/3.0/au/"},4:{version:"4.0",link:"https://creativecommons.org/licenses/by/4.0/"}};angular.module("common.cc",[]).directive("commonCc",[function(){return{templateUrl:"common/cc/cc.html",scope:{version:"=?"},link:function(e){e.version?e.details=versions[e.version]:e.details=versions[4],e.template="common/cc/cctemplate.html"}}}]);var captured=function(e){var t=e.split(" - ");return 2!==t.length?e:formatDate(t[0])+" - "+formatDate(t[1])},formatDate=function(e){return 8!==e.length?e:e.substr(0,4)+"/"+e.substr(4,2)+"/"+e.substr(6,2)};angular.module("common.featureinfo",[]).directive("commonFeatureInfo",["$http","$log","$q","$timeout","featureInfoService","flashService","mapService","messageService",function(e,t,n,r,a,i,o,l){var s="https://elvis2018-ga.fmecloud.com/fmedatastreaming/elvis_indexes/GetFeatureInfo_ElevationAvailableData.fmw?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&SRS=EPSG%3A4326&BBOX=${bounds}&WIDTH=${width}&HEIGHT=${height}&LAYERS=public.QLD_Elevation_Metadata_Index,public.ACT2015-Tile_Index_55,public.5dem_ProjectsIndex,public.NSW_100k_Index_54,public.NSW_100k_Index_55,public.NSW_100k_Index_56,public.NSW_100k_Index_Forward_Program,public.QLD_Project_Index_54,public.QLD_Project_Index_55,public.QLD_Project_Index_56,public.TAS_Project_Index_55,public.GA_Project_Index_47,public.GA_Project_Index_48,public.GA_Project_Index_54,public.GA_Project_Index_55,public.GA_Project_Index_56&STYLES=&INFO_FORMAT=application%2Fjson&FEATURE_COUNT=100&X=${x}&Y=${y}";return{restrict:"AE",link:function(t,n,l,c){var u=null;"undefined"==typeof t.options&&(t.options={}),o.getMap().then(function(n){n.on("popupclose",function(e){a.removeLastLayer(n)}),n.on("draw:drawstart point:start",function(){t.paused=!0}),n.on("draw:drawstop point:end",function(){r(function(){t.paused=!1},6)}),n.on("click",function(r){if(!t.paused){console.log("clicked feature info");var o=null,l=n.getSize(),c=n.latLngToContainerPoint(r.latlng,n.getZoom()),d=r.latlng,m={x:c.x,y:c.y,bounds:n.getBounds().toBBoxString(),height:l.y,width:l.x},p=s;i.remove(u),u=i.add("Checking available data at this point",3e4,!0),angular.forEach(m,function(e,t){p=p.replace("${"+t+"}",e)}),e.get(p).then(function(e){var t=e.data,r=void 0,l=[],s=[];console.log(t),n.closePopup(),a.removeLastLayer(n),i.remove(u),t.length?(r={data:{name:"public.AllIndexes",type:"FeatureCollection",crs:{type:"name",properties:{name:"EPSG:4326"}},features:[]}},l=r.data.features,t.forEach(function(e){e.features.forEach(function(e){l.push(e);var t=["<span>"],n=e.properties;if(n.maptitle){var r=n.mapnumber?"Map number: "+n.mapnumber:"";t.push("<strong>Map Title:</strong> <span title='"+r+"'>"+n.maptitle)}if(n.project&&t.push("<strong>Project name:</strong> "+n.project),n.captured&&t.push("<br/><strong>Capture date:</strong> "+captured(n.captured)),n.object_name?t.push("<strong>File name:</strong> "+n.object_name):n.object_name_ahd?t.push("<strong>File name:</strong> "+n.object_name_ahd):n.object_name_ort&&t.push("<strong>File name:</strong> "+n.object_name_ort),t.push("</span><br/><strong>Status:</strong> "+e.properties.status),n.available_date&&t.push("<br/><strong>Available date:</strong> "+formatDate(n.available_date)),n.contact){var a=n.contact,i=0===a.toLowerCase().indexOf("mailto:")?"":"mailto:";t.push("<br/><strong>Contact:</strong> <a href='"+i+n.contact+"'>"+n.contact+"</a>")}n.metadata_url&&t.push("<br/><a href='"+n.metadata_url+"' target='_blank'>Metadata</a>"),s.push(t.join(" "))})})):(u=i.add("No status information available for this point.",4e3),r=e),l.length&&(o=L.geoJson(r.data,{style:function(e){return{fillOpacity:.1,color:"red"}}}).addTo(n),a.setLayer(o),L.popup().setLatLng(d).setContent("<div class='fi-popup'>"+s.join("<hr/>")+"</div>").openOn(n))})}})})}}}]).factory("featureInfoService",[function(){var e=null;return{setLayer:function(t){e=t},removeLastLayer:function(t){e&&(t.removeLayer(e),e=null)}}}]),function(e){e.module("common.header",[]).controller("headerController",["$scope","$q","$timeout",function(e,t,n){var r=function(e){return e};e.$on("headerUpdated",function(t,n){e.headerConfig=r(n)})}]).directive("icsmHeader",[function(){var t={current:"none",heading:"ICSM",headingtitle:"ICSM",helpurl:"help.html",helptitle:"Get help about ICSM",helpalttext:"Get help about ICSM",skiptocontenttitle:"Skip to content",skiptocontent:"Skip to content",quicklinksurl:"/search/api/quickLinks/json?lang=en-US"};return{transclude:!0,restrict:"EA",templateUrl:"common/header/header.html",scope:{current:"=",breadcrumbs:"=",heading:"=",headingtitle:"=",helpurl:"=",helptitle:"=",helpalttext:"=",skiptocontenttitle:"=",skiptocontent:"=",quicklinksurl:"="},link:function(n,r,a){e.copy(t);e.forEach(t,function(e,t){t in n||(n[t]=e)})}}}]).factory("headerService",["$http",function(){}])}(angular),angular.module("common.altthemes",[]).directive("altThemes",["altthemesService",function(e){return{restrict:"AE",templateUrl:"common/navigation/altthemes.html",scope:{current:"="},link:function(t){e.getThemes().then(function(e){t.themes=e}),e.getCurrentTheme().then(function(e){t.theme=e}),t.changeTheme=function(n){t.theme=n,e.setTheme(n.key)}}}}]).controller("altthemesCtrl",["altthemesService",function(e){this.service=e}]).filter("altthemesFilter",function(){return function(e,t){var n=[];return t?(e&&e.forEach(function(e){e.themes&&e.themes.some(function(e){return e===t.key})&&n.push(e)}),n):e}}).factory("altthemesService",["$q","$http","storageService",function(e,t,n){var r="icsm.current.theme",a="icsm/resources/config/themes.json?v=1",i="All",o=[],l=this;return this.themes=[],this.theme=null,n.getItem(r).then(function(e){e||(e=i),t.get(a,{cache:!0}).then(function(t){var n=t.data.themes;l.themes=n,l.theme=n[e],angular.forEach(n,function(e,t){e.key=t}),o.forEach(function(e){e.resolve(l.theme)})})}),this.getCurrentTheme=function(){if(this.theme)return e.when(l.theme);var t=e.defer();return o.push(t),t.promise},this.getThemes=function(){return t.get(a,{cache:!0}).then(function(e){return e.data.themes})},this.setTheme=function(e){this.theme=this.themes[e],n.setItem(r,e)},this}]).filter("altthemesEnabled",function(){return function(e){return e?e.filter(function(e){return!!e.enabled}):e}}).filter("altthemesMatchCurrent",function(){return function(e,t){return e?e.filter(function(e){return!!e.keys.find(function(e){return e===t})}):e}}),angular.module("common.navigation",[]).directive("commonNavigation",[function(){return{restrict:"AE",template:"<alt-themes current='current'></alt-themes>",scope:{current:"=?"},link:function(e){e.username="Anonymous",e.current||(e.current="none")}}}]).factory("navigationService",[function(){return{}}]),angular.module("common.legend",[]).directive("commonLegend",[function(){return{template:"<img ng-href='url' ng-if='url'></img>",scope:{map:"="},restrict:"AE",link:function(e){e.map}}}]),function(e){e.module("common.scroll",[]).directive("commonScroller",["$timeout",function(e){return{scope:{more:"&",buffer:"=?"},link:function(t,n,r){var a;t.buffer||(t.buffer=100),n.on("scroll",function(n){function r(){t.more&&i.scrollHeight-i.scrollTop<=i.clientHeight+t.buffer&&t.more()}var i=n.currentTarget;e.cancel(a),a=e(r,120)})}}}])}(angular),angular.module("common.reset",[]).directive("resetPage",function(e){return{restrict:"AE",scope:{},templateUrl:"common/reset/reset.html",controller:["$scope",function(t){t.reset=function(){e.location.reload()}}]}}),angular.module("common.slider",[]).directive("slider",["$parse","$timeout",function(e,t){return{restrict:"AE",replace:!0,template:'<div><input class="slider-input" type="text" /></div>',require:"ngModel",scope:{max:"=",min:"=",step:"=",value:"=",ngModel:"=",range:"=",enabled:"=",sliderid:"=",formatter:"&",onStartSlide:"&",onStopSlide:"&",onSlide:"&"},link:function(n,r,a,i,o){function l(){function o(e,t,n){m[e]=t||n}function l(e,t,n){m[e]=t?parseFloat(t):n}function u(e,t,n){m[e]=t?t+""=="true":n}function d(e){return angular.isString(e)&&0===e.indexOf("[")?angular.fromJson(e):e}var m={};o("id",n.sliderid),o("orientation",a.orientation,"horizontal"),o("selection",a.selection,"before"),o("handle",a.handle,"round"),o("tooltip",a.uiTooltip,"show"),o("tooltipseparator",a.tooltipseparator,":"),l("min",n.min,0),l("max",n.max,10),l("step",n.step,1);var p=m.step+"",f=p.substring(p.lastIndexOf(".")+1);if(l("precision",a.precision,f),u("tooltip_split",a.tooltipsplit,!1),u("enabled",a.enabled,!0),u("naturalarrowkeys",a.naturalarrowkeys,!1),u("reversed",a.reversed,!1),u("range",n.range,!1),m.range){if(angular.isArray(n.value))m.value=n.value;else if(angular.isString(n.value)){if(m.value=d(n.value),!angular.isArray(m.value)){var h=parseFloat(n.value);isNaN(h)&&(h=5),h<n.min?(h=n.min,m.value=[h,m.max]):h>n.max?(h=n.max,m.value=[m.min,h]):m.value=[m.min,m.max]}}else m.value=[m.min,m.max];n.ngModel=m.value}else l("value",n.value,5);n.formatter&&(m.formatter=n.$eval(n.formatter));var g=$(r).find(".slider-input").eq(0);if($.fn.slider){$.fn.slider.constructor.prototype.disable=function(){this.picker.off()},$.fn.slider.constructor.prototype.enable=function(){this.picker.on()},g.slider(m),g.slider("destroy"),g.slider(m);var v=d(a.updateevent);v=angular.isString(v)?[v]:["slide"],angular.forEach(v,function(e){g.on(e,function(e){i.$setViewValue(e.value),t(function(){n.$apply()})})}),g.on("change",function(e){i.$setViewValue(e.value.newValue),t(function(){n.$apply()})});var b={slideStart:"onStartSlide",slide:"onSlide",slideStop:"onStopSlide"};angular.forEach(b,function(r,i){g.on(i,function(i){if(n[r]){var o=e(a[r]);o(n.$parent,{$event:i,value:i.value}),t(function(){n.$apply()})}})}),angular.isFunction(c)&&(c(),c=null),angular.isDefined(a.ngDisabled)&&(c=n.$watch(a.ngDisabled,function(e){e?g.slider("disable"):g.slider("enable")})),angular.isFunction(s)&&s(),s=n.$watch("ngModel",function(e){g.slider("setValue",e)})}window.slip=g,n.$watch("enabled",function(e){e?g.slider("disable"):g.slider("enable")})}var s,c;l();var u=["min","max","step","range"];angular.forEach(u,function(e){n.$watch(e,function(){l()})})}}}]),angular.module("common.side-panel",[]).factory("panelSideFactory",["$rootScope","$timeout",function(e,t){function n(e,t){var n=e.active;return n===t?(e.active=null,e.width=0):e.active=t,!n}var r={left:{active:null,width:0},right:{active:null,width:0}};return{state:r,setLeft:function(e){var t=n(r.left,e);return t&&(r.left.width=320),t},setRight:function(t){r.right.width=t.width;var a=n(r.right,t.name);return e.$broadcast("side.panel.change",{side:"right",data:r.right,width:t.width}),a}}}]).directive("sidePanelRightOppose",["panelSideFactory",function(e){return{restrict:"E",transclude:!0,template:'<div class="contentContainer" ng-attr-style="right:{{right.width}}"><ng-transclude></ng-transclude></div>',link:function(t){t.right=e.state.right}}}]).directive("sidePanelRight",["panelSideFactory",function(e){return{restrict:"E",transclude:!0,templateUrl:"icsm/side-panel/side-panel-right.html",link:function(t){t.right=e.state.right,t.closePanel=function(){e.setRight({name:null,width:0})}}}}]).directive("panelTrigger",["panelSideFactory",function(e){return{restrict:"E",transclude:!0,templateUrl:"common/side-panel/trigger.html",scope:{"default":"@?",panelWidth:"@",name:"@",iconClass:"@",panelId:"@"},link:function(t){t.toggle=function(){e.setRight({width:t.panelWidth,name:t.panelId})},t["default"]&&e.setRight({width:t.panelWidth,name:t.panelId})}}}]).directive("panelOpenOnEvent",["$rootScope","panelSideFactory",function(e,t){return{restrict:"E",scope:{panelWidth:"@",eventName:"@",panelId:"@",side:"@?"},link:function(n){n.side||(n.side="right"),e.$on(n.eventName,function(e,r){var a=t.state[n.side];if(a&&(!a.active||n.panelId!==a.active)){var i={width:n.panelWidth,name:n.panelId};"right"===n.side?t.setRight(i):t.setLeft(i)}})}}}]).directive("panelCloseOnEvent",["$rootScope","panelSideFactory",function(e,t){return{restrict:"E",scope:{eventName:"@",side:"@?",onlyOn:"@?"},link:function(n){n.side||(n.side="right"),e.$on(n.eventName,function(e,r){var a=t.state[n.side];if((!n.onlyOn||a.active===n.onlyOn)&&a&&a.active){var i={name:null};"right"===n.side?t.setRight(i):t.setLeft(i)}})}}}]).directive("sidePanelLeft",["panelSideFactory",function(e){return{restrict:"E",transclude:!0,templateUrl:"icsm/side-panel/side-panel-left.html",link:function(t){t.left=e.state.left,t.closeLeft=function(){e.setLeft(null)}}}}]),angular.module("common.storage",["explorer.projects"]).factory("storageService",["$log","$q","projectsService",function(e,t,n){return{setGlobalItem:function(e,t){this._setItem("_system",e,t)},setItem:function(e,t){n.getCurrentProject().then(function(n){this._setItem(n,e,t)}.bind(this))},_setItem:function(t,n,r){e.debug("Fetching state for key locally"+n),localStorage.setItem("mars.anon."+t+"."+n,JSON.stringify(r))},getGlobalItem:function(e){return this._getItem("_system",e)},getItem:function(e){var r=t.defer();return n.getCurrentProject().then(function(t){this._getItem(t,e).then(function(e){r.resolve(e)})}.bind(this)),r.promise},_getItem:function(n,r){e.debug("Fetching state locally for key "+r);var a=localStorage.getItem("mars.anon."+n+"."+r);if(a)try{a=JSON.parse(a)}catch(i){}return t.when(a)}}}]);var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),TerrainLoader=function(){function e(){_classCallCheck(this,e)}return _createClass(e,[{key:"load",value:function(e,t,n){var r=new XMLHttpRequest;r.addEventListener("load",function(e){try{var r=new GeotiffParser;r.parseHeader(e.target.response),t(r.loadPixels())}catch(a){n(a)}},!1),void 0!==n&&r.addEventListener("error",function(e){n(e)},!1),r.open("GET",e,!0),r.responseType="arraybuffer",r.send(null)}}]),e}();angular.module("common.templates",[]).run(["$templateCache",function(e){e.put("common/cc/cc.html",'<button type="button" class="undecorated" title="View CCBy {{details.version}} licence details"\r\n      popover-trigger="outsideClick"\r\n      uib-popover-template="template" popover-placement="bottom" popover-append-to-body="true">\r\n\t<i ng-class="{active:data.isWmsShowing}" class="fa fa-lg fa-gavel"></i>\r\n</button>'),e.put("common/cc/cctemplate.html",'<div>\r\n   <div class="row">\r\n      <div class="col-md-12">\r\n         <a target="_blank" ng-href="{{details.link}}">Creative Commons Attribution {{details.version}} </a>\r\n      </div>\r\n   </div>\r\n   <div class="row">\r\n      <div class="col-md-2">\r\n         <span class="fa-stack" aria-hidden="true">\r\n         <i class="fa fa-check-circle-o fa-stack-2x" aria-hidden="true"></i>\r\n      </span>\r\n      </div>\r\n      <div class="col-md-10">\r\n         You may use this work for commercial purposes.\r\n      </div>\r\n   </div>\r\n   <div class="row">\r\n      <div class="col-md-2">\r\n         <span class="fa-stack" aria-hidden="true">\r\n         <i class="fa fa-circle-o fa-stack-2x"></i>\r\n         <i class="fa fa-female fa-stack-1x"></i>\r\n      </span>\r\n      </div>\r\n      <div class="col-md-10">\r\n         You must attribute the creator in your own works.\r\n      </div>\r\n   </div>\r\n</div>'),e.put("common/header/header.html",'<div class="container-full common-header" style="padding-right:10px; padding-left:10px">\r\n   <div class="navbar-header">\r\n\r\n      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".ga-header-collapse">\r\n         <span class="sr-only">Toggle navigation</span>\r\n         <span class="icon-bar"></span>\r\n         <span class="icon-bar"></span>\r\n         <span class="icon-bar"></span>\r\n      </button>\r\n\r\n      <a href="/" class="appTitle visible-xs">\r\n         <h1 style="font-size:120%">{{heading}}</h1>\r\n      </a>\r\n   </div>\r\n   <div class="navbar-collapse collapse ga-header-collapse">\r\n      <ul class="nav navbar-nav">\r\n         <li class="hidden-xs">\r\n            <a href="https://www.icsm.gov.au/" target="_blank" class="icsm-logo"\r\n               style="margin-top: -4px;display:inline-block;">\r\n               <img alt="ICSM - ANZLIC Committee on Surveying &amp; Mapping" class="header-logo"\r\n                  src="icsm/resources/img/icsm-logo-sml.gif">\r\n            </a>\r\n            <a href="/" style="margin-top:8px; padding:5px;display:inline-block">\r\n               <h1 class="applicationTitle">{{heading}}</h1>\r\n            </a>\r\n         </li>\r\n      </ul>\r\n      <ul class="nav navbar-nav navbar-right nav-icons">\r\n         <li common-navigation role="menuitem" current="current" style="padding-right:10px"></li>\r\n         <li mars-version-display role="menuitem"></li>\r\n         <li style="width:10px"></li>\r\n      </ul>\r\n   </div>\r\n   <!--/.nav-collapse -->\r\n</div>\r\n<div class="contributorsLink" style="position: absolute; right:7px; bottom:15px">\r\n   <icsm-contributors-link></icsm-contributors-link>\r\n</div>\r\n<!-- Strap -->\r\n<div class="row">\r\n   <div class="col-md-12">\r\n      <div class="strap-blue">\r\n      </div>\r\n      <div class="strap-white">\r\n      </div>\r\n      <div class="strap-red">\r\n      </div>\r\n   </div>\r\n</div>'),e.put("common/navigation/altthemes.html",'<span class="altthemes-container">\r\n\t<span ng-repeat="item in themes | altthemesEnabled">\r\n       <a title="{{item.label}}" ng-href="{{item.url}}" class="altthemesItemCompact" target="_blank">\r\n         <span class="altthemes-icon" ng-class="item.className"></span>\r\n       </a>\r\n    </li>\r\n</span>'),e.put("common/reset/reset.html",'<button type="button" class="map-tool-toggle-btn" ng-click="reset()" title="Reset page">\r\n   <span class="panel-sm">Reset</span>\r\n   <i class="fa fa-lg fa-refresh"></i>\r\n</button>'),e.put("common/side-panel/trigger.html",'<button ng-click="toggle()" type="button" class="map-tool-toggle-btn">\r\n   <span class="panel-sm">{{name}}</span>\r\n   <ng-transclude></ng-transclude>\r\n   <i class="fa fa-lg" ng-class="iconClass"></i>\r\n</button>')}]);