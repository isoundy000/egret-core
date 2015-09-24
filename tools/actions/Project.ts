﻿
/// <reference path="../lib/types.d.ts" />

import utils = require('../lib/utils');
import htmlparser = require("../lib/htmlparser");


export function normalize(project: egret.ILarkProject) {
    project.entryClass = project.entryClass || "Main";
    project.platform = project.platform || "web";
    project.background = project.background || "#888888";
    project.scaleMode = project.scaleMode || "noScale"
    project.orientationMode = project.orientationMode || "auto"
    project.frameRate = project.frameRate || 30;
    project.contentWidth = project.contentWidth || 480;
    project.contentHeight = project.contentHeight || 800;
    project.moduleScripts = project.moduleScripts || [];
    project.showLog = project.showLog || false;
    project.logFilter = project.logFilter || "";
    project.maxTouches = project.maxTouches || 2;
    project.textureScaleFactor = project.textureScaleFactor || 1;
    project.showPaintRect = project.showPaintRect || false;
    project.showFPS = project.showFPS || false;
    project.fpsStyles = project.fpsStyles || "";
    project.scripts = project.scripts || [];
    project.nativeScripts = project.nativeScripts || [];
    project.resolutionMode = project.resolutionMode || "retina";
}

export function getLibsList(html:string, isNative:boolean, isDebug:boolean):string[] {
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error)
            console.log(error);
    });
    var resultArr:string[] = [];
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(html);
    handler.dom.forEach(d=> visitDom(d));

    return resultArr;

    function visitDom(el: htmlparser.Element) {
        if (el.type == "script" && el.attribs && el.attribs["egret"]) {
            if (isDebug) {
                var src = el.attribs['src'];
                if (isNative) {
                    src = src.replace(".web.", ".native.");
                }
            }
            else {
                if (el.attribs["egret"] == "lib") {
                    var src = el.attribs['src-release'] || el.attribs['src'];
                    if (isNative) {
                        src = src.replace(".web.", ".native.");
                    }
                }
            }
            if (src) {
                resultArr.push(src);
            }
        }

        if (el.children) {
            el.children.forEach(e=> visitDom(e));
        }
    }
}

import doT = require('../lib/doT');
import FileUtil = require('../lib/FileUtil');

export function getNativeProjectInfo(html:string) {
    if (!FileUtil.exists(html))
        return;
    var content = FileUtil.read(html);

    var projs = parseProjectInfo(content);
    var proj: egret.ILarkProject;
    if (projs.length == 0) {
        proj = {};
    } else {
        proj = projs[0];
    }

    var optionStr =
        'entryClassName: "{{=it.entryClass}}",\n\t\t' +
        'frameRate: {{=it.frameRate}},\n\t\t' +
        'scaleMode: "{{=it.scaleMode}}",\n\t\t' +
        'contentWidth: {{=it.contentWidth}},\n\t\t' +
        'contentHeight: {{=it.contentHeight}},\n\t\t' +
        'showPaintRect: {{=it.showPaintRect}},\n\t\t' +
        'showFPS: {{=it.showFPS}},\n\t\t' +
        'fpsStyles: "{{=it.fpsStyles}}",\n\t\t' +
        'showLog: {{=it.showLog}},\n\t\t' +
        'logFilter: "{{=it.logFilter}}",\n\t\t' +
        'maxTouches: {{=it.maxTouches}},\n\t\t' +
        'textureScaleFactor: {{=it.textureScaleFactor}}';

    var temp = doT.template(optionStr);
    optionStr = temp(proj);

    return optionStr;
}

export function parseProjectInfo(html: string): egret.ILarkProject[] {
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error)
            console.log(error);
    });
    var containers: htmlparser.Element[] = [];
    var projects: egret.ILarkProject[] = [];
    var scripts: string[] = [];
    var nativeScripts: string[] = [];
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(html);
    handler.dom.forEach(d=> visitDom(d));
    parseProject();
    return projects;

    function visitDom(el: htmlparser.Element) {
        if (el.attribs && el.attribs['class'] == "egret-player") {
            containers.push(el);
        }
        if (el.type == "script" && el.attribs) {
            nativeScripts.push(el.attribs['src'].replace(".web.", ".native."));
            scripts.push(el.attribs['src']);
        }
        if (el.children) {
            el.children.forEach(e=> visitDom(e));
        }
    }

    function parseProject() {
        containers.forEach(s=> {
            var project: egret.ILarkProject = {};
            project.contentHeight = s.attribs['data-content-height'];
            project.contentWidth = s.attribs['data-content-width'];
            project.entryClass = s.attribs['data-entry-class'];
            project.frameRate = s.attribs['data-frame-rate'];
            project.orientationMode = s.attribs['data-orientation-mode'];
            project.resolutionMode = s.attribs['data-resolution-mode'];
            project.scaleMode = s.attribs['data-scale-mode'];
            project.showFPS = s.attribs['data-show-fps'];
            project.showPaintRect = s.attribs['data-show-paint-rect'];
            project.fpsStyles = s.attribs['data-show-fps-style'];
            project.showLog = s.attribs['data-show-log'];
            project.logFilter = s.attribs['data-log-filter'];
            project.textureScaleFactor = s.attribs['texture-scale-factor'];
            project.maxTouches = s.attribs['data-multi-fingered'];
            project.scripts = scripts;
            project.nativeScripts = nativeScripts;
            projects.push(project);
        });
    }
}
