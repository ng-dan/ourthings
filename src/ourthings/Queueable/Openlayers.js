/** @module Openlayers */
import Queueable from "../Queueable";
import {Map, View, Feature} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import WKT from 'ol/format/WKT';
import {fromLonLat,units,epsg3857,epsg4326} from 'ol/proj';

/**
 * @classdesc
 *
 * Openlayers Hook
 *
 * @author Richard Reynolds richard@nautoguide.com
 *
 * @example
 * //
 *
 */
export default class Openlayers extends Queueable {

	init(queue) {
		let self=this;
		self.queue=queue;

		self.maps={};

		self.ready=true;
	}


	addMap(pid,json) {
		let self=this;
		let options=Object.assign({
			"map":"map1",
			"projection":"EPSG:3857",
			"zoom": 0,
			"renderer": ['webgl', 'canvas'],
			"target":"map"
		},json);
		const map = new Map({
			target: options.target,
			view: new View({
				center: [0, 0],
				zoom: 0
			})
		});
		self.maps[options.map]={"object":map,"layers":{}};
		self.finished(pid,self.queue.DEFINE.FIN_OK);
	}

	addLayer(pid,json) {
		let self=this;
		let options=Object.assign({
			"map":"map1",
			"name":"default",
			"opacity": 1,
			"transparent": false,
			"active": true,
			"tilesize": [256, 256],
			"tiled": true,
			"selectable": true,
			"hover": true,
			"style": "default"
		},json);
		let map=self.maps[options.map].object;
		let olLayer = null;
		let layerFunction = self["_addLayer_" + options.type];

		if (typeof layerFunction === "function") {
			olLayer = layerFunction.apply(null, [options]);
		}
		else {
			self.finished(pid,self.queue.DEFINE.FIN_ERROR,"No add layer function for " + options.type);
			return false;
		}
		map.addLayer(olLayer);
		self.maps[options.map].layers[options.name]=olLayer;
		self.finished(pid,self.queue.DEFINE.FIN_OK);

	}

	_addLayer_osm(options) {
		let olLayer=new TileLayer({
			source: new OSM()
		});
		return olLayer;
	}

	_addLayer_vector(options) {
		let source={};
		let vectorSource = new VectorSource(source);
		let olLayer = new VectorLayer({
			name: options.name,
			visible: options.active,
			source: vectorSource,
			//style: window.styles[options.style],
			opacity: options.opacity,
			zIndex: options['zindex'],
			selectable: options.selectable,
			hover: options.hover
		});
		return olLayer;

	}

	addFeature(pid,json) {
		let self=this;
		let options=Object.assign({
			"map":"map1",
			"layer":"default",
			"values":{}
		},json);

		let map=self.maps[options.map].object;
		let layer=self.maps[options.map].layers[options.layer];
		let view=map.getView();
		let source=layer.getSource();
		console.log(layer);

		let projection = "EPSG:" + options.geometry.match(/SRID=(.*?);/)[1];
		let wkt = options.geometry.replace(/SRID=(.*?);/, '');

		let format = new WKT();
		let feature = format.readFeature(wkt);
		options.values.geometry = feature.getGeometry().transform(projection, view.getProjection().getCode());
		source.addFeature(new Feature(options.values));

	}
}