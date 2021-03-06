import SerialPort = require('../../src/serialport-sync');

var serial = new SerialPort.SerialPort("COM5", 19200, true);

main();

async function main() {

    console.log(await SerialPort.SerialPort.GetSerialPorts());

    console.log(serial.IsOpen());

    await serial.Open();

    console.log(serial.IsOpen());

    await serial.WriteLine('v');

    await serial.Delay(500);

    var res = await serial.ReadExisting();
    console.log(res);

    await serial.Write('f0');

    await serial.Delay(500);

    await serial.Write('f?');

    await serial.Delay(500);

    var res = await serial.ReadExisting();
    console.log(res);

    console.log('done');
}