import { List } from 'immutable';
import serialport = require('serialport');
import * as Collections from 'typescript-collections';

const Readline = (serialport as any).parsers.Readline;
const ByteLength = (serialport as any).parsers.ByteLength;


export class SerialPort {
    myQueue = new Collections.Queue();
    currentData = "";
    port: serialport;
    private _isOpen = false;

    constructor(public comPort: string, public baudRate: number, public showDebugData: boolean = false) {
        this.myQueue = new Collections.Queue();
        this.currentData = "";

    }

    public static async  GetSerialPorts() {
        var comPorts: string[] = [];
        var serialObjs = await serialport.list();

        for (var i = 0; i < serialObjs.length; i++) {
            comPorts.push(serialObjs[i].comName);
        }

        return comPorts;
    }


    public GetPendingLines(): number {

        return this.myQueue.size();
    }

    public IsOpen() {
        return this._isOpen;
    }

    public async Open() {
        if (this.showDebugData) console.log("Init COM " + this.comPort + ", Baud Rate " + this.baudRate);
        this.port = new serialport(this.comPort, {
            autoOpen: true,
            baudRate: this.baudRate,
        });

        const parser = (this.port as any).pipe(new ByteLength({ length: 1 }));

        parser.on('data', (data: Buffer) => {
            if (this.showDebugData) console.log(this.comPort + ' PARSER : ', data);
            this.LastLine.push(data);
            this.currentData = this.ShowExisting();
        });

        await new Promise((resolve, reject) => {
            this.port.on('open', () => {
                if (this.showDebugData) console.log("opened : " + this.comPort);
                this._isOpen = true;
                resolve(true);
            });
        });
    }

    READLINE_RETRY_COUNT = 10;
    READLINE_RETRY_DELAY = 20;

    LastLine: Array<any> = [];

    ReadLastLine() {
        var lastLineTemp = this.LastLine;
        this.LastLine = [];
        return Buffer.concat(lastLineTemp, lastLineTemp.length);
    }

    async ReadLine(ignoreEcho: boolean = false): Promise<string> {
        var bufferData = "";

        for (var i = 0; i < this.READLINE_RETRY_COUNT; i++) {
            if (this.myQueue.size() > 0) {
                bufferData = this.myQueue.dequeue().toString();
                break;
            }
            await this.Delay(this.READLINE_RETRY_DELAY);
        }

        if (this.showDebugData) console.log("IN MSG : " + bufferData);
        if (ignoreEcho) {
            return await this.ReadLine(false);
        }
        return bufferData;
    }

    async WriteLine(data: string): Promise<number> {
        if (this.showDebugData) console.log("OUT MSG : ", data);
        return await new Promise<number>((resolve, reject) => {
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

        const parser = (this.port as any).pipe(new ByteLength({ length: 1 }));

        parser.on('data', (data: Uint8Array) => {
            var s = String.fromCharCode(data[0]);
            console.log("s : " + data[0]);
            this.myQueue.enqueue(s);
            this.currentData = this.ShowExisting();
        });

    }

    async Close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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

    Write(data: string) {
        if (this.showDebugData) console.log("OUT MSG : ", data);
        this.port.write(data);
    }

    async Query(data, delayAfterWrite) {
        await this.WriteLine(data);
        await this.Delay(delayAfterWrite);
        // Ignore echo line
        await this.ReadLine();
        return await this.ReadExisting();
    }

    async Delay(milliseconds: number) {
        return new Promise<void>(resolve => {
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

    async ReadExisting(addNewLine: boolean = true) {
        var data = this.LastLine;
        this.LastLine = [];
        return Buffer.concat(data, data.length);
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