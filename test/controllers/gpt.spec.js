/* global describe, it, xit, sinon, expect */
// var sinon = require("sinon");
var should = require("chai").should();
var expect = require("chai").expect;

var GPT = require("../../src_new/controllers/gpt.js");
var UTIL = require("../../src_new/util.js");
var AM = require("../../src_new/adapterManager.js");
var CONSTANTS = require("../../src_new/constants.js");
var CONFIG = require("../../src_new/config.js");
var BM = require("../../src_new/bidManager.js");
var SLOT = require("../../src_new/slot.js");

var commonDivID = "DIV_1";

// TODO : remove as required during single TDD only
// var jsdom = require('jsdom').jsdom;
// var exposedProperties = ['window', 'navigator', 'document'];
// global.document = jsdom('');
// global.window = document.defaultView;
// Object.keys(document.defaultView).forEach((property) => {
//     if (typeof global[property] === 'undefined') {
//         exposedProperties.push(property);
//         global[property] = document.defaultView[property];
//     }
// });
// global.navigator = {
//     userAgent: 'node.js'
// };

describe("CONTROLLER: GPT", function() {

    describe("#setWindowReference()", function() {
        var nonObject = 0;

        it("should not set WindowReference if argument is not object", function(done) {
            GPT.setWindowReference(nonObject);
            expect(GPT.getWindowReference() === null).to.equal(true);
            done();
        });

        it("should set WindowReference if argument is object", function(done) {
            GPT.setWindowReference(window);
            GPT.getWindowReference().should.be.deep.equal(window);
            done();
        });
    });


    describe('#getWindowReference', function () {
        it('is a function', function (done) {
            GPT.getWindowReference.should.be.a('function');
            done();
        });
    });

    describe("#getAdUnitIndex()", function() {

        it("should return 0 when the object passed is null ", function() {
            GPT.getAdUnitIndex(null).should.equal(0);
        });

        it("should return 0 when the object passed is number ", function() {
            GPT.getAdUnitIndex(0).should.equal(0);
        });

        it("should return 0 when the object passed is empty string ", function() {
            GPT.getAdUnitIndex("").should.equal(0);
        });

        it("should return 0 when the object passed is not empty string ", function() {
            GPT.getAdUnitIndex("abcd").should.equal(0);
        });

        it("should return 0 when the object passed does not have required method ", function() {
            GPT.getAdUnitIndex({}).should.equal(0);
        });

        var random = Math.floor(Math.random() * 100);
        var test = {
            getSlotId: function() {
                return this;
            },
            getId: function() {
                return "abcd_" + random;
            }
        };

        it("should return " + random + " when the object passed does have required method ", function() {
            GPT.getAdUnitIndex(test).should.equal(random);
        });

    });

    describe("#callJsLoadedIfRequired()", function() {

        it("should return false when the object passed is string ", function() {
            GPT.callJsLoadedIfRequired("").should.equal(false);
        });

        it("should return false when the object passed is number ", function() {
            GPT.callJsLoadedIfRequired(1).should.equal(false);
        });

        it("should return false when the object passed is null ", function() {
            GPT.callJsLoadedIfRequired(null).should.equal(false);
        });

        it("should return false when the object is not passed ", function() {
            GPT.callJsLoadedIfRequired().should.equal(false);
        });

        it("should return false when the object passed is object but it does not have PWT property ", function() {
            GPT.callJsLoadedIfRequired({}).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set to null", function() {
            GPT.callJsLoadedIfRequired({ PWT: null }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set to string", function() {
            GPT.callJsLoadedIfRequired({ PWT: "" }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set to number", function() {
            GPT.callJsLoadedIfRequired({ PWT: 1 }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but does not have jsLoaded property", function() {
            GPT.callJsLoadedIfRequired({ PWT: {} }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but jsLoaded is set to null", function() {
            GPT.callJsLoadedIfRequired({ PWT: { jsLoaded: null } }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but jsLoaded is set to number", function() {
            GPT.callJsLoadedIfRequired({ PWT: { jsLoaded: 1 } }).should.equal(false);
        });

        it("should return false when the object passed is object but PWT property is set but jsLoaded is set to string", function() {
            GPT.callJsLoadedIfRequired({ PWT: { jsLoaded: "" } }).should.equal(false);
        });

        var _test = {
            PWT: {}
        };
        _test.PWT.jsLoaded = function() {
            flag = true;
        };
        var flag = false;
        it("should return true when the object passed is object and PWT property is set and jsLoaded is set to function and the function is called", function() {
            GPT.callJsLoadedIfRequired(_test).should.equal(true);
            flag.should.equal(true);
        });

    });

    describe("#defineGPTVariables()", function() {
        var windowObj = null;

        it("should return false when the invalid window object is passed", function(done) {
            GPT.defineGPTVariables(null).should.equal(false);
            done();
        });

        it("should return true when the object passed is valid", function(done) {
            windowObj = {};
            GPT.defineGPTVariables(windowObj).should.equal(true);
            UTIL.isObject(windowObj.googletag);
            UTIL.isArray(windowObj.googletag.cmd);
            done();
        });

        it("should return true when the googletag.cmd is already defined", function(done) {
            windowObj.googletag = {
                cmd: []
            };
            GPT.defineGPTVariables(windowObj).should.equal(true);
            UTIL.isObject(windowObj.googletag);
            UTIL.isArray(windowObj.googletag.cmd);
            done();
        });

        it("should create googletag.cmd as empty array if not present", function(done) {
            windowObj.googletag = {
            };
            GPT.defineGPTVariables(windowObj).should.equal(true);
            UTIL.isArray(windowObj.googletag.cmd);
            windowObj.googletag.cmd.length.should.equal(0);
            done();
        });

        it("should create googletag as empty object if not present", function(done) {
            windowObj = {};
            GPT.defineGPTVariables(windowObj).should.equal(true);
            UTIL.isObject(windowObj.googletag);
            done();
        });
    });

    

    describe("#init()", function() {
        
        beforeEach(function(done) {
            sinon.spy(UTIL, "isObject");
            sinon.spy(GPT, "setWindowReference");
            sinon.spy(GPT, "defineWrapperTargetingKeys");
            sinon.spy(GPT, "defineGPTVariables");
            sinon.spy(AM, "registerAdapters");
            sinon.spy(GPT, "addHooksIfPossible");
            sinon.spy(GPT, "callJsLoadedIfRequired");
            sinon.spy(GPT, "initSafeFrameListener");
            done();
        });

        afterEach(function(done) {
            UTIL.isObject.restore();
            GPT.setWindowReference.restore();
            GPT.defineWrapperTargetingKeys.restore();
            GPT.defineGPTVariables.restore();
            AM.registerAdapters.restore();
            GPT.addHooksIfPossible.restore();
            GPT.callJsLoadedIfRequired.restore();
            GPT.initSafeFrameListener.restore();
            done();
        });

        it("should return false when window object is null", function(done) {
            GPT.init(null).should.equal(false);
            done();
        });

        it("should have called respective internal functions ", function(done) {
            window.PWT = {};
            GPT.init(window).should.equal(true);

            UTIL.isObject.called.should.be.true;
            UTIL.isObject.returned(true).should.to.be.true;

            GPT.setWindowReference.called.should.be.true;
            GPT.defineWrapperTargetingKeys.called.should.be.true;
            GPT.defineGPTVariables.called.should.be.true;
            AM.registerAdapters.called.should.be.true;
            GPT.addHooksIfPossible.called.should.be.true;
            GPT.callJsLoadedIfRequired.called.should.be.true;
            done();
        });

        it('should not proceed if passed window object is invalid', function (done) {
            GPT.init("NonObject").should.be.false;

            UTIL.isObject.called.should.be.true;
            UTIL.isObject.returned(false).should.be.true;

            UTIL.isObject.calledWith("NonObject").should.be.true;
            GPT.setWindowReference.called.should.be.false;
            GPT.defineWrapperTargetingKeys.called.should.be.false;
            GPT.defineGPTVariables.called.should.be.false;
            AM.registerAdapters.called.should.be.false;
            GPT.addHooksIfPossible.called.should.be.false;
            GPT.callJsLoadedIfRequired.called.should.be.false;
            done(); 
        });
    });

    describe("#defineWrapperTargetingKeys()", function() {

        it("should return empty object when empty object is passed", function(done) {
            GPT.defineWrapperTargetingKeys({}).should.deep.equal({});
            done();
        });

        describe("When object with keys n values is passed", function() {
            beforeEach(function(done) {
                sinon.spy(UTIL, "forEachOnObject");
                done();
            });

            afterEach(function(done) {
                UTIL.forEachOnObject.restore();
                done();
            });

            var inputObject = {
                "key1": "value1",
                "key2": "value2"
            };

            var outputObject = {
                "value1": "",
                "value2": ""
            };

            it("should return object with values as keys and respective value should be empty strings", function(done) {
                GPT.defineWrapperTargetingKeys(inputObject).should.deep.equal(outputObject);
                done();
            });

            it("should have called util.forEachOnObject", function(done) {
                GPT.defineWrapperTargetingKeys(inputObject); //.should.deep.equal(outputObject);
                // console.log("UTIL.forEachOnObject.calledTwice ==>", UTIL.forEachOnObject.calledOnce);
                UTIL.forEachOnObject.calledOnce.should.equal(true);
                // expect(UTIL.forEachOnObject.calledTwice, true);
                done();
            });
        });
    });

    describe("#generateSlotName()", function() {
        var domId = null;
        var slotIDObject = null;
        var googleSlotObject = null;

        beforeEach(function(done) {
            sinon.spy(UTIL, "isFunction");
            domId = "DIV_1";
            slotIDObject = {
                getDomId: function() {
                    return domId;
                }
            };

            googleSlotObject = {
                getSlotId: function() {
                    return slotIDObject;
                }
            };

            done();
        });

        afterEach(function(done) {
            UTIL.isFunction.restore();
            domId = null;
            slotIDObject = null;
            googleSlotObject = null;
            done();
        });

        it("GPT.generateSlotName is a function", function(done) {
            GPT.generateSlotName.should.be.a("function");
            done();
        });

        it("return empty string if googleSlot is not an object", function(done) {
            GPT.generateSlotName(null).should.equal("");
            done();
        });

        it("return empty string if googleSlot is an object but without required methods", function(done) {
            GPT.generateSlotName({}).should.equal("");
            done();
        });

        it("should have called util.isFunction if propper googleSlot is passed", function(done) {
            GPT.generateSlotName(googleSlotObject);
            // console.log("UTIL.isFunction.called ==>", UTIL.isFunction.called);
            UTIL.isFunction.calledTwice.should.equal(true);
            done();
        });

        it("should have returned Dom Id as generated Slot name if propper googleSlot object is passed", function(done) {
            GPT.generateSlotName(googleSlotObject).should.equal(domId);
            done();
        });
    });

    describe("#defineWrapperTargetingKey()", function() {

        beforeEach(function (done) {
            sinon.spy(UTIL, "isObject");
            done();
        });

        afterEach(function (done) {
            UTIL.isObject.restore();
            done();
        });

        it("is a function", function(done) {
            GPT.defineWrapperTargetingKey.should.be.a("function");
            done();
        });

        it("set wrapper Targeting Key's value to empty string", function(done) {
            GPT.defineWrapperTargetingKey("DIV_1");
            GPT.wrapperTargetingKeys["DIV_1"].should.equal("");
            done();
        });


        it("initialize wrapperTargetingKeys if its not been initialized", function(done) {
            GPT.wrapperTargetingKeys = {};
            GPT.defineWrapperTargetingKey("DIV_2");
            GPT.wrapperTargetingKeys["DIV_2"].should.equal("");
            Object.keys(GPT.wrapperTargetingKeys).length.should.be.equal(1);
            UTIL.isObject.returned(true).should.be.true;
            done();
        });
    });

    describe("#addHooksIfPossible()", function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "isUndefined");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isArray");
            sinon.spy(UTIL, "isFunction");
            sinon.spy(UTIL, "log");
            done();
        });

        afterEach(function(done) {
            UTIL.isUndefined.restore();
            UTIL.isObject.restore();
            UTIL.isArray.restore();
            UTIL.isFunction.restore();
            UTIL.log.restore();
            done();
        });

        it("is a function", function(done) {
            GPT.addHooksIfPossible.should.be.a("function");
            done();
        });

        it("return false if passed in window object is impropper and should have called util.log", function(done) {
            GPT.addHooksIfPossible({}).should.equal(false);
            UTIL.log.calledOnce.should.equal(true);
            UTIL.log.calledWith("Failed to load before GPT").should.be.true;

            UTIL.isUndefined.calledOnce.should.equal(true);
            UTIL.isObject.calledOnce.should.equal(true);
            done();
        });

        it("return true if passed window object with required props and should have called util.log", function(done) {
            var winObj = {
                googletag: {
                    cmd: []
                }
            };
            GPT.addHooksIfPossible(winObj).should.equal(true);
            UTIL.log.calledOnce.should.equal(true);
            UTIL.log.calledWith("Succeeded to load before GPT").should.be.true;
            done();
        });
    });


    describe("#addHooks()", function() {
        var winObj = null;
        var winObjBad = null;
        beforeEach(function(done) {
            winObj = {
                googletag: {
                    pubads: function() {
                        return {};
                    }
                }
            };

            winObjBad = {
                googletag: {
                    pubads: function() {
                        return null;
                    }
                }
            };

            sinon.spy(UTIL, "addHookOnFunction");
            sinon.spy(GPT, "addHookOnSlotDefineSizeMapping");
            sinon.spy(GPT, "newAddHookOnGoogletagDisplay");
            done();
        });

        afterEach(function(done) {
            winObj = null;
            winObjBad = null;
            UTIL.addHookOnFunction.restore();
            GPT.addHookOnSlotDefineSizeMapping.restore();
            GPT.newAddHookOnGoogletagDisplay.restore();
            done();
        });

        it("is a function", function(done) {
            GPT.addHooks.should.be.a("function");
            done();
        });

        it("returns false if passed in window object is not an object", function(done) {
            GPT.addHooks(null).should.equal(false);
            done();
        });

        it("returns false if googletag.pubads returns a non object value ", function(done) {
            GPT.addHooks(winObjBad).should.equal(false);
            done();
        });


        it("returns true if proper window object is passed with required structure", function(done) {
            GPT.addHooks(winObj).should.equal(true);
            done();
        });

        it("on passing proper window object with required structure should have called util.addHookOnFunction for various googletag pubads object methods", function(done) {
            GPT.addHooks(winObj).should.equal(true);

            GPT.addHookOnSlotDefineSizeMapping.calledOnce.should.equal(true);
            GPT.addHookOnSlotDefineSizeMapping.calledWith(winObj.googletag).should.equal(true);

            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "disableInitialLoad", GPT.newDisableInitialLoadFunction).should.equal(true);
            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "enableSingleRequest", GPT.newEnableSingleRequestFunction).should.equal(true);

            GPT.newAddHookOnGoogletagDisplay.calledOnce.should.equal(true);
            GPT.newAddHookOnGoogletagDisplay.calledWith(winObj.googletag).should.equal(true);

            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "refresh", GPT.newRefreshFuncton).should.equal(true);
            UTIL.addHookOnFunction.calledWith(winObj.googletag.pubads(), false, "setTargeting", GPT.newSetTargetingFunction).should.equal(true);
            UTIL.addHookOnFunction.calledWith(winObj.googletag, false, "destroySlots", GPT.newDestroySlotsFunction).should.equal(true);

            done();
        });
    });

    describe("#addHookOnSlotDefineSizeMapping()", function() {


        var googleTag = null;
        var definedSlotS1 = null;
        beforeEach(function(done) {
            definedSlotS1 = {
                "/Harshad": {
                    sizes: [
                        [728, 90]
                    ],
                    id: "Harshad-02051986"
                }
            };
            googleTag = {
                defineSlot: function() {
                    return definedSlotS1;
                },
                destroySlots: function() {
                    return {};
                }
            };
            sinon.spy(googleTag, "defineSlot");
            sinon.spy(googleTag, "destroySlots");
            sinon.spy(UTIL, "isFunction");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "addHookOnFunction");
            done();
        });

        afterEach(function(done) {
            googleTag.defineSlot.restore();
            googleTag.destroySlots.restore();

            UTIL.isFunction.restore();
            UTIL.isObject.restore();
            UTIL.addHookOnFunction.restore();

            googleTag = null;

            done();
        });

        it("is a function", function(done) {
            GPT.addHookOnSlotDefineSizeMapping.should.be.a("function");
            done();
        });

        it("returns false if passed in googletag is not and object", function(done) {
            GPT.addHookOnSlotDefineSizeMapping(null).should.equal(false);
            done();
        });

        it("should return true when proper googleTag object is passed", function(done) {
            GPT.addHookOnSlotDefineSizeMapping(googleTag).should.equal(true);
            done();
        });

        it("on passing proper googleTag object should have called util.addHookOnFunction", function(done) {
            GPT.addHookOnSlotDefineSizeMapping(googleTag).should.equal(true);

            UTIL.addHookOnFunction.calledWith(definedSlotS1, true, "defineSizeMapping", GPT.newSizeMappingFunction).should.equal(true);

            googleTag.defineSlot.calledWith("/Harshad", [
                [728, 90]
            ], "Harshad-02051986").should.equal(true);

            googleTag.destroySlots.calledWith([definedSlotS1]).should.equal(true);

            done();
        });
    });

    describe('#getAdSlotSizesArray()', function() {
        var divID = null;
        var currentGoogleSlots = null;
        var sizeObj_1 = null;
        var sizeObj_2 = null;
        beforeEach(function(done) {
            divID = commonDivID;
            sizeObj_1 = {
                getWidth: function() {
                    return 1024;
                },
                getHeight: function() {
                    return 768;
                }
            };

            sizeObj_2 = {
                getWidth: function() {
                    return 640;
                },
                getHeight: function() {
                    return 480;
                }
            };
            currentGoogleSlots = {
                getSizes: function() {
                    return [sizeObj_1, sizeObj_2];
                }
            };

            sinon.spy(currentGoogleSlots, 'getSizes');
            sinon.spy(sizeObj_1, 'getHeight');
            sinon.spy(sizeObj_1, 'getWidth');
            sinon.spy(sizeObj_2, 'getHeight');
            sinon.spy(sizeObj_2, 'getWidth');

            sinon.stub(GPT, 'getSizeFromSizeMapping');
            GPT.getSizeFromSizeMapping.returns(true);
            sinon.stub(UTIL, 'log');
            sinon.stub(UTIL, 'isFunction');
            UTIL.isFunction.returns(true);
            sinon.spy(UTIL, 'forEachOnArray');
            done();
        });

        afterEach(function(done) {
            GPT.getSizeFromSizeMapping.restore();
            UTIL.log.restore();
            UTIL.isFunction.restore();
            UTIL.forEachOnArray.restore();

            currentGoogleSlots.getSizes.restore();
            sizeObj_1.getHeight.restore();
            sizeObj_1.getWidth.restore();
            sizeObj_2.getHeight.restore();
            sizeObj_2.getWidth.restore();

            sizeObj_1 = null;
            sizeObj_2 = null;
            currentGoogleSlots = null;
            done();
        });


        it('is a function', function(done) {
            GPT.getAdSlotSizesArray.should.be.a('function');
            done();
        });

        it('should have called getSizeFromSizeMapping', function(done) {
            GPT.getAdSlotSizesArray(divID, currentGoogleSlots).should.be.true;
            UTIL.log.calledWith(divID + ": responsiveSizeMapping applied: ");
            UTIL.log.calledWith(true);
            done();
        });

        it('should have created adSlotSizesArray when proper currentGoogleSlots is passed ', function(done) {
            GPT.getSizeFromSizeMapping.restore();
            sinon.stub(GPT, 'getSizeFromSizeMapping');
            GPT.getSizeFromSizeMapping.returns(false);
            GPT.getAdSlotSizesArray(divID, currentGoogleSlots).should.be.a('array');
            UTIL.isFunction.called.should.be.true;
            UTIL.forEachOnArray.called.should.be.true;

            currentGoogleSlots.getSizes.called.should.be.true;
            sizeObj_1.getHeight.called.should.be.true;
            sizeObj_1.getWidth.called.should.be.true;
            sizeObj_2.getHeight.called.should.be.true;
            sizeObj_2.getWidth.called.should.be.true;

            done();
        });
    });

    describe('#getSizeFromSizeMapping', function() {
        var divID = null;
        var slotSizeMapping = null;
        var screenWidth = 1024;
        var screenHeight = 768;
        beforeEach(function(done) {
            divID = commonDivID;
            slotSizeMapping = {};
            slotSizeMapping[divID] = [];
            sinon.spy(UTIL, 'isOwnProperty');

            sinon.stub(UTIL, 'getScreenWidth');
            UTIL.getScreenWidth.returns(screenWidth);

            sinon.stub(UTIL, 'getScreenHeight');
            UTIL.getScreenHeight.returns(screenHeight);

            sinon.stub(UTIL, 'isArray');
            sinon.stub(UTIL, 'isNumber');
            sinon.stub(UTIL, 'log');
            done();
        });

        afterEach(function(done) {
            divID = null;
            slotSizeMapping = null;
            UTIL.isOwnProperty.restore();
            UTIL.getScreenWidth.restore();
            UTIL.getScreenHeight.restore();
            UTIL.isArray.restore();
            UTIL.isNumber.restore();
            UTIL.log.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.getSizeFromSizeMapping.should.be.a('function');
            done();
        });

        it('should return false when given divID not a property of slotSizeMapping passed', function(done) {
            delete slotSizeMapping[divID];
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            UTIL.isOwnProperty.calledOnce.should.be.true;
            done();
        });

        it('should have logged sizeMapping and its details', function(done) {
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping);

            UTIL.log.calledWith(divID + ": responsiveSizeMapping found: screenWidth: " + screenWidth + ", screenHeight: " + screenHeight).should.be.true;
            UTIL.log.calledWith(slotSizeMapping[divID]).should.be.true;
            done();
        });

        it('should return false if sizeMapping is not and array', function(done) {
            slotSizeMapping[divID] = {};
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            UTIL.isArray.calledOnce.should.be.true;
            done();
        });


    });


    describe('#newDisplayFunction()', function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "log");
            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.newDisplayFunction.should.be.a('function');
            done();
        });

        it('should return null when impropper parameters are passed', function(done) {
            // TODO : finf better approach to check for null in chai
            var result = GPT.newDisplayFunction(null, function() { console.log("inside function") });
            // console.log(" result ==>", result);
            should.not.exist(result);
            UTIL.log.calledOnce.should.equal(true);
            UTIL.log.calledWith("display: originalFunction is not a function").should.be.true;
            done();
        });

        it('should return function when proper parameters are passed', function(done) {
            GPT.newDisplayFunction({}, function() { console.log("inside function") }).should.be.a('function');
            // console.log("updateSlotsMapFromGoogleSlots ==>", GPT.updateSlotsMapFromGoogleSlots.callCount);
            done();
        });

    });

    describe('#newSizeMappingFunction', function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");
            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();
            done();
        });


        it('is a function', function(done) {
            GPT.newSizeMappingFunction.should.be.a('function');
            done();
        });

        it('should return null when impropper parameters passed', function(done) {
            var result = GPT.newSizeMappingFunction(null, {});
            should.not.exist(result);
            UTIL.log.calledOnce.should.be.true;
            UTIL.log.calledWith("newSizeMappingFunction: originalFunction is not a function").should.be.true;
            done();
        });

        it('should return a function when propper parameters are passed', function(done) {
            GPT.newSizeMappingFunction({}, function() {
                console.log("inside function");
            }).should.be.a('function');
            UTIL.isObject.calledOnce.should.be.true;
            UTIL.isFunction.calledOnce.should.be.true;
            done();
        });
    });

    describe('#newRefreshFuncton', function() {

        beforeEach(function(done) {
            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");
            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();
            done();
        });


        it('is a function', function(done) {
            GPT.newRefreshFuncton.should.be.a('function');
            done();
        });

        it('should return null when impropper parameters passed', function(done) {
            var result = GPT.newRefreshFuncton(null, {});
            should.not.exist(result);
            UTIL.log.calledOnce.should.be.true;
            UTIL.log.calledWith("refresh: originalFunction is not a function").should.be.true;
            done();
        });

        it('should return a function when propper parameters are passed', function(done) {
            GPT.newRefreshFuncton({}, function() {
                console.log("inside function");
            }).should.be.a('function');
            UTIL.isObject.calledOnce.should.be.true;
            UTIL.isFunction.calledOnce.should.be.true;
            done();
        });
    });

    describe('#getQualifyingSlotNamesForRefresh', function() {
        var arg = null;
        var theObject = null;
        var slot_1Stub = null;
        var slot_2Stub = null;

        beforeEach(function(done) {
            arg = [];
            slot_1Stub = {
                getSlotId: function () {
                    return {
                        getDomId: function () {
                            return "DIV_1";
                        }
                    }
                }
            };

            slot_2Stub = {
                getSlotId: function () {
                    return {
                        getDomId: function () {
                            return "DIV_2";
                        }
                    }
                }
            };
            theObject = {
                getSlots: function() {
                    return [slot_1Stub, slot_2Stub];
                }
            };
            sinon.spy(UTIL, "forEachOnArray");
            sinon.spy(GPT, "generateSlotName");
            sinon.spy(theObject, "getSlots");
            // GPT.generateSlotName.returns("qualifying_slot_name");
            done();
        });

        afterEach(function(done) {
            UTIL.forEachOnArray.restore();
            GPT.generateSlotName.restore();
            theObject.getSlots.restore();
            theObject = null;
            arg = null;
            done();
        });

        it('is a function', function(done) {
            GPT.getQualifyingSlotNamesForRefresh.should.be.a('function');
            done();
        });

        it('should return an array', function(done) {
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.a('array');
            done();
        });

        it('should have called GPT.generateSlotName and UTIL.forEachOnArray', function(done) {
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject);
            GPT.generateSlotName.called.should.be.true;
            UTIL.forEachOnArray.called.should.be.true;
            UTIL.forEachOnArray.calledWith(theObject.getSlots()).should.be.true;
            done();
        });

        it('should consider passed arg if its not empty', function(done) {
            arg = [ [slot_1Stub, slot_2Stub] ];
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.deep.equal(['DIV_1', 'DIV_2']);
            UTIL.forEachOnArray.calledWith(arg[0]).should.be.true;
            done();
        });

        it('should consider passed arg if first argumnet in array is null', function(done) {
            arg = [ [null, slot_2Stub] ];
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.deep.equal(['DIV_2']);
            UTIL.forEachOnArray.calledWith(arg[0]).should.be.true;
            done();
        });


        it('should consider passed arg if passed argumnet is empty string array', function(done) {
            arg = [ [''] ];
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.deep.equal([]);
            UTIL.forEachOnArray.calledWith(arg[0]).should.be.true;
            done();
        });

        it('should consider passed arg if first argumnet is empty string array and second is slot object', function(done) {
            arg = [ ['', slot_2Stub] ];
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.deep.equal(['DIV_2']);
            UTIL.forEachOnArray.calledWith(arg[0]).should.be.true;
            done();
        });

        it('should consider passed arg if its empty ', function(done) {
            arg = [];
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.deep.equal([ 'DIV_1', 'DIV_2']);
            UTIL.forEachOnArray.calledWith(theObject.getSlots()).should.be.true;
            done();
        });

        it('should consider passed arg if its null', function(done) {
            arg = [null];
            GPT.getQualifyingSlotNamesForRefresh(arg, theObject).should.be.deep.equal([ 'DIV_1', 'DIV_2']);
            UTIL.forEachOnArray.calledWith(theObject.getSlots()).should.be.true;
            done();
        });
    });


    describe('#callOriginalRefeshFunction', function() {
        var flag = null;
        var theObject = null;
        var obj = null;
        // var originalFunction = null;
        var arg = null;

        beforeEach(function(done) {
            flag = true
            theObject = {}

            obj = {
                originalFunction: function(theObject, arg) {
                    return "originalFunction";
                }
            };
            // obj.originalFunction = originalFunction;
            sinon.spy(obj.originalFunction, 'apply');
            sinon.spy(UTIL, "log");
            arg = [
                ["slot_1", "slot_2"]
            ];
            done();
        });

        afterEach(function(done) {
            obj.originalFunction.apply.restore();
            UTIL.log.restore();
            flag = null;
            theObject = null;
            obj.originalFunction = null;
            obj = null;
            arg = null;
            done();
        });

        it('is a function', function(done) {
            GPT.callOriginalRefeshFunction.should.be.a('function');
            done();
        });

        it('should have logged if the ad has been already rendered ', function(done) {
            flag = false;
            GPT.callOriginalRefeshFunction(flag, theObject, obj.originalFunction, arg);
            UTIL.log.calledWith("AdSlot already rendered").should.be.true;
            done();
        });

        //todo: move the log messages to constants and use same here
        it('should have logged while calling the passed originalFunction with passed arguments', function(done) {
            GPT.callOriginalRefeshFunction(flag, theObject, obj.originalFunction, arg);
            obj.originalFunction.apply.calledWith(theObject, arg).should.be.true;
            UTIL.log.calledWith("Calling original refresh function post timeout").should.be.true;
            done();
        });
    });

    describe('#findWinningBidIfRequired_Refresh', function() {
        var slotName = null,
            divID = null,
            currentFlagValue = null;

        beforeEach(function(done) {
            slotName = "Slot_1";
            divID = commonDivID;
            currentFlagValue = true;
            GPT.slotMap = {};
            GPT.slotMap[slotName] = {
                isRefreshFunctionCalled: function() {
                    return true;
                },
                getStatus: function() {
                    return CONSTANTS.SLOT_STATUS.CREATED;
                }
            };

            sinon.stub(GPT.slotMap[slotName], "isRefreshFunctionCalled");

            sinon.stub(GPT.slotMap[slotName], "getStatus");

            sinon.stub(UTIL, "isOwnProperty");
            UTIL.isOwnProperty.returns(true);

            sinon.stub(GPT, "findWinningBidAndApplyTargeting");
            GPT.findWinningBidAndApplyTargeting.returns(true);

            sinon.stub(GPT, "updateStatusAfterRendering");
            GPT.updateStatusAfterRendering.returns(true);

            done();
        });

        afterEach(function(done) {


            GPT.slotMap[slotName].isRefreshFunctionCalled.restore();
            GPT.slotMap[slotName].getStatus.restore();

            GPT.slotMap[slotName] = null;


            UTIL.isOwnProperty.restore();

            GPT.findWinningBidAndApplyTargeting.restore();

            GPT.updateStatusAfterRendering.restore();

            slotName = null;
            divID = null;
            currentFlagValue = null;
            done();
        });

        it('is a function', function(done) {
            GPT.findWinningBidIfRequired_Refresh.should.be.a('function');
            done();
        });

        xit('should return true ', function(done) {
            GPT.findWinningBidIfRequired_Refresh(slotName, divID, currentFlagValue).should.be.true;
            GPT.slotMap[slotName].isRefreshFunctionCalled.called.should.be.true;
            GPT.slotMap[slotName].getStatus.called.should.be.true;
            UTIL.isOwnProperty.calledWith(GPT.slotsMap, slotName).should.be.true;
            done();
        });

        xit('should return passed currentFlagValue when either given slotName is not in slotMap or given slotNames refresh function is already not called or given slotNames status is of type DISPLAYED', function(done) {
            currentFlagValue = false;
            GPT.slotMap[slotName].isRefreshFunctionCalled.restore();
            sinon.stub(GPT.slotMap[slotName], "isRefreshFunctionCalled");
            GPT.slotMap[slotName].isRefreshFunctionCalled.returns(false);
            GPT.findWinningBidIfRequired_Refresh(slotName, divID, currentFlagValue).should.be.false;
            done();
        });
    });

    describe('#newAddHookOnGoogletagDisplay', function() {
        var localGoogletag = null;
        beforeEach(function(done) {
            localGoogletag = {};
            sinon.spy(UTIL, "log");
            sinon.stub(UTIL, "addHookOnFunction");
            UTIL.addHookOnFunction.returns(true);
            done();
        });

        afterEach(function(done) {
            localGoogletag = null;
            UTIL.log.restore();
            UTIL.addHookOnFunction.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.newAddHookOnGoogletagDisplay.should.be.a('function');
            done();
        });

        it('should have return without adding hook on localGoogletag passed', function(done) {
            GPT.displayHookIsAdded = true;
            GPT.newAddHookOnGoogletagDisplay(localGoogletag);
            UTIL.log.calledOnce.should.be.false;
            UTIL.addHookOnFunction.calledOnce.should.be.false;
            done();
        });

        it('should have return while adding hook on localGoogletag passed and logging it', function(done) {
            GPT.displayHookIsAdded = false;
            GPT.newAddHookOnGoogletagDisplay(localGoogletag);
            UTIL.log.calledWith("Adding hook on googletag.display.").should.be.true;
            UTIL.log.calledWith(localGoogletag, false, "display", GPT.newDisplayFunction).should.be.false;
            done();
        });


    });

    describe('#forQualifyingSlotNamesCallAdapters', function() {

        var qualifyingSlotNames = null,
            arg = null,
            isRefreshCall = null;
        var qualifyingSlots = null;
        beforeEach(function(done) {
            qualifyingSlotNames = ["slot_1", "slot_2", "slot_3"];
            arg = [
                ["slot_1"], "slot_2"
            ];
            qualifyingSlots = ["slot_1", "slot_2"];
            isRefreshCall = false;

            sinon.stub(GPT, "updateStatusOfQualifyingSlotsBeforeCallingAdapters");
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.returns(true);

            sinon.stub(GPT, "arrayOfSelectedSlots");
            GPT.arrayOfSelectedSlots.returns(qualifyingSlots);

            sinon.stub(AM, "callAdapters");
            AM.callAdapters.returns(true);

            done();
        });

        afterEach(function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.restore();
            GPT.arrayOfSelectedSlots.restore();
            AM.callAdapters.restore();

            qualifyingSlotNames = null;
            qualifyingSlots = null;

            done();
        });


        it('should be a function', function(done) {
            GPT.forQualifyingSlotNamesCallAdapters.should.be.a('function');
            done();
        });

        it('should have called updateStatusOfQualifyingSlotsBeforeCallingAdapters and arrayOfSelectedSlots', function(done) {
            GPT.forQualifyingSlotNamesCallAdapters(qualifyingSlotNames, arg, isRefreshCall);
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.calledWith(qualifyingSlotNames, arg, isRefreshCall).should.be.true;
            GPT.arrayOfSelectedSlots.calledWith(qualifyingSlotNames).should.be.true;
            AM.callAdapters.calledWith(qualifyingSlots).should.be.true;
            done();
        });

        it('should not have called updateStatusOfQualifyingSlotsBeforeCallingAdapters and arrayOfSelectedSlots when passed qualifyingSlotNames is empty', function(done) {
            qualifyingSlotNames = [];
            GPT.forQualifyingSlotNamesCallAdapters(qualifyingSlotNames, arg, isRefreshCall);
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.called.should.be.false;
            GPT.arrayOfSelectedSlots.called.should.be.false;
            AM.callAdapters.called.should.be.false;
            done();
        });
    });

    describe('#displayFunctionStatusHandler', function() {

        var oldStatus = null,
            theObject = null,
            originalFunction = null,
            arg = null;
        beforeEach(function(done) {
            oldStatus = CONSTANTS.SLOT_STATUS.CREATED;
            theObject = {};
            originalFunction = function() {
                return "originalFunction"
            };
            arg = {};
            sinon.stub(GPT, "updateStatusAndCallOriginalFunction_Display").returns(true);
            done();
        });

        afterEach(function(done) {
            oldStatus = null;
            theObject = null;
            originalFunction = null;
            arg = null;
            GPT.updateStatusAndCallOriginalFunction_Display.restore();
            done();
        });

        it('should be a function', function(done) {
            GPT.displayFunctionStatusHandler.should.be.a('function');
            done();
        });

        it('should have called updateStatusAndCallOriginalFunction_Display with proper arguments when oldStatus is  TARGETING_ADDED', function(done) {
            oldStatus = CONSTANTS.SLOT_STATUS.TARGETING_ADDED;
            GPT.displayFunctionStatusHandler(oldStatus, theObject, originalFunction, arg);
            GPT.updateStatusAndCallOriginalFunction_Display
                .calledWith(
                    "As DM processing is already done, Calling original display function with arguments",
                    theObject,
                    originalFunction,
                    arg)
                .should.be.true;
            done();
        });

        it('should have called updateStatusAndCallOriginalFunction_Display with proper arguments when oldStatus is  DISPLAYED', function(done) {
            oldStatus = CONSTANTS.SLOT_STATUS.DISPLAYED;
            GPT.displayFunctionStatusHandler(oldStatus, theObject, originalFunction, arg);
            GPT.updateStatusAndCallOriginalFunction_Display
                .calledWith(
                    "As slot is already displayed, Calling original display function with arguments",
                    theObject,
                    originalFunction,
                    arg)
                .should.be.true;
            done();
        });
    });


    describe('#findWinningBidIfRequired_Display', function() {
        var key = null,
            slot = null;

        beforeEach(function(done) {
            key = "key_1";
            slot = {
                getStatus: function() {
                    return CONSTANTS.SLOT_STATUS.CREATED;
                }
            };
            sinon.stub(slot, "getStatus");

            sinon.stub(GPT, "findWinningBidAndApplyTargeting");
            GPT.findWinningBidAndApplyTargeting.returns(true);

            done();
        });

        afterEach(function(done) {
            GPT.findWinningBidAndApplyTargeting.restore();

            slot.getStatus.restore();

            key = null;
            slot = null;
            done();
        });

        it('is a function', function(done) {
            GPT.findWinningBidIfRequired_Display.should.be.a('function');
            done();
        });

        it('should not have called GPT.findWinningBidAndApplyTargeting if slot\'s status is either DISPLAYED or TARGETING_ADDED', function(done) {
            slot.getStatus.returns(CONSTANTS.SLOT_STATUS.DISPLAYED);
            GPT.findWinningBidIfRequired_Display(key, slot);
            GPT.findWinningBidAndApplyTargeting.called.should.be.false;
            slot.getStatus.called.should.be.true;
            done();
        });

        it('should have called GPT.findWinningBidAndApplyTargeting if slot\'s status is neither DISPLAYED nor TARGETING_ADDED', function(done) {
            GPT.findWinningBidIfRequired_Display(key, slot);
            GPT.findWinningBidAndApplyTargeting.called.should.be.true;
            slot.getStatus.called.should.be.true;
            done();
        });
    });

    describe('#updateStatusAndCallOriginalFunction_Display', function() {
        var message = null,
            theObject = null,
            originalFunction = null,
            arg = null;
        var obj = null;

        beforeEach(function(done) {
            message = "log message";
            theObject = {};
            obj = {
                originalFunction: function() {
                    return "originalFunction";
                }
            };

            arg = ["DIV_1", "DIV_2"];
            // sinon.spy(obj, "originalFunction");
            sinon.spy(obj.originalFunction, "apply");
            sinon.spy(UTIL, "log");

            sinon.stub(GPT, "updateStatusAfterRendering");
            GPT.updateStatusAfterRendering.returns(true);

            done();
        });

        afterEach(function(done) {
            obj.originalFunction.apply.restore();
            UTIL.log.restore();
            GPT.updateStatusAfterRendering.restore();
            message = null;
            theObject = null;
            originalFunction = null;
            arg = null;
            done();
        });

        it('is a function', function(done) {
            GPT.updateStatusAndCallOriginalFunction_Display.should.be.a('function');
            done();
        });

        it('should have called UTIL.log, GPT.updateStatusAfterRendering and passed originalFunction with proper arguments', function(done) {
            GPT.updateStatusAndCallOriginalFunction_Display(message, theObject, obj.originalFunction, arg);
            UTIL.log.calledWith(message).should.be.true;
            UTIL.log.calledWith(arg).should.be.true;
            obj.originalFunction.apply.calledWith(theObject, arg).should.be.true;
            GPT.updateStatusAfterRendering.calledWith(arg[0], false).should.be.true;
            done();
        });
    });

    describe('#newDestroySlotsFunction', function() {
        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newDestroySlotsFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newDestroySlotsFunction(theObject, originalFunction));
            UTIL.log.calledWith("destroySlots: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newDestroySlotsFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });

    describe('#newSetTargetingFunction', function() {

        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newSetTargetingFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newSetTargetingFunction(theObject, originalFunction));
            UTIL.log.calledWith("setTargeting: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newSetTargetingFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });


    describe('#newEnableSingleRequestFunction', function() {

        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newEnableSingleRequestFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newEnableSingleRequestFunction(theObject, originalFunction));
            UTIL.log.calledWith("disableInitialLoad: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newEnableSingleRequestFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });


    describe('#newDisableInitialLoadFunction', function() {

        var theObject = null,
            originalFunction = null;

        beforeEach(function(done) {
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");

            done();

        });

        afterEach(function(done) {
            originalFunction = null;
            theObject = null;

            UTIL.log.restore();
            UTIL.isObject.restore();
            UTIL.isFunction.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.newDisableInitialLoadFunction.should.be.a('function');
            done();
        });

        it('return null if passed object is not an object or passed function is not a function', function(done) {
            theObject = null;
            should.not.exist(GPT.newDisableInitialLoadFunction(theObject, originalFunction));
            UTIL.log.calledWith("disableInitialLoad: originalFunction is not a function").should.be.true;
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.false;
            done();
        });

        it('return function if passed object is an object and passed function is a function', function(done) {
            GPT.newDisableInitialLoadFunction(theObject, originalFunction).should.be.a('function');
            UTIL.isObject.calledWith(theObject).should.be.true;
            UTIL.isFunction.calledWith(originalFunction).should.be.true;
            done();
        });
    });

    describe('#arrayOfSelectedSlots', function() {
        var slotNames = null;
        beforeEach(function(done) {
            slotNames = ["slot_1", "slot_2", "slot_3"];
            GPT.slotsMap = {
                "slot_1": {
                    getStatus: function() {
                        return "slot_1";
                    }
                },
                "slot_2": {
                    getStatus: function() {
                        return "slot_2";
                    }
                },
                "slot_3": {
                    getStatus: function() {
                        return "slot_3";
                    }
                },
            };
            sinon.spy(UTIL, "forEachOnArray");
            done();
        });

        afterEach(function(done) {
            UTIL.forEachOnArray.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.arrayOfSelectedSlots.should.be.a('function');
            done();
        });

        it('return array slot objects of given slot names from the slotMap', function(done) {
            GPT.arrayOfSelectedSlots(slotNames).should.be.a('array');
            done();
        });
    });

    describe('#setDisplayFunctionCalledIfRequired', function() {

        var slot = null,
            arg = null;
        beforeEach(function(done) {
            slot = {
                getDivID: function() {
                    return "DIV_1";
                },
                setDisplayFunctionCalled: function() {
                    return true;
                },
                setArguments: function() {
                    return true;
                }
            };
            arg = ["DIV_1", "DIV_2"];

            sinon.spy(slot, "getDivID");
            sinon.spy(slot, "setDisplayFunctionCalled");
            sinon.spy(slot, "setArguments");

            sinon.spy(UTIL, "isObject");
            sinon.spy(UTIL, "isFunction");
            sinon.spy(UTIL, "isArray");
            done();
        });

        afterEach(function(done) {

            slot.getDivID.restore();
            slot.setDisplayFunctionCalled.restore();
            slot.setArguments.restore();

            slot = null;

            UTIL.isObject.restore();
            UTIL.isFunction.restore();
            UTIL.isArray.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.setDisplayFunctionCalledIfRequired.should.be.a('function');
            done();
        });

        it('should have called setDisplayFunctionCalled and setArguments if given is proper ', function(done) {
            GPT.setDisplayFunctionCalledIfRequired(slot, arg);
            UTIL.isObject.calledWith(slot).should.be.true;
            UTIL.isFunction.calledWith(slot.getDivID).should.be.true;
            UTIL.isArray.calledWith(arg).should.be.true;
            slot.getDivID.called.should.be.true;
            slot.setDisplayFunctionCalled.calledWith(true).should.be.true;
            slot.setArguments.calledWith(arg).should.be.true;
            done();
        });

    });

    describe('#getStatusOfSlotForDivId', function() {
        var divID = null;

        beforeEach(function(done) {
            divID = commonDivID;
            GPT.slotsMap[divID] = {
                getStatus: function() {
                    CONSTANTS.SLOT_STATUS.TARGETING_ADDED;
                }
            };
            sinon.spy(GPT.slotsMap[divID], "getStatus");
            sinon.stub(UTIL, "isOwnProperty");

            UTIL.isOwnProperty.returns(true)
            done();
        });

        afterEach(function(done) {
            GPT.slotMap[divID] = null;
            UTIL.isOwnProperty.restore();
            divID = null;
            done();
        });

        it('is a function', function(done) {
            GPT.getStatusOfSlotForDivId.should.be.a('function');
            done();
        });

        it('should return slot status by calling getStatus of the given slot if its present in slotMap', function(done) {
            GPT.getStatusOfSlotForDivId(divID);
            // UTIL.isOwnProperty.calledWith(GPT.slotMap, divID).should.be.true;
            UTIL.isOwnProperty.called.should.be.true;
            GPT.slotsMap[divID].getStatus.called.should.be.true;
            done();
        });

        it('should return slot status as DISPLAYED if given divID is not present in slotMap', function(done) {
            UTIL.isOwnProperty.returns(false);
            GPT.getStatusOfSlotForDivId(divID).should.be.equal(CONSTANTS.SLOT_STATUS.DISPLAYED);
            done();
        });
    });

    describe('#getSlotNamesByStatus', function() {
        var statusObject = null;
        var slot_1_Stub = null;
        var slot_2_Stub = null;

        beforeEach(function(done) {
            statusObject = CONSTANTS.SLOT_STATUS;

            slot_1_Stub = {
                getStatus: function () {
                    return "CREATED";
                }
            };

            slot_2_Stub =  {
                getStatus: function () {
                    return "NON_EXISITNG_STATUS";
                }
            };

            GPT.slotsMap["DIV_1"] = slot_1_Stub;
            GPT.slotsMap["DIV_2"] = slot_2_Stub;

            sinon.spy(GPT.slotsMap["DIV_1"], "getStatus");
            sinon.spy(GPT.slotsMap["DIV_2"], "getStatus");
            sinon.spy(UTIL, 'forEachOnObject');
            sinon.spy(UTIL, 'isOwnProperty');
            done();
        });

        afterEach(function(done) {
            GPT.slotMap["DIV_1"] = null;
            GPT.slotMap["DIV_2"] = null;
            UTIL.forEachOnObject.restore();
            UTIL.isOwnProperty.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.getSlotNamesByStatus.should.be.a('function');
            done();
        });

        it('should return array of slots', function(done) {
            GPT.getSlotNamesByStatus(statusObject).should.be.a('array');
            done();
        });

        it('should have called UTIL functions and slot\'s getStatus', function(done) {
            GPT.getSlotNamesByStatus(statusObject);
            
            UTIL.isOwnProperty.called.should.be.true;
            UTIL.forEachOnObject.called.should.be.true;

            GPT.slotsMap["DIV_1"].getStatus.called.should.be.true;
            GPT.slotsMap["DIV_2"].getStatus.called.should.be.true;
            done();
        });

        it('should return array of keys from slotMap which match the status of given status object', function (done) {
            GPT.getSlotNamesByStatus(statusObject).should.be.an('array');
            GPT.getSlotNamesByStatus(statusObject).should.be.deep.equal(["DIV_1"]);
            done();
        });

        it('should return empty array if slotsMap is empty', function (done) {
            GPT.slotsMap = {};
            GPT.getSlotNamesByStatus(statusObject).should.be.an('array');
            GPT.getSlotNamesByStatus(statusObject).should.be.deep.equal([]);
            done();
        });
    });

    describe('#removeDMTargetingFromSlot', function() {
        var key = null;
        var currentGoogleSlotStub = null;

        beforeEach(function(done) {
            key = commonDivID;
            GPT.slotsMap = {};
            currentGoogleSlotStub = {
                keyValuePairs: {
                    "k1": "v1",
                    "k2": "v2",
                    "pk1": "pv1",
                    "pk2": "pv2",                    
                },
                getTargetingKeys: function() {
                    return Object.keys(this.keyValuePairs);
                },
                getTargeting: function(key) {
                    return this.keyValuePairs[key];
                },
                clearTargeting: function() {
                    this.keyValuePairs = {};
                },
                setTargeting: function(key, value) {
                    return this.keyValuePairs[key] = value;
                },
            };
            
            GPT.wrapperTargetingKeys = {
                "pk1": "pv1",
                "pk2": "pv2",
                "pk3": "pv3"
            };

            GPT.slotsMap[key] = {
                getPubAdServerObject: function() {
                    return currentGoogleSlotStub;
                }
            };

            sinon.spy(currentGoogleSlotStub, "getTargetingKeys");
            sinon.spy(currentGoogleSlotStub, "getTargeting");
            sinon.spy(currentGoogleSlotStub, "clearTargeting");
            sinon.spy(currentGoogleSlotStub, "setTargeting");

            sinon.spy(UTIL, "isOwnProperty");
            sinon.spy(UTIL, "forEachOnArray");
            sinon.spy(UTIL, "forEachOnObject");
            done();
        });


        afterEach(function(done) {
            currentGoogleSlotStub.getTargetingKeys.restore();
            currentGoogleSlotStub.getTargeting.restore();
            currentGoogleSlotStub.clearTargeting.restore();
            currentGoogleSlotStub.setTargeting.restore();

            UTIL.isOwnProperty.restore();
            UTIL.forEachOnArray.restore();
            UTIL.forEachOnObject.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.removeDMTargetingFromSlot.should.be.a('function');
            done();
        });

        it('should proceed only if given key is present in slotsMap', function (done) {
            GPT.removeDMTargetingFromSlot("non_existing_key");

            UTIL.isOwnProperty.calledOnce.should.be.true;

            UTIL.forEachOnObject.called.should.be.false;
            UTIL.forEachOnArray.called.should.be.false;

            currentGoogleSlotStub.getTargetingKeys.called.should.be.false;
            currentGoogleSlotStub.getTargeting.called.should.be.false;
            currentGoogleSlotStub.clearTargeting.called.should.be.false;
            currentGoogleSlotStub.setTargeting.called.should.be.false;
            done();
        });

        it('should have called proper functions', function(done) {
            GPT.removeDMTargetingFromSlot(key);

            UTIL.isOwnProperty.called.should.be.true;
            UTIL.forEachOnObject.called.should.be.true;
            UTIL.forEachOnArray.called.should.be.true;

            currentGoogleSlotStub.getTargetingKeys.called.should.be.true;
            currentGoogleSlotStub.getTargeting.called.should.be.true;
            currentGoogleSlotStub.clearTargeting.called.should.be.true;
            currentGoogleSlotStub.setTargeting.called.should.be.true;
            done();
        });

        it('should have removed wrapper targeting keys', function (done) {
            GPT.removeDMTargetingFromSlot(key);

            currentGoogleSlotStub.keyValuePairs.should.not.have.all.keys(Object.keys(GPT.wrapperTargetingKeys));

            currentGoogleSlotStub.setTargeting.calledWith("k1", "v1").should.be.true;
            currentGoogleSlotStub.setTargeting.calledWith("k2", "v2").should.be.true;
            currentGoogleSlotStub.setTargeting.calledWith("pk1", "pv1").should.be.false;
            currentGoogleSlotStub.setTargeting.calledWith("pk2", "pv2").should.be.false;
            currentGoogleSlotStub.setTargeting.calledWith("pk3", "pv3").should.be.false;
            done();
        });
    });

    describe('#updateStatusOfQualifyingSlotsBeforeCallingAdapters', function() {
        var slotNames = null,
            argumentsFromCallingFunction = null,
            isRefreshCall = null;
        var slotObject = null;
        beforeEach(function(done) {
            slotNames = ["slot_1", "slot_2", "slot_3"];
            argumentsFromCallingFunction = {};
            isRefreshCall = true;
            sinon.spy(UTIL, "forEachOnArray");
            sinon.stub(UTIL, "isOwnProperty");
            GPT.slotsMap = {};
            slotObject = {
                setStatus: function() {
                    return "setStatus";
                },
                setRefreshFunctionCalled: function() {
                    return "setRefreshFunctionCalled";
                },
                setArguments: function() {
                    return "setArguments";
                },
                getStatus: function() {
                    return CONSTANTS.SLOT_STATUS.PARTNERS_CALLED;
                }
            };

            sinon.spy(slotObject, "setStatus");
            sinon.spy(slotObject, "setRefreshFunctionCalled");
            sinon.spy(slotObject, "setArguments");

            GPT.slotsMap["slot_1"] = slotObject;
            GPT.slotsMap["slot_2"] = slotObject;
            GPT.slotsMap["slot_3"] = slotObject;

            UTIL.isOwnProperty.returns(true);
            sinon.stub(GPT, "removeDMTargetingFromSlot");
            GPT.removeDMTargetingFromSlot.returns(true);

            done();
        });

        afterEach(function(done) {

            slotObject.setStatus.restore();
            slotObject.setRefreshFunctionCalled.restore();
            slotObject.setArguments.restore();

            GPT.slotsMap = null;

            UTIL.forEachOnArray.restore();
            UTIL.isOwnProperty.restore();

            GPT.removeDMTargetingFromSlot.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters.should.be.a('function');
            done();
        });

        it('should set status of slot to PARTNERS_CALLED if given slot is present in slotsMap', function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters(slotNames, argumentsFromCallingFunction, isRefreshCall);
            UTIL.forEachOnArray.calledWith(slotNames).should.be.true;
            GPT.slotsMap["slot_1"].getStatus().should.be.equal(CONSTANTS.SLOT_STATUS.PARTNERS_CALLED);
            done();
        });

        it('should have called GPT.removeDMTargetingFromSlot with slot names and should have called respective slot\'s setRefreshFunctionCalled and setArguments if isRefreshCall is true', function(done) {
            GPT.updateStatusOfQualifyingSlotsBeforeCallingAdapters(slotNames, argumentsFromCallingFunction, isRefreshCall);
            GPT.removeDMTargetingFromSlot.called.should.be.true;
            GPT.slotsMap["slot_1"].setRefreshFunctionCalled.calledWith(true).should.be.true;
            GPT.slotsMap["slot_1"].setArguments.calledWith(argumentsFromCallingFunction).should.be.true;
            done();
        });
    });

    describe('#postTimeoutRefreshExecution', function() {
        var qualifyingSlotNames = null,
            theObject = null,
            originalFunction = null,
            arg = null;
        var slotObject = null;
        beforeEach(function(done) {
            qualifyingSlotNames = ["slot_1", "slot_2"];
            theObject = {};
            originalFunction = function() {
                return "originalFunction";
            };
            arg = {};
            slotObject = {
                getDivID: function() {
                    return "getDivID";
                },
                getSizes: function() {
                    return "getSizes";
                },
            };

            GPT.slotsMap = {};
            GPT.slotsMap["slot_1"] = slotObject;
            GPT.slotsMap["slot_2"] = slotObject;

            sinon.spy(slotObject, "getDivID");

            sinon.spy(window, "setTimeout");

            sinon.spy(CONFIG, "getTimeout");

            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "forEachOnArray");
            sinon.spy(UTIL, "createVLogInfoPanel");
            sinon.spy(UTIL, "realignVLogInfoPanel");

            sinon.stub(BM, "executeAnalyticsPixel");
            BM.executeAnalyticsPixel.returns(true);
            sinon.stub(GPT, "callOriginalRefeshFunction");
            GPT.callOriginalRefeshFunction.returns(true);

            sinon.stub(GPT, "findWinningBidIfRequired_Refresh");
            GPT.findWinningBidIfRequired_Refresh.returns(true);

            done();
        });

        afterEach(function(done) {
            UTIL.log.restore();
            UTIL.forEachOnArray.restore();
            UTIL.createVLogInfoPanel.restore();
            UTIL.realignVLogInfoPanel.restore();

            BM.executeAnalyticsPixel.restore();

            GPT.callOriginalRefeshFunction.restore();

            GPT.findWinningBidIfRequired_Refresh.restore();

            window.setTimeout.restore();

            CONFIG.getTimeout.restore();

            slotObject.getDivID.restore();

            done();
        });

        it('is a function', function(done) {
            GPT.postTimeoutRefreshExecution.should.be.a('function');
            done();
        });

        // todo
        xit('should have logged the arg', function(done) {
            GPT.postTimeoutRefreshExecution(qualifyingSlotNames, theObject, originalFunction, arg);
            UTIL.log.calledWith("Executing post CONFIG.getTimeout() events, arguments: ").should.be.true;
            UTIL.log.calledWith(arg).should.be.true;
            UTIL.forEachOnArray.calledWith(qualifyingSlotNames).should.be.true;
            window.setTimeout.called.should.be.true;
            BM.executeAnalyticsPixel.called.should.be.true;
            GPT.callOriginalRefeshFunction.calledWith(true, theObject, originalFunction, arg).should.be.true;
            done();
        });
    });

    describe('#getSizeFromSizeMapping', function() {
        var divID = null,
            slotSizeMapping = null;
        var sizeMapping = null;

        beforeEach(function(done) {
            divID = commonDivID;
            sizeMapping = [
                [340, 210],
                [1024, 768]
            ]
            slotSizeMapping = sizeMapping;
            sinon.stub(UTIL, "isOwnProperty");
            sinon.stub(UTIL, "getScreenWidth");
            sinon.stub(UTIL, "getScreenHeight");
            sinon.stub(UTIL, "isArray");
            sinon.stub(UTIL, "isNumber");
            sinon.stub(UTIL, "log");

            sinon.stub(GPT, "getWindowReference");
            GPT.getWindowReference.returns(true);
            done();
        });

        afterEach(function(done) {

            UTIL.isOwnProperty.restore();
            UTIL.getScreenWidth.restore();
            UTIL.getScreenHeight.restore();
            UTIL.isArray.restore();
            UTIL.isNumber.restore();
            UTIL.log.restore();

            GPT.getWindowReference.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.getSizeFromSizeMapping.should.be.a('function');
            done();
        });

        it('returns false if given divID is not in give slotSizeMapping', function(done) {
            UTIL.isOwnProperty.returns(false);
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            done();
        });

        it('returns false if sizeMapping for given divID is not an array', function(done) {
            UTIL.isOwnProperty.returns(true);
            UTIL.isArray.withArgs(sizeMapping).returns(false);
            GPT.getSizeFromSizeMapping(divID, slotSizeMapping).should.be.false;
            done();
        });
    });

    describe('#storeInSlotsMap', function() {
        it('is a function', function(done) {
            GPT.storeInSlotsMap.should.be.a('function');
            done();
        });
    });


    describe('#updateSlotsMapFromGoogleSlots', function() {
        var googleSlotsArray = null, argumentsFromCallingFunction = null, isDisplayFlow = null;
        var currentGoogleSlotStub_1 = null;
        var currentGoogleSlotStub_2 = null;

        beforeEach(function (done) {
            currentGoogleSlotStub_1 = {
                keyValuePairs: {
                    "k1": "v1",
                    "k2": "v2",
                    "pk1": "pv1",
                    "pk2": "pv2",                    
                },
                getTargetingKeys: function() {
                    return Object.keys(this.keyValuePairs);
                },
                getTargeting: function(key) {
                    return this.keyValuePairs[key];
                },
                clearTargeting: function() {
                    this.keyValuePairs = {};
                },
                setTargeting: function(key, value) {
                    return this.keyValuePairs[key] = value;
                },
                getSlotId: function () {
                    return "slot_1";
                },
                getAdUnitPath: function () {
                    return "getAdUnitPath";
                }
            };

            currentGoogleSlotStub_2 = {
                keyValuePairs: {
                    "k11": "v11",
                    "k22": "v22",
                    "pk11": "pv11",
                    "pk22": "pv22",                    
                },
                getTargetingKeys: function() {
                    return Object.keys(this.keyValuePairs);
                },
                getTargeting: function(key) {
                    return this.keyValuePairs[key];
                },
                clearTargeting: function() {
                    this.keyValuePairs = {};
                },
                setTargeting: function(key, value) {
                    return this.keyValuePairs[key] = value;
                },
                getSlotId: function () {
                    return {
                        getDomId: function () {
                            return "DIV_2";
                        }
                    };
                },
                getAdUnitPath: function () {
                    return "getAdUnitPath";
                }
            };

            GPT.slotsMap["DIV_2"] = currentGoogleSlotStub_1;

            argumentsFromCallingFunction = ["DIV_1", "DIV_2"];

            googleSlotsArray = [currentGoogleSlotStub_1, currentGoogleSlotStub_2];
            isDisplayFlow = true;

            sinon.spy(currentGoogleSlotStub_1, "getTargetingKeys");
            sinon.spy(currentGoogleSlotStub_1, "getTargeting");
            sinon.spy(currentGoogleSlotStub_1, "clearTargeting");
            sinon.spy(currentGoogleSlotStub_1, "setTargeting");
            sinon.spy(currentGoogleSlotStub_1, "getSlotId");


            sinon.spy(currentGoogleSlotStub_2, "getTargetingKeys");
            sinon.spy(currentGoogleSlotStub_2, "getTargeting");
            sinon.spy(currentGoogleSlotStub_2, "clearTargeting");
            sinon.spy(currentGoogleSlotStub_2, "setTargeting");
            sinon.spy(currentGoogleSlotStub_2, "getSlotId");

            sinon.spy(UTIL, "isOwnProperty");
            sinon.spy(UTIL, "forEachOnArray");
            sinon.spy(UTIL, "log");

            sinon.spy(GPT, "generateSlotName");
            sinon.spy(GPT, "storeInSlotsMap");

            sinon.spy(GPT, "setDisplayFunctionCalledIfRequired");

            done();
        });

        afterEach(function (done) {

            currentGoogleSlotStub_1.getTargetingKeys.restore();
            currentGoogleSlotStub_1.getTargeting.restore();
            currentGoogleSlotStub_1.clearTargeting.restore();
            currentGoogleSlotStub_1.setTargeting.restore();
            currentGoogleSlotStub_1.getSlotId.restore();

            currentGoogleSlotStub_2.getTargetingKeys.restore();
            currentGoogleSlotStub_2.getTargeting.restore();
            currentGoogleSlotStub_2.clearTargeting.restore();
            currentGoogleSlotStub_2.setTargeting.restore();
            currentGoogleSlotStub_2.getSlotId.restore();

            UTIL.isOwnProperty.restore();
            UTIL.forEachOnArray.restore();
            UTIL.log.restore();

            GPT.generateSlotName.restore();
            GPT.storeInSlotsMap.restore();
            GPT.setDisplayFunctionCalledIfRequired.restore();

            isDisplayFlow = null;
            googleSlotsArray = null;
            argumentsFromCallingFunction = null;

            done();
        });

        it('is a function', function(done) {
            GPT.updateSlotsMapFromGoogleSlots.should.be.a('function');
            done();
        });

        it('should have logged about generating slotsMap as well as the slotsMap generated', function (done) {
            GPT.updateSlotsMapFromGoogleSlots(googleSlotsArray, argumentsFromCallingFunction, isDisplayFlow);
            UTIL.log.calledWith("Generating slotsMap").should.be.true;
            UTIL.log.calledWith(GPT.slotsMap).should.be.true;
            done();
        });

        it('should have iterated over the googleSlotsArray ', function (done) {
            GPT.updateSlotsMapFromGoogleSlots(googleSlotsArray, argumentsFromCallingFunction, isDisplayFlow);
            GPT.generateSlotName.calledTwice.should.be.true;
            GPT.storeInSlotsMap.calledTwice.should.be.true;
            GPT.storeInSlotsMap.calledWith("").should.be.true;
            GPT.storeInSlotsMap.calledWith("DIV_2", currentGoogleSlotStub_2, isDisplayFlow).should.be.true;
            done();
        });


        it('should set display function called bsaed on isDisplayFlow and whether current slot is present in slotsMap', function (done) {
            GPT.updateSlotsMapFromGoogleSlots(googleSlotsArray, argumentsFromCallingFunction, isDisplayFlow);
            GPT.setDisplayFunctionCalledIfRequired.calledWith(GPT.slotsMap["DIV_2"], argumentsFromCallingFunction).should.be.true;
            expect(googleSlotsArray.length).to.be.equal(2);
            GPT.setDisplayFunctionCalledIfRequired.calledOnce.should.be.true;
            done();
        });

        it('should not set display function called if  isDisplayFlow  if false even current slot is present in slotsMap', function (done) {
            isDisplayFlow = false;
            GPT.updateSlotsMapFromGoogleSlots(googleSlotsArray, argumentsFromCallingFunction, isDisplayFlow);
            GPT.setDisplayFunctionCalledIfRequired.calledWith(GPT.slotsMap["DIV_2"], argumentsFromCallingFunction).should.be.false;
            expect(googleSlotsArray.length).to.be.equal(2);
            GPT.setDisplayFunctionCalledIfRequired.calledOnce.should.be.false;
            done();
        });

    });

    describe('#updateStatusAfterRendering', function() {
        var divID = null, isRefreshCall = null;
        var slot_1_Stub = null;
        var slotName = null;

        beforeEach(function (done) {
            isRefreshCall = true;
            slotName = "slot_1";
            divID = commonDivID;
            slot_1_Stub = SLOT.createSlot(slotName);
            GPT.slotsMap[divID] = slot_1_Stub;

            sinon.spy(GPT.slotsMap[divID], "updateStatusAfterRendering");

            sinon.spy(UTIL, "isOwnProperty");
            done();
        });

        afterEach(function (done) {
            isRefreshCall = false;
            GPT.slotsMap[divID].updateStatusAfterRendering.restore();
            GPT.slotsMap[divID] = null;
            slot_1_Stub = null;
            divID = null;

            UTIL.isOwnProperty.restore();
            done();
        });

        it('is a function', function(done) {
            GPT.updateStatusAfterRendering.should.be.a('function');
            done();
        });

        it('should not proceed if given divID is not in slotsMap', function (done) {
            GPT.updateStatusAfterRendering("non_existing_div_id", true);
            GPT.slotsMap[divID].updateStatusAfterRendering.called.should.be.false;
            done();
        });

        it('should have called updateStatusAfterRendering on slot of given id when present in slotsMap', function (done) {
            GPT.updateStatusAfterRendering(divID, isRefreshCall);
            GPT.slotsMap[divID].updateStatusAfterRendering.calledWith(isRefreshCall).should.be.true;
            done();
        });
    });

    describe('#findWinningBidAndApplyTargeting', function() {
        var divID = null;
        var dataStub = null;
        var winningBidStub = null;
        var keyValuePairsStub = null;
        var googleDefinedSlotStub = null;

        beforeEach(function(done) {
            divID = commonDivID;
            winningBidStub = {
                getBidID: function() {
                    return "getBidID";
                },
                getStatus: function() {
                    return "getStatus";
                },
                getNetEcpm: function() {
                    return "getNetEcpm";
                },
                getDealID: function() {
                    return "getDealID";
                },
                getAdapterID: function() {
                    return "getAdapterID";
                },
            };
            sinon.stub(winningBidStub, "getBidID");
            sinon.stub(winningBidStub, "getStatus");
            sinon.stub(winningBidStub, "getNetEcpm");
            sinon.stub(winningBidStub, "getDealID");
            sinon.stub(winningBidStub, "getAdapterID");
            keyValuePairsStub = {
                "key1": {
                    "k1": "v1",
                    "k2": "v2"
                },
                "key2": {
                    "k12": "v12",
                    "k22": "v22"
                }
            };
            dataStub = {
                wb: winningBidStub,
                kvp: keyValuePairsStub
            };
            googleDefinedSlotStub = {
                setTargeting: function() {
                    return "setTargeting";
                }
            };
            sinon.spy(googleDefinedSlotStub, "setTargeting");

            GPT.slotsMap[divID] = {
                getPubAdServerObject: function() {
                    return googleDefinedSlotStub;
                },
                setStatus: function() {
                    return "setStatus";
                }
            };
            sinon.spy(GPT.slotsMap[divID], "setStatus");

            sinon.stub(BM, "getBid").withArgs(divID).returns(dataStub);
            sinon.spy(UTIL, "log");
            sinon.spy(UTIL, "forEachOnObject");
            sinon.stub(UTIL, "isOwnProperty");
            sinon.stub(GPT, "defineWrapperTargetingKey").returns(true);
            done();
        });

        afterEach(function(done) {
            BM.getBid.restore();

            UTIL.log.restore();
            UTIL.forEachOnObject.restore();
            UTIL.isOwnProperty.restore();

            GPT.slotsMap[divID].setStatus.restore();

            googleDefinedSlotStub.setTargeting.restore();
            GPT.defineWrapperTargetingKey.restore();

            if (winningBidStub) {
                winningBidStub.getBidID.restore();
                winningBidStub.getStatus.restore();
                winningBidStub.getNetEcpm.restore();
                winningBidStub.getDealID.restore();
                winningBidStub.getAdapterID.restore();
            }
            divID = null;
            done();
        });

        it('is a function', function(done) {
            GPT.findWinningBidAndApplyTargeting.should.be.a('function');
            done();
        });

        it('should have logged passed divID along with winning Bid object', function(done) {
            GPT.findWinningBidAndApplyTargeting(divID);
            UTIL.log.calledWith("DIV: " + divID + " winningBid: ").should.be.true;
            UTIL.log.calledWith(winningBidStub).should.be.true;
            done();
        });

        it('should not have called setTargeting for bid if the winningBid is invalid object', function(done) {
            winningBidStub = null;
            GPT.findWinningBidAndApplyTargeting(divID);
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.SLOT_STATUS.TARGETING_ADDED).should.be.false;
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.WRAPPER_TARGETING_KEYS.PROFILE_ID, CONFIG.getProfileID()).should.be.false;
            done();
        });

        it('should not have called setTargeting for bid if bid\'s net ecpm is not greater than 0', function(done) {
            winningBidStub.getNetEcpm.returns(-1);
            GPT.findWinningBidAndApplyTargeting(divID);
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.SLOT_STATUS.TARGETING_ADDED).should.be.false;
            googleDefinedSlotStub.setTargeting.calledWith(CONSTANTS.WRAPPER_TARGETING_KEYS.PROFILE_ID, CONFIG.getProfileID()).should.be.false;
            winningBidStub.getNetEcpm.called.should.be.true;
            winningBidStub.getBidID.called.should.be.false;
            winningBidStub.getStatus.called.should.be.false;
            winningBidStub.getDealID.called.should.be.false;
            winningBidStub.getAdapterID.called.should.be.false;
            done();
        });

        it('should not have called defineWrapperTargetingKey if key in keyValuePairs is among prebid keys to ignore', function(done) {
            winningBidStub.getNetEcpm.returns(2);

            UTIL.isOwnProperty.withArgs(CONSTANTS.IGNORE_PREBID_KEYS).returns(true);

            GPT.findWinningBidAndApplyTargeting(divID);

            winningBidStub.getNetEcpm.called.should.be.true;
            winningBidStub.getBidID.called.should.be.true;
            winningBidStub.getStatus.called.should.be.true;
            GPT.defineWrapperTargetingKey.called.should.be.false;
            done();
        });
    });
});
