(function (window) {

    //namespace
    window.PARSER = {
 
        parseStrDate: function(dateStr){
            var milliSecs = Date.parse(dateStr);
            return milliSecs / 1000;
        },

        parseMilliSecToDate: function(milliSecs){
            var d = new Date(milliSecs * 1000),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [day, month, year].join('/');
        },

        parseStrToHexImage: function(urls){
            var hexImages = [];
            angular.forEach(urls, function (val, key) {
                if (key > 4) // limit of 5
                    return;
                hexImages.push(CONVERTER.strTohex(val));
            });
            return hexImages;
        },

        parseHexToStrImage: function(urls){
            var images = [];
                angular.forEach(urls, function (val, key) {
                    if (key > 4) // limit of 5
                        return;
                    images.push(CONVERTER.hexTostr(val));
                });
                return images;
        }
    };
})(this);