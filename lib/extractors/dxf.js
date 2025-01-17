const { exec } = require("child_process");
const path = require("path");
const util = require("../util");

function extractText(filePath, options, cb) {
    const execOptions = util.createExecOptions("dxf", options);
    const escapedPath = filePath.replace(/\s/g, "\\ ");
    exec(`drawingtotext ${escapedPath}`, execOptions, function (error, stdout, stderr) {
        if (stderr !== "") {
            error = new Error(`error extracting DXF text ${path.basename(filePath)}: ${stderr}`);
            cb(error, null);
            return;
        }

        cb(null, stdout);
    });
}

function testForBinary(options, cb) {
    exec("drawingtotext notalegalfile", function (error, stdout, stderr) {
        let msg;
        const errorRegex = /I couldn't make sense of your input/;
        if (stderr && errorRegex.test(stderr)) {
            cb(true);
        } else {
            msg =
                "INFO: 'drawingtotext' does not appear to be installed, " +
                "so textract will be unable to extract DXFs.";
            cb(false, msg);
        }
    });
}

module.exports = {
    types: [
        "application/dxf",
        "application/x-autocad",
        "application/x-dxf",
        "drawing/x-dxf",
        "image/vnd.dxf",
        "image/x-autocad",
        "image/x-dxf",
        "zz-application/zz-winassoc-dxf",
    ],
    extract: extractText,
    test: testForBinary,
};
