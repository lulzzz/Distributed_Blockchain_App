var path = require("path"),
    AWS = require('aws-sdk'),
    fs = require('fs');

exports.uploadFile = function(req, res) {
  
    var accessKeyId = "AKIAJ2YVOM4ZXQ5GKSNQ";
    var secretAccessKey = "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";

    AWS.config.update({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    });

    //For InvalidRequest error
    var s3 = new AWS.S3({
        endpoint: 's3-eu-central-1.amazonaws.com',
        signatureVersion: 'v4',
        region: 'eu-central-1'
    });

    var params = {
        Bucket: 'bverifybucket',
        Key: req.file.originalname,
        Body: fs.createReadStream(req.file.path),
        ContentType: req.file.mimetype
    };

    s3.putObject(params, function(perr, pres) {
        if (perr) {
            console.log("Error uploading data: ", perr);
        } else {
             console.log("uploaded data: ", pres);
            var params = { Bucket: 'bverifybucket' };
            s3.listObjects(params, function(err, data) {
                var bucketContents = data.Contents;
                for (var i = 0; i < bucketContents.length; i++) {
                    var urlParams = { Bucket: 'bverifybucket', Key: bucketContents[i].Key };
                    s3.getSignedUrl('getObject', urlParams, function(err, url) {
                        console.log('the url of the image is', url);
                    });
                }
            });
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


exports.registerProduct = function(req, res) {

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
