var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import axios from "axios";
import { headers, schedulePlannerUrl } from "./secrets"; // you have to create this manually.
import * as fs from "fs/promises";
var sections = {};
var grabSchedules = function () { return __awaiter(void 0, void 0, void 0, function () {
    var classes, _loop_1, classes_1, classes_1_1, c, e_1_1;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                classes = [
                    "9083052",
                    "9083053",
                    "9082979",
                    "9378697",
                    "9082980",
                    "9310700",
                ];
                _loop_1 = function (c) {
                    var data;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, axios.post(schedulePlannerUrl, {
                                    breaks: [],
                                    cartSections: [],
                                    courses: [c],
                                    currentSections: [],
                                    padding: 0,
                                }, {
                                    headers: headers,
                                })];
                            case 1:
                                data = (_c.sent()).data;
                                data.registrationBlocks.forEach(function (block) {
                                    var subsections = block.sectionIds.map(function (id) { return data.sections.find(function (sec) { return sec.id === id; }); });
                                    var section = {
                                        id: "whatever",
                                        course: subsections[0].course,
                                        subjectId: subsections[0].subjectId,
                                        meetings: subsections.flatMap(function (subs) { return subs.meetings; }),
                                    };
                                    var key = "".concat(section.subjectId, " ").concat(section.course);
                                    if (sections[key] === undefined)
                                        sections[key] = [];
                                    sections[key].push(section);
                                });
                                return [2 /*return*/];
                        }
                    });
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, 7, 8]);
                classes_1 = __values(classes), classes_1_1 = classes_1.next();
                _b.label = 2;
            case 2:
                if (!!classes_1_1.done) return [3 /*break*/, 5];
                c = classes_1_1.value;
                return [5 /*yield**/, _loop_1(c)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                classes_1_1 = classes_1.next();
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 8];
            case 6:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 8];
            case 7:
                try {
                    if (classes_1_1 && !classes_1_1.done && (_a = classes_1.return)) _a.call(classes_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 8:
                fs.writeFile("sectiosn.json", JSON.stringify(sections));
                return [2 /*return*/];
        }
    });
}); };
grabSchedules();
