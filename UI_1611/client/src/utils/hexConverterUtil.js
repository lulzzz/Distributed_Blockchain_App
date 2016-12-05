(function (window) {

    //namespace
    window.CONVERTER = {
        //Convert to Hex
        strTohex: function (input) {
            var hex = '';
            for (var i = 0; i < input.length; i++) {
                hex += '' + input.charCodeAt(i).toString(16);
            }
            return hex;
        },

        //Convert from Hex
        hexTostr: function (input) {
            var str = '';
            for (var i = 0; i < input.length; i += 2) {
                str += String.fromCharCode(parseInt(input.substr(i, 2), 16));
            }
            return str;
        },

        convertToDate: function (d) {
            var date = (new Date((d) * 1000));
            return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        },

        convertToDateTime: function (d) {
            var date = (new Date((d) * 1000));
            return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + padZero(date.getHours()) + ':' + padZero(date.getMinutes()) + ':' + padZero(date.getSeconds());
        },

        padZero: function (a) {
            debugger
            if (a < 10) {
                return '0' + a;
            } else {
                return a;
            }
        }
    };
})(this);