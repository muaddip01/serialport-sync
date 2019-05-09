"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport = require("serialport");
const Collections = require("typescript-collections");
const Readline = serialport.parsers.Readline;
const ByteLength = serialport.parsers.ByteLength;
class SerialPort {
    constructor(comPort, baudRate, showDebugData = false) {
        this.comPort = comPort;
        this.baudRate = baudRate;
        this.showDebugData = showDebugData;
        this.myQueue = new Collections.Queue();
        this.currentData = "";
        this.READLINE_RETRY_COUNT = 10;
        this.READLINE_RETRY_DELAY = 20;
        this.LastLine = "";
        this.myQueue = new Collections.Queue();
        this.currentData = "";
    }
    GetPendingLines() {
        return this.myQueue.size();
    }
    Open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.showDebugData)
                console.log("Init COM " + this.comPort + ", Baud Rate " + this.baudRate);
            this.port = new serialport(this.comPort, {
                autoOpen: true,
                baudRate: this.baudRate,
            });
            const parser = this.port.pipe(new ByteLength({ length: 1 }));
            parser.on('data', (data) => {
                if (this.showDebugData)
                    console.log(this.comPort + ' PARSER : ' + data);
                this.myQueue.enqueue(data);
                this.LastLine = data;
                this.currentData = this.ShowExisting();
            });
            yield new Promise((resolve, reject) => {
                this.port.on('open', function () {
                    if (this.showDebugData)
                        console.log("opened : " + this.path);
                    resolve(true);
                });
            });
        });
    }
    ReadLastLine() {
        var lastLineTemp = this.LastLine;
        this.LastLine = "";
        return lastLineTemp;
    }
    ReadLine(ignoreEcho = false) {
        return __awaiter(this, void 0, void 0, function* () {
            var bufferData = "";
            for (var i = 0; i < this.READLINE_RETRY_COUNT; i++) {
                if (this.myQueue.size() > 0) {
                    bufferData = this.myQueue.dequeue().toString();
                    break;
                }
                yield this.Delay(this.READLINE_RETRY_DELAY);
            }
            if (this.showDebugData)
                console.log("IN MSG : " + bufferData);
            if (ignoreEcho) {
                return yield this.ReadLine(false);
            }
            return bufferData;
        });
    }
    WriteLine(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.showDebugData)
                console.log("OUT MSG : " + data);
            return yield new Promise((resolve, reject) => {
                this.port.write(data + '\r\n', (err, bytes) => {
                    if (err !== undefined) {
                        console.log('serial write error!');
                        reject(err);
                    }
                    else {
                        resolve(bytes);
                    }
                });
            });
        });
    }
    // TODO : Recode me
    CloseAndTest() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Close();
            yield this.Delay(1000);
            this.port = new serialport(this.comPort, {
                autoOpen: true, baudRate: this.baudRate
            });
            const parser = this.port.pipe(new ByteLength({ length: 1 }));
            parser.on('data', (data) => {
                var s = String.fromCharCode(data[0]);
                console.log("s : " + data[0]);
                this.myQueue.enqueue(s);
                this.currentData = this.ShowExisting();
            });
        });
    }
    Close() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.port.close((err) => {
                    if (err !== null) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    Write(data) {
        if (this.showDebugData)
            console.log("OUT MSG : " + data);
        this.port.write(data);
    }
    Query(data, delayAfterWrite) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.WriteLine(data);
            yield this.Delay(delayAfterWrite);
            // Ignore echo line
            yield this.ReadLine();
            return yield this.ReadExisting();
        });
    }
    Delay(milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                setTimeout(resolve, milliseconds);
            });
        });
    }
    ShowExisting() {
        var all = '';
        this.myQueue.forEach(function (d) {
            all += d;
        });
        return all;
    }
    ReadExisting(addNewLine = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                var bufferData = "";
                while (this.myQueue.size() > 0) {
                    bufferData += this.myQueue.dequeue().toString();
                    if (addNewLine)
                        bufferData += '\n';
                }
                if (this.showDebugData)
                    console.log("IN MSG : " + bufferData);
                this.port.flush((err) => {
                    if (err !== null) {
                        console.log("serial flush error");
                        reject(err);
                    }
                    else {
                        resolve(bufferData);
                    }
                });
            });
        });
    }
}
exports.SerialPort = SerialPort;
//# sourceMappingURL=serialport-sync.js.map