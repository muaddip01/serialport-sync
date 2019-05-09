import SerialPort = require('../../src/serialport-sync');

var serial = new SerialPort.SerialPort("COM4", 115200, false);

main();

async function main() {
    console.log(serial.IsOpen());

    await serial.Open();

    console.log(serial.IsOpen());

    await serial.Write('f0');

    await serial.Delay(500);

    await serial.Write('f?');

    await serial.Delay(500);


    var res = await serial.ReadExisting();
    console.log(res);
}