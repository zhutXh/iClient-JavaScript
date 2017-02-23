﻿/* COPYRIGHT 2017 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * Class: SuperMap.REST.GetLayersInfoService
 * 获取图层信息服务类。
 * 该类负责将从客户端指定的服务器上获取该服务器提供的图层信息。
 *
 * Inherits from:
 *  - <SuperMap.CoreServiceBase>
 */
require('./CoreServiceBase');
SuperMap.REST.GetLayersInfoService = SuperMap.Class(SuperMap.CoreServiceBase, {

    /**
     * Property: isTempLayers
     * {Boolean>} 当前url对应的图层是否是临时图层。
     */
    isTempLayers: false,

    /**
     * Constructor: SuperMap.REST.GetLayersInfoService
     * 获取图层信息服务类构造函数。
     *
     * Parameters:
     * url - {String} 与客户端交互的地图服务地址。请求地图服务,URL 应为：
     * http://{服务器地址}:{服务端口号}/iserver/services/{地图服务名}/rest/maps/{地图名}；
     * 如 http://localhost:8090/iserver/services/map-world/rest/maps/World 。
     * 如果查询临时图层的信息，请指定完成的url，包含临时图层ID信息，如：
     * http://localhost:8090/iserver/services/map-world/rest/maps/World/tempLayersSet/resourceID
     * options - {Object} 参数。
     *
     * Allowed options properties:
     * eventListeners - {Object} 需要被注册的监听器对象。
     * isTempLayers - {Boolean} 当前url对应的图层是否是临时图层。
     */
    initialize: function (url, options) {
        SuperMap.CoreServiceBase.prototype.initialize.apply(this, arguments);
        if (options) {
            SuperMap.Util.extend(this, options);
        }
    },

    /**
     * APIMethod: destroy
     * 释放资源,将引用资源的属性置空。
     */
    destroy: function () {
        SuperMap.CoreServiceBase.prototype.destroy.apply(this, arguments);
        SuperMap.Util.reset(this);
    },

    /**
     * APIMethod: processAsync
     * 负责将客户端的更新参数传递到服务端。
     *
     */
    processAsync: function () {
        var me = this,
            method = "GET",
            end = me.url.substr(me.url.length - 1, 1);
        if (!me.isTempLayers) {
            me.url += (end === "/") ? '' : '/';
            me.url += me.isInTheSameDomain ? "layers.json?" : "layers.jsonp?";
        } else {
            me.url += me.isInTheSameDomain ? ".json?" : ".jsonp?";
        }
        me.request({
            method: method,
            params: null,
            scope: me,
            success: me.serviceProcessCompleted,
            failure: me.serviceProcessFailed
        });
    },

    /**
     * Method: getLayerComplted
     * 编辑完成，执行此方法。
     *
     * Parameters:
     * result - {Object} 服务器返回的结果对象。
     */
    serviceProcessCompleted: function (result) {
        result = SuperMap.Util.transformResult(result);
        result = (result && result.length > 0) ? result[0] : null;
        this.events.triggerEvent("processCompleted", {result: result});
    },

    /**
     * TODO 专题图时候可能会用到，先放在这
     * Method: handleLayers
     * 处理iserver 新增图层组数据 (subLayers.layers 中可能还会含有 subLayers.layers)
     *
     * Parameters:
     * len - {Number} subLayers.layers的长度
     * layers - {Array} subLayers.layers
     */
    handleLayers: function (len, layers) {
        var me = this, tempLayer;
        if (len) {
            for (var i = 0; i < len; i++) {
                if (layers[i].subLayers && layers[i].subLayers.layers && layers[i].subLayers.layers.length > 0) {
                    this.handleLayers(layers[i].subLayers.layers.length, layers[i].subLayers.layers);
                }
                else {
                    var type = layers[i].ugcLayerType;
                    switch (type) {
                        case 'THEME':
                            tempLayer = new ServerTheme();
                            tempLayer.fromJson(layers[i]);
                            layers[i] = tempLayer;
                            break;
                        case 'GRID':
                            tempLayer = new Grid();
                            tempLayer.fromJson(layers[i]);
                            layers[i] = tempLayer;
                            break;
                        case 'IMAGE':
                            tempLayer = new Image();
                            tempLayer.fromJson(layers[i]);
                            layers[i] = tempLayer;
                            break;
                        case 'VECTOR':
                            tempLayer = new Vector();
                            tempLayer.fromJson(layers[i]);
                            layers[i] = tempLayer;
                            break;
                    }
                }

            }
        }
    },

    CLASS_NAME: "SuperMap.REST.GetLayersInfoService"
});

module.exports = function (url, options) {
    return new SuperMap.REST.GetLayersInfoService(url, options);
};