$(function () {
    getFeed(jsonFeed, jsonCallback);
});

/*
 * Retrieve JSONP feed and populate the template
 */

function getFeed(uri, callback) {
        // Assign handlers immediately after making the request, and remember the jxhr object for this request
        var jxhr = $.ajax({
        url: uri ,
        dataType: "jsonp" ,
        timeout: 30000 ,
        jsonpCallback : callback })
        .success(function(data,status) {
            $("#stream").html("");
            $("#template").tmpl(data).appendTo("#stream");
            display();
        })
        .error(function(status) {
            var  textStatus = status.statusText
            if ( textStatus == "timeout" ) {
                $("#stream").html('<p class="notice">Can\'t display the river because the request to the JSON server timed out</p>');
            }
            else if ( textStatus == "error" ) {
                $("#stream").html('<p class="notice">Can\'t display the river because the response from the JSON server is not valid</p>');
            }
            else if ( textStatus != "success" ) {
                $("#stream").html('<p class="notice">Error, status: ' + textStatus + ', please try again later</p>');
            }
        });
}

/*
 * Display options
 */

function display() {
    var $viewLink = $('#display');
    var $stream = $('#stream');
    var fullText = 'Switch to full view';
    var compactText = 'Switch to compact view';

    var displayType = getCookie('display');

    if (displayType == 'compact') {
        $viewLink.text(fullText);
        $stream.addClass('compact');
    }

    $viewLink.live('click', function(e) {
        e.preventDefault();
        if ($stream.is('.compact')) {
            setCookie('display','full',30);
            $viewLink.text(compactText);
            $stream.removeClass('compact');
        } else {
            setCookie('display','compact',30);
            $viewLink.text(fullText);
            $stream.addClass('compact');
        }
    });
};


/*
 * Clean up URL to return a domain
 */

function getDomain(url) {
    if (( url != null ) && (url != "")) {
        url = url.replace("www.","").replace("www2.", "").replace("feedproxy.", "").replace("feeds.", "");
        var root = url.split('?')[0]; // cleans urls of form http://domain.com?a=1&b=2
        var url = root.split('/')[2];
    }
    return url;
};

/*
 * Remove HTML tags and elements from description
 */

function getText(html) {
    var text = $('<div>' + html + '</div>').text();
    return text;
};


/*
 * Get media type (used as a class in the HTML)
 */

function getEnclosureType(type) {
    var typeClass = type.split('/')[0];
    return typeClass;
};


/*
 * Human readable file size
 * http://blog.elctech.com/2009/01/06/convert-filesize-bytes-to-readable-string-in-javascript/
 */

 function getEnclosureSize(bytes) {
    var s = ['bytes', 'kB', 'MB', 'GB', 'TB'];
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " +s[e];
};


/*
 * Cookies: set, get, delete
 * http://www.quirksmode.org/js/cookies.html
 */

function setCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
};

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i ++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

function deleteCookie(name) {
    setCookie(name, "", -1);
};


/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 *
 * http://blog.stevenlevithan.com/archives/date-time-format
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "HH:MM:ss dd mmm yyyy ", // 17:46:21 09 Jun 2007
	shortDate:      "m/d/yy", // 6/9/07
	mediumDate:     "d mmm yyyy", // 9 Jun 2007
	longDate:       "d mmmm yyyy", // 9 June 2007
	fullDate:       "dddd, mmmm d, yyyy", // Saturday, June 9, 2007
	shortTime:      "h:MM TT", // 5:46 PM
	mediumTime:     "h:MM:ss TT", // 5:46:21 PM
	longTime:       "h:MM:ss TT Z", // 5:46:21 PM EST
	isoDate:        "yyyy-mm-dd", // 2007-06-09
	isoTime:        "HH:MM:ss", // 17:46:21
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss", // 2007-06-09T17:46:21
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'", // 2007-06-09T22:46:21Z

    timeDate:       "h:MM:ss TT; dd mmm" // 5:46:21 PM; 09 Jun
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};


/*
 * Relative time formats
 * Modified from http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 */

function timeDifference(date){
    var date = new Date(date);
    var seconds = (new Date - new Date(date)) / 1000;

    var i = 0, f;
    while (f = timeDifference.formats[i++]) if (seconds < f[0])
        return f[2] ? Math.floor(seconds / f[2]) + ' ' + f[1] + ' ago' :  f[1];
    // Crude fix for feeds with no supplied pubDate (e.g. huffington post wikileaks rss)
    // JSON file marks them as 01 Dec 1999; look for anything over 10 years old
    if (seconds > 315569260) {
        return 'Recently';
    }
    return dateFormat(date, 'longDate');
};

timeDifference.formats = [
    [-1, 'Recently'], // Deals with times in the future
    [60, 'seconds', 1],
    [120, '1 minute ago'],
    [3600, 'minutes', 60],
    [7200, '1 hour ago'],
    [86400, 'hours', 3600],
    [172800, 'Yesterday'],
    [604800, 'days', 86400],
    [1209600, '1 week ago'],
    [2678400, 'weeks', 604800]
];
