import SerialPort = require('../../src/serialport-sync');

var serial = new SerialPort.SerialPort("COM2", 19200, true);

main();

async function main() {
    await serial.Open();

    await serial.WriteLine('R 0');

    await serial.Delay(500);

    var res = await serial.ReadExisting();
    console.log(res);
}