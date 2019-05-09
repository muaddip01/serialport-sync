serialport-sync Driver For NodeJS

## Installation
```
npm i serialport-sync --save
```

## Usage

```
import serialSync = require("serialport-sync");

import SerialPort = require('../../src/serialport-sync');

var serial = new SerialPort.SerialPort("COM2", 19200, true);

main();

async function main() {
    await serial.Open();

}


```
