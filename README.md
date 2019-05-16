serialport-sync Driver For NodeJS

## Installation
```
npm i serialport-sync --save
```

## Usage

```
var SerialPort = require("serialport-sync");

var serial = new SerialPort.SerialPort("COM4", 115200, false);

main();

async function main() {
    console.log(await SerialPort.SerialPort.GetSerialPorts());

    await serial.Open();

    await serial.WriteLine('f0');

    await serial.Delay(500);

    await serial.WriteLine('f?');

    await serial.Delay(500);


    var res = await serial.ReadExisting();
    console.log(res);
}

```
