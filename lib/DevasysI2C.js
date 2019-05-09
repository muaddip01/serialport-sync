"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ffi = require("ffi");
const ref = require("ref");
const Struct = require("ref-struct");
const ArrayType = require("ref-array");
class DevasysI2C {
    constructor(showDebugInfo = true) {
        this.DAPI_I2C_TRANS_DAMP = Struct({
            'byType': 'byte',
            'byDevId': 'byte',
            'wMemAddr': 'int16',
            'wCount': 'int16',
            'Data': ArrayType('byte', 30)
        });
        this.InitFFI();
        this.Open();
        this.handle = 0;
        this.showDebugInfo = showDebugInfo;
    }
    InitFFI() {
        var int16Ptr = ref.refType('int16');
        var DAPI_I2C_TRANS_DAMPPtr = ref.refType(this.DAPI_I2C_TRANS_DAMP);
        this.libi2c = ffi.Library('usbi2cio', {
            'DAPI_GetDllVersion': ['int', []],
            // public static extern int DAPI_OpenDeviceInstance(string lpsDevName, byte byDevInstance);
            'DAPI_OpenDeviceInstance': ['int', ['string', 'byte']],
            // public static extern bool DAPI_GetFirmwareVersion(IntPtr hDevInstance, ref DAPI_WORD pwVersion);
            'DAPI_GetFirmwareVersion': ['bool', ['int', int16Ptr]],
            // public static extern int DAPI_ReadI2c(IntPtr hDevInstance, ref DAPI_I2C_TRANS_Long TransI2c);
            'DAPI_ReadI2c': ['bool', ['int', DAPI_I2C_TRANS_DAMPPtr]],
            // public static extern int DAPI_WriteI2c(IntPtr hDevInstance, ref DAPI_I2C_TRANS TransI2c);
            'DAPI_WriteI2c': ['int', ['int', DAPI_I2C_TRANS_DAMPPtr]],
        });
    }
    ToHexString(byteArray) {
        return '[' + Array.from(byteArray, function (byte) {
            return '0x' + ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join(', ') + ']';
    }
    ReadI2C(devAddr, numOfBytes) {
        var I2CTransRef = ref.alloc(this.DAPI_I2C_TRANS_DAMP);
        I2CTransRef[0] = 0; // type
        I2CTransRef[1] = devAddr; // dev addr
        I2CTransRef[4] = numOfBytes; // count
        var result = this.libi2c.DAPI_ReadI2c(this.handle, I2CTransRef);
        var arr = [...I2CTransRef];
        var arr_sliced = arr.slice(6, 6 + numOfBytes);
        if (this.showDebugInfo)
            console.log("READ [0x" + devAddr.toString(16) + "]: " + this.ToHexString(arr_sliced));
        return arr_sliced;
    }
    WriteI2C(devAddr, data) {
        var I2CTransRef = ref.alloc(this.DAPI_I2C_TRANS_DAMP);
        I2CTransRef[0] = 0; // type
        I2CTransRef[1] = devAddr; // dev addr
        I2CTransRef[4] = data.length; // count
        for (var i = 0; i < data.length; i++) {
            I2CTransRef[i + 6] = data[i];
        }
        var result = this.libi2c.DAPI_WriteI2c(this.handle, I2CTransRef);
        if (this.showDebugInfo)
            console.log("WRITE [0x" + devAddr.toString(16) + "]: " + this.ToHexString(data));
        return result;
    }
    Open() {
        this.handle = this.libi2c.DAPI_OpenDeviceInstance("UsbI2cIo", 0);
    }
    GetDllVersion() {
        return this.libi2c.DAPI_GetDllVersion();
    }
    GetFWVersion() {
        var version = ref.alloc('int16');
        return this.libi2c.DAPI_GetFirmwareVersion(this.handle, version);
    }
}
exports.DevasysI2C = DevasysI2C;
