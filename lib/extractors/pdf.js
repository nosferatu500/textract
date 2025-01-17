const { exec } = require("child_process");
const path = require("path");
const extract = require("pdf-text-extract");

function extractText(filePath, options, cb) {
    // See https://github.com/dbashford/textract/issues/75 for description of
    // what is happening here
    const pdftotextOptions = options.pdftotextOptions || { layout: "raw" };

    extract(filePath, pdftotextOptions, function (error, pages) {
        let fullText;
        if (error) {
            error = new Error(
                `Error extracting PDF text for file at [[ ${path.basename(filePath)} ]], error: ${error.message}`
            );
            cb(error, null);
            return;
        }
        fullText = pages.join(" ").trim();
        cb(null, fullText);
    });
}

function testForBinary(options, cb) {
    exec("pdftotext -v", function (error, stdout, stderr) {
        let msg;
        if (stderr && stderr.includes("pdftotext version")) {
            cb(true);
        } else {
            msg = "INFO: 'pdftotext' does not appear to be installed, " + "so textract will be unable to extract PDFs.";
            cb(false, msg);
        }
    });
}

module.exports = {
    types: ["application/pdf"],
    extract: extractText,
    test: testForBinary,
};
