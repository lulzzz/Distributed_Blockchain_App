var path = require("path"),
    AWS = require('aws-sdk');

exports.uploadFile = function (req, res) {
    console.log(req.body);
    var accessKeyId = "AKIAJ2YVOM4ZXQ5GKSNQ";
    var secretAccessKey = "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";

    AWS.config.update({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    });

    var s3 = new AWS.S3();

    var params = {
        Bucket: 'bverifybucket',
        Key: req.file.originalname,
        Body: JSON.stringify(req.file)
    };

    s3.putObject(params, function (perr, pres) {
        if (perr) {
            console.log("Error uploading data: ", perr);
        } else {
            console.log("Successfully uploaded data to myBucket/myKey");
        }
    });
    var product = {
        tokenId: '',
        materialName: 'Garcia leather',
        productName: 'Coach Crosby line Tote Handbag',
        quantity: '25 units',
        batchNumber: 'CCLTH22216FL',
        quality: 'Top Grain',
        color: 'Brown',
        weight: '5.7 oz.',
        manufactureDate: '22/2/2016',
        registeredDate: new Date(),
        dimension: "17' (L) x 8 3/4' (H) x 7' (W)",
        modelNumber: '33524LIC7C',
        shippedFrom: '',
        shippedOn: new Date(),
        trackDetails: {
            currentlyAt: 'FedEx',
            trackRecords: []
        },
        file: {
            name: ''
        }
    };
    res.json(product);
};


exports.registerProduct = function (req, res) {
    
    var product = {
        tokenId: '',
        materialName: 'Garcia leather',
        productName: 'Coach Crosby line Tote Handbag',
        quantity: '25 units',
        batchNumber: 'CCLTH22216FL',
        quality: 'Top Grain',
        color: 'Brown',
        weight: '5.7 oz.',
        manufactureDate: '22/2/2016',
        registeredDate: new Date(),
        dimension: "17' (L) x 8 3/4' (H) x 7' (W)",
        modelNumber: '33524LIC7C',
        shippedFrom: '',
        shippedOn: new Date(),
        trackDetails: {
            currentlyAt: 'FedEx',
            trackRecords: []
        },
        file: {
            name: ''
        }
    };
    res.json(product);
};
