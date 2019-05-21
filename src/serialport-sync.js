"use strict";
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
        this._isOpen = false;
        this.READLINE_RETRY_COUNT = 10;
        this.READLINE_RETRY_DELAY = 20;
        this.LastLine = "";
        this.myQueue = new Collections.Queue();
        this.currentData = "";
    }
    static async GetSerialPorts() {
        var comPorts = [];
        var serialObjs = await serialport.list();
        for (var i = 0; i < serialObjs.length; i++) {
            comPorts.push(serialObjs[i].comName);
        }
        return comPorts;
    }
    GetPendingLines() {
        return this.myQueue.size();
    }
    IsOpen() {
        return this._isOpen;
    }
    async Open() {
        if (this.showDebugData)
            console.log("Init COM " + this.comPort + ", Baud Rate " + this.baudRate);
        this.port = new serialport(this.comPort, {
            autoOpen: true,
            baudRate: this.baudRate,
        });
        const parser = this.port.pipe(new ByteLength({ length: 1 }));
        parser.on('data', (data) => {
            var str = data.toString('utf8');
            if (this.showDebugData)
                console.log(this.comPort + ' PARSER : ' + str);
            this.LastLine += str;
            // if (str === '\r') {
            //     this.myQueue.enqueue(this.LastLine);
            // }
            this.currentData = this.ShowExisting();
        });
        await new Promise((resolve, reject) => {
            this.port.on('open', () => {
                if (this.showDebugData)
                    console.log("opened : " + this.comPort);
                this._isOpen = true;
                resolve(true);
            });
        });
    }
    ReadLastLine() {
        var lastLineTemp = this.LastLine;
        this.LastLine = "";
        return lastLineTemp;
    }
    async ReadLine(ignoreEcho = false) {
        var bufferData = "";
        for (var i = 0; i < this.READLINE_RETRY_COUNT; i++) {
            if (this.myQueue.size() > 0) {
                bufferData = this.myQueue.dequeue().toString();
                break;
            }
            await this.Delay(this.READLINE_RETRY_DELAY);
        }
        if (this.showDebugData)
            console.log("IN MSG : " + bufferData);
        if (ignoreEcho) {
            return await this.ReadLine(false);
        }
        return bufferData;
    }
    async WriteLine(data) {
        if (this.showDebugData)
            console.log("OUT MSG : " + data);
        return await new Promise((resolve, reject) => {
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
    }
    // TODO : Recode me
    async CloseAndTest() {
        await this.Close();
        await this.Delay(1000);
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
    }
    async Close() {
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
    }
    Write(data) {
        if (this.showDebugData)
            console.log("OUT MSG : " + data);
        this.port.write(data);
    }
    async Query(data, delayAfterWrite) {
        await this.WriteLine(data);
        await this.Delay(delayAfterWrite);
        // Ignore echo line
        await this.ReadLine();
        return await this.ReadExisting();
    }
    async Delay(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
    ShowExisting() {
        var all = '';
        this.myQueue.forEach(function (d) {
            all += d;
        });
        return all;
    }
    async ReadExisting(addNewLine = true) {
        var data = this.LastLine;
        this.LastLine = "";
        return data;
        // var bufferData = this.LastLine;
        // this.LastLine = "";
        // while (this.myQueue.size() > 0) {
        //     bufferData += this.myQueue.dequeue().toString();
        //     if (addNewLine) bufferData += '\n';
        // }
        // if (this.showDebugData) console.log("IN MSG : " + bufferData);
        // return this.LastLine;
    }
    async Flush() {
        return await new Promise((resolve, reject) => {
            this.port.flush((err) => {
                if (err !== null) {
                    console.log("serial flush error");
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.SerialPort = SerialPort;
//# sourceMappingURL=serialport-sync.js.map