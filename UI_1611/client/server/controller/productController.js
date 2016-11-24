var path = require("path"),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    config = require('../appConfig/config.js');

exports.uploadFile = function (req, res) {
    try {
        var list = ["https://s3.ap-south-1.amazonaws.com/bverifybucket/manufacturer.png", "https://s3.ap-south-1.amazonaws.com/bverifybucket/qrcode.png"];
        //Configuring AWS account
      /*  AWS.config.update({
            accessKeyId: config.AWS_ACCESSKEY,
            secretAccessKey: config.AWS_SECRETACCESSKEY
        });

        //For InvalidRequest error
        var s3 = new AWS.S3({
            endpoint: config.S3_ENDPOINT,
            signatureVersion: config.S3_VERSION,
            region: config.S3_REGION
        });

        var params = {
            Bucket: config.S3_BUCKET,
            Key: req.file.originalname,
            Body: fs.createReadStream(req.file.path),
            ContentType: req.file.mimetype
        };*/

        /*s3.putObject(params, function (err, data) {
            if (err) {
                console.log("Error uploading data: ", err);
                res.status(500).json({ errorMsg: "Failed to upload file. Please try after some time." });
            } else {
                console.log("uploaded data: ", data);
                var params = { Bucket: config.S3_BUCKET };
                var urlList = [];
                s3.listObjects(params, function (err, data) {
                    if (err) {
                        res.status(500).json({ errorMsg: "Failed to retrieve uploaded files. Please try after some time." });
                    } else {
                        var bucketContents = data.Contents;
                        for (var i = 0; i < bucketContents.length; i++) {
                            var urlParams = { Bucket: config.S3_BUCKET, Key: bucketContents[i].Key };
                            s3.getSignedUrl('getObject', urlParams, function (err, url) {
                                urlList.push(url);
                            });
                        }
                        res.status(200).json(urlList);
                    }
                });
            }
        });*/
        res.status(200).json(list);

    } catch (e) {
        console.log("Errorr----------------", e);
        res.status(500).json({ errorMsg: "Currently we are experiencing technical difficulties. Please try after some time." });
    }
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
