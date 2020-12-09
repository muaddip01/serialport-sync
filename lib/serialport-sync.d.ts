/// <reference types="node" />
import serialport = require('serialport');
import * as Collections from 'typescript-collections';
export declare class SerialPort {
    comPort: string;
    baudRate: number;
    showDebugData: boolean;
    myQueue: Collections.Queue<{}>;
    currentData: string;
    port: serialport;
    private _isOpen;
    constructor(comPort: string, baudRate: number, showDebugData?: boolean);
    static GetSerialPorts(): Promise<string[]>;
    GetPendingLines(): number;
    IsOpen(): boolean;
    Open(): Promise<void>;
    READLINE_RETRY_COUNT: number;
    READLINE_RETRY_DELAY: number;
    LastLine: Array<any>;
    ReadLastLine(): Buffer;
    ReadLine(ignoreEcho?: boolean): Promise<string>;
    WriteLine(data: string): Promise<number>;
    CloseAndTest(): Promise<void>;
    Close(): Promise<void>;
    Write(data: string): void;
    Query(data: any, delayAfterWrite: any): Promise<Buffer>;
    Delay(milliseconds: number): Promise<void>;
    ShowExisting(): string;
    ReadExisting(addNewLine?: boolean): Promise<Buffer>;
    Flush(): Promise<{}>;
}
