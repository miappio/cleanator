function openChildBrowser(url, extension, onLocationChange, onClose) {
    var closeChildBrowserAfterLocationChange = !1;
    if (window.device) {
        miapp.InternalLog.log("openChildBrowser", "cordova : window.open");
        var target = "_blank";
        "url" != extension && "Android" === window.device.platform && (target = "_system");
        var ref = window.open(url, target, "location=no");
        ref.addEventListener("loadstart", function (e) {
            miapp.InternalLog.log("openChildBrowser", "loadstart " + e.url)
        }), ref.addEventListener("loadstop", function (e) {
            miapp.InternalLog.log("openChildBrowser", "loadstop " + e.url), "string" == typeof e.url && e.url.indexOf("about:blank") >= 0 && (closeChildBrowserAfterLocationChange = !0, onLocationChange && onLocationChange(), ref.close())
        }), ref.addEventListener("loaderror", function (e) {
            miapp.InternalLog.log("openChildBrowser", "loaderror " + e.url)
        }), ref.addEventListener("exit", function (e) {
            miapp.InternalLog.log("openChildBrowser", "exit " + e.url), closeChildBrowserAfterLocationChange || onClose && onClose()
        })
    } else {
        miapp.InternalLog.log("openChildBrowser", "window.open");
        var initialLocation, initialUrl, new_window = window.open(url, "_blank", "menubar=no,scrollbars=yes,resizable=1,height=400,width=600");
        miapp.isDefinedAndNotNull(new_window.location) && (initialLocation = new_window.location.href), miapp.isDefinedAndNotNull(new_window.document) && (initialUrl = new_window.document.URL), miapp.InternalLog.log("openChildBrowser", "initialLocation=" + initialLocation + " initialUrl=" + initialUrl);
        var locationChanged = !1, new_window_tracker = function () {
            if (miapp.isDefinedAndNotNull(new_window.location) && "string" == typeof new_window.location.href || miapp.isDefinedAndNotNull(new_window.document) && "string" == typeof new_window.document.URL, locationChanged) {
                if (miapp.isDefinedAndNotNull(new_window.location) && "string" == typeof new_window.location.href && new_window.location.href.indexOf("about:blank") >= 0)return miapp.InternalLog.log("openChildBrowser", "onLocationChange"), onLocationChange && onLocationChange(), closeChildBrowserAfterLocationChange = !0, void new_window.close();
                if (miapp.isDefinedAndNotNull(new_window.document) && "string" == typeof new_window.document.URL && new_window.document.URL.indexOf("about:blank") >= 0)return miapp.InternalLog.log("openChildBrowser", "onUrlChange"), onLocationChange && onLocationChange(), closeChildBrowserAfterLocationChange = !0, void new_window.close()
            } else {
                if (miapp.isDefinedAndNotNull(new_window.location) && "string" == typeof new_window.location.href && initialLocation != new_window.location.href)return miapp.InternalLog.log("openChildBrowser", "new location=" + new_window.location.href), locationChanged = !0, void setTimeout(new_window_tracker, 100);
                if (miapp.isDefinedAndNotNull(new_window.document) && "string" == typeof new_window.document.URL && initialUrl != new_window.document.URL)return miapp.InternalLog.log("openChildBrowser", "new url=" + new_window.document.URL), locationChanged = !0, void setTimeout(new_window_tracker, 100)
            }
            return new_window.closed ? (miapp.InternalLog.log("openChildBrowser", "onClose"), void(closeChildBrowserAfterLocationChange || onClose && onClose())) : void setTimeout(new_window_tracker, 100)
        };
        setTimeout(new_window_tracker, 100)
    }
}
function closeWindow() {
    window.close()
}
function isArray(obj) {
    return obj instanceof Array || "object" == typeof obj && (!miapp.isUndefined(obj) && null !== obj && "[object Array]" === Object.prototype.toString.call(obj))
}
function updateImage(source, img) {
    return img && "/." != img ? source.src = img : source.src = "./img/broken.png", source.onerror = "", !0
}
function ImgError(source, img) {
    return setTimeout(function () {
        updateImage(source, img)
    }, 1e4), !1
}
function getErrorObject() {
    try {
        throw Error("")
    } catch (err) {
        return err
    }
}
function miappExportJson(input, maxDepth) {
    var key, type, str = "{\n", first = !0;
    for (key in input)input.hasOwnProperty(key) && ("Contact" != key && "Attendee" != key && "Account" != key && "Opportunity" != key && "Event" != key && "Document" != key || (type = key, first ? first = !1 : str += ",\n", str += '\t"' + key + '":[\n', "object" == typeof input[key] && maxDepth > 0 && (str += miappExportJsonObject("\t\t", input[key], maxDepth - 1, type)), str += "\t]"));
    return str += "\n}\n"
}
function miappExportJsonObject(offset, input, maxDepth, type) {
    var key, str = "", first = !0;
    for (key in input)input.hasOwnProperty(key) && (first ? first = !1 : str += ",\n", "object" == typeof input[key] ? maxDepth > 0 && (str += 2 == maxDepth ? offset + "{\n" : offset + '"' + key + '":{', str += miappExportJsonObject(offset + "\t", input[key], maxDepth - 1, type), str += 2 == maxDepth ? offset + "}" : "}") : ("string" == typeof input[key] && (input[key] = input[key].replace(/\r/gi, " ").replace(/\n/gi, " ")), str += 0 === maxDepth ? '"' + key + '":"' + input[key] + '"' : offset + '"' + key + '":"' + input[key] + '"'));
    return 1 == maxDepth && "Document" == type && (str += ",\n" + offset + '"url":"img/samples/docs/' + input.name + '"'), 0 !== maxDepth && (str += "\n"), str
}
function logEvent(e) {
    var online, status, type, message, bCon = checkConnection();
    online = bCon ? "yes" : "no", status = cacheStatusValues[cache.status], type = e.type, message = "CACHE online: " + online, message += ", event: " + type, message += ", status: " + status, "error" == type && bCon && (message += " (prolly a syntax error in manifest)"), miapp.InternalLog.log(message)
}
function checkCache() {
    cache && (cacheStatusValues[0] = "uncached", cacheStatusValues[1] = "idle", cacheStatusValues[2] = "checking", cacheStatusValues[3] = "downloading", cacheStatusValues[4] = "updateready", cacheStatusValues[5] = "obsolete", cache.addEventListener("cached", logEvent, !1), cache.addEventListener("checking", logEvent, !1), cache.addEventListener("downloading", logEvent, !1), cache.addEventListener("error", logEvent, !1), cache.addEventListener("noupdate", logEvent, !1), cache.addEventListener("obsolete", logEvent, !1), cache.addEventListener("progress", logEvent, !1), cache.addEventListener("updateready", logEvent, !1))
}
function checkConnection() {
    var bCon = !1;
    if (miapp.InternalLog.log("checkConnection", "launched"), navigator.connection && navigator.connection.type) {
        var networkState = navigator.connection.type, states = {};
        states[Connection.UNKNOWN] = "Unknown connection", states[Connection.ETHERNET] = "Ethernet connection", states[Connection.WIFI] = "WiFi connection", states[Connection.CELL_2G] = "Cell 2G connection", states[Connection.CELL_3G] = "Cell 3G connection", states[Connection.CELL_4G] = "Cell 4G connection", states[Connection.CELL] = "Cell generic connection", states[Connection.NONE] = "No network connection", miapp.InternalLog.log("checkConnection", "Cordova Connection type: " + states[networkState]), bCon = networkState != Connection.NONE
    } else miapp.BrowserCapabilities && miapp.BrowserCapabilities.online ? bCon = !0 : miapp.BrowserCapabilities || (bCon = navigator.onLine), miapp.InternalLog.log("checkConnection", "without Cordova but online ? " + bCon);
    return bCon
}
function getUrlVars(ihref) {
    var href = ihref;
    !miapp.isUndefined(href) && href || (href = window.location.href), miapp.InternalLog.log("getUrlVars", "href:" + href);
    for (var hash, vars = [], hashes = href.slice(href.indexOf("#") + 1).split("&"), i = 0; i < hashes.length; i++)hash = hashes[i].split("="), vars.push(hash[0]), vars[hash[0]] = hash[1];
    return vars
}
function SHA256(s) {
    function safe_add(x, y) {
        var lsw = (65535 & x) + (65535 & y), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | 65535 & lsw
    }

    function S(X, n) {
        return X >>> n | X << 32 - n
    }

    function R(X, n) {
        return X >>> n
    }

    function Ch(x, y, z) {
        return x & y ^ ~x & z
    }

    function Maj(x, y, z) {
        return x & y ^ x & z ^ y & z
    }

    function Sigma0256(x) {
        return S(x, 2) ^ S(x, 13) ^ S(x, 22)
    }

    function Sigma1256(x) {
        return S(x, 6) ^ S(x, 11) ^ S(x, 25)
    }

    function Gamma0256(x) {
        return S(x, 7) ^ S(x, 18) ^ R(x, 3)
    }

    function Gamma1256(x) {
        return S(x, 17) ^ S(x, 19) ^ R(x, 10)
    }

    function core_sha256(m, l) {
        var a, b, c, d, e, f, g, h, i, j, T1, T2, K = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298], HASH = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], W = new Array(64);
        for (m[l >> 5] |= 128 << 24 - l % 32, m[(l + 64 >> 9 << 4) + 15] = l, i = 0; i < m.length; i += 16) {
            for (a = HASH[0], b = HASH[1], c = HASH[2], d = HASH[3], e = HASH[4], f = HASH[5], g = HASH[6], h = HASH[7], j = 0; j < 64; j++)j < 16 ? W[j] = m[j + i] : W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]), T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]), T2 = safe_add(Sigma0256(a), Maj(a, b, c)), h = g, g = f, f = e, e = safe_add(d, T1), d = c, c = b, b = a, a = safe_add(T1, T2);
            HASH[0] = safe_add(a, HASH[0]), HASH[1] = safe_add(b, HASH[1]), HASH[2] = safe_add(c, HASH[2]), HASH[3] = safe_add(d, HASH[3]), HASH[4] = safe_add(e, HASH[4]), HASH[5] = safe_add(f, HASH[5]), HASH[6] = safe_add(g, HASH[6]), HASH[7] = safe_add(h, HASH[7])
        }
        return HASH
    }

    function str2binb(str) {
        for (var bin = Array(), mask = (1 << chrsz) - 1, i = 0; i < str.length * chrsz; i += chrsz)bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << 24 - i % 32;
        return bin
    }

    function Utf8Encode(string) {
        if (0 === string.length)return string;
        string = string.replace(/\r\n/g, "\n");
        for (var utftext = "", n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            c < 128 ? utftext += String.fromCharCode(c) : c > 127 && c < 2048 ? (utftext += String.fromCharCode(c >> 6 | 192), utftext += String.fromCharCode(63 & c | 128)) : (utftext += String.fromCharCode(c >> 12 | 224), utftext += String.fromCharCode(c >> 6 & 63 | 128), utftext += String.fromCharCode(63 & c | 128))
        }
        return utftext
    }

    function binb2hex(binarray) {
        for (var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", str = "", i = 0; i < 4 * binarray.length; i++)str += hex_tab.charAt(binarray[i >> 2] >> 8 * (3 - i % 4) + 4 & 15) + hex_tab.charAt(binarray[i >> 2] >> 8 * (3 - i % 4) & 15);
        return str
    }

    if (0 === s.length)return "";
    var chrsz = 8, hexcase = 0;
    return s = Utf8Encode(s), binb2hex(core_sha256(str2binb(s), s.length * chrsz))
}
function successHandler(data) {
    miapp.InternalLog.log("Analytics", "initialization success : " + data)
}
function errorHandler(data) {
    miapp.InternalLog.log("Analytics", "initialization pb : " + data)
}
function removeObjectFromList(list, dbid) {
    return removeSubKeyFromList(list, "id", "dbid", dbid)
}
function replaceObjectFromList(list, dbid, object) {
    return replaceSubKeyFromList(list, "id", "dbid", dbid, object)
}
function addObjectToList(list, object) {
    return addSubKeyToList(list, "id", "dbid", object)
}
function getObjectFromList(list, dbid) {
    return getSubKeyFromList(list, "id", "dbid", dbid)
}
function removeLinkFromList(list, dbid) {
    return removeKeyFromList(list, "dbid", dbid)
}
function replaceLinkFromList(list, dbid, object) {
    return replaceKeyFromList(list, "dbid", dbid, object)
}
function addLinkToList(list, object) {
    return addKeyToList(list, "dbid", object)
}
function getLinkFromList(list, dbid) {
    return getKeyFromList(list, "dbid", dbid)
}
function removeIdFromList(list, id) {
    return removeKeyFromList(list, "id", id)
}
function replaceIdFromList(list, id, object) {
    return replaceKeyFromList(list, "id", id, object)
}
function addIdToList(list, object) {
    return addKeyToList(list, "id", object)
}
function getIdFromList(list, id) {
    return getKeyFromList(list, "id", id)
}
function removeKeyFromList(list, key, value) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i][key] == value)return list.splice(i, 1);
    return !1
}
function replaceKeyFromList(list, key, value, object) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i][key] == value)return list.splice(i, 1, object);
    return !1
}
function addKeyToList(list, key, object) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i][key] == object[key])return !1;
    return list.push(object), !0
}
function getKeyFromList(list, key, value) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i][key] == value)return list[i];
    return !1
}
function removeSubKeyFromList(list, sub, key, value) {
    for (var i = list.length - 1; i >= 0; i--)if (a4p.isDefined(list[i][sub]) && list[i][sub][key] == value)return list.splice(i, 1);
    return !1
}
function replaceSubKeyFromList(list, sub, key, value, object) {
    for (var i = list.length - 1; i >= 0; i--)if (a4p.isDefined(list[i][sub]) && list[i][sub][key] == value)return list.splice(i, 1, object);
    return !1
}
function addSubKeyToList(list, sub, key, object) {
    for (var i = list.length - 1; i >= 0; i--)if (a4p.isDefined(list[i][sub]) && list[i][sub][key] == object[sub][key])return !1;
    return list.push(object), !0
}
function getSubKeyFromList(list, sub, key, value) {
    for (var i = list.length - 1; i >= 0; i--)if (a4p.isDefined(list[i][sub]) && list[i][sub][key] == value)return list[i];
    return !1
}
function removeValueFromList(list, value) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i] == value)return list.splice(i, 1);
    return !1
}
function replaceValueFromList(list, oldValue, newValue) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i] == oldValue)return list.splice(i, 1, newValue);
    return !1
}
function addValueToList(list, value) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i] == value)return !1;
    return list.push(value), !0
}
function isValueInList(list, value) {
    for (var i = list.length - 1; i >= 0; i--)if (list[i] == value)return !0;
    return !1
}
function Bridge() {
}
function normalizedPath(dirPath, fileName, fileExtension) {
    "use strict";
    var filePath = dirPath;
    return filePath = "/" == filePath.charAt(filePath.length - 1) ? "/" == fileName.charAt(0) ? filePath.substring(0, filePath.length - 1) + fileName + "." + fileExtension : filePath + fileName + "." + fileExtension : "/" == fileName.charAt(0) ? filePath + fileName + "." + fileExtension : filePath + "/" + fileName + "." + fileExtension
}
function sanitizeFilename(name, addTimeStamp) {
    "use strict";
    a4p.InternalLog.log("a4p.file", "sanitizeFilename " + name);
    var filename = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    if (addTimeStamp === !0) {
        var timestamp = a4pDateCompactFormat(new Date);
        filename = filename + "_" + timestamp
    }
    return a4p.InternalLog.log("a4p.file", "sanitizeFilename end : " + filename), filename
}
function transferErrorMessage(fileTransferError) {
    "use strict";
    var msg = "";
    switch (fileTransferError.code) {
        case FileTransferError.FILE_NOT_FOUND_ERR:
            msg = "File not found";
            break;
        case FileTransferError.CONNECTION_ERR:
            msg = "Connection error";
            break;
        case FileTransferError.INVALID_URL_ERR:
            msg = "Invalid URL error";
            break;
        default:
            msg = "Unknown FileTransferError code (code= " + fileTransferError.code + ", type=" + typeof fileTransferError + ")"
    }
    return msg
}
function showFileInFS(fileRelPath, fileName, fileExtension) {
    a4p.InternalLog.log("showFileInFS", fileRelPath + "  Name:" + fileName + "  Extension:" + fileExtension);
    try {
        var localPath = gFileSystem.root.fullPath;
        "Android" === device.platform && 0 === localPath.indexOf("file://") && (localPath = localPath.substring(7));
        var fullPath = localPath + fileRelPath + fileName;
        a4p.InternalLog.log("showFileInFS", "get file : " + fullPath), openChildBrowser(fullPath, fileExtension)
    } catch (e) {
        fileErrorHandler(e)
    }
}
function getFileSystem(success, arg1, arg2, arg3) {
    if (gFileSystem)return a4p.InternalLog.log("getFileSystem", "allready did : launch"), success(arg1, arg2, arg3);
    if (window.requestFileSystem)try {
        a4p.InternalLog.log("getFileSystem", "window.requestFileSystem"), window.requestFileSystem(LocalFileSystem.PERSISTENT, 10485760, function (fs) {
            return a4p.InternalLog.log("getFileSystem", "get FileSystem"), gFileSystem = fs, success(arg1, arg2, arg3)
        }, fileErrorHandler)
    } catch (e) {
        fileErrorHandler(e)
    } else a4p.InternalLog.log("getFileSystem", "Impossible to use file, No FileSystem !")
}
function miappDumpData(input, maxDepth) {
    var str = "";
    return "object" == typeof input ? input instanceof Array ? maxDepth > 0 ? (str += "[\n", str += miappDumpArray("  ", input, maxDepth - 1), str += "]\n") : str += "[Array]\n" : maxDepth > 0 ? (str += "{\n", str += miappDumpObject("  ", input, maxDepth - 1), str += "}\n") : str += "[" + typeof input + "]\n" : str += input + "\n", str
}
function miappDumpArray(offset, input, maxDepth) {
    for (var str = "", key = 0, nb = input.length; key < nb; key++)"object" == typeof input[key] ? input[key] instanceof Array ? maxDepth > 0 ? (str += offset + key + " : [\n", str += miappDumpArray(offset + "  ", input[key], maxDepth - 1), str += offset + "]\n") : str += offset + key + " : [Array]\n" : maxDepth > 0 ? (str += offset + key + " : {\n", str += miappDumpObject(offset + "  ", input[key], maxDepth - 1), str += offset + "}\n") : str += offset + key + " : [" + typeof input[key] + "]\n" : str += offset + key + " : " + input[key] + "\n";
    return str
}
function miappDumpObject(offset, input, maxDepth) {
    var key, str = "";
    for (key in input)input.hasOwnProperty(key) && ("object" == typeof input[key] ? input[key] instanceof Array ? maxDepth > 0 ? (str += offset + key + " : [\n", str += miappDumpArray(offset + "  ", input[key], maxDepth - 1), str += offset + "]\n") : str += offset + key + " : [Array]\n" : maxDepth > 0 ? (str += offset + key + " : {\n", str += miappDumpObject(offset + "  ", input[key], maxDepth - 1), str += offset + "}\n") : str += offset + key + " : [" + typeof input[key] + "]\n" : str += offset + key + " : " + input[key] + "\n");
    return str
}
function miappTimestampFormat(timestamp) {
    var date = new Date(timestamp);
    return miappPadNumber(date.getFullYear(), 4) + "-" + miappPadNumber(date.getMonth() + 1, 2) + "-" + miappPadNumber(date.getDate(), 2) + " " + miappPadNumber(date.getHours(), 2) + ":" + miappPadNumber(date.getMinutes(), 2) + ":" + miappPadNumber(date.getSeconds(), 2)
}
function miappDateFormat(date) {
    return date ? miappPadNumber(date.getFullYear(), 4) + "-" + miappPadNumber(date.getMonth() + 1, 2) + "-" + miappPadNumber(date.getDate(), 2) + " " + miappPadNumber(date.getHours(), 2) + ":" + miappPadNumber(date.getMinutes(), 2) + ":" + miappPadNumber(date.getSeconds(), 2) : ""
}
function miappDateCompactFormat(date) {
    return date ? miappPadNumber(date.getFullYear(), 2) + miappPadNumber(date.getMonth() + 1, 2) + miappPadNumber(date.getDate(), 2) + "_" + miappPadNumber(date.getHours(), 2) + miappPadNumber(date.getMinutes(), 2) + miappPadNumber(date.getSeconds(), 2) : ""
}
function miappTimestampParse(date) {
    var newDate = miappDateParse(date);
    return newDate !== !1 ? newDate.getTime() : 0
}
function miappDateParse(date) {
    if (!date || "string" != typeof date || "" == date)return !1;
    var yearS = parseInt(date.substr(0, 4), 10) || 0, monthS = parseInt(date.substr(5, 2), 10) || 0, dayS = parseInt(date.substr(8, 2), 10) || 0, hourS = parseInt(date.substr(11, 2), 10) || 0, minuteS = parseInt(date.substr(14, 2), 10) || 0, secS = parseInt(date.substr(17, 2), 10) || 0, newDate = new Date(yearS, monthS - 1, dayS, hourS, minuteS, secS, 0);
    return newDate.getFullYear() === yearS && newDate.getMonth() === monthS - 1 && newDate.getDate() === dayS && newDate
}
function miappDateFormatObject(object) {
    var yearS = "1970", monthS = "01", dayS = "01", hourS = "00", minuteS = "00", secondS = "00";
    if ("[object Date]" === Object.prototype.toString.call(object)) isNaN(object.getTime()) || (yearS = "" + object.getFullYear(), monthS = "" + (object.getMonth() + 1), dayS = "" + object.getDate(), hourS = "" + object.getHours(), minuteS = "" + object.getMinutes(), secondS = "" + object.getSeconds()); else if ("string" == typeof object) {
        var dateReg = new RegExp("([0-9][0-9][0-9][0-9])-([0-9]\\d)-([0-9]\\d)+", "g"), dateParts = object.split(dateReg);
        yearS = dateParts[1] || "0", monthS = dateParts[2] || "0", dayS = dateParts[3] || "0";
        var timeReg = new RegExp("([01]\\d|2[0-9]):([0-5]\\d):([0-5]\\d)"), timeParts = object.match(timeReg);
        null != timeParts ? (hourS = timeParts[1] || "00", minuteS = timeParts[2] || "00", secondS = timeParts[3] || "00") : (hourS = "00", minuteS = "00", secondS = "00")
    }
    for (; yearS.length < 4;)yearS = "0" + yearS;
    for (; monthS.length < 2;)monthS = "0" + monthS;
    for (; dayS.length < 2;)dayS = "0" + dayS;
    for (; hourS.length < 2;)hourS = "0" + hourS;
    for (; minuteS.length < 2;)minuteS = "0" + minuteS;
    for (; secondS.length < 2;)secondS = "0" + secondS;
    var newDate = yearS + "-" + monthS + "-" + dayS + " " + hourS + ":" + minuteS + ":" + secondS;
    return newDate
}
function miappDateExtractDate(dateString) {
    for (var dateReg = new RegExp("([0-9][0-9][0-9][0-9])-([0-9]\\d)-([0-9]\\d)+", "g"), dateParts = dateString.split(dateReg), yearS = dateParts[1] || "0", monthS = dateParts[2] || "0", dayS = dateParts[3] || "0"; yearS.length < 4;)yearS = "0" + yearS;
    for (; monthS.length < 2;)monthS = "0" + monthS;
    for (; dayS.length < 2;)dayS = "0" + dayS;
    return "" + yearS + "-" + monthS + "-" + dayS
}
function miappDateExtractTime(dateString) {
    var timeReg = new RegExp("([01]\\d|2[0-9]):([0-5]\\d):([0-5]\\d)"), timeParts = dateString.match(timeReg), hourS = "00", minuteS = "00", secondS = "00";
    for (null != timeParts ? (hourS = timeParts[1] || "00", minuteS = timeParts[2] || "00", secondS = timeParts[3] || "00") : (hourS = "00", minuteS = "00", secondS = "00"); hourS.length < 2;)hourS = "0" + hourS;
    for (; minuteS.length < 2;)minuteS = "0" + minuteS;
    for (; secondS.length < 2;)secondS = "0" + secondS;
    return "" + hourS + ":" + minuteS + ":" + secondS
}
function miappPadNumber(num, digits, trim) {
    var neg = "";
    for (num < 0 && (neg = "-", num = -num), num = "" + num; num.length < digits;)num = "0" + num;
    return trim && num.length > digits && (num = num.substr(num.length - digits)), neg + num
}
function strCompare(str1, str2) {
    for (var lg1 = str1.length, lg2 = str2.length, nb = lg1 < lg2 ? lg1 : lg2, i = 0; i < nb; i++) {
        var c1 = str1.charCodeAt(i), c2 = str2.charCodeAt(i);
        if (c1 < c2)return -1;
        if (c1 > c2)return 1
    }
    return lg1 < lg2 ? -1 : lg1 > lg2 ? 1 : 0
}
function miappFormat(input) {
    if (miapp.isUndefined(input) || !input)return miapp.ErrorLog.log("miappFormat", "invalid string " + input), "";
    for (var formatted = input, max = arguments.length, i = 1; i < max; i++) {
        var regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi");
        formatted = formatted.replace(regexp, arguments[i])
    }
    return formatted
}
function miappFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1, 0, 0, 0, 0)
}
function miappLastDayOfMonth(year, month) {
    return new Date(year, month, 0, 0, 0, 0, 0)
}
function miappDayOfSameWeek(date, dayOfWeek) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOfWeek - (date.getDay() || 7), 0, 0, 0, 0)
}
function miappWeek(date) {
    var thursday = miappDayOfSameWeek(date, 4), fourthJanuary = new Date(thursday.getFullYear(), 0, 4, 0, 0, 0, 0), thursdayOfWeek1 = miappDayOfSameWeek(fourthJanuary, 4), nbDays = Math.round((thursday.getTime() - thursdayOfWeek1.getTime()) / 864e5);
    return 1 + Math.floor(nbDays / 7)
}
function extend(subClass, superClass) {
    var F = function () {
    };
    return F.prototype = superClass.prototype, subClass.prototype = new F, subClass.prototype.constructor = subClass, subClass.superclass = superClass.prototype, superClass.prototype.constructor == Object.prototype.constructor && (superClass.prototype.constructor = superClass), subClass
}
function propCopy(from, to) {
    for (var prop in from)from.hasOwnProperty(prop) && ("object" == typeof from[prop] && "object" == typeof to[prop] ? to[prop] = propCopy(from[prop], to[prop]) : to[prop] = from[prop]);
    return to
}
function NOOP() {
}
function isValidUrl(url) {
    if (!url)return !1;
    var doc, base, anchor, isValid = !1;
    try {
        doc = document.implementation.createHTMLDocument(""), base = doc.createElement("base"), base.href = base || window.lo, doc.head.appendChild(base), anchor = doc.createElement("a"), anchor.href = url, doc.body.appendChild(anchor), isValid = !("" === anchor.href)
    } catch (e) {
    } finally {
        return doc.head.removeChild(base), doc.body.removeChild(anchor), base = null, anchor = null, doc = null, isValid
    }
}
function isUUID(uuid) {
    return !!uuid && uuidValueRegex.test(uuid)
}
function encodeParams(params) {
    var queryString;
    return params && Object.keys(params) && (queryString = [].slice.call(arguments).reduce(function (a, b) {
        return a.concat(b instanceof Array ? b : [b])
    }, []).filter(function (c) {
        return "object" == typeof c
    }).reduce(function (p, c) {
        return c instanceof Array ? p.push(c) : p = p.concat(Object.keys(c).map(function (key) {
                return [key, c[key]]
            })), p
    }, []).reduce(function (p, c) {
        return 2 === c.length ? p.push(c) : p = p.concat(c), p
    }, []).reduce(function (p, c) {
        return c[1] instanceof Array ? c[1].forEach(function (v) {
                p.push([c[0], v])
            }) : p.push(c), p
    }, []).map(function (c) {
        return c[1] = encodeURIComponent(c[1]), c.join("=")
    }).join("&")), queryString
}
function isFunction(f) {
    return f && null !== f && "function" == typeof f
}
function doCallback(callback, params, context) {
    var returnValue;
    return isFunction(callback) && (params || (params = []), context || (context = this), params.push(context), returnValue = callback.apply(context, params)), returnValue
}
function getSafeTime(prop) {
    var time;
    switch (typeof prop) {
        case"undefined":
            time = Date.now();
            break;
        case"number":
            time = prop;
            break;
        case"string":
            time = isNaN(prop) ? Date.parse(prop) : parseInt(prop);
            break;
        default:
            time = Date.parse(prop.toString())
    }
    return time
}
var miapp;
miapp || (miapp = {}), miapp.Aes = function () {
    "use strict";
    function cipher(input, w) {
        for (var Nb = 4, Nr = w.length / Nb - 1, round = 0, state = [[], [], [], []], i = 0; i < 4 * Nb; i++)state[i % 4][Math.floor(i / 4)] = input[i];
        for (state = addRoundKey(state, w, round, Nb), round++; round < Nr; round++)state = subBytes(state, Nb), state = shiftRows(state, Nb), state = mixColumns(state, Nb), state = addRoundKey(state, w, round, Nb);
        state = subBytes(state, Nb), state = shiftRows(state, Nb), state = addRoundKey(state, w, round, Nb);
        for (var output = new Array(4 * Nb), i = 0; i < 4 * Nb; i++)output[i] = state[i % 4][Math.floor(i / 4)];
        return output
    }

    function decipher(input, w) {
        for (var Nb = 4, Nr = w.length / Nb - 1, round = Nr, state = [[], [], [], []], i = 0; i < 4 * Nb; i++)state[i % 4][Math.floor(i / 4)] = input[i];
        for (state = addRoundKey(state, w, round, Nb), round--; round > 0; round--)state = invShiftRows(state, Nb), state = invSubBytes(state, Nb), state = addRoundKey(state, w, round, Nb), state = invMixColumns(state, Nb);
        state = invShiftRows(state, Nb), state = invSubBytes(state, Nb), state = addRoundKey(state, w, round, Nb);
        for (var output = new Array(4 * Nb), i = 0; i < 4 * Nb; i++)output[i] = state[i % 4][Math.floor(i / 4)];
        return output
    }

    function keyExpansion(key) {
        for (var Nb = 4, Nk = key.length / 4, Nr = Nk + 6, w = new Array(Nb * (Nr + 1)), temp = new Array(4), i = 0; i < Nk; i++) {
            var r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
            w[i] = r
        }
        for (var i = Nk; i < Nb * (Nr + 1); i++) {
            w[i] = new Array(4);
            for (var t = 0; t < 4; t++)temp[t] = w[i - 1][t];
            if (i % Nk == 0) {
                temp = subWord(rotWord(temp));
                for (var t = 0; t < 4; t++)temp[t] ^= rCon[i / Nk][t]
            } else Nk > 6 && i % Nk == 4 && (temp = subWord(temp));
            for (var t = 0; t < 4; t++)w[i][t] = w[i - Nk][t] ^ temp[t]
        }
        return w
    }

    function subBytes(s, Nb) {
        for (var r = 0; r < 4; r++)for (var c = 0; c < Nb; c++)s[r][c] = sBox[s[r][c]];
        return s
    }

    function invSubBytes(s, Nb) {
        for (var r = 0; r < 4; r++)for (var c = 0; c < Nb; c++)s[r][c] = invsBox[s[r][c]];
        return s
    }

    function shiftRows(s, Nb) {
        for (var t = new Array(4), r = 1; r < 4; r++) {
            for (var c = 0; c < 4; c++)t[c] = s[r][(c + r) % Nb];
            for (var c = 0; c < 4; c++)s[r][c] = t[c]
        }
        return s
    }

    function invShiftRows(s, Nb) {
        for (var t = new Array(4), r = 1; r < 4; r++) {
            for (var c = 0; c < 4; c++)t[c] = s[r][c];
            for (var c = 0; c < 4; c++)s[r][(c + r) % Nb] = t[c]
        }
        return s
    }

    function mixColumns(s, Nb) {
        for (var c = 0; c < 4; c++) {
            for (var a = new Array(4), a2 = new Array(4), i = 0; i < 4; i++)a[i] = s[i][c], a2[i] = 128 & a[i] ? a[i] << 1 ^ 283 : a[i] << 1;
            s[0][c] = a2[0] ^ a[1] ^ a2[1] ^ a[2] ^ a[3], s[1][c] = a2[1] ^ a[2] ^ a2[2] ^ a[3] ^ a[0], s[2][c] = a2[2] ^ a[3] ^ a2[3] ^ a[0] ^ a[1], s[3][c] = a2[3] ^ a[0] ^ a2[0] ^ a[1] ^ a[2]
        }
        return s
    }

    function invMixColumns(s, Nb) {
        for (var c = 0; c < 4; c++) {
            for (var a = new Array(4), a2 = new Array(4), a4 = new Array(4), a8 = new Array(4), i = 0; i < 4; i++)a[i] = s[i][c], a2[i] = 128 & a[i] ? a[i] << 1 ^ 283 : a[i] << 1, a4[i] = 128 & a2[i] ? a2[i] << 1 ^ 283 : a2[i] << 1, a8[i] = 128 & a4[i] ? a4[i] << 1 ^ 283 : a4[i] << 1;
            s[0][c] = a8[0] ^ a4[0] ^ a2[0] ^ a8[1] ^ a2[1] ^ a[1] ^ a8[2] ^ a4[2] ^ a[2] ^ a8[3] ^ a[3], s[1][c] = a8[1] ^ a4[1] ^ a2[1] ^ a8[2] ^ a2[2] ^ a[2] ^ a8[3] ^ a4[3] ^ a[3] ^ a8[0] ^ a[0], s[2][c] = a8[2] ^ a4[2] ^ a2[2] ^ a8[3] ^ a2[3] ^ a[3] ^ a8[0] ^ a4[0] ^ a[0] ^ a8[1] ^ a[1], s[3][c] = a8[3] ^ a4[3] ^ a2[3] ^ a8[0] ^ a2[0] ^ a[0] ^ a8[1] ^ a4[1] ^ a[1] ^ a8[2] ^ a[2]
        }
        return s
    }

    function addRoundKey(state, w, rnd, Nb) {
        for (var r = 0; r < 4; r++)for (var c = 0; c < Nb; c++)state[r][c] ^= w[4 * rnd + c][r];
        return state
    }

    function subWord(w) {
        for (var i = 0; i < 4; i++)w[i] = sBox[w[i]];
        return w
    }

    function rotWord(w) {
        for (var tmp = w[0], i = 0; i < 3; i++)w[i] = w[i + 1];
        return w[3] = tmp, w
    }

    var Aes = {};
    Aes.encrypt = function (plaintext, stringkey) {
        var blockSize = 16;
        if (16 != stringkey.length && 24 != stringkey.length && 32 != stringkey.length)return "";
        for (var key = new Array(stringkey.length), i = 0; i < stringkey.length; i++)key[i] = 255 & stringkey.charCodeAt(i);
        for (var counterBlock = new Array(blockSize), keySchedule = keyExpansion(key), blockCount = Math.ceil(plaintext.length / blockSize), ciphertxt = new Array(blockCount), i = 0; i < blockSize; i++)counterBlock[i] = 0;
        for (var b = 0; b < blockCount; b++) {
            for (var i = 0; i < blockSize; i++)counterBlock[i] ^= 255 & plaintext.charCodeAt(b * blockSize + i);
            for (var cipherCntr = cipher(counterBlock, keySchedule), blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1, cipherChar = new Array(blockLength), i = 0; i < blockLength; i++)cipherChar[i] = String.fromCharCode(cipherCntr[i]);
            ciphertxt[b] = cipherChar.join("");
            for (var i = 0; i < blockSize; i++)counterBlock[i] = 0
        }
        return ciphertxt.join("")
    }, Aes.decrypt = function (ciphertext, stringkey) {
        var blockSize = 16;
        if (16 != stringkey.length && 24 != stringkey.length && 32 != stringkey.length)return "";
        for (var key = new Array(stringkey.length), i = 0; i < stringkey.length; i++)key[i] = 255 & stringkey.charCodeAt(i);
        for (var counterBlock = new Array(blockSize), keySchedule = keyExpansion(key), blockCount = Math.ceil(ciphertext.length / blockSize), plaintxt = new Array(blockCount), i = 0; i < blockSize; i++)counterBlock[i] = 0;
        for (var b = 0; b < blockCount; b++) {
            for (var i = 0; i < blockSize; i++)counterBlock[i] ^= 255 & ciphertext.charCodeAt(b * blockSize + i);
            for (var cipherCntr = decipher(counterBlock, keySchedule), blockLength = b < blockCount - 1 ? blockSize : (ciphertext.length - 1) % blockSize + 1, cipherChar = new Array(blockLength), i = 0; i < blockLength; i++)cipherChar[i] = String.fromCharCode(cipherCntr[i]);
            plaintxt[b] = cipherChar.join("");
            for (var i = 0; i < blockSize; i++)counterBlock[i] = 0
        }
        return plaintxt.join("")
    }, Aes.ctrEncrypt = function (plaintext, stringkey) {
        var blockSize = 16;
        if (16 != stringkey.length && 24 != stringkey.length && 32 != stringkey.length)return "";
        plaintext = miapp.Utf8.encode(plaintext);
        for (var key = new Array(stringkey.length), i = 0; i < stringkey.length; i++)key[i] = 255 & stringkey[i];
        for (var counterBlock = new Array(blockSize), nonce = (new Date).getTime(), nonceMs = nonce % 1e3, nonceSec = Math.floor(nonce / 1e3), nonceRnd = Math.floor(65535 * Math.random()), i = 0; i < 2; i++)counterBlock[i] = nonceMs >>> 8 * i & 255;
        for (var i = 0; i < 2; i++)counterBlock[i + 2] = nonceRnd >>> 8 * i & 255;
        for (var i = 0; i < 4; i++)counterBlock[i + 4] = nonceSec >>> 8 * i & 255;
        for (var ctrTxt = "", i = 0; i < 8; i++)ctrTxt += String.fromCharCode(counterBlock[i]);
        for (var keySchedule = keyExpansion(key), blockCount = Math.ceil(plaintext.length / blockSize), ciphertxt = new Array(blockCount), b = 0; b < blockCount; b++) {
            for (var c = 0; c < 4; c++)counterBlock[15 - c] = b >>> 8 * c & 255;
            for (var c = 0; c < 4; c++)counterBlock[15 - c - 4] = b / 4294967296 >>> 8 * c;
            for (var cipherCntr = cipher(counterBlock, keySchedule), blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1, cipherChar = new Array(blockLength), i = 0; i < blockLength; i++)cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i), cipherChar[i] = String.fromCharCode(cipherChar[i]);
            ciphertxt[b] = cipherChar.join("")
        }
        var ciphertext = ctrTxt + ciphertxt.join("");
        return ciphertext
    }, Aes.ctrDecrypt = function (ciphertext, stringkey) {
        var blockSize = 16;
        if (16 != stringkey.length && 24 != stringkey.length && 32 != stringkey.length)return "";
        for (var key = new Array(stringkey.length), i = 0; i < stringkey.length; i++)key[i] = 255 & stringkey[i];
        for (var counterBlock = new Array(8), ctrTxt = ciphertext.slice(0, 8), i = 0; i < 8; i++)counterBlock[i] = ctrTxt.charCodeAt(i);
        for (var keySchedule = keyExpansion(key), nBlocks = Math.ceil((ciphertext.length - 8) / blockSize), ct = new Array(nBlocks), b = 0; b < nBlocks; b++)ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
        ciphertext = ct;
        for (var plaintxt = new Array(ciphertext.length), b = 0; b < nBlocks; b++) {
            for (var c = 0; c < 4; c++)counterBlock[15 - c] = b >>> 8 * c & 255;
            for (var c = 0; c < 4; c++)counterBlock[15 - c - 4] = (b + 1) / 4294967296 - 1 >>> 8 * c & 255;
            for (var cipherCntr = cipher(counterBlock, keySchedule), plaintxtByte = new Array(ciphertext[b].length), i = 0; i < ciphertext[b].length; i++)plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i), plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
            plaintxt[b] = plaintxtByte.join("")
        }
        var plaintext = plaintxt.join("");
        return plaintext = miapp.Utf8.decode(plaintext)
    };
    var sBox = [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22], invsBox = [82, 9, 106, 213, 48, 54, 165, 56, 191, 64, 163, 158, 129, 243, 215, 251, 124, 227, 57, 130, 155, 47, 255, 135, 52, 142, 67, 68, 196, 222, 233, 203, 84, 123, 148, 50, 166, 194, 35, 61, 238, 76, 149, 11, 66, 250, 195, 78, 8, 46, 161, 102, 40, 217, 36, 178, 118, 91, 162, 73, 109, 139, 209, 37, 114, 248, 246, 100, 134, 104, 152, 22, 212, 164, 92, 204, 93, 101, 182, 146, 108, 112, 72, 80, 253, 237, 185, 218, 94, 21, 70, 87, 167, 141, 157, 132, 144, 216, 171, 0, 140, 188, 211, 10, 247, 228, 88, 5, 184, 179, 69, 6, 208, 44, 30, 143, 202, 63, 15, 2, 193, 175, 189, 3, 1, 19, 138, 107, 58, 145, 17, 65, 79, 103, 220, 234, 151, 242, 207, 206, 240, 180, 230, 115, 150, 172, 116, 34, 231, 173, 53, 133, 226, 249, 55, 232, 28, 117, 223, 110, 71, 241, 26, 113, 29, 41, 197, 137, 111, 183, 98, 14, 170, 24, 190, 27, 252, 86, 62, 75, 198, 210, 121, 32, 154, 219, 192, 254, 120, 205, 90, 244, 31, 221, 168, 51, 136, 7, 199, 49, 177, 18, 16, 89, 39, 128, 236, 95, 96, 81, 127, 169, 25, 181, 74, 13, 45, 229, 122, 159, 147, 201, 156, 239, 160, 224, 59, 77, 174, 42, 245, 176, 200, 235, 187, 60, 131, 83, 153, 97, 23, 43, 4, 126, 186, 119, 214, 38, 225, 105, 20, 99, 85, 33, 12, 125], rCon = [[0, 0, 0, 0], [1, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [8, 0, 0, 0], [16, 0, 0, 0], [32, 0, 0, 0], [64, 0, 0, 0], [128, 0, 0, 0], [27, 0, 0, 0], [54, 0, 0, 0]];
    return Aes
}();
var miapp;
miapp || (miapp = {});
var miappBlockMove = function (evt, stopBubble) {
    "use strict";
    evt.preventDefault && !$(".c4p-container-scroll-y").has($(evt.target)).length && evt.preventDefault(), stopBubble && evt.stopPropagation && evt.stopPropagation(), stopBubble && !evt.cancelBubble && (evt.cancelBubble = !0)
}, miappAllowMove = function (e) {
    return !0
}, miappFakeConsoleLog = function (e) {
    return !0
}, LocalFileSystem, Metadata, FileError, ProgressEvent, File, DirectoryEntry, DirectoryReader, FileWriter, FileEntry, FileSystem, FileReader, FileTransferError, FileUploadOptions, FileUploadResult, FileTransfer, Camera;
miapp.uid = ["0", "0", "0"], miapp.idStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", miapp.idNext = {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 9,
    9: 10,
    A: 11,
    B: 12,
    C: 13,
    D: 14,
    E: 15,
    F: 16,
    G: 17,
    H: 18,
    I: 19,
    J: 20,
    K: 21,
    L: 22,
    M: 23,
    N: 24,
    O: 25,
    P: 26,
    Q: 27,
    R: 28,
    S: 29,
    T: 30,
    U: 31,
    V: 32,
    W: 33,
    X: 34,
    Y: 35,
    Z: 0
}, miapp.nextUid = function () {
    for (var index = miapp.uid.length; index;) {
        index--;
        var i = miapp.idNext[miapp.uid[index]];
        if (miapp.uid[index] = miapp.idStr[i], i > 0)return miapp.uid.join("")
    }
    return miapp.uid.unshift("0"), miapp.uid.join("")
}, miapp.getUid = function () {
    return miapp.uid.join("")
}, miapp.initUid = function (seed) {
    if (miapp.isUndefined(seed))return void(miapp.uid = ["0", "0", "0"]);
    seed = seed.toUpperCase(), miapp.uid = [];
    for (var i = 0, n = seed.length; i < n; i++) {
        var c = seed.charAt(i);
        miapp.isDefined(miapp.idNext[c]) && miapp.uid.push(c)
    }
    for (; miapp.uid.length < 3;)miapp.uid.unshift("0")
}, miapp.isUndefined = function (obj) {
    return "undefined" == typeof obj
}, miapp.isDefined = function (obj) {
    return "undefined" != typeof obj
}, miapp.isUndefinedOrNull = function (obj) {
    return "undefined" == typeof obj || null === obj
}, miapp.isDefinedAndNotNull = function (obj) {
    return "undefined" != typeof obj && null !== obj
}, miapp.isEmptyOrFalse = function (obj) {
    "use strict";
    switch (typeof obj) {
        case"object":
            return null === obj || (0 === Object.getOwnPropertyNames(obj).length || obj instanceof Array && 0 === obj.length);
        case"string":
            return 0 === obj.length;
        case"number":
            return 0 === obj;
        case"boolean":
            return !obj;
        case"function":
            return !1;
        case"undefined":
            return !0
    }
    return !obj
}, miapp.isTrueOrNonEmpty = function (obj) {
    switch (typeof obj) {
        case"object":
            return null !== obj && (0 !== Object.getOwnPropertyNames(obj).length && (!(obj instanceof Array) || 0 !== obj.length));
        case"string":
            return 0 !== obj.length;
        case"number":
            return 0 !== obj;
        case"boolean":
            return obj;
        case"function":
            return !0;
        case"undefined":
            return !1
    }
    return !!obj
}, miapp.safeApply = function (scope, expr, beforeFct, afterFct) {
    beforeFct && miapp.safeApply(scope, beforeFct), scope.$root && scope.$root.$$phase ? scope.$root.$evalAsync(function () {
            scope.$eval(expr)
        }) : scope.$treeScope && scope.$treeScope.$apply ? scope.$treeScope.$apply(expr) : scope.$apply && scope.$apply != angular.noop ? scope.$apply(expr) : expr(), afterFct && miapp.safeApply(scope, afterFct)
}, miapp.promiseWakeupNb = 0, miapp.promiseWakeupTimeout = null, miapp.promiseWakeup = function (scope, httpPromise, fctOnHttpSuccess, fctOnHttpError) {
    function tick() {
        miapp.promiseWakeupNb > 0 && (miapp.safeApply(scope), miapp.promiseWakeupTimeout = setTimeout(tick, 1e3))
    }

    var promiseWakeupOnHttpSuccess = function (response) {
        miapp.promiseWakeupNb--, miapp.promiseWakeupNb <= 0 && (miapp.InternalLog.log("miapp.promiseWakeup.tick", "stop"), miapp.promiseWakeupNb = 0, clearTimeout(miapp.promiseWakeupTimeout), miapp.promiseWakeupTimeout = null), fctOnHttpSuccess(response)
    }, promiseWakeupOnHttpError = function (response) {
        miapp.promiseWakeupNb--, miapp.promiseWakeupNb <= 0 && (miapp.InternalLog.log("miapp.promiseWakeup.tick", "stop"), miapp.promiseWakeupNb = 0, clearTimeout(miapp.promiseWakeupTimeout), miapp.promiseWakeupTimeout = null), fctOnHttpError(response)
    };
    0 === miapp.promiseWakeupNb && (miapp.promiseWakeupTimeout = setTimeout(tick, 1e3)), miapp.promiseWakeupNb++, httpPromise.then(promiseWakeupOnHttpSuccess, promiseWakeupOnHttpError)
};
var cache = window.applicationCache, cacheStatusValues = [], miappTranslateDatesToPxSize = function (date_start, date_end, totalSize) {
    var date1 = date_start;
    if ("string" == typeof date1 && (date1 = miappDateParse(date_start)), !date1)return totalSize;
    var date2 = date_end;
    if ("string" == typeof date2 && (date2 = miappDateParse(date_end)), !date2)return totalSize;
    var milliseconds = date2.getTime() - date1.getTime();
    if (milliseconds < 0)return totalSize;
    var days = milliseconds / 1e3 / 86400;
    return days > 1 && (days = 1), Math.round(days * totalSize)
}, miappTranslateDateToPx = function (date, totalSize) {
    var date1 = date;
    if ("string" == typeof date1 && (date1 = miappDateParse(date)), !date1)return 0;
    var days = (60 * date1.getHours() + date1.getMinutes()) / 1440;
    return Math.round(days * totalSize)
};
miapp.not = function (f) {
    return function () {
        var result = f.apply(this, arguments);
        return !result
    }
}, miapp.mapper = function (f) {
    return function (a) {
        return map(a, f)
    }
}, miapp.memoize = function (f) {
    var cache = {};
    return function () {
        var key = arguments.length + Array.prototype.join.call(arguments, ",");
        return key in cache ? cache.key : (cache.key = f.apply(this, arguments), cache.key)
    }
}, miapp.extend = function (o, p) {
    for (var prop in p)o[prop] = p[prop];
    return o
}, miapp.merge = function (o, p) {
    for (var prop in p)o.hasOwnProperty(prop) || (o[prop] = p[prop]);
    return o
}, miapp.restrict = function (o, p) {
    for (var prop in o)prop in p || delete o[prop];
    return o
}, miapp.subtract = function (o, p) {
    for (var prop in p)delete o[prop];
    return o
}, miapp.union = function (o, p) {
    return miapp.extend(miapp.extend({}, o), p)
}, miapp.intersection = function (o, p) {
    return miapp.restrict(miapp.extend({}, o), p)
}, miapp.keys = function (o) {
    if ("object" != typeof o)throw new TypeError;
    var result = [];
    for (var prop in o)o.hasOwnProperty(prop) && result.push(prop);
    return result
}, miapp.create = function (proto, props) {
    function F() {
    }

    if (null === proto)throw new TypeError;
    if (Object.create)return Object.create(proto, props);
    var t = typeof proto;
    if ("object" !== t && "function" !== t)throw new TypeError;
    F.prototype = proto;
    var o = new F;
    return miapp.extend(o, props)
}, miapp.even = function (x) {
    return x % 2 === 0
}, miapp.odd = miapp.not(miapp.even), miapp.foreach = function (a, f, t) {
    try {
        a.forEach(f, t)
    } catch (e) {
        if (e === miapp.foreach.break)return;
        throw e
    }
}, miapp.foreach.break = new Error("StopIteration");
var miapp;
miapp || (miapp = {}), miapp.Analytics = function () {
    "use strict";
    function Analytics(localStorage, googleAnalytics_UA_ID) {
        this.localStorage = null, miapp.isDefined(localStorage) && localStorage && (this.localStorage = localStorage), this.mAnalyticsArray = [], this.mAnalyticsFunctionnalitiesArray = [], this.localStorage && (this.mAnalyticsArray = this.localStorage.get(mAnalyticsLS, this.mAnalyticsArray), this.mAnalyticsFunctionnalitiesArray = this.localStorage.get(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray)), this.vid = "vid_undefined", this.uid = "uid_undefined", this.initDone = !1, this.bEnabled = !0, this.googleAnalytics_UA_ID = googleAnalytics_UA_ID, this.gaQueue = null, this.gaPanalytics = null, this.gaPlugin = null
    }

    var mAnalyticsLS = "miapp.Analytics", mAnalyticsFunctionnalitiesLS = "miapp.Analytics.functionalities";
    return Analytics.prototype.init = function () {
        this.initDone || ("undefined" != typeof _gaq ? (miapp.InternalLog.log("Analytics", "googleAnalytics official launched."), this.gaQueue = _gaq || [], this.gaQueue.push(["_setAccount", this.googleAnalytics_UA_ID]), this.gaQueue.push(["_trackPageview"])) : miapp.InternalLog.log("Analytics", "googleAnalytics not defined."), "undefined" != typeof window.plugins && "undefined" != typeof window.plugins.gaPlugin && (miapp.InternalLog.log("Analytics", "GAPlugin launched."), this.gaPlugin = window.plugins.gaPlugin, this.gaPlugin.init(successHandler, errorHandler, this.googleAnalytics_UA_ID, 10)), this.initDone = !0)
    }, Analytics.prototype.setVid = function (vid) {
        this.vid = vid, miapp.InternalLog.log("Analytics", "set vid " + this.vid)
    }, Analytics.prototype.setUid = function (uid) {
        miapp.InternalLog.log("Analytics", "set uid " + uid), uid && "" !== uid && (this.uid = uid)
    }, Analytics.prototype.setEnabled = function (enable) {
        this.bEnabled = enable === !0, miapp.InternalLog.log("Analytics", "set enabled " + this.bEnabled)
    }, Analytics.prototype.add = function (category, action, value) {
        if (this.bEnabled && category && action) {
            var shouldBeTrackedAsEvent = !0;
            if ("Once" == category) {
                for (var i = 0; i < this.mAnalyticsFunctionnalitiesArray.length && shouldBeTrackedAsEvent; i++)this.mAnalyticsFunctionnalitiesArray[i] === action && (shouldBeTrackedAsEvent = !1);
                shouldBeTrackedAsEvent && this.mAnalyticsFunctionnalitiesArray.push(action)
            }
            miapp.InternalLog.log("Analytics", "shouldBeTrackedAsEvent ?" + shouldBeTrackedAsEvent);
            var paramEvent = {
                vid: this.vid,
                uid: this.uid,
                type: "event",
                category: category,
                action: action,
                value: value || 1
            }, paramView = {
                vid: this.vid,
                uid: this.uid,
                type: "view",
                category: category,
                action: action,
                value: value || 1
            };
            miapp.InternalLog.log("Analytics", "add " + paramEvent.toString()), shouldBeTrackedAsEvent && this.mAnalyticsArray.push(paramEvent), this.mAnalyticsArray.push(paramView), this.localStorage && this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray), this.localStorage && this.localStorage.set(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray), checkConnection() && this.run()
        }
    }, Analytics.prototype.run = function () {
        if (this.bEnabled) {
            miapp.InternalLog.log("Analytics", "run - pushing " + this.mAnalyticsArray.length + " elements");
            var bOK = !0;
            try {
                for (var i = 0; i < this.mAnalyticsArray.length; i++) {
                    var param = this.mAnalyticsArray[i];
                    if ("view" == param.type) {
                        var url = "" + this.vid + " - " + param.category + " - " + param.action;
                        miapp.InternalLog.log("Analytics", "track view " + url), this.gaQueue && this.gaQueue.push(["_trackPageview", url]), this.gaPanalytics && this.gaPanalytics.trackView(url), this.gaPlugin && this.gaPlugin.trackPage(successHandler, errorHandler, url)
                    } else {
                        var cat = this.vid + " - " + param.category, act = param.category + " - " + param.action, lab = param.uid, val = param.value;
                        miapp.InternalLog.log("Analytics", "track event " + cat + ", " + act + ", " + lab + ", " + val), this.gaQueue && this.gaQueue.push(["_trackEvent", cat, act, lab, val]), this.gaPanalytics && this.gaPanalytics.trackEvent(cat, act, lab, val), this.gaPlugin && this.gaPlugin.trackEvent(successHandler, errorHandler, cat, act, lab, val)
                    }
                }
            } catch (e) {
                miapp.ErrorLog.log("Analytics", " run pb : " + miapp.formatError(e)), bOK = !1
            }
            bOK && (this.mAnalyticsArray = [], this.localStorage && this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray))
        }
    }, Analytics
}();
var miapp;
miapp || (miapp = {}), miapp.Base64 = function () {
    "use strict";
    function uint6ToB64(nUint6) {
        return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : 62 === nUint6 ? 43 : 63 === nUint6 ? 47 : 65
    }

    function b64ToUint6(nChr) {
        return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : 43 === nChr ? 62 : 47 === nChr ? 63 : 0
    }

    var Base64 = {};
    Base64.encode = function (input) {
        for (var chr1, chr2, chr3, enc1, enc2, enc3, enc4, output = "", i = 0; i < input.length;)chr1 = input.charCodeAt(i++), chr2 = input.charCodeAt(i++), chr3 = input.charCodeAt(i++), enc1 = chr1 >> 2, enc2 = (3 & chr1) << 4 | chr2 >> 4, enc3 = (15 & chr2) << 2 | chr3 >> 6, enc4 = 63 & chr3, isNaN(chr2) ? enc3 = enc4 = 64 : isNaN(chr3) && (enc4 = 64), output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        return output
    }, Base64.encodeFromUint8Array = function (input) {
        for (var nMod3, sB64Enc = "", nLen = input.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++)nMod3 = nIdx % 3, nIdx > 0 && 4 * nIdx / 3 % 76 === 0 && (sB64Enc += "\r\n"), nUint24 |= input[nIdx] << (16 >>> nMod3 & 24), 2 !== nMod3 && input.length - nIdx !== 1 || (sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(63 & nUint24)), nUint24 = 0);
        return sB64Enc.replace(/A(?=A$|$)/g, "=")
    }, Base64.decode = function (input) {
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4, output = "", i = 0;
        for (input = input.replace(/[^A-Za-z0-9\+\/\=]/g, ""); i < input.length;)enc1 = keyStr.indexOf(input.charAt(i++)), enc2 = keyStr.indexOf(input.charAt(i++)), enc3 = keyStr.indexOf(input.charAt(i++)), enc4 = keyStr.indexOf(input.charAt(i++)), chr1 = enc1 << 2 | enc2 >> 4, chr2 = (15 & enc2) << 4 | enc3 >> 2, chr3 = (3 & enc3) << 6 | enc4, output += String.fromCharCode(chr1), 64 != enc3 && (output += String.fromCharCode(chr2)), 64 != enc4 && (output += String.fromCharCode(chr3));
        return output
    }, Base64.decodeToUint8Array = function (input) {
        for (var nMod3, nMod4, nBlocksSize = 1, sB64Enc = input.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length, nOutLen = nBlocksSize ? Math.ceil((3 * nInLen + 1 >> 2) / nBlocksSize) * nBlocksSize : 3 * nInLen + 1 >> 2, taBytes = new Uint8Array(nOutLen), nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++)if (nMod4 = 3 & nInIdx, nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4, 3 === nMod4 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++)taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            nUint24 = 0
        }
        return taBytes
    };
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    return Base64
}();
var a4p;
a4p || (a4p = {}), a4p.BezierDrawer = function () {
    function BezierDrawer(canvas) {
        this.canvas = canvas, this.ctx = canvas.getContext("2d"), this.begin = function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }, this.add = function (p0, q0, q1, p1) {
            this.ctx.beginPath(), this.ctx.strokeStyle = "cyan", this.ctx.lineWidth = "6", this.ctx.moveTo(p0.x, p0.y), this.ctx.bezierCurveTo(q0.x, q0.y, q1.x, q1.y, p1.x, p1.y), this.ctx.stroke(), this.ctx.strokeStyle = "red", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.arc(p0.x, p0.y, 2, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.strokeStyle = "green", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.arc(q0.x, q0.y, 2, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.strokeStyle = "green", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.arc(q1.x, q1.y, 2, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.strokeStyle = "red", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.arc(p1.x, p1.y, 2, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.strokeStyle = "green", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.moveTo(p0.x, p0.y), this.ctx.lineTo(q0.x, q0.y), this.ctx.stroke(), this.ctx.strokeStyle = "green", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.moveTo(q1.x, q1.y), this.ctx.lineTo(p1.x, p1.y), this.ctx.stroke()
        }, this.end = function () {
        }
    }

    return BezierDrawer
}();
var a4p;
a4p || (a4p = {}), a4p.BezierInterpolator = function () {
    function BezierInterpolator(scale) {
        var p0, q0, q1, p1, samplePoint0, samplePoint1, sample10X, sample10Y, sampleDist10;
        this.listeners = [], this.sampleScale = scale || .33, this.controlPoints = [], this.nbCurve = 0, this.begin = function () {
            this.controlPoints = [], this.nbCurve = 0, p0 = null, q0 = null, q1 = null, p1 = null, samplePoint0 = null, samplePoint1 = null;
            for (var i = 0; i < this.listeners.length; i++)this.listeners[i].begin()
        }, this.add = function (x, y, timeStamp) {
            if (null == samplePoint0)return void(samplePoint0 = {x: x, y: y});
            if (null == samplePoint1) {
                if (x == samplePoint0.x && y == samplePoint0.y)return;
                return samplePoint1 = {
                    x: x,
                    y: y
                }, sample10X = samplePoint1.x - samplePoint0.x, sample10Y = samplePoint1.y - samplePoint0.y, sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y), p0 = {
                    x: samplePoint0.x,
                    y: samplePoint0.y
                }, q0 = {
                    x: samplePoint0.x + this.sampleScale * sample10X,
                    y: samplePoint0.y + this.sampleScale * sample10Y
                }, this.controlPoints.push(p0), void this.controlPoints.push(q0)
            }
            if (x != samplePoint1.x || y != samplePoint1.y) {
                var tangentX = x - samplePoint0.x, tangentY = y - samplePoint0.y, tangentDist = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
                q1 = {
                    x: samplePoint1.x - this.sampleScale * tangentX * sampleDist10 / tangentDist,
                    y: samplePoint1.y - this.sampleScale * tangentY * sampleDist10 / tangentDist
                }, p1 = {
                    x: samplePoint1.x,
                    y: samplePoint1.y
                }, this.controlPoints.push(q1), this.controlPoints.push(p1);
                for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add(p0, q0, q1, p1);
                sample10X = x - samplePoint1.x, sample10Y = y - samplePoint1.y, sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y), p0 = p1, q0 = {
                    x: samplePoint1.x + this.sampleScale * tangentX * sampleDist10 / tangentDist,
                    y: samplePoint1.y + this.sampleScale * tangentY * sampleDist10 / tangentDist
                }, this.controlPoints.push(q0), samplePoint0 = samplePoint1, samplePoint1 = {x: x, y: y}, this.nbCurve++
            }
        }, this.end = function () {
            if (this.controlPoints.length > 1) {
                q1 = {
                    x: samplePoint1.x - this.sampleScale * sample10X,
                    y: samplePoint1.y - this.sampleScale * sample10Y
                }, p1 = {
                    x: samplePoint1.x,
                    y: samplePoint1.y
                }, this.controlPoints.push(q1), this.controlPoints.push(p1);
                for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add(p0, q0, q1, p1);
                this.nbCurve++
            }
            for (var i = 0; i < this.listeners.length; i++)this.listeners[i].end()
        }
    }

    return BezierInterpolator.prototype.size = function () {
        return this.nbCurve
    }, BezierInterpolator.prototype.addListener = function (listener) {
        this.listeners.push(listener)
    }, BezierInterpolator
}(), Bridge.prototype.setUrl = function (url, email, appId, right) {
    a4p.InternalLog.log("bridge.js", "setUrl"), window.device && "Android" === window.device.platform && cordova.exec(null, null, "Bridge", "setUrl", [url, email, appId, right])
}, Bridge.prototype.getUrl = function (email, success, fail) {
    return a4p.InternalLog.log("bridge.js", "getUrl"), window.device && "Android" === window.device.platform ? (a4p.InternalLog.log("bridge.js", "exec getUrl"), cordova.exec(success, fail, "Bridge", "getUrl", [email])) : null
}, window.plugins || (window.plugins = {}), window.plugins.bridge = new Bridge;
var miapp;
miapp || (miapp = {}), miapp.BrowserCapabilities = function (navigator, window, document) {
    function prefixStyle(style) {
        return "" === capacities.vendor ? style : (style = style.charAt(0).toUpperCase() + style.substr(1), capacities.vendor + style)
    }

    for (var capacities = {
        vendor: "",
        cssVendor: ""
    }, dummyStyle = document.createElement("div").style, vendors = "t,webkitT,MozT,msT,OT".split(","), nbVendors = vendors.length, i = 0; i < nbVendors; i++) {
        var t = vendors[i] + "ransform";
        if (t in dummyStyle) {
            capacities.vendor = vendors[i].substr(0, vendors[i].length - 1), capacities.cssVendor = "-" + capacities.vendor.toLowerCase() + "-";
            break
        }
    }
    return capacities.transform = prefixStyle("transform"), capacities.transitionProperty = prefixStyle("transitionProperty"), capacities.transitionDuration = prefixStyle("transitionDuration"), capacities.transformOrigin = prefixStyle("transformOrigin"), capacities.transitionTimingFunction = prefixStyle("transitionTimingFunction"), capacities.transitionDelay = prefixStyle("transitionDelay"), capacities.isAndroid = /android/gi.test(navigator.appVersion), capacities.isIDevice = /iphone|ipad/gi.test(navigator.appVersion), capacities.isTouchPad = /hp-tablet/gi.test(navigator.appVersion), capacities.isPhantom = /phantom/gi.test(navigator.userAgent), capacities.hasTouch = ("ontouchstart" in window || "createTouch" in document) && (capacities.isAndroid || capacities.isIDevice) && !capacities.isPhantom, capacities.has3d = prefixStyle("perspective") in dummyStyle, capacities.hasTransform = "" != capacities.vendor, capacities.hasTransitionEnd = prefixStyle("transition") in dummyStyle, capacities.online = navigator.onLine, capacities.isConnectionOnline = function () {
        if (navigator && navigator.connection && Connection) {
            var networkState = navigator.connection.type, states = {};
            return states[Connection.UNKNOWN] = "Unknown connection", states[Connection.ETHERNET] = "Ethernet connection", states[Connection.WIFI] = "WiFi connection", states[Connection.CELL_2G] = "Cell 2G connection", states[Connection.CELL_3G] = "Cell 3G connection", states[Connection.CELL_4G] = "Cell 4G connection", states[Connection.CELL] = "Cell generic connection", states[Connection.NONE] = "No network connection", "No network connection" !== states[networkState] && "Unknown connection" !== states[networkState]
        }
        return !(!navigator || "boolean" != typeof navigator.onLine) && navigator.onLine
    }, capacities.RESIZE_EVENT = "onorientationchange" in window ? "orientationchange" : "resize", capacities.TRNEND_EVENT = function () {
        if ("" == capacities.vendor)return !1;
        var transitionEnd = {
            "": "transitionend",
            webkit: "webkitTransitionEnd",
            Moz: "transitionend",
            O: "otransitionend",
            ms: "MSTransitionEnd"
        };
        return transitionEnd[capacities.vendor]
    }(), window.requestAnimationFrame ? capacities.nextFrame = function (callback) {
            return window.requestAnimationFrame(callback)
        } : window.webkitRequestAnimationFrame ? capacities.nextFrame = function (callback) {
                return window.webkitRequestAnimationFrame(callback)
            } : window.mozRequestAnimationFrame ? capacities.nextFrame = function (callback) {
                    return window.mozRequestAnimationFrame(callback)
                } : window.oRequestAnimationFrame ? capacities.nextFrame = function (callback) {
                        return window.oRequestAnimationFrame(callback)
                    } : window.msRequestAnimationFrame ? capacities.nextFrame = function (callback) {
                            return window.msRequestAnimationFrame(callback)
                        } : capacities.nextFrame = function (callback) {
                            return setTimeout(callback, 1)
                        }, window.cancelRequestAnimationFrame ? capacities.cancelFrame = function (handle) {
            return window.cancelRequestAnimationFrame(handle)
        } : window.webkitCancelAnimationFrame ? capacities.cancelFrame = function (handle) {
                return window.webkitCancelAnimationFrame(handle)
            } : window.webkitCancelRequestAnimationFrame ? capacities.cancelFrame = function (handle) {
                    return window.webkitCancelRequestAnimationFrame(handle)
                } : window.mozCancelRequestAnimationFrame ? capacities.cancelFrame = function (handle) {
                        return window.mozCancelRequestAnimationFrame(handle)
                    } : window.oCancelRequestAnimationFrame ? capacities.cancelFrame = function (handle) {
                            return window.oCancelRequestAnimationFrame(handle)
                        } : window.msCancelRequestAnimationFrame ? capacities.cancelFrame = function (handle) {
                                return window.msCancelRequestAnimationFrame(handle)
                            } : capacities.cancelFrame = function (handle) {
                                return clearTimeout(handle)
                            }, capacities.translateZ = capacities.has3d && !capacities.isAndroid ? " translateZ(0)" : "", dummyStyle = null, capacities
}(navigator, window, document);
var gFileSystem = null, fileErrorHandler = function (e) {
    var msg = "Unknown Error - " + e.code;
    if (a4p.InternalLog.log("fileErrorHandler", e.code), e.source)switch (e.code) {
        case FileTransferError.FILE_NOT_FOUND_ERR:
            msg = "FILE_NOT_FOUND_ERR";
            break;
        case FileTransferError.INVALID_URL_ERR:
            msg = "INVALID_URL_ERR";
            break;
        case FileTransferError.CONNECTION_ERR:
            msg = "CONNECTION_ERR"
    } else switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = "QUOTA_EXCEEDED_ERR";
            break;
        case FileError.NOT_FOUND_ERR:
            msg = "NOT_FOUND_ERR";
            break;
        case FileError.SECURITY_ERR:
            msg = "SECURITY_ERR";
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = "INVALID_MODIFICATION_ERR";
            break;
        case FileError.INVALID_STATE_ERR:
            msg = "INVALID_STATE_ERR";
            break;
        case FileError.NO_MODIFICATION_ALLOWED_ERR:
            msg = "NO_MODIFICATION_ALLOWED_ERR";
            break;
        case FileError.SYNTAX_ERR:
            msg = "SYNTAX_ERR";
            break;
        case FileError.TYPE_MISMATCH_ERR:
            msg = "TYPE_MISMATCH_ERR";
            break;
        case FileError.PATH_EXISTS_ERR:
            msg = "PATH_EXISTS_ERR"
    }
    e.source && (msg = msg + " error source " + e.source), e.target && (msg = msg + " error target " + e.target), e.description && (msg = msg + " error description " + e.description), a4p.InternalLog.log("fileErrorHandler", "File Error: " + msg), onFillCompleted(!1), a4p.InternalLog.log("fileErrorHandler", "onFillCompleted : false")
}, a4p;
a4p || (a4p = {});
var a4p;
a4p || (a4p = {});
var geo_code, geo_city, geo_success = function (position) {
    var lat = position.coords.latitude, lng = position.coords.longitude;
    geo_codeLatLng(lat, lng)
}, geo_error = function () {
    a4p.ErrorLog.log("geo_error", "Geocoder failed")
}, geo_codeLatLng = function (lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    geo_code.geocode({latLng: latlng}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK)if (a4p.InternalLog.log("geo_codeLatLng", results), results[1]) {
            a4p.InternalLog.log("geo_codeLatLng", results[0].formatted_address), geo_city = results[0].formatted_address;
            for (var city, i = 0; i < results[0].address_components.length; i++)for (var b = 0; b < results[0].address_components[i].types.length; b++)if ("administrative_area_level_1" == results[0].address_components[i].types[b]) {
                city = results[0].address_components[i];
                break
            }
            a4p.InternalLog.log("geo_codeLatLng", city.short_name + " " + city.long_name), geo_city = '<?php print Lang::_t("(near)",$current_user);?> ' + geo_city;
            var option = new Option(geo_city, geo_city, !0, !0);
            $("#rdv-header-location").append(option), $("#rdv-header-location").val(option)
        } else a4p.InternalLog.log("geo_codeLatLng", "Geocoder No results found"); else a4p.InternalLog.log("geo_codeLatLng", "Geocoder failed due to: " + status)
    })
}, loadLocation = function () {
    geo_code = new google.maps.Geocoder, navigator.geolocation && navigator.geolocation.getCurrentPosition(geo_success, geo_error)
}, a4p;
a4p || (a4p = {}), a4p.GestureDrawer = function () {
    function GestureDrawer(canvas) {
        this.canvas = canvas, this.ctx = canvas.getContext("2d"), this.begin = function () {
        }, this.add = function (event) {
            this.ctx.strokeStyle = "blue", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.arc(event.x, event.y, 2, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.strokeStyle = "blue", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.moveTo(event.x, event.y), "W" == event.line ? this.ctx.lineTo(event.x - event.dist, event.y) : "SW" == event.line ? this.ctx.lineTo(event.x - event.dist / Math.sqrt(2), event.y + event.dist / Math.sqrt(2)) : "S" == event.line ? this.ctx.lineTo(event.x, event.y + event.dist) : "SE" == event.line ? this.ctx.lineTo(event.x + event.dist / Math.sqrt(2), event.y + event.dist / Math.sqrt(2)) : "E" == event.line ? this.ctx.lineTo(event.x + event.dist, event.y) : "NE" == event.line ? this.ctx.lineTo(event.x + event.dist / Math.sqrt(2), event.y - event.dist / Math.sqrt(2)) : "N" == event.line ? this.ctx.lineTo(event.x, event.y - event.dist) : "NW" == event.line && this.ctx.lineTo(event.x - event.dist / Math.sqrt(2), event.y - event.dist / Math.sqrt(2)), this.ctx.stroke()
        }, this.end = function () {
        }
    }

    return GestureDrawer
}();
var a4p;
a4p || (a4p = {}), a4p.GestureInterpolator = function () {
    function GestureInterpolator() {
        function triggerMove(self, move) {
            self.lastMove = {line: move.line, rotate: move.rotate}, self.moves.push({
                x: move.x,
                y: move.y,
                timeStamp: move.timeStamp,
                angle: move.angle,
                dist: move.dist,
                line: move.line,
                rotate: move.rotate
            });
            for (var i = 0; i < self.listeners.length; i++)self.listeners[i].add(move)
        }

        var samplePoint0, samplePoint1, sample10X, sample10Y, sampleDist10, sampleAngle10, move0;
        this.listeners = [], this.moves = [], this.lastMove = null, this.begin = function () {
            this.moves = [], this.fromIdx = 0, samplePoint0 = null, samplePoint1 = null, move0 = null;
            for (var i = 0; i < this.listeners.length; i++)this.listeners[i].begin()
        }, this.add = function (x, y, timeStamp) {
            if (null == samplePoint0)return void(samplePoint0 = {x: x, y: y, timeStamp: timeStamp});
            var self = this;
            if (null == samplePoint1) {
                if (x == samplePoint0.x && y == samplePoint0.y)return;
                return samplePoint1 = {
                    x: x,
                    y: y,
                    timeStamp: timeStamp
                }, sample10X = samplePoint1.x - samplePoint0.x, sample10Y = samplePoint1.y - samplePoint0.y, sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y), sampleAngle10 = Math.atan2(sample10Y, sample10X), move0 = {
                    x: samplePoint0.x,
                    y: samplePoint0.y,
                    timeStamp: samplePoint0.timeStamp,
                    angle: sampleAngle10,
                    dist: sampleDist10,
                    line: orientation(sampleAngle10),
                    rotate: ""
                }, void triggerMove(self, move0)
            }
            if (x != samplePoint1.x || y != samplePoint1.y) {
                var oldDist = sampleDist10, tangentX = x - samplePoint0.x, tangentY = y - samplePoint0.y, tangentAngle = (Math.sqrt(tangentX * tangentX + tangentY * tangentY), Math.atan2(tangentY, tangentX)), line = orientation(tangentAngle), rotate = "";
                sample10X = x - samplePoint1.x, sample10Y = y - samplePoint1.y, sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y), sampleAngle10 = Math.atan2(sample10Y, sample10X);
                var newMove = !1;
                if (line != move0.line) {
                    var angle = angleOf(tangentAngle, move0.angle), angleNbStep = angleNbStepOf(tangentAngle, move0.angle);
                    rotate = rotation(angle, angleNbStep), newMove = !0
                }
                newMove && "" != this.lastMove.rotate && rotate != this.lastMove.rotate && (move0 = {
                    x: move0.x,
                    y: move0.y,
                    timeStamp: move0.timeStamp,
                    angle: move0.angle,
                    dist: move0.dist,
                    line: move0.line,
                    rotate: ""
                }, triggerMove(self, move0)), move0 = {
                    x: samplePoint1.x,
                    y: samplePoint1.y,
                    timeStamp: samplePoint1.timeStamp,
                    angle: tangentAngle,
                    dist: (oldDist + sampleDist10) / 2,
                    line: line,
                    rotate: rotate
                }, newMove && triggerMove(self, move0), samplePoint0 = samplePoint1, samplePoint1 = {
                    x: x,
                    y: y,
                    timeStamp: timeStamp
                }
            }
        }, this.end = function () {
            if (null != samplePoint1) {
                var line = orientation(sampleAngle10), rotate = "", newMove = !1;
                if (line != move0.line) {
                    var angle = angleOf(sampleAngle10, move0.angle), angleNbStep = angleNbStepOf(sampleAngle10, move0.angle);
                    rotate = rotation(angle, angleNbStep), newMove = !0
                }
                var self = this;
                newMove && "" != this.lastMove.rotate && rotate != this.lastMove.rotate && (move0 = {
                    x: move0.x,
                    y: move0.y,
                    timeStamp: move0.timeStamp,
                    angle: move0.angle,
                    dist: move0.dist,
                    line: move0.line,
                    rotate: ""
                }, triggerMove(self, move0)), move0 = {
                    x: samplePoint1.x,
                    y: samplePoint1.y,
                    timeStamp: samplePoint1.timeStamp,
                    angle: sampleAngle10,
                    dist: sampleDist10,
                    line: line,
                    rotate: rotate
                }, newMove && triggerMove(self, move0), "" != this.lastMove.rotate && (move0 = {
                    x: move0.x,
                    y: move0.y,
                    timeStamp: move0.timeStamp,
                    angle: move0.angle,
                    dist: move0.dist,
                    line: move0.line,
                    rotate: ""
                }, triggerMove(self, move0))
            }
            for (var i = 0; i < this.listeners.length; i++)this.listeners[i].end()
        }
    }

    function orientation(angle) {
        return angle > Math.PI - step ? "W" : angle > Math.PI - 3 * step ? "SW" : angle > Math.PI - 5 * step ? "S" : angle > Math.PI - 7 * step ? "SE" : angle > Math.PI - 9 * step ? "E" : angle > Math.PI - 11 * step ? "NE" : angle > Math.PI - 13 * step ? "N" : angle > Math.PI - 15 * step ? "NW" : "W"
    }

    function angleOf(angle1, angle0) {
        var angle = angle1 - angle0;
        return angle <= -Math.PI ? angle += 2 * Math.PI : angle > Math.PI && (angle -= 2 * Math.PI), angle
    }

    function angleNbStepOf(angle1, angle0) {
        var nbStep = Math.round(angle1 / (2 * step)) - Math.round(angle0 / (2 * step));
        return nbStep <= -4 ? nbStep += 8 : nbStep > 4 && (nbStep -= 8), nbStep
    }

    function rotation(angle, nbStep) {
        return 1 == Math.abs(nbStep) ? angle < 0 ? "left" : "right" : ""
    }

    var step = Math.PI / 8;
    return GestureInterpolator.prototype.addListener = function (listener) {
        this.listeners.push(listener)
    }, GestureInterpolator.prototype.size = function () {
        return this.moves.length
    }, GestureInterpolator
}();
var miapp;
miapp || (miapp = {}), miapp.Hex = function () {
    var Hex = {};
    Hex.encode = function (input) {
        for (var output = "", i = 0; i < input.length; i++) {
            var x = input.charCodeAt(i);
            output += hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(15 & x)
        }
        return output
    }, Hex.decode = function (input) {
        var output = "";
        input.length % 2 > 0 && (input = "0" + input);
        for (var i = 0; i < input.length; i += 2)output += String.fromCharCode(parseInt(input.charAt(i) + input.charAt(i + 1), 16));
        return output
    };
    var hexTab = "0123456789abcdef";
    return Hex
}();
var miapp;
miapp || (miapp = {}), miapp.Json = function ($) {
    "use strict";
    function Json() {
        this.version = "0.1"
    }

    if (!Object.toJSON && !window.JSON)throw new Error("Object.toJSON or window.JSON needs to be loaded before miapp.Json!");
    return Json.uriEncode = function (obj) {
        var name, value, fullSubName, subName, subValue, innerObj, i, query = "";
        for (name in obj)if (obj.hasOwnProperty(name))if (value = obj[name], value instanceof Array)for (i = 0; i < value.length; ++i)subValue = value[i], fullSubName = name + "[" + i + "]", innerObj = {}, innerObj[fullSubName] = subValue, query += Json.uriEncode(innerObj) + "&"; else if (value instanceof Object)for (subName in value)value.hasOwnProperty(subName) && (subValue = value[subName], fullSubName = name + "[" + subName + "]", innerObj = {}, innerObj[fullSubName] = subValue, query += Json.uriEncode(innerObj) + "&"); else void 0 !== value && null !== value && (query += encodeURIComponent(name) + "=" + encodeURIComponent(value) + "&");
        return query.length ? query.substr(0, query.length - 1) : query
    }, Json.object2String = Object.toJSON || window.JSON && (JSON.encode || JSON.stringify), Json.string2Object = window.JSON && (JSON.decode || JSON.parse) || function (str) {
            return String(str).evalJSON()
        }, Json
}(window.$ || window.jQuery);
var miapp;
miapp || (miapp = {}), miapp.formatError = function (arg) {
    return arg instanceof Error && (arg.stack ? arg = arg.message && arg.stack.indexOf(arg.message) === -1 ? "Error: " + arg.message + "\n" + arg.stack : arg.stack : arg.sourceURL && (arg = arg.message + "\n" + arg.sourceURL + ":" + arg.line)), arg
}, miapp.Log = function () {
    function Log(nbMax) {
        this.nbMax = nbMax || 1e3, this.nbMax < 1 && (this.nbMax = 1), this.logEntries = [], this.callbackHandle = 0, this.callbacks = []
    }

    return Log.prototype.getLog = function () {
        return this.logEntries
    }, Log.prototype.clearLog = function () {
        this.logEntries = []
    }, Log.prototype.setNbMax = function (nbMax) {
        this.nbMax = nbMax || 1e3, this.nbMax < 1 && (this.nbMax = 1), this.logEntries.length > this.nbMax && this.logEntries.splice(0, this.logEntries.length - this.nbMax)
    }, Log.prototype.log = function (msg, details, traceStackOffset) {
        details = details || "";
        var now = new Date;
        now = miappDateFormat(now) + "." + now.getMilliseconds();
        var stack, from = "";
        if (traceStackOffset = traceStackOffset || 0, stack = (new Error).stack) {
            var caller_stack = stack.split("\n"), caller_line = caller_stack[2 + traceStackOffset];
            if (caller_line) {
                var index = caller_line.indexOf("at ") + 3;
                from = " at " + caller_line.substr(index)
            }
        }
        var logEntry = {date: now, msg: msg, details: details};
        this.logEntries.length >= this.nbMax && this.logEntries.splice(0, 1), this.logEntries.push(logEntry);
        for (var idx = 0, nb = this.callbacks.length; idx < nb; idx++)try {
            this.callbacks[idx].callback(this.callbacks[idx].id, logEntry)
        } catch (e) {
        }
        return logEntry
    }, Log.prototype.addListener = function (fct) {
        return this.callbackHandle++, this.callbacks.push({id: this.callbackHandle, callback: fct}), this.callbackHandle
    }, Log.prototype.cancelListener = function (callbackHandle) {
        for (var idx = this.callbacks.length - 1; idx >= 0; idx--)if (this.callbacks[idx].id == callbackHandle)return this.callbacks.splice(idx, 1), !0;
        return !1
    }, Log
}(), miapp.ErrorLog = new miapp.Log(1e3), miapp.InternalLog = new miapp.Log(1e3);
var a4p;
a4p || (a4p = {}), a4p.MoveDrawer = function () {
    function MoveDrawer(canvas) {
        this.canvas = canvas, this.ctx = canvas.getContext("2d"), this.begin = function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }, this.add = function (p0) {
            this.ctx.strokeStyle = "red", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.arc(p0.x, p0.y, 2, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.strokeStyle = "green", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.arc(p0.x + p0.dx, p0.y + p0.dy, 2, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.strokeStyle = "green", this.ctx.lineWidth = "1", this.ctx.beginPath(), this.ctx.moveTo(p0.x, p0.y), this.ctx.lineTo(p0.x + p0.dx, p0.y + p0.dy), this.ctx.stroke()
        }, this.end = function () {
        }
    }

    return MoveDrawer
}();
var a4p;
a4p || (a4p = {}), a4p.MoveInterpolator = function () {
    function MoveInterpolator(scale) {
        var samplePoint0, samplePoint1, sample10X, sample10Y, sampleDist10, sampleAngle10;
        this.listeners = [], this.moves = [], this.begin = function () {
            this.moves = [], samplePoint0 = null, samplePoint1 = null;
            for (var i = 0; i < this.listeners.length; i++)this.listeners[i].begin()
        }, this.add = function (x, y, timeStamp) {
            if (null == samplePoint0)return void(samplePoint0 = {x: x, y: y, timeStamp: timeStamp});
            if (null != samplePoint1) {
                if (x != samplePoint1.x || y != samplePoint1.y) {
                    var oldDist = sampleDist10, tangentX = x - samplePoint0.x, tangentY = y - samplePoint0.y, tangentDist = Math.sqrt(tangentX * tangentX + tangentY * tangentY), tangentAngle = Math.atan2(tangentY, tangentX);
                    sample10X = x - samplePoint1.x, sample10Y = y - samplePoint1.y, sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y), sampleAngle10 = Math.atan2(sample10Y, sample10X);
                    var compass2 = orientation(tangentAngle);
                    this.moves.push({
                        x: samplePoint1.x,
                        y: samplePoint1.y,
                        dx: tangentX * (oldDist + sampleDist10) / 2 / tangentDist,
                        dy: tangentY * (oldDist + sampleDist10) / 2 / tangentDist,
                        d: (oldDist + sampleDist10) / 2,
                        angle: tangentAngle,
                        compass: compass2,
                        timeStamp: samplePoint1.timeStamp
                    });
                    for (var idx2 = 0; idx2 < this.listeners.length; idx2++)this.listeners[idx2].add({
                        x: samplePoint1.x,
                        y: samplePoint1.y,
                        dx: tangentX * (oldDist + sampleDist10) / 2 / tangentDist,
                        dy: tangentY * (oldDist + sampleDist10) / 2 / tangentDist,
                        d: (oldDist + sampleDist10) / 2,
                        angle: tangentAngle,
                        compass: compass2,
                        timeStamp: samplePoint1.timeStamp
                    });
                    samplePoint0 = samplePoint1, samplePoint1 = {x: x, y: y, timeStamp: timeStamp}
                }
            } else {
                if (x == samplePoint0.x && y == samplePoint0.y)return;
                samplePoint1 = {
                    x: x,
                    y: y,
                    timeStamp: timeStamp
                }, sample10X = samplePoint1.x - samplePoint0.x, sample10Y = samplePoint1.y - samplePoint0.y, sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y), sampleAngle10 = Math.atan2(sample10Y, sample10X);
                var compass1 = orientation(sampleAngle10);
                this.moves.push({
                    x: samplePoint0.x,
                    y: samplePoint0.y,
                    dx: sample10X,
                    dy: sample10Y,
                    d: sampleDist10,
                    angle: sampleAngle10,
                    compass: compass1,
                    timeStamp: samplePoint0.timeStamp
                });
                for (var idx1 = 0; idx1 < this.listeners.length; idx1++)this.listeners[idx1].add({
                    x: samplePoint0.x,
                    y: samplePoint0.y,
                    dx: sample10X,
                    dy: sample10Y,
                    d: sampleDist10,
                    angle: sampleAngle10,
                    compass: compass1,
                    timeStamp: samplePoint0.timeStamp
                })
            }
        }, this.end = function () {
            if (null != samplePoint1) {
                var compass1 = orientation(sampleAngle10);
                this.moves.push({
                    x: samplePoint1.x,
                    y: samplePoint1.y,
                    dx: sample10X,
                    dy: sample10Y,
                    d: sampleDist10,
                    angle: sampleAngle10,
                    compass: compass1,
                    timeStamp: samplePoint1.timeStamp
                });
                for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add({
                    x: samplePoint1.x,
                    y: samplePoint1.y,
                    dx: sample10X,
                    dy: sample10Y,
                    d: sampleDist10,
                    angle: sampleAngle10,
                    compass: compass1,
                    timeStamp: samplePoint1.timeStamp
                })
            }
            for (var idx1 = 0; idx1 < this.listeners.length; idx1++)this.listeners[idx1].end()
        }
    }

    function orientation(angle) {
        return angle > Math.PI - step ? "W" : angle > Math.PI - 3 * step ? "SW" : angle > Math.PI - 5 * step ? "S" : angle > Math.PI - 7 * step ? "SE" : angle > Math.PI - 9 * step ? "E" : angle > Math.PI - 11 * step ? "NE" : angle > Math.PI - 13 * step ? "N" : angle > Math.PI - 15 * step ? "NW" : "W"
    }

    MoveInterpolator.prototype.size = function () {
        return this.moves.length
    }, MoveInterpolator.prototype.addListener = function (listener) {
        this.listeners.push(listener)
    };
    var step = Math.PI / 8;
    return MoveInterpolator
}();
var a4p;
a4p || (a4p = {}), a4p.throttle = function (func, wait) {
    var context, args, timeout, result, previous = 0, later = function () {
        previous = new Date, timeout = null, result = func.apply(context, args)
    };
    return function () {
        var now = new Date, remaining = wait - (now - previous);
        return context = this, args = arguments, remaining <= 0 ? (window.clearTimeout(timeout), timeout = null, previous = now, result = func.apply(context, args)) : timeout || (timeout = window.setTimeout(later, remaining)), result
    }
}, a4p.delay = function (func, wait) {
    var context, args, timeout, previous = 0, later = function () {
        var now = (new Date).getTime(), remaining = wait - (now - previous);
        remaining > 0 ? timeout = window.setTimeout(later, remaining) : (timeout = null, func.apply(context, args))
    };
    return function () {
        return previous = (new Date).getTime(), timeout || (context = this, args = arguments, timeout = window.setTimeout(later, wait)), timeout
    }
};
var a4p;
a4p || (a4p = {}), a4p.PointSampler = function () {
    function PointSampler(maxIdleTime, minDistance) {
        var sourcePoint0, sourcePoint1, ptTimeout, lg0, lg1, addSampleTimeout = null;
        this.listeners = [], this.maxIdleTime = maxIdleTime || 10, this.minSqrDistance = minDistance * minDistance || 10, this.stats = {
            timeout: 0,
            angle: 0,
            lg: 0
        }, this.points = [], this.beginSample = function () {
            sourcePoint0 = null, sourcePoint1 = null, ptTimeout = null, lg0 = 0, lg1 = 0, null != addSampleTimeout && clearTimeout(addSampleTimeout), addSampleTimeout = null, this.stats = {
                timeout: 0,
                angle: 0,
                lg: 0
            };
            for (var i = 0; i < this.listeners.length; i++)this.listeners[i].begin()
        }, this.addSample = function (x, y, timeStamp) {
            var self = this;
            if (null == sourcePoint0) {
                null != addSampleTimeout && clearTimeout(addSampleTimeout), addSampleTimeout = null, ptTimeout = null, this.points.push({
                    x: x,
                    y: y
                });
                for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add(x, y, timeStamp);
                return void(sourcePoint0 = {x: x, y: y})
            }
            if (null != sourcePoint1) {
                lg1 = (x - sourcePoint1.x) * (x - sourcePoint1.x) + (y - sourcePoint1.y) * (y - sourcePoint1.y);
                var lg2 = (x - sourcePoint0.x) * (x - sourcePoint0.x) + (y - sourcePoint0.y) * (y - sourcePoint0.y);
                if (lg1 > this.minSqrDistance)if (lg1 + lg0 > 1.5 * lg2) {
                    null != addSampleTimeout && clearTimeout(addSampleTimeout), addSampleTimeout = null, ptTimeout = null, this.stats.lg++, this.points.push({
                        x: x,
                        y: y
                    });
                    for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add(x, y, timeStamp);
                    sourcePoint0 = sourcePoint1, sourcePoint1 = {x: x, y: y}, lg0 = lg1
                } else if (lg1 + lg0 - lg2 > 36) {
                    null != addSampleTimeout && clearTimeout(addSampleTimeout), addSampleTimeout = null, ptTimeout = null, this.stats.angle++, this.points.push({
                        x: x,
                        y: y
                    });
                    for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add(x, y, timeStamp);
                    sourcePoint0 = sourcePoint1, sourcePoint1 = {x: x, y: y}, lg0 = lg1
                } else ptTimeout = {
                    x: x,
                    y: y,
                    timeStamp: timeStamp
                }, null == addSampleTimeout && (addSampleTimeout = setTimeout(function () {
                    self.stats.timeout++, self.points.push({x: ptTimeout.x, y: ptTimeout.y});
                    for (var i = 0; i < self.listeners.length; i++)self.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp);
                    sourcePoint0 = sourcePoint1, sourcePoint1 = {
                        x: ptTimeout.x,
                        y: ptTimeout.y
                    }, ptTimeout = null, addSampleTimeout = null, lg0 = lg1
                }, this.maxIdleTime)); else ptTimeout = {
                    x: x,
                    y: y,
                    timeStamp: timeStamp
                }, null == addSampleTimeout && (addSampleTimeout = setTimeout(function () {
                    self.stats.timeout++, self.points.push({x: ptTimeout.x, y: ptTimeout.y});
                    for (var i = 0; i < self.listeners.length; i++)self.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp);
                    sourcePoint0 = sourcePoint1, sourcePoint1 = {
                        x: ptTimeout.x,
                        y: ptTimeout.y
                    }, ptTimeout = null, addSampleTimeout = null, lg0 = lg1
                }, this.maxIdleTime))
            } else if (lg0 = (x - sourcePoint0.x) * (x - sourcePoint0.x) + (y - sourcePoint0.y) * (y - sourcePoint0.y), lg0 > this.minSqrDistance) {
                null != addSampleTimeout && clearTimeout(addSampleTimeout), addSampleTimeout = null, ptTimeout = null, this.stats.lg++, this.points.push({
                    x: x,
                    y: y
                });
                for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add(x, y, timeStamp);
                sourcePoint1 = {x: x, y: y}
            } else ptTimeout = {
                x: x,
                y: y,
                timeStamp: timeStamp
            }, null == addSampleTimeout && (addSampleTimeout = setTimeout(function () {
                self.stats.timeout++, self.points.push({x: ptTimeout.x, y: ptTimeout.y});
                for (var i = 0; i < self.listeners.length; i++)self.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp);
                sourcePoint1 = {x: ptTimeout.x, y: ptTimeout.y}, ptTimeout = null, addSampleTimeout = null
            }, this.maxIdleTime))
        }, this.endSample = function () {
            if (null != addSampleTimeout && clearTimeout(addSampleTimeout), addSampleTimeout = null, null != ptTimeout) {
                this.points.push({x: ptTimeout.x, y: ptTimeout.y});
                for (var i = 0; i < this.listeners.length; i++)this.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp)
            }
            sourcePoint0 = null, sourcePoint1 = null, ptTimeout = null, lg0 = 0, lg1 = 0;
            for (var i = 0; i < this.listeners.length; i++)this.listeners[i].end()
        }
    }

    return PointSampler.prototype.addListener = function (listener) {
        this.listeners.push(listener)
    }, PointSampler
}();
var a4p;
a4p || (a4p = {}), a4p.Resize = function (navigator, window, document) {
    function refreshResizers() {
        attrIndex = {}, refreshWriteQueue = [];
        for (var key, fn, nodeDependent, value, idx = 0, nb = rootListener.length; idx < nb; idx++) {
            for (var resizer = rootListener[idx], varIdx = 0, varNb = resizer.scopeVars.length; varIdx < varNb; varIdx++)key = resizer.scopeVars[varIdx].key, fn = resizer.scopeVars[varIdx].fn, nodeDependent = resizer.scopeVars[varIdx].nodeDependent, value = fn(resizer.scope, {}), setVar(resizer, key, value);
            for (var cssIdx = 0, cssNb = resizer.cssKeys.length; cssIdx < cssNb; cssIdx++) {
                switch (key = resizer.cssKeys[cssIdx].key, fn = resizer.cssKeys[cssIdx].fn, nodeDependent = resizer.cssKeys[cssIdx].nodeDependent, value = fn(resizer.scope, {}), key) {
                    case"top":
                        a4p.isDefined(listenersIndex[resizer.name]) && listenersIndex[resizer.name].id == resizer.id && (attrIndex["@" + resizer.name + ".clientTop"] = value, attrIndex["@" + resizer.name + ".offsetTop"] = value), attrIndex["@" + resizer.id + ".clientTop"] = value, attrIndex["@" + resizer.id + ".offsetTop"] = value;
                        break;
                    case"left":
                        a4p.isDefined(listenersIndex[resizer.name]) && listenersIndex[resizer.name].id == resizer.id && (attrIndex["@" + resizer.name + ".clientLeft"] = value, attrIndex["@" + resizer.name + ".offsetLeft"] = value), attrIndex["@" + resizer.id + ".clientLeft"] = value, attrIndex["@" + resizer.id + ".offsetLeft"] = value;
                        break;
                    case"width":
                        a4p.isDefined(listenersIndex[resizer.name]) && listenersIndex[resizer.name].id == resizer.id && (attrIndex["@" + resizer.name + ".clientWidth"] = value, attrIndex["@" + resizer.name + ".offsetWidth"] = value), attrIndex["@" + resizer.id + ".clientWidth"] = value, attrIndex["@" + resizer.id + ".offsetWidth"] = value;
                        break;
                    case"height":
                        a4p.isDefined(listenersIndex[resizer.name]) && listenersIndex[resizer.name].id == resizer.id && (attrIndex["@" + resizer.name + ".clientHeight"] = value, attrIndex["@" + resizer.name + ".offsetHeight"] = value), attrIndex["@" + resizer.id + ".clientHeight"] = value, attrIndex["@" + resizer.id + ".offsetHeight"] = value;
                        break;
                    case"minHeight":
                        break;
                    case"minWidth":
                        break;
                    case"lineHeight":
                }
                refreshWriteQueue.push({resizer: resizer, cssAttr: key, value: value, nodeDependent: nodeDependent})
            }
        }
        for (var jobIdx = 0, jobNb = refreshWriteQueue.length; jobIdx < jobNb; jobIdx++) {
            var job = refreshWriteQueue[jobIdx];
            setCss(job.resizer, job.cssAttr, "" + job.value + "px")
        }
        rootScope && a4p.safeApply(rootScope)
    }

    function endRefreshResizers() {
        for (var previousAttrIndex = attrIndex, previousRefreshWrites = {}, i = 0, nb = refreshWriteQueue.length; i < nb; i++) {
            var job = refreshWriteQueue[i];
            previousRefreshWrites[job.resizer.id + "-" + job.cssAttr] = job.value
        }
        refreshResizers();
        var dirty = !1;
        for (var optKey in attrIndex)attrIndex.hasOwnProperty(optKey) && previousAttrIndex[optKey] != attrIndex[optKey] && (dirty = !0, a4p.ErrorLog.log("a4p.Resize", "COLLATERAL " + endRefreshResizersCount + " effect of resizers upon " + optKey + " : " + previousAttrIndex[optKey] + "," + attrIndex[optKey] + " : try to move some resize-css-* option in its DOM children."));
        for (var jobIdx = 0, jobNb = refreshWriteQueue.length; jobIdx < jobNb; jobIdx++) {
            var job = refreshWriteQueue[jobIdx];
            a4p.isUndefined(previousRefreshWrites[job.resizer.id + "-" + job.cssAttr]) ? (dirty = !0, a4p.ErrorLog.log("a4p.Resize", "COLLATERAL " + endRefreshResizersCount + " effect of resizers upon " + job.resizer.name + "." + job.cssAttr + " which did not exist previously.")) : previousRefreshWrites[job.resizer.id + "-" + job.cssAttr] != job.value && (dirty = !0, a4p.ErrorLog.log("a4p.Resize", "COLLATERAL " + endRefreshResizersCount + " effect of resizers upon " + job.resizer.name + "." + job.cssAttr + " which had another value previously."))
        }
        dirty && !endRefreshResizersCount ? (endRefreshResizersCount++, endRefreshResizersTimer = miapp.BrowserCapabilities.nextFrame(endRefreshResizers)) : orientationChangeEvent && Resize.windowAll()
    }

    function refreshAllTimeout() {
        endRefreshResizersTimer && (miapp.BrowserCapabilities.cancelFrame(endRefreshResizersTimer), endRefreshResizersTimer = null), refreshResizers(), endRefreshResizersCount = 0, endRefreshResizersTimer = miapp.BrowserCapabilities.nextFrame(endRefreshResizers)
    }

    function windowAllTimeout() {
        orientationChangeEvent = !1;
        for (var idx = 0, nb = rootListener.length; idx < nb; idx++) {
            var resizer = rootListener[idx];
            resizer.triggerEvent(EVT_WINDOW, {
                id: resizer.id,
                name: resizer.name,
                resizeOrientation: Resize.resizeOrientation,
                resizePortrait: Resize.resizePortrait,
                resizeOneColumn: Resize.resizeOneColumn,
                resizeWidth: Resize.resizeWidth,
                resizeHeight: Resize.resizeHeight
            })
        }
    }

    function orderResizeListeners() {
        Resize.isReordering = !0;
        for (var idx = rootListener.length - 1; idx >= 0; idx--) {
            var depNodes = rootListener[idx].dependingOnNodes();
            moveResizeListenerAfterDependentNodes(rootListener[idx], depNodes)
        }
        Resize.isReordering = !1
    }

    function addResizeListener(resizeListener) {
        a4p.isUndefinedOrNull(listenersIndex[resizeListener.id]) && (listenersIndex[resizeListener.id] = resizeListener, rootListener.push(resizeListener), listenersIndex[resizeListener.name] = resizeListener, orderResizeListeners())
    }

    function removeResizeListener(resizeListener) {
        removeIdFromList(rootListener, resizeListener.id), a4p.isDefined(listenersIndex[resizeListener.id]) && delete listenersIndex[resizeListener.id], a4p.isDefined(listenersIndex[resizeListener.name]) && listenersIndex[resizeListener.name].id == resizeListener.id && delete listenersIndex[resizeListener.name]
    }

    function moveResizeListenerAfterDependentNodes(resizeListener, dependentNodeNames) {
        var selfIdx, nb = rootListener.length, depNb = dependentNodeNames.length;
        for (selfIdx = 0; selfIdx < nb && rootListener[selfIdx].id != resizeListener.id; selfIdx++);
        for (var lastDepIdx = selfIdx, otherIdx = selfIdx + 1; otherIdx < nb; otherIdx++)for (var otherListenerId = rootListener[otherIdx].id, depIdx = 0; depIdx < depNb; depIdx++) {
            var depName = dependentNodeNames[depIdx];
            if (otherListenerId == listenersIndex[depName].id) {
                lastDepIdx = otherIdx;
                break
            }
        }
        lastDepIdx > selfIdx && (rootListener.splice(selfIdx, 1), rootListener.splice(lastDepIdx, 0, resizeListener))
    }

    function setVar(self, name, newValue) {
        self.scope[name] = newValue
    }

    function setCss(self, name, newValue) {
        var oldValue = self.DOMelement.style[name];
        self.element.css(name, newValue), newValue !== oldValue && window.setTimeout(function () {
            self.triggerEvent(EVT_CHANGED, {id: self.id, name: self.name, attr: name, value: newValue})
        }, miapp.BrowserCapabilities.isAndroid ? 200 : 0)
    }

    function nextUid() {
        for (var index = uid.length; index;) {
            index--;
            var i = idNext[uid[index]];
            if (uid[index] = idStr[i], i > 0)return uid.join("")
        }
        return uid.unshift("0"), uid.join("")
    }

    function Resize($rootScope, scope, element, options) {
        rootScope = $rootScope, this.id = nextUid(), this.name = this.id, this.scope = scope, this.timeStamp = 0, this.element = element, this.DOMelement = null, "object" == typeof element ? this.DOMelement = element[0] : this.DOMelement = document.getElementById(element), this.options = {callApply: !1}, this.nodeList = [], this.nodeIndex = {}, this.cssKeys = [], this.scopeVars = [];
        for (var optKey in options)options.hasOwnProperty(optKey) && (this.options[optKey] = options[optKey], "name" == optKey && (this.name = options[optKey]));
        var self = this;
        addResizeListener(this), this.element.bind("$destroy", function () {
            self.destroy()
        }), orientationChangeHandlerStarted || (window.addEventListener(miapp.BrowserCapabilities.RESIZE_EVENT, Resize.handleDocOrientationChange, !1), orientationChangeHandlerStarted = !0, window.setTimeout(function () {
            a4p.safeApply($rootScope, function () {
                Resize.handleDocOrientationChange()
            })
        }, 200))
    }

    var orientationChangeHandlerStarted = !1, orientationChangeEvent = !1, endRefreshResizersTimer = null, endRefreshResizersTimeout = 200, endRefreshResizersCount = 0, rootListener = [], listenersIndex = {}, rootScope = null, attrIndex = {}, refreshWriteQueue = [], uid = ["0", "0", "0"], idStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", idNext = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
        6: 7,
        7: 8,
        8: 9,
        9: 10,
        A: 11,
        B: 12,
        C: 13,
        D: 14,
        E: 15,
        F: 16,
        G: 17,
        H: 18,
        I: 19,
        J: 20,
        K: 21,
        L: 22,
        M: 23,
        N: 24,
        O: 25,
        P: 26,
        Q: 27,
        R: 28,
        S: 29,
        T: 30,
        U: 31,
        V: 32,
        W: 33,
        X: 34,
        Y: 35,
        Z: 0
    }, EVT_BEFORE_WINDOW = "BeforeWindow", EVT_WINDOW = "Window", EVT_CHANGED = "Changed";
    return Resize.prototype.destroy = function () {
        return removeResizeListener(this), !0
    }, Resize.initWidth = 0, Resize.initHeight = 0, Resize.initOrientation = 0, Resize.initPortrait = !1, Resize.initPortrait0Orientation = !1, Resize.resizeOrientation = "landscape", Resize.resizePortrait = !1, Resize.resizeOneColumn = !1, Resize.resizeWidth = 0, Resize.resizeHeight = 0, Resize.isReordering = !1, Resize.prototype.triggerEvent = function (name, evt) {
        var toSenseEventName = "toSense" + name;
        if (a4p.isDefined(this[toSenseEventName]) && null != this[toSenseEventName])try {
            this[toSenseEventName](evt)
        } catch (exception) {
        }
        var onEventName = "on" + name;
        if (a4p.isDefined(this[onEventName]) && null != this[onEventName]) {
            try {
                this[onEventName](evt)
            } catch (exception) {
            }
            return !0
        }
        return !1
    }, Resize.prototype.getPathValue = function (path, key) {
        var value = 0, node;
        try {
            if (a4p.isTrueOrNonEmpty(path)) {
                if (!a4p.isDefined(attrIndex["@" + this.id + "." + path + "." + key]))return node = eval("this.DOMelement." + path), Resize.isReordering && this.addDependentNode(node), value = node[key], a4p.isDefined(listenersIndex[this.name]) && listenersIndex[this.name].id == this.id && (attrIndex["@" + this.name + "." + path + "." + key] = value), attrIndex["@" + this.id + "." + path + "." + key] = value, value;
                value = attrIndex["@" + this.id + "." + path + "." + key]
            } else {
                if (!a4p.isDefined(attrIndex["@" + this.id + "." + key]))return node = this.DOMelement, value = node[key], a4p.isDefined(listenersIndex[this.name]) && listenersIndex[this.name].id == this.id && (attrIndex["@" + this.name + "." + key] = value), attrIndex["@" + this.id + "." + key] = value, value;
                value = attrIndex["@" + this.id + "." + key]
            }
        } catch (e) {
            a4p.ErrorLog.log("a4p.Resize " + this.name, "getPathValue(" + path + ", " + key + ") has invalid parameters : " + e.message)
        }
        return value
    }, Resize.prototype.addDependentNode = function (node) {
        for (var nodeResize = null, i = 0, nb = rootListener.length; i < nb; i++)if (rootListener[i].DOMelement == node) {
            nodeResize = rootListener[i];
            break
        }
        nodeResize && (listenersIndex[nodeResize.name].id == nodeResize.id ? (a4p.isUndefined(this.nodeIndex[nodeResize.name]) && (this.nodeIndex[nodeResize.name] = !0, this.nodeList.push(nodeResize.name)), a4p.isUndefined(this.nodeIndex[nodeResize.id]) && (this.nodeIndex[nodeResize.id] = !0)) : a4p.isUndefined(this.nodeIndex[nodeResize.id]) && (this.nodeIndex[nodeResize.id] = !0, this.nodeList.push(nodeResize.id)))
    }, Resize.prototype.addScopeVar = function (key, fn) {
        this.scope[key] = 0, this.tmpNodeDependent = !1, fn(this.scope, {}), this.scopeVars.push({
            key: key,
            fn: fn,
            nodeDependent: this.tmpNodeDependent
        })
    }, Resize.prototype.addCssKey = function (key, fn) {
        this.tmpNodeDependent = !1, fn(this.scope, {}), this.tmpNodeDependent || a4p.ErrorLog.log("a4p.Resize", "USELESS resize-css-" + key + " option in resizer " + this.name + ' : try to use style="' + key + ':..." or ng-style="{' + key + ":getResize...()+'px'}\" to calculate it asap."), this.cssKeys.push({
            key: key,
            fn: fn,
            nodeDependent: this.tmpNodeDependent
        })
    }, Resize.prototype.dependingOnNodes = function () {
        var key, fn;
        this.nodeList = [], this.nodeIndex = {};
        for (var varIdx = 0, varNb = this.scopeVars.length; varIdx < varNb; varIdx++)key = this.scopeVars[varIdx].key, (fn = this.scopeVars[varIdx].fn)(this.scope, {});
        for (var cssIdx = 0, cssNb = this.cssKeys.length; cssIdx < cssNb; cssIdx++)key = this.cssKeys[cssIdx].key, (fn = this.cssKeys[cssIdx].fn)(this.scope, {});
        return this.nodeList
    }, Resize.prototype.resize = function () {
        return this.scopeVars.length > 0 ? (Resize.refreshAll(), !0) : this.cssKeys.length > 0 && (Resize.refreshAll(), !0)
    }, Resize.refreshAll = a4p.delay(refreshAllTimeout, 10), Resize.windowAll = a4p.delay(windowAllTimeout, 10), Resize.handleDocOrientationChange = function () {
        window.setTimeout(Resize.handleDocOrientationChangeDelay, 750)
    }, Resize.handleDocOrientationChangeDelay = function () {
        var html = document.documentElement;
        if (0 == Resize.initWidth) a4p.InternalLog.log("a4p.Resize", "INIT orientationChange : window.orientation=" + window.orientation + ", window.innerWidth=" + window.innerWidth + ", window.outerWidth=" + window.outerWidth + ", screen.width=" + screen.width + ", html.clientWidth=" + html.clientWidth + ", window.innerHeight=" + window.innerHeight + ", window.outerHeight=" + window.outerHeight + ", screen.height=" + screen.height + ", html.clientHeight=" + html.clientHeight), Resize.initWidth = html.clientWidth, window.innerWidth > 0 && window.innerWidth < Resize.initWidth && (Resize.initWidth = window.innerWidth), Resize.resizeWidth = Resize.initWidth, Resize.initHeight = html.clientHeight, window.innerHeight > 0 && window.innerHeight < Resize.initHeight && (Resize.initHeight = window.innerHeight), Resize.resizeHeight = Resize.initHeight, Resize.initOrientation = window.orientation, a4p.isUndefined(Resize.initOrientation) || 0 == Resize.initOrientation || 180 == Resize.initOrientation ? (Resize.initPortrait = Resize.initWidth < Resize.initHeight, Resize.initPortrait0Orientation = Resize.initPortrait) : (Resize.initPortrait = Resize.initWidth < Resize.initHeight, Resize.initPortrait0Orientation = !Resize.initPortrait), Resize.resizePortrait = Resize.initPortrait, Resize.resizeOrientation = Resize.initPortrait ? "portrait" : "landscape", a4p.InternalLog.log("a4p.Resize", "INIT orientation : initOrientation=" + Resize.initOrientation + ", initWidth=" + Resize.initWidth + ", initHeight=" + Resize.initHeight + ", initPortrait=" + Resize.initPortrait + ", initPortrait0Orientation=" + Resize.initPortrait0Orientation); else {
            a4p.InternalLog.log("a4p.Resize", "orientationChange : window.orientation=" + window.orientation + ", window.innerWidth=" + window.innerWidth + ", window.outerWidth=" + window.outerWidth + ", screen.width=" + screen.width + ", html.clientWidth=" + html.clientWidth + ", window.innerHeight=" + window.innerHeight + ", window.outerHeight=" + window.outerHeight + ", screen.height=" + screen.height + ", html.clientHeight=" + html.clientHeight);
            var initWidth = html.clientWidth;
            window.innerWidth > 0 && window.innerWidth < initWidth && (initWidth = window.innerWidth);
            var initHeight = html.clientHeight;
            window.innerHeight > 0 && window.innerHeight < initHeight && (initHeight = window.innerHeight), a4p.isUndefined(window.orientation) ? (Resize.resizeOrientation = initWidth < initHeight ? "portrait" : "landscape", Resize.resizePortrait = initWidth < initHeight) : initWidth < initHeight && window.innerWidth < window.innerHeight && window.outerWidth < window.outerHeight && html.clientWidth < html.clientHeight ? (Resize.resizeOrientation = "portrait", Resize.resizePortrait = !0) : initWidth >= initHeight && window.innerWidth >= window.innerHeight && window.outerWidth >= window.outerHeight && html.clientWidth >= html.clientHeight ? (Resize.resizeOrientation = "landscape", Resize.resizePortrait = !1) : 0 == window.orientation || 180 == window.orientation ? (Resize.resizeOrientation = Resize.initPortrait0Orientation ? "portrait" : "landscape", Resize.resizePortrait = Resize.initPortrait0Orientation) : (Resize.resizeOrientation = Resize.initPortrait0Orientation ? "landscape" : "portrait", Resize.resizePortrait = !Resize.initPortrait0Orientation), Resize.resizePortrait ? (Resize.resizeWidth = initWidth < initHeight ? initWidth : initHeight, Resize.resizeHeight = initWidth < initHeight ? initHeight : initWidth) : (Resize.resizeWidth = initWidth >= initHeight ? initWidth : initHeight, Resize.resizeHeight = initWidth >= initHeight ? initHeight : initWidth)
        }
        Resize.resizeWidth < 500 ? (Resize.resizeOneColumn = !0, document.body.setAttribute("resizeOneColumn", "1")) : (Resize.resizeOneColumn = !1, document.body.setAttribute("resizeOneColumn", "0")), a4p.InternalLog.log("a4p.Resize", "orientationChange : resizeOrientation=" + Resize.resizeOrientation + ", resizePortrait=" + Resize.resizePortrait + ", resizeOneColumn=" + Resize.resizeOneColumn + ", resizeWidth=" + Resize.resizeWidth + ", resizeHeight=" + Resize.resizeHeight);
        for (var idx = 0, nb = rootListener.length; idx < nb; idx++) {
            var resizer = rootListener[idx];
            resizer.triggerEvent(EVT_BEFORE_WINDOW, {
                id: resizer.id,
                name: resizer.name,
                resizeOrientation: Resize.resizeOrientation,
                resizePortrait: Resize.resizePortrait,
                resizeOneColumn: Resize.resizeOneColumn,
                resizeWidth: Resize.resizeWidth,
                resizeHeight: Resize.resizeHeight
            })
        }
        orientationChangeEvent = !0, Resize.refreshAll()
    }, Resize.declareDirectives = function (directiveModule) {
        angular.forEach([EVT_BEFORE_WINDOW, EVT_WINDOW, EVT_CHANGED], function (name) {
            var directiveName = "resize" + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), eventName = name.charAt(0).toUpperCase() + name.slice(1);
            directiveModule.directive(directiveName, ["$parse", "$rootScope", function ($parse, $rootScope) {
                return function (scope, element, attr) {
                    var resize = element.data("resize");
                    if (a4p.isUndefined(resize)) {
                        resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                        var initFn = $parse(resize.options.init);
                        initFn(scope, {$resize: resize})
                    }
                    var fn = $parse(attr[directiveName]);
                    resize["on" + eventName] = function (event) {
                        resize.options.callApply ? a4p.safeApply(scope, function () {
                                fn(scope, {$event: event})
                            }) : fn(scope, {$event: event})
                    }
                }
            }])
        }), directiveModule.directive("resizeOpts", ["$parse", "$rootScope", function ($parse, $rootScope) {
            return function (scope, element, attr) {
                var resize = element.data("resize");
                if (a4p.isUndefined(resize)) {
                    resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(resize.options.init);
                    initFn(scope, {$resize: resize})
                }
            }
        }]), directiveModule.directive("resizeVars", ["$parse", "$rootScope", function ($parse, $rootScope) {
            return function (scope, element, attr) {
                var resize = element.data("resize");
                if (a4p.isUndefined(resize)) {
                    resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(resize.options.init);
                    initFn(scope, {$resize: resize})
                }
                var vars = $parse(attr.resizeVars)(scope, {});
                for (var varName in vars)if (vars.hasOwnProperty(varName)) {
                    var fn = $parse(vars[varName]);
                    resize.addScopeVar(varName, fn)
                }
            }
        }]), angular.forEach(["top", "left", "width", "height", "lineHeight", "minHeight", "minWidth"], function (name) {
            var directiveName = "resizecss" + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            directiveModule.directive(directiveName, ["$parse", "$rootScope", function ($parse, $rootScope) {
                return function (scope, element, attr) {
                    var resize = element.data("resize");
                    if (a4p.isUndefined(resize)) {
                        resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                        var initFn = $parse(resize.options.init);
                        initFn(scope, {$resize: resize})
                    }
                    var fn = $parse(attr[directiveName]);
                    resize.addCssKey(name, fn)
                }
            }])
        })
    }, Resize.newResize = function ($parse, $rootScope, scope, element, attr) {
        var resize, opts = {};
        if (a4p.isDefined(attr.resizeOpts) && (opts = $parse(attr.resizeOpts)(scope, {})), resize = new a4p.Resize($rootScope, scope, element, opts), element.data("resize", resize), scope.getResizeOrientation = function () {
                return Resize.resizeOrientation
            }, scope.getResizePortrait = function () {
                return Resize.resizePortrait
            }, scope.getResizeOneColumn = function () {
                return Resize.resizeOneColumn
            }, scope.getResizeWidth = function () {
                return Resize.resizeWidth
            }, scope.getResizeHeight = function () {
                return Resize.resizeHeight
            }, scope.getResizeId = function () {
                return resize.id
            }, scope.getResizeName = function () {
                return resize.name
            }, scope.getPathValue = function (path, key) {
                return resize.tmpNodeDependent = !0, resize.getPathValue(path, key)
            }, scope.getResizePathValue = function (name, path, key) {
                resize.tmpNodeDependent = !0;
                var resizer = listenersIndex[name];
                return a4p.isDefined(resizer) ? (Resize.isReordering && resize.addDependentNode(resizer.DOMelement), resizer.getPathValue(path, key)) : 0
            }, scope.resizeRefresh = function () {
                resize.resize()
            }, a4p.isDefined(resize.options.watchRefresh))if ("string" == typeof resize.options.watchRefresh) scope.$watch(resize.options.watchRefresh, function (newValue, oldValue) {
            newValue !== oldValue && resize.resize()
        }); else for (var i = 0, nb = resize.options.watchRefresh.length; i < nb; i++)scope.$watch(resize.options.watchRefresh[i], function (newValue, oldValue) {
            newValue !== oldValue && resize.resize()
        });
        return Resize.refreshAll(), resize
    }, Resize.getResize = function (name) {
        return a4p.isDefined(listenersIndex[name]) ? listenersIndex[name] : null
    }, Resize
}(navigator, window, document);
var a4p;
a4p || (a4p = {}), a4p.Scroll = function (navigator, window, document) {
    function scrollbarH(self) {
        if (!self.hScrollbar)return void(self.hScrollbarWrapper && (miapp.BrowserCapabilities.hasTransform && (self.hScrollbarIndicator.style[miapp.BrowserCapabilities.transform] = ""), self.DOMelement.removeChild(self.hScrollbarWrapper), self.hScrollbarWrapper = null, self.hScrollbarIndicator = null));
        if (!self.hScrollbarWrapper) {
            var bar = document.createElement("div");
            self.options.scrollbarClass ? bar.className = self.options.scrollbarClass + "H" : (bar.style.position = "absolute", bar.style.zIndex = "100", bar.style.height = "7px", bar.style.bottom = "1px", bar.style.left = "2px", bar.style.right = (self.vScrollbar ? "7" : "2") + "px"), bar.style.overflow = "hidden", bar.style.opacity = self.options.hideScrollbar ? "0" : "1", bar.style.pointerEvents = "none", bar.style[miapp.BrowserCapabilities.transitionProperty] = "opacity", bar.style[miapp.BrowserCapabilities.transitionDuration] = self.options.fadeScrollbar ? "350ms" : "0ms", self.DOMelement.appendChild(bar), self.hScrollbarWrapper = bar, bar = document.createElement("div"), self.options.scrollbarClass || (bar.style.position = "absolute", bar.style.zIndex = "100", bar.style.height = "100%", bar.style.backgroundColor = "rgba(0,0,0,0.5)", bar.style.borderWidth = "1px", bar.style.borderStyle = "solid", bar.style.borderColor = "rgba(255,255,255,0.9)", bar.style[miapp.BrowserCapabilities.vendor + "BackgroundClip"] = "padding-box", bar.style.boxSizing = "border-box", bar.style[miapp.BrowserCapabilities.vendor + "BoxSizing"] = "border-box", bar.style.borderRadius = "3px", bar.style[miapp.BrowserCapabilities.vendor + "BorderRadius"] = "3px"), bar.style.pointerEvents = "none", bar.style[miapp.BrowserCapabilities.transitionProperty] = miapp.BrowserCapabilities.cssVendor + "transform", bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = "cubic-bezier(0.33,0.66,0.66,1)", bar.style[miapp.BrowserCapabilities.transitionDuration] = "0ms", bar.style[miapp.BrowserCapabilities.transform] = "translate(0,0)" + miapp.BrowserCapabilities.translateZ, self.options.useTransition && (bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = "cubic-bezier(0.33,0.66,0.66,1)"), self.hScrollbarWrapper.appendChild(bar), self.hScrollbarIndicator = bar
        }
        var margins = 2 + (self.vScrollbar ? 7 : 2);
        self.hScrollbarWrapper.style.width = self.wrapperW - margins + "px", self.hScrollbarIndicatorSize = Math.max(Math.round((self.wrapperW - margins) * self.wrapperW / self.scrollerW), 8), self.hScrollbarIndicator.style.width = self.hScrollbarIndicatorSize + "px", self.hScrollbarMaxScroll = self.wrapperW - margins - self.hScrollbarIndicatorSize, self.hScrollbarProp = self.hScrollbarMaxScroll / self.maxScrollX, scrollbarPosH(self, !0)
    }

    function scrollbarV(self) {
        if (!self.vScrollbar)return void(self.vScrollbarWrapper && (miapp.BrowserCapabilities.hasTransform && (self.vScrollbarIndicator.style[miapp.BrowserCapabilities.transform] = ""), self.DOMelement.removeChild(self.vScrollbarWrapper), self.vScrollbarWrapper = null, self.vScrollbarIndicator = null));
        if (!self.vScrollbarWrapper) {
            var bar = document.createElement("div");
            self.options.scrollbarClass ? bar.className = self.options.scrollbarClass + "V" : (bar.style.position = "absolute", bar.style.zIndex = "100", bar.style.width = "7px", bar.style.right = "1px", bar.style.top = "2px", bar.style.bottom = (self.hScrollbar ? "7" : "2") + "px"), bar.style.overflow = "hidden", bar.style.opacity = self.options.hideScrollbar ? "0" : "1", bar.style.pointerEvents = "none", bar.style[miapp.BrowserCapabilities.transitionProperty] = "opacity", bar.style[miapp.BrowserCapabilities.transitionDuration] = self.options.fadeScrollbar ? "350ms" : "0ms", self.DOMelement.appendChild(bar), self.vScrollbarWrapper = bar, bar = document.createElement("div"), self.options.scrollbarClass || (bar.style.position = "absolute", bar.style.zIndex = "100", bar.style.width = "100%", bar.style.backgroundColor = "rgba(0,0,0,0.5)", bar.style.borderWidth = "1px", bar.style.borderStyle = "solid", bar.style.borderColor = "rgba(255,255,255,0.9)", bar.style[miapp.BrowserCapabilities.vendor + "BackgroundClip"] = "padding-box", bar.style.boxSizing = "border-box", bar.style[miapp.BrowserCapabilities.vendor + "BoxSizing"] = "border-box", bar.style.borderRadius = "3px", bar.style[miapp.BrowserCapabilities.vendor + "BorderRadius"] = "3px"), bar.style.pointerEvents = "none", bar.style[miapp.BrowserCapabilities.transitionProperty] = miapp.BrowserCapabilities.cssVendor + "transform", bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = "cubic-bezier(0.33,0.66,0.66,1)", bar.style[miapp.BrowserCapabilities.transitionDuration] = "0ms", bar.style[miapp.BrowserCapabilities.transform] = "translate(0,0)" + miapp.BrowserCapabilities.translateZ,
            self.options.useTransition && (bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = "cubic-bezier(0.33,0.66,0.66,1)"), self.vScrollbarWrapper.appendChild(bar), self.vScrollbarIndicator = bar
        }
        var margins = 2 + (self.hScrollbar ? 7 : 2);
        self.vScrollbarWrapper.style.height = self.wrapperH - margins + "px", self.vScrollbarIndicatorSize = Math.max(Math.round((self.wrapperH - margins) * self.wrapperH / self.scrollerH), 8), self.vScrollbarIndicator.style.height = self.vScrollbarIndicatorSize + "px", self.vScrollbarMaxScroll = self.wrapperH - margins - self.vScrollbarIndicatorSize, self.vScrollbarProp = self.vScrollbarMaxScroll / self.maxScrollY, scrollbarPosV(self, !0)
    }

    function pos(self, x, y, reset) {
        if (!self.zoomed) {
            var deltaX = self.hScroll ? x - self.x : 0, deltaY = self.vScroll ? y - self.y : 0;
            !reset && self.options.onBeforeScrollMove && (self.options.onBeforeScrollMove.call(self, deltaX, deltaY), x = self.x + deltaX, y = self.y + deltaY), x = self.hScroll ? x : 0, y = self.vScroll ? y : 0, self.options.useTransform ? self.scroller.style[miapp.BrowserCapabilities.transform] = "translate(" + x + "px," + y + "px) scale(" + self.scale + ")" + miapp.BrowserCapabilities.translateZ : (x = Math.round(x), y = Math.round(y), self.scroller.style.left = x + "px", self.scroller.style.top = y + "px"), self.x = x, self.y = y, scrollbarPosH(self), scrollbarPosV(self)
        }
    }

    function scrollbarPosH(self, hidden) {
        var size, pos = self.x;
        self.hScrollbar && (pos = self.hScrollbarProp * pos, pos < 0 ? (self.options.fixedScrollbar || (size = self.hScrollbarIndicatorSize + Math.round(3 * pos), size < 8 && (size = 8), self.hScrollbarIndicator.style.width = size + "px"), pos = 0) : pos > self.hScrollbarMaxScroll && (self.options.fixedScrollbar ? pos = self.hScrollbarMaxScroll : (size = self.hScrollbarIndicatorSize - Math.round(3 * (pos - self.hScrollbarMaxScroll)), size < 8 && (size = 8), self.hScrollbarIndicator.style.width = size + "px", pos = self.hScrollbarMaxScroll + (self.hScrollbarIndicatorSize - size))), self.hScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = "0", self.hScrollbarWrapper.style.opacity = hidden && self.options.hideScrollbar ? "0" : "1", self.hScrollbarIndicator.style[miapp.BrowserCapabilities.transform] = "translate(" + pos + "px,0)" + miapp.BrowserCapabilities.translateZ)
    }

    function scrollbarPosV(self, hidden) {
        var size, pos = self.y;
        self.vScrollbar && (pos = self.vScrollbarProp * pos, pos < 0 ? (self.options.fixedScrollbar || (size = self.vScrollbarIndicatorSize + Math.round(3 * pos), size < 8 && (size = 8), self.vScrollbarIndicator.style.height = size + "px"), pos = 0) : pos > self.vScrollbarMaxScroll && (self.options.fixedScrollbar ? pos = self.vScrollbarMaxScroll : (size = self.vScrollbarIndicatorSize - Math.round(3 * (pos - self.vScrollbarMaxScroll)), size < 8 && (size = 8), self.vScrollbarIndicator.style.height = size + "px", pos = self.vScrollbarMaxScroll + (self.vScrollbarIndicatorSize - size))), self.vScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = "0", self.vScrollbarWrapper.style.opacity = hidden && self.options.hideScrollbar ? "0" : "1", self.vScrollbarIndicator.style[miapp.BrowserCapabilities.transform] = "translate(0," + pos + "px)" + miapp.BrowserCapabilities.translateZ)
    }

    function resetPos(self, time) {
        var resetX = self.x >= 0 ? 0 : self.x < self.maxScrollX ? self.maxScrollX : self.x, resetY = self.y >= -self.options.topOffset || self.maxScrollY > 0 ? -self.options.topOffset : self.y < self.maxScrollY ? self.maxScrollY : self.y;
        return resetX == self.x && resetY == self.y ? (self.moved && (self.moved = !1, self.options.onAfterScrollEnd && self.options.onAfterScrollEnd.call(self)), self.hScrollbar && self.options.hideScrollbar && ("webkit" == miapp.BrowserCapabilities.vendor && (self.hScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = "300ms"), self.hScrollbarWrapper.style.opacity = "0"), void(self.vScrollbar && self.options.hideScrollbar && ("webkit" == miapp.BrowserCapabilities.vendor && (self.vScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = "300ms"), self.vScrollbarWrapper.style.opacity = "0"))) : void self.scrollTo(resetX, resetY, time || 0, !1, !0)
    }

    function transitionEnd(self, e) {
        e.target == self.scroller && (self.bindTransitionEnd && (self.bindTransitionEnd.destroy(), self.bindTransitionEnd = null), startAni(self))
    }

    function startAni(self) {
        if (!self.animating) {
            if (!self.steps.length)return void resetPos(self, 400);
            var startTime = (new Date).getTime(), step = self.steps.shift();
            if (0 == step.deltaX && 0 == step.deltaY && (step.time = 0), self.animating = !0, self.moved = !0, self.options.useTransition)if (transitionTime(self, step.time), pos(self, self.x + step.deltaX, self.y + step.deltaY, step.reset), self.animating = !1, step.time) {
                var handler = function (evt) {
                    transitionEnd(self, evt)
                };
                self.scroller.addEventListener(miapp.BrowserCapabilities.TRNEND_EVENT, handler, !1), self.bindTransitionEnd = {
                    destroy: function () {
                        self.scroller.removeEventListener(miapp.BrowserCapabilities.TRNEND_EVENT, handler, !1)
                    }
                }
            } else resetPos(self, 0); else {
                var animate = function () {
                    var now = (new Date).getTime();
                    if (now >= startTime + step.time || step.deltaX < 5 && step.deltaX > -5 && step.deltaY < 5 && step.deltaY > -5) pos(self, self.x + step.deltaX, self.y + step.deltaY, step.reset), self.animating = !1, startAni(self); else {
                        var ratio = (now - startTime) / step.time, easeOut = Math.sqrt(ratio), deltaX = Math.floor(step.deltaX * easeOut), deltaY = Math.floor(step.deltaY * easeOut);
                        step.deltaX -= deltaX, step.deltaY -= deltaY, pos(self, self.x + deltaX, self.y + deltaY, step.reset), self.animating && (self.aniTime = miapp.BrowserCapabilities.nextFrame(animate))
                    }
                };
                animate()
            }
        }
    }

    function stopAni(self) {
        self.options.useTransition ? self.bindTransitionEnd && (self.bindTransitionEnd.destroy(), self.bindTransitionEnd = null) : self.aniTime && (miapp.BrowserCapabilities.cancelFrame(self.aniTime), self.aniTime = null)
    }

    function stopMomentum(self) {
        if (self.options.momentum > 0) {
            var x, y;
            if (self.options.useTransform) {
                var matrix = getComputedStyle(self.scroller, null)[miapp.BrowserCapabilities.transform].replace(/[^0-9\-.,]/g, "").split(",");
                x = +(matrix[12] || matrix[4] || 0), y = +(matrix[13] || matrix[5] || 0)
            } else x = +getComputedStyle(self.scroller, null).left.replace(/[^0-9-]/g, "") || 0, y = +getComputedStyle(self.scroller, null).top.replace(/[^0-9-]/g, "") || 0;
            if (x != self.x || y != self.y) {
                var deltaX = x - self.x, deltaY = y - self.y;
                stopAni(self), self.steps = [], pos(self, self.x + deltaX, self.y + deltaY), self.options.onAfterScrollEnd && self.options.onAfterScrollEnd.call(self)
            }
        }
    }

    function transitionTime(self, time) {
        time += "ms", self.scroller.style[miapp.BrowserCapabilities.transitionDuration] = time, self.hScrollbar && (self.hScrollbarIndicator.style[miapp.BrowserCapabilities.transitionDuration] = time), self.vScrollbar && (self.vScrollbarIndicator.style[miapp.BrowserCapabilities.transitionDuration] = time)
    }

    function offset(self, el) {
        for (var left = el.offsetLeft, top = el.offsetTop; el = el.offsetParent;)left += el.offsetLeft, top += el.offsetTop;
        return el != self.DOMelement && (left *= self.scale, top *= self.scale), {left: left, top: top}
    }

    function momentumPos(self, deltaX, deltaY, time, momentum) {
        var deceleration = .006, speedX = Math.abs(deltaX) / time, speedY = Math.abs(deltaY) / time;
        if (0 != deltaX) {
            var newDistX = momentum * speedX;
            if (!self.options.virtualLoop) {
                var xMaxDistUpper = -self.x, xMaxDistLower = self.x - self.maxScrollX;
                deltaX > 0 && newDistX > xMaxDistUpper ? newDistX = self.options.bounce ? xMaxDistUpper + (newDistX - xMaxDistUpper) * (newDistX - xMaxDistUpper) / self.wrapperW : xMaxDistUpper : deltaX < 0 && newDistX > xMaxDistLower && (newDistX = self.options.bounce ? xMaxDistLower + (newDistX - xMaxDistLower) * (newDistX - xMaxDistLower) / self.wrapperW : xMaxDistLower)
            }
            deltaX = newDistX * (deltaX < 0 ? -1 : 1)
        }
        if (0 != deltaY) {
            var newDistY = momentum * speedY;
            if (!self.options.virtualLoop) {
                var yMaxDistUpper = -self.y, yMaxDistLower = self.y - self.maxScrollY;
                self.options.bounce ? self.wrapperH : 0;
                deltaY > 0 && newDistY > yMaxDistUpper ? newDistY = self.options.bounce ? yMaxDistUpper + (newDistY - yMaxDistUpper) * (newDistY - yMaxDistUpper) / self.wrapperH : yMaxDistUpper : deltaY < 0 && newDistY > yMaxDistLower && (newDistY = self.options.bounce ? yMaxDistLower + (newDistY - yMaxDistLower) * (newDistY - yMaxDistLower) / self.wrapperH : yMaxDistLower)
            }
            deltaY = newDistY * (deltaY < 0 ? -1 : 1)
        }
        return time = Math.round(Math.max(speedX, speedY) * momentum / deceleration), {
            deltaX: deltaX,
            deltaY: deltaY,
            time: time
        }
    }

    function snapPos(self, x, y) {
        var i, l, page, time, sizeX, sizeY;
        for (page = self.pagesX.length - 1, i = 0, l = self.pagesX.length; i < l; i++)if (x >= self.pagesX[i]) {
            page = i;
            break
        }
        for (page == self.currPageX && page > 0 && self.dirX < 0 && page--, x = self.pagesX[page], sizeX = Math.abs(x - self.pagesX[self.currPageX]), sizeX = sizeX ? Math.abs(self.x - x) / sizeX * 500 : 0, self.currPageX = page, page = self.pagesY.length - 1, i = 0; i < page; i++)if (y >= self.pagesY[i]) {
            page = i;
            break
        }
        return page == self.currPageY && page > 0 && self.dirY < 0 && page--, y = self.pagesY[page], sizeY = Math.abs(y - self.pagesY[self.currPageY]), sizeY = sizeY ? Math.abs(self.y - y) / sizeY * 500 : 0, self.currPageY = page, time = Math.round(Math.max(sizeX, sizeY)) || 200, {
            x: x,
            y: y,
            time: time
        }
    }

    function Scroll(element, options) {
        this.element = element, "object" == typeof element ? this.DOMelement = element[0] : this.DOMelement = document.getElementById(element), this.scroller = this.DOMelement.children[0], this.options = {
            name: "",
            hScroll: !0,
            vScroll: !0,
            x: 0,
            y: 0,
            bounce: !0,
            bounceLock: !1,
            momentum: 100,
            virtualLoop: !1,
            useTransform: !0,
            useTransition: !1,
            topOffset: 0,
            bottomOffset: 0,
            hScrollbar: !0,
            vScrollbar: !0,
            fixedScrollbar: miapp.BrowserCapabilities.isAndroid,
            hideScrollbar: miapp.BrowserCapabilities.isIDevice,
            fadeScrollbar: miapp.BrowserCapabilities.isIDevice && miapp.BrowserCapabilities.has3d,
            scrollbarClass: "",
            zoom: !1,
            zoomMin: 1,
            zoomMax: 4,
            wheelAction: "scroll",
            pageSelector: null,
            snap: !1,
            snapThreshold: 1,
            onRefresh: null,
            onDestroy: null,
            onBeforeScrollMove: null,
            onAfterScrollEnd: null,
            onZoomStart: null,
            onZoom: null,
            onZoomEnd: null
        };
        for (var i in options)options.hasOwnProperty(i) && (this.options[i] = options[i]);
        this.options.useTransform = miapp.BrowserCapabilities.hasTransform && this.options.useTransform, this.options.hScrollbar = this.options.hScroll && this.options.hScrollbar, this.options.vScrollbar = this.options.vScroll && this.options.vScrollbar, "zoom" == this.options.wheelAction && (this.options.zoom = !0), this.options.zoom && !this.options.useTransform && a4p.ErrorLog.log("a4p.sense", "Zoom option impossible because Browser cannot use transform"), this.options.zoom = this.options.useTransform && this.options.zoom, this.options.useTransition = miapp.BrowserCapabilities.hasTransitionEnd && this.options.useTransition, this.options.useTransition && (this.options.fixedScrollbar = !0), this.DOMelement.style.overflow = "hidden", this.DOMelement.style.position = "relative", this.scroller.style[miapp.BrowserCapabilities.transitionProperty] = this.options.useTransform ? miapp.BrowserCapabilities.cssVendor + "transform" : "top left", this.scroller.style[miapp.BrowserCapabilities.transitionDuration] = "0", this.scroller.style[miapp.BrowserCapabilities.transformOrigin] = "0 0", this.options.useTransition && (this.scroller.style[miapp.BrowserCapabilities.transitionTimingFunction] = "cubic-bezier(0.33,0.66,0.66,1)"), this.options.useTransform ? this.scroller.style[miapp.BrowserCapabilities.transform] = "translate(" + this.x + "px," + this.y + "px)" + miapp.BrowserCapabilities.translateZ : (this.scroller.style.position = "absolute", this.scroller.style.top = this.y + "px", this.scroller.style.left = this.x + "px"), this.x = 0, this.y = 0, this.enabled = !0, this.steps = [], this.scale = 1, this.currPageX = 0, this.currPageY = 0, this.pagesX = [], this.pagesY = [], this.aniTime = null, this.bindTransitionEnd = null, this.wheelZoomCount = 0, this.scrollCount = 0, this.scrollHistory = [], this.hScroll = !1, this.vScroll = !1, this.hScrollbar = !1, this.vScrollbar = !1, this.refresh(), this.scrollTo(this.options.x, this.options.y, 0, !1, !0)
    }

    function zoomStart(self, pageX, pageY) {
        self.zoomed = !1, self.originX = Math.abs(pageX - self.wrapperOffsetLeft) - self.x, self.originY = Math.abs(pageY - self.wrapperOffsetTop) - self.y, self.options.onZoomStart && self.options.onZoomStart.call(self, {
            pageX: pageX,
            pageY: pageY
        })
    }

    function scrollStart(self) {
        (self.options.useTransition || self.options.zoom) && transitionTime(self, 0), self.moved = !1, self.animating = !1, self.distX = 0, self.distY = 0, self.absDistX = 0, self.absDistY = 0, self.dirX = 0, self.dirY = 0, self.snapStartX = self.x, self.snapStartY = self.y, stopMomentum(self)
    }

    function zoomMove(self, scale) {
        self.zoomed = !0, scale < self.options.zoomMin ? scale = .5 * self.options.zoomMin * Math.pow(2, scale / self.options.zoomMin) : scale > self.options.zoomMax && (scale = 2 * self.options.zoomMax * Math.pow(.5, self.options.zoomMax / scale)), self.lastScale = scale / self.scale;
        var newX = self.originX - self.originX * self.lastScale + self.x, newY = self.originY - self.originY * self.lastScale + self.y;
        self.scroller.style[miapp.BrowserCapabilities.transform] = "translate(" + newX + "px," + newY + "px) scale(" + scale + ")" + miapp.BrowserCapabilities.translateZ, self.options.onZoom && self.options.onZoom.call(self, {scale: scale})
    }

    function scrollMove(self, deltaX, deltaY) {
        var newX = self.x + deltaX, newY = self.y + deltaY;
        self.options.virtualLoop || ((newX > 0 || newX < self.maxScrollX) && (newX = self.options.bounce ? self.x + deltaX / 2 : newX >= 0 || self.maxScrollX >= 0 ? 0 : self.maxScrollX), (newY > -self.options.topOffset || newY < self.maxScrollY) && (newY = self.options.bounce ? self.y + deltaY / 2 : newY >= -self.options.topOffset || self.maxScrollY >= 0 ? -self.options.topOffset : self.maxScrollY)), self.distX += deltaX, self.distY += deltaY, self.absDistX = Math.abs(self.distX), self.absDistY = Math.abs(self.distY), self.moved = !0, pos(self, newX, newY), self.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0, self.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0
    }

    function zoomEnd(self, scale) {
        scale = Math.max(self.options.zoomMin, scale), scale = Math.min(self.options.zoomMax, scale), self.lastScale = scale / self.scale, self.setScale(scale), self.x = self.originX - self.originX * self.lastScale + self.x, self.y = self.originY - self.originY * self.lastScale + self.y, self.scroller.style[miapp.BrowserCapabilities.transitionDuration] = "200ms", self.scroller.style[miapp.BrowserCapabilities.transform] = "translate(" + self.x + "px," + self.y + "px) scale(" + self.scale + ")" + miapp.BrowserCapabilities.translateZ, self.zoomed = !1, self.refresh(), self.options.onZoomEnd && self.options.onZoomEnd.call(self, {scale: scale})
    }

    function scrollEnd(self, deltaX, deltaY, duration) {
        if (self.options.momentum > 0) {
            var momentum = momentumPos(self, deltaX, deltaY, duration, self.options.momentum);
            deltaX = momentum.deltaX, deltaY = momentum.deltaY, duration = Math.max(momentum.time, 10);
            var newPosX = self.x + deltaX, newPosY = self.y + deltaY;
            if ((self.x > 0 && newPosX > 0 || self.x < self.maxScrollX && newPosX < self.maxScrollX) && (deltaX = 0), (self.y > -self.options.topOffset && newPosY > -self.options.topOffset || self.y < self.maxScrollY && newPosY < self.maxScrollY) && (deltaY = 0), deltaX || deltaY) {
                if (self.options.snap) {
                    if (Math.abs(newPosX - self.snapStartX) < self.options.snapThreshold && Math.abs(newPosY - self.snapStartY) < self.options.snapThreshold)return void self.scrollTo(self.snapStartX, self.snapStartY, 200);
                    var snap = snapPos(self, newPosX, newPosY);
                    newPosX = snap.x, newPosY = snap.y, duration = Math.max(snap.time, duration)
                } else self.options.pageSelector && snapPos(self, newPosX, newPosY);
                return newPosX = Math.round(newPosX), newPosY = Math.round(newPosY), void self.scrollTo(newPosX, newPosY, duration)
            }
        } else {
            var newPos2X = self.x + deltaX, newPos2Y = self.y + deltaY;
            if (self.options.snap) {
                if (Math.abs(newPos2X - self.snapStartX) < self.options.snapThreshold && Math.abs(newPos2Y - self.snapStartY) < self.options.snapThreshold)return void self.scrollTo(self.snapStartX, self.snapStartY, 200);
                var snap2 = snapPos(self, newPos2X, newPos2Y);
                return void self.scrollTo(snap2.x, snap2.y, snap2.time)
            }
            self.options.pageSelector && snapPos(self, newPos2X, newPos2Y)
        }
        resetPos(self, 200)
    }

    return Scroll.prototype.destroy = function () {
        this.scroller.style[miapp.BrowserCapabilities.transform] = "", this.hScrollbar = !1, this.vScrollbar = !1, scrollbarH(this), scrollbarV(this), this.bindTransitionEnd && (this.bindTransitionEnd.destroy(), this.bindTransitionEnd = null), this.options.onDestroy && this.options.onDestroy.call(this)
    }, Scroll.prototype.checkDOMChanges = function () {
        return this.isReady() && (this.wrapperW != (this.DOMelement.offsetWidth || 1) || this.wrapperH != (this.DOMelement.offsetHeight || 1) || this.scrollerW != Math.round(this.scroller.offsetWidth * this.scale) || this.scrollerH != Math.round((this.scroller.offsetHeight - this.options.topOffset - this.options.bottomOffset) * this.scale))
    }, Scroll.prototype.setScale = function (scale) {
        this.scale = scale, this.scale < this.options.zoomMin && (this.scale = this.options.zoomMin)
    }, Scroll.prototype.refresh = function () {
        var wrapperOffset, i, l, els;
        if (this.wrapperW = this.DOMelement.offsetWidth || 1, this.wrapperH = this.DOMelement.offsetHeight || 1, this.scrollerW = Math.round(this.scroller.offsetWidth * this.scale), this.scrollerH = Math.round((this.scroller.offsetHeight - this.options.topOffset - this.options.bottomOffset) * this.scale), this.maxScrollX = this.wrapperW - this.scrollerW, this.maxScrollX > 0 && (this.maxScrollX = 0), this.maxScrollY = this.wrapperH - this.scrollerH - this.options.topOffset - this.options.bottomOffset, this.maxScrollY > 0 && (this.maxScrollY = 0), this.dirX = 0, this.dirY = 0, this.options.onRefresh && this.options.onRefresh.call(this), this.hScroll = this.options.hScroll && this.maxScrollX < 0, this.vScroll = this.options.vScroll && (!this.options.bounceLock && !this.hScroll || this.scrollerH > this.wrapperH), this.hScrollbar = this.hScroll && this.options.hScrollbar, this.vScrollbar = this.vScroll && this.options.vScrollbar && this.scrollerH > this.wrapperH, wrapperOffset = offset(this, this.DOMelement), this.wrapperOffsetLeft = wrapperOffset.left, this.wrapperOffsetTop = wrapperOffset.top, this.options.pageSelector)for (this.pagesX = [], this.pagesY = [], els = this.scroller.querySelectorAll(this.options.pageSelector), i = 0, l = els.length; i < l; i++) {
            var posLT = offset(this, els[i]);
            posLT.left -= this.wrapperOffsetLeft, posLT.top -= this.wrapperOffsetTop, this.pagesX[i] = -posLT.left < this.maxScrollX ? this.maxScrollX : -posLT.left * this.scale, this.pagesY[i] = -posLT.top < this.maxScrollY ? this.maxScrollY : -posLT.top * this.scale
        } else if (this.options.snap) {
            var pos = 0, page = 0;
            for (this.pagesX = []; pos >= this.maxScrollX;)this.pagesX[page] = pos, pos -= this.wrapperW, page++;
            for (this.maxScrollX % this.wrapperW && (this.pagesX[this.pagesX.length] = this.maxScrollX - this.pagesX[this.pagesX.length - 1] + this.pagesX[this.pagesX.length - 1]), pos = 0, page = 0, this.pagesY = []; pos >= this.maxScrollY;)this.pagesY[page] = pos, pos -= this.wrapperH, page++;
            this.maxScrollY % this.wrapperH && (this.pagesY[this.pagesY.length] = this.maxScrollY - this.pagesY[this.pagesY.length - 1] + this.pagesY[this.pagesY.length - 1])
        }
        scrollbarH(this), scrollbarV(this), this.zoomed || (this.scroller.style[miapp.BrowserCapabilities.transitionDuration] = "0", resetPos(this, 400))
    }, Scroll.prototype.scrollTo = function (x, y, time, relative, reset) {
        this.stop(), relative && (x = this.x - x, y = this.y - y);
        var deltaX = x - this.x, deltaY = y - this.y;
        (deltaX || deltaY) && (this.steps.push({
            deltaX: deltaX,
            deltaY: deltaY,
            time: time || 0,
            reset: reset
        }), startAni(this))
    }, Scroll.prototype.scrollToElement = function (el, time) {
        var pos;
        el = el.nodeType ? el : this.scroller.querySelector(el), el && (pos = offset(this, el), pos.left -= this.wrapperOffsetLeft, pos.top -= this.wrapperOffsetTop, pos.left = -pos.left > 0 ? 0 : -pos.left < this.maxScrollX ? this.maxScrollX : pos.left, pos.top = -pos.top > -this.options.topOffset ? -this.options.topOffset : -pos.top < this.maxScrollY ? this.maxScrollY : pos.top, time = a4p.isUndefined(time) ? Math.max(2 * Math.abs(pos.left), 2 * Math.abs(pos.top)) : time, this.scrollTo(-pos.left, -pos.top, time))
    }, Scroll.prototype.scrollToPage = function (pageX, pageY, time) {
        var x, y;
        time = a4p.isUndefined(time) ? 400 : time, this.options.pageSelector ? (pageX = "next" == pageX ? this.currPageX + 1 : "prev" == pageX ? this.currPageX - 1 : pageX, pageY = "next" == pageY ? this.currPageY + 1 : "prev" == pageY ? this.currPageY - 1 : pageY, pageX = pageX < 0 ? 0 : pageX > this.pagesX.length - 1 ? this.pagesX.length - 1 : pageX, pageY = pageY < 0 ? 0 : pageY > this.pagesY.length - 1 ? this.pagesY.length - 1 : pageY, this.currPageX = pageX, this.currPageY = pageY, x = this.pagesX[pageX], y = this.pagesY[pageY]) : (x = -this.wrapperW * pageX, y = -this.wrapperH * pageY, x < this.maxScrollX && (x = this.maxScrollX), y < this.maxScrollY && (y = this.maxScrollY)), this.scrollTo(x, y, time)
    }, Scroll.prototype.hasAttainedSideLeft = function () {
        return !this.hScroll || this.x >= 0
    }, Scroll.prototype.hasAttainedSideRight = function () {
        return !this.hScroll || this.x <= this.maxScrollX
    }, Scroll.prototype.hasAttainedSideTop = function () {
        return !this.vScroll || this.y >= -this.options.topOffset
    }, Scroll.prototype.hasAttainedSideBottom = function () {
        return !this.vScroll || this.y <= this.maxScrollY
    }, Scroll.prototype.disable = function () {
        this.stop(), resetPos(this, 0), this.enabled = !1
    }, Scroll.prototype.enable = function () {
        this.enabled = !0
    }, Scroll.prototype.stop = function () {
        stopMomentum(this), stopAni(this), this.steps = [], this.moved = !1, this.animating = !1
    }, Scroll.prototype.zoom = function (x, y, scale, time) {
        var relScale = scale / this.scale;
        this.options.useTransform && (this.zoomed = !0, time = a4p.isUndefined(time) ? 200 : time, x = x - this.wrapperOffsetLeft - this.x, y = y - this.wrapperOffsetTop - this.y, this.x = this.x * relScale, this.y = this.y * relScale, this.setScale(scale), this.refresh(), this.x = this.x > 0 ? 0 : this.x < this.maxScrollX ? this.maxScrollX : this.x, this.y = this.y > -this.options.topOffset ? -this.options.topOffset : this.y < this.maxScrollY ? this.maxScrollY : this.y, this.scroller.style[miapp.BrowserCapabilities.transitionDuration] = time + "ms", this.scroller.style[miapp.BrowserCapabilities.transform] = "translate(" + this.x + "px," + this.y + "px) scale(" + scale + ")" + miapp.BrowserCapabilities.translateZ, this.zoomed = !1)
    }, Scroll.prototype.isReady = function () {
        return !this.moved && !this.zoomed && !this.animating
    }, Scroll.prototype.onZoomStart = function (pageX, pageY) {
        return !!this.enabled && (this.checkDOMChanges() && this.refresh(), !!this.options.zoom && (zoomStart(this, pageX, pageY), !0))
    }, Scroll.prototype.onScrollStart = function (pageX, pageY, timeStamp) {
        return !!this.enabled && (this.checkDOMChanges() && this.refresh(), this.options.zoom && zoomStart(this, pageX, pageY), scrollStart(this), this.scrollCount++, this.scrollHistory = [{
                deltaX: 0,
                deltaY: 0,
                timeStamp: timeStamp
            }], this.startX = this.x, this.startY = this.y, this.pointX = pageX, this.pointY = pageY, this.startTime = timeStamp, !0)
    }, Scroll.prototype.onZoomMove = function (scale) {
        return !!this.enabled && (!(!this.options.zoom || 1 == scale) && (zoomMove(this, scale), !0))
    }, Scroll.prototype.onScrollMove = function (pageX, pageY, timeStamp, scale) {
        if (!this.enabled)return !1;
        var deltaX = pageX - this.pointX, deltaY = pageY - this.pointY;
        return this.options.zoom && 1 != scale ? (zoomMove(this, scale), !0) : (0 == deltaX && 0 == deltaY || (scrollMove(this, deltaX, deltaY), this.scrollCount++, this.scrollHistory.push({
                deltaX: deltaX,
                deltaY: deltaY,
                timeStamp: timeStamp
            })), this.pointX = pageX, this.pointY = pageY, timeStamp - this.startTime > 300 && (this.startTime = timeStamp, this.startX = this.x, this.startY = this.y), !0)
    }, Scroll.prototype.onZoomEnd = function (scale) {
        return !!this.enabled && (!!this.zoomed && (zoomEnd(this, scale), !0))
    }, Scroll.prototype.onScrollEnd = function (pageX, pageY, timeStamp, scale) {
        if (!this.enabled)return !1;
        if (this.zoomed)return zoomEnd(this, scale), !0;
        if (!this.moved)return resetPos(this, 400), !0;
        var i = this.scrollHistory.length - 1, lastMove = this.scrollHistory[i], deltaX = lastMove.deltaX, deltaY = lastMove.deltaY, duration = 35;
        for (i--; i >= 0; i--) {
            var move = this.scrollHistory[i];
            if (!(lastMove.timeStamp - move.timeStamp < 300))break;
            deltaX += move.deltaX, deltaY += move.deltaY, lastMove.timeStamp - move.timeStamp >= duration && (duration = lastMove.timeStamp - move.timeStamp)
        }
        return this.scrollCount = 0, this.scrollHistory = [], scrollEnd(this, deltaX, deltaY, duration), !0
    }, Scroll.prototype.wheel = function (e, cumulatedWheelDeltaX, cumulatedWheelDeltaY) {
        var timeStamp = e.timeStamp, deltaX = 0, deltaY = 0;
        if (a4p.isDefined(cumulatedWheelDeltaX) && 0 != cumulatedWheelDeltaX || a4p.isDefined(cumulatedWheelDeltaY) && 0 != cumulatedWheelDeltaY ? (deltaX = cumulatedWheelDeltaX / 12, deltaY = cumulatedWheelDeltaY / 12) : "wheelDeltaX" in e && (0 != e.wheelDeltaX || 0 != e.wheelDeltaY) ? (deltaX = e.wheelDeltaX / 12, deltaY = e.wheelDeltaY / 12) : "wheelDelta" in e && 0 != e.wheelDelta ? deltaX = deltaY = e.wheelDelta / 12 : "detail" in e && 0 != e.detail && (deltaX = deltaY = 3 * -e.detail), 0 == deltaX && 0 == deltaY)return !1;
        this.checkDOMChanges() && this.refresh();
        var self = this;
        if ("zoom" == this.options.wheelAction) {
            var deltaScale = this.scale * Math.pow(2, 1 / 3 * (deltaY ? deltaY / Math.abs(deltaY) : 0));
            return deltaScale < this.options.zoomMin && (deltaScale = this.options.zoomMin), deltaScale > this.options.zoomMax && (deltaScale = this.options.zoomMax), deltaScale != this.scale && (!this.wheelZoomCount && this.options.onZoomStart && this.options.onZoomStart.call(this, e), this.wheelZoomCount++, this.zoom(e.pageX, e.pageY, deltaScale, 400), window.setTimeout(function () {
                self.wheelZoomCount--, !self.wheelZoomCount && self.options.onZoomEnd && self.options.onZoomEnd.call(self, e)
            }, 400)), !0
        }
        return 0 == this.scrollCount && (scrollStart(this), this.scrollCount++, this.scrollHistory = [{
            deltaX: 0,
            deltaY: 0,
            timeStamp: timeStamp
        }]), scrollMove(this, deltaX, deltaY), this.scrollCount++, this.scrollHistory.push({
            deltaX: deltaX,
            deltaY: deltaY,
            timeStamp: timeStamp
        }), window.setTimeout(function () {
            if (self.scrollCount--, 1 == self.scrollCount) {
                var i = self.scrollHistory.length - 1, lastMove = self.scrollHistory[i], deltaX = lastMove.deltaX, deltaY = lastMove.deltaY, duration = 35;
                for (i--; i >= 0; i--) {
                    var move = self.scrollHistory[i];
                    if (!(lastMove.timeStamp - move.timeStamp < 300))break;
                    deltaX += move.deltaX, deltaY += move.deltaY, lastMove.timeStamp - move.timeStamp >= duration && (duration = lastMove.timeStamp - move.timeStamp)
                }
                self.scrollCount = 0, self.scrollHistory = [], scrollEnd(self, deltaX, deltaY, duration)
            }
        }, 35), !0
    }, Scroll
}(navigator, window, document), a4p.Sense = function (navigator, window, document) {
    function nextUid() {
        for (var index = uid.length; index;) {
            index--;
            var i = idNext[uid[index]];
            if (uid[index] = idStr[i], i > 0)return uid.join("")
        }
        return uid.unshift("0"), uid.join("")
    }

    function handleTouchStart(sense, evt) {
        return sense.timeStamp = (new Date).getTime(), sense.inTouchMove = !1, sense.evtHandled = !1, sense.evtTriggered = !1, sense.fingers.length <= 0 && bindOnTouchOther(sense), onTouchStart[sense.state].call(sense, evt), sense.evtTriggered && (sense.options.defaultAction || preventDefault(evt), sense.options.bubble || stopPropagation(evt)), !sense.options.defaultAction
    }

    function handleTouchMove(sense, evt) {
        var now = (new Date).getTime();
        return now - sense.timeStamp < 17 || (sense.timeStamp = now, sense.inTouchMove || (sense.inTouchMove = !0), sense.evtHandled = !1, sense.evtTriggered = !1, onTouchMove[sense.state].call(sense, evt), sense.evtTriggered && (sense.options.defaultAction || preventDefault(evt), sense.options.bubble || stopPropagation(evt), unbindAllOtherExceptFor(sense)), !sense.options.defaultAction)
    }

    function handleTouchEnd(sense, evt) {
        return sense.timeStamp = (new Date).getTime(), sense.inTouchMove = !1, sense.evtHandled = !1, sense.evtTriggered = !1, onTouchEnd[sense.state].call(sense, evt), sense.evtTriggered && (sense.options.defaultAction || preventDefault(evt), sense.options.bubble || stopPropagation(evt), unbindAllOtherExceptFor(sense)), sense.fingers.length <= 0 && unbindOther(sense), !sense.options.defaultAction
    }

    function handleTouchCancel(sense, evt) {
        return sense.timeStamp = (new Date).getTime(), sense.inTouchMove = !1, sense.evtHandled = !1, sense.evtTriggered = !1, onTouchCancel[sense.state].call(sense, evt), sense.evtTriggered && (sense.options.defaultAction || preventDefault(evt), sense.options.bubble || stopPropagation(evt), unbindAllOtherExceptFor(sense)), sense.fingers.length <= 0 && unbindOther(sense), !sense.options.defaultAction
    }

    function handleMouseDown(sense, evt) {
        return sense.timeStamp = (new Date).getTime(), sense.inMouseMove = !1, sense.evtHandled = !1, sense.evtTriggered = !1, sense.fingers.length <= 0 && bindOnMouseOther(sense), onMouseDown[sense.state].call(sense, evt), sense.evtTriggered && (sense.options.defaultAction || preventDefault(evt), sense.options.bubble || stopPropagation(evt)), !sense.options.defaultAction
    }

    function handleMouseMove(sense, evt) {
        var now = (new Date).getTime();
        return now - sense.timeStamp < 17 || (sense.timeStamp = now, sense.inMouseMove || (sense.inMouseMove = !0), sense.evtHandled = !1, sense.evtTriggered = !1, onMouseMove[sense.state].call(sense, evt), sense.evtTriggered && (sense.options.defaultAction || preventDefault(evt), sense.options.bubble || stopPropagation(evt), unbindAllOtherExceptFor(sense)), !sense.options.defaultAction)
    }

    function handleMouseUp(sense, evt) {
        return sense.timeStamp = (new Date).getTime(), sense.inMouseMove = !1, sense.evtHandled = !1, sense.evtTriggered = !1, onMouseUp[sense.state].call(sense, evt), sense.evtTriggered && (sense.options.defaultAction || preventDefault(evt), sense.options.bubble || stopPropagation(evt), unbindAllOtherExceptFor(sense)), sense.fingers.length <= 0 && unbindOther(sense), !sense.options.defaultAction
    }

    function handleWheel(sense, evt) {
        "wheelDeltaX" in evt && (0 != evt.wheelDeltaX || 0 != evt.wheelDeltaY) ? (sense.wheelDeltaX += evt.wheelDeltaX, sense.wheelDeltaY += evt.wheelDeltaY) : "wheelDelta" in evt && 0 != evt.wheelDelta ? (sense.wheelDeltaX += evt.wheelDelta, sense.wheelDeltaY += evt.wheelDelta) : "detail" in evt && 0 != evt.detail && (sense.wheelDeltaX += 36 * -evt.detail, sense.wheelDeltaY += 36 * -evt.detail);
        var now = (new Date).getTime();
        return now - sense.timeStamp < 17 ? !sense.options.defaultAction : (sense.scroll && sense.scroll.wheel(evt, sense.wheelDeltaX, sense.wheelDeltaY), sense.wheelDeltaX = 0, sense.wheelDeltaY = 0, sense.timeStamp = now, !sense.options.defaultAction)
    }

    function handleDocMouseMove(evt) {
        var now = (new Date).getTime();
        if (now - timeStampDocMouseMove < 17)return !0;
        timeStampDocMouseMove = now;
        var i, nb, handlers = [];
        for (i = 0, nb = mouseListeners.length; i < nb; i++)handlers.push(mouseListeners[i]);
        var noBubble = !1;
        for (i = 0, nb = handlers.length; i < nb && (a4p.isDefined(handlers[i]) && (handleMouseMove(handlers[i], evt), noBubble = handlers[i].evtTriggered && !handlers[i].options.bubble), !noBubble); i++);
        return !0
    }

    function handleDocMouseUp(evt) {
        var i, nb, handlers = [];
        for (i = 0, nb = mouseListeners.length; i < nb; i++)handlers.push(mouseListeners[i]);
        var noBubble = !1;
        for (i = 0, nb = handlers.length; i < nb && (a4p.isDefined(handlers[i]) && (handleMouseUp(handlers[i], evt), noBubble = handlers[i].evtTriggered && !handlers[i].options.bubble), !noBubble); i++);
        return !0
    }

    function bindOnStart(sense, newScroll) {
        miapp.BrowserCapabilities.hasTouch ? sense.bindTouchStart || (sense.bindTouchStart = bindEvent(sense.DOMelement, "touchstart", function (evt) {
                handleTouchStart(sense, evt)
            })) : (sense.bindMouseDown || (sense.bindMouseDown = bindEvent(sense.DOMelement, "mousedown", function (evt) {
                handleMouseDown(sense, evt)
            })), newScroll && (sense.bindMouseWheel || (sense.bindMouseWheel = bindEvent(sense.DOMelement, "mousewheel", function (evt) {
                handleWheel(sense, evt)
            })), sense.bindDomMouseWheel || (sense.bindDomMouseWheel = bindEvent(sense.DOMelement, "DOMMouseScroll", function (evt) {
                handleWheel(sense, evt)
            }))))
    }

    function unbindStart(sense) {
        sense.bindDomMouseWheel && (sense.bindDomMouseWheel.destroy(), sense.bindDomMouseWheel = !1), sense.bindMouseWheel && (sense.bindMouseWheel.destroy(), sense.bindMouseWheel = !1), miapp.BrowserCapabilities.hasTouch ? sense.bindTouchStart && (sense.bindTouchStart.destroy(), sense.bindTouchStart = !1) : sense.bindMouseDown && (sense.bindMouseDown.destroy(), sense.bindMouseDown = !1)
    }

    function bindOnTouchOther(sense) {
        if (miapp.BrowserCapabilities.hasTouch && sense.bindTouchStart) {
            for (var found = !1, i = touchListeners.length - 1; i >= 0; i--)if (touchListeners[i].id == sense.id) {
                found = !0;
                break
            }
            found || touchListeners.push(sense), sense.bindTouchMove || (sense.bindTouchMove = bindEvent(sense.DOMelement, "touchmove", function (evt) {
                handleTouchMove(sense, evt)
            })), sense.bindTouchEnd || (sense.bindTouchEnd = bindEvent(sense.DOMelement, "touchend", function (evt) {
                handleTouchEnd(sense, evt)
            })), sense.bindTouchCancel || (sense.bindTouchCancel = bindEvent(sense.DOMelement, "touchcancel", function (evt) {
                handleTouchCancel(sense, evt)
            }))
        }
    }

    function bindOnMouseOther(sense) {
        if (!miapp.BrowserCapabilities.hasTouch && sense.bindMouseDown && !sense.bindMouseOther) {
            for (var found = !1, i = mouseListeners.length - 1; i >= 0; i--)if (mouseListeners[i].id == sense.id) {
                found = !0;
                break
            }
            found || mouseListeners.push(sense), sense.bindMouseOther = !0
        }
    }

    function unbindAllOtherExceptFor(sense) {
        var i;
        if (miapp.BrowserCapabilities.hasTouch)for (i = touchListeners.length - 1; i >= 0 && touchListeners[i].id != sense.id; i--)touchListeners[i].resetState(); else for (i = mouseListeners.length - 1; i >= 0 && mouseListeners[i].id != sense.id; i--)mouseListeners[i].resetState()
    }

    function unbindOther(sense) {
        var i;
        if (miapp.BrowserCapabilities.hasTouch) {
            for (i = touchListeners.length - 1; i >= 0; i--)if (touchListeners[i].id == sense.id) {
                touchListeners.splice(i, 1);
                break
            }
            sense.bindTouchMove && (sense.bindTouchMove.destroy(), sense.bindTouchMove = !1), sense.bindTouchEnd && (sense.bindTouchEnd.destroy(), sense.bindTouchEnd = !1), sense.bindTouchCancel && (sense.bindTouchCancel.destroy(), sense.bindTouchCancel = !1)
        } else if (sense.bindMouseOther) {
            for (i = mouseListeners.length - 1; i >= 0; i--)if (mouseListeners[i].id == sense.id) {
                mouseListeners.splice(i, 1);
                break
            }
            sense.bindMouseOther = !1
        }
    }

    function bindEvent(element, eventName, callback) {
        return element.addEventListener ? (element.addEventListener(eventName, callback, !1), {
                destroy: function () {
                    element.removeEventListener(eventName, callback, !1)
                }
            }) : !!element.attachEvent && (element.attachEvent("on" + eventName, callback),
                {
                    destroy: function () {
                        element.detachEvent("on" + eventName, callback)
                    }
                })
    }

    function preventDefault(event) {
        event = event || window.event, event.preventDefault ? event.preventDefault() : event.returnValue = !1
    }

    function stopPropagation(event) {
        event = event || window.event, event.stopPropagation ? event.stopPropagation() : event.cancelBubble = !0
    }

    function eventNameWithoutPrefixNorNbFinger(eventName) {
        "Short" == eventName.substr(0, 5) ? eventName = eventName.substr(5) : "Long" == eventName.substr(0, 4) && (eventName = eventName.substr(4));
        var lg = eventName.length;
        return lg > 0 && ("1" == eventName.charAt(lg - 1) || "2" == eventName.charAt(lg - 1) || "3" == eventName.charAt(lg - 1) || "4" == eventName.charAt(lg - 1) || "5" == eventName.charAt(lg - 1)) ? eventName.substr(0, lg - 1) : eventName
    }

    function clearFingers(sense) {
        sense.fingers = [], sense.side = "", sense.scale = 1, sense.rotate = 0, sense.moves = [], sense.timeStamp = (new Date).getTime(), sense.wheelDeltaX = 0, sense.wheelDeltaY = 0, sense.sourcePoints = [], sense.startPageX = 0, sense.startPageY = 0, sense.startClientX = 0, sense.startClientY = 0, sense.pageX = 0, sense.pageY = 0, sense.clientX = 0, sense.clientY = 0, sense.deltaX = 0, sense.deltaY = 0, sense.deltaFingerX = 0, sense.deltaFingerY = 0, delete sense.finger1, delete sense.finger2
    }

    function addTouchFinger(sense, id, finger) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id)return void(i > 1 ? sense.fingers[i] = {
                    id: id,
                    target: finger.target,
                    pageX: finger.pageX,
                    pageY: finger.pageY,
                    clientX: finger.clientX,
                    clientY: finger.clientY,
                    deltaFingerX: finger.clientX - sense.clientX,
                    deltaFingerY: finger.clientY - sense.clientY
                } : 1 == i ? (sense.deltaFingerX = finger.clientX - sense.clientX, sense.deltaFingerY = finger.clientY - sense.clientY, sense.fingers[1] = {
                        id: id,
                        target: finger.target,
                        pageX: finger.pageX,
                        pageY: finger.pageY,
                        clientX: finger.clientX,
                        clientY: finger.clientY,
                        deltaFingerX: sense.deltaFingerX,
                        deltaFingerY: sense.deltaFingerY
                    }, sense.finger2 = sense.fingers[1]) : (sense.startPageX = finger.pageX, sense.startPageY = finger.pageY, sense.startClientX = finger.clientX, sense.startClientY = finger.clientY, sense.pageX = finger.pageX, sense.pageY = finger.pageY, sense.clientX = finger.clientX, sense.clientY = finger.clientY, sense.deltaFingerX = 0, sense.deltaFingerY = 0, sense.fingers[0] = {
                        id: id,
                        target: finger.target,
                        pageX: finger.pageX,
                        pageY: finger.pageY,
                        clientX: finger.clientX,
                        clientY: finger.clientY,
                        deltaFingerX: 0,
                        deltaFingerY: 0
                    }, sense.finger1 = sense.fingers[0]))
        }
        sense.fingers.length > 1 ? sense.fingers.push({
                id: id,
                target: finger.target,
                pageX: finger.pageX,
                pageY: finger.pageY,
                clientX: finger.clientX,
                clientY: finger.clientY,
                deltaFingerX: finger.clientX - sense.clientX,
                deltaFingerY: finger.clientY - sense.clientY
            }) : 1 == sense.fingers.length ? (sense.deltaFingerX = finger.clientX - sense.clientX, sense.deltaFingerY = finger.clientY - sense.clientY, sense.fingers.push({
                    id: id,
                    target: finger.target,
                    pageX: finger.pageX,
                    pageY: finger.pageY,
                    clientX: finger.clientX,
                    clientY: finger.clientY,
                    deltaFingerX: sense.deltaFingerX,
                    deltaFingerY: sense.deltaFingerY
                }), sense.finger2 = sense.fingers[1]) : (sense.startPageX = finger.pageX, sense.startPageY = finger.pageY, sense.startClientX = finger.clientX, sense.startClientY = finger.clientY, sense.pageX = finger.pageX, sense.pageY = finger.pageY, sense.clientX = finger.clientX, sense.clientY = finger.clientY, sense.deltaFingerX = 0, sense.deltaFingerY = 0, sense.fingers.push({
                    id: id,
                    target: finger.target,
                    pageX: finger.pageX,
                    pageY: finger.pageY,
                    clientX: finger.clientX,
                    clientY: finger.clientY,
                    deltaFingerX: 0,
                    deltaFingerY: 0
                }), sense.finger1 = sense.fingers[0])
    }

    function addMouseFinger(sense, id, evt) {
        for (var pageX = getMousePageX(evt), pageY = getMousePageY(evt), i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id)return void(i > 1 ? sense.fingers[i] = {
                    id: id,
                    target: evt.target,
                    pageX: pageX,
                    pageY: pageY,
                    clientX: evt.clientX,
                    clientY: evt.clientY,
                    deltaFingerX: evt.clientX - sense.clientX,
                    deltaFingerY: evt.clientY - sense.clientY
                } : 1 == i ? (sense.deltaFingerX = evt.clientX - sense.clientX, sense.deltaFingerY = evt.clientY - sense.clientY, sense.fingers[1] = {
                        id: id,
                        target: evt.target,
                        pageX: pageX,
                        pageY: pageY,
                        clientX: evt.clientX,
                        clientY: evt.clientY,
                        deltaFingerX: sense.deltaFingerX,
                        deltaFingerY: sense.deltaFingerY
                    }, sense.finger2 = sense.fingers[1]) : (sense.startPageX = pageX, sense.startPageY = pageY, sense.startClientX = evt.clientX, sense.startClientY = evt.clientY, sense.pageX = pageX, sense.pageY = pageY, sense.clientX = evt.clientX, sense.clientY = evt.clientY, sense.deltaFingerX = 0, sense.deltaFingerY = 0, sense.fingers[0] = {
                        id: id,
                        target: evt.target,
                        pageX: pageX,
                        pageY: pageY,
                        clientX: evt.clientX,
                        clientY: evt.clientY,
                        deltaFingerX: 0,
                        deltaFingerY: 0
                    }, sense.finger1 = sense.fingers[0]))
        }
        sense.fingers.length > 1 ? sense.fingers.push({
                id: id,
                target: evt.target,
                pageX: pageX,
                pageY: pageY,
                clientX: evt.clientX,
                clientY: evt.clientY,
                deltaFingerX: evt.clientX - sense.clientX,
                deltaFingerY: evt.clientY - sense.clientY
            }) : 1 == sense.fingers.length ? (sense.deltaFingerX = evt.clientX - sense.clientX, sense.deltaFingerY = evt.clientY - sense.clientY, sense.fingers.push({
                    id: id,
                    target: evt.target,
                    pageX: pageX,
                    pageY: pageY,
                    clientX: evt.clientX,
                    clientY: evt.clientY,
                    deltaFingerX: sense.deltaFingerX,
                    deltaFingerY: sense.deltaFingerY
                }), sense.finger2 = sense.fingers[1]) : (sense.startPageX = pageX, sense.startPageY = pageY, sense.startClientX = evt.clientX, sense.startClientY = evt.clientY, sense.pageX = pageX, sense.pageY = pageY, sense.clientX = evt.clientX, sense.clientY = evt.clientY, sense.deltaFingerX = 0, sense.deltaFingerY = 0, sense.fingers.push({
                    id: id,
                    target: evt.target,
                    pageX: pageX,
                    pageY: pageY,
                    clientX: evt.clientX,
                    clientY: evt.clientY,
                    deltaFingerX: 0,
                    deltaFingerY: 0
                }), sense.finger1 = sense.fingers[0])
    }

    function setTouchFinger(sense, id, finger) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id)return item.pageX = finger.pageX, item.pageY = finger.pageY, item.clientX = finger.clientX, item.clientY = finger.clientY, 0 == i ? (sense.pageX = item.pageX - item.deltaFingerX, sense.pageY = item.pageY - item.deltaFingerY, sense.clientX = item.clientX - item.deltaFingerX, sense.clientY = item.clientY - item.deltaFingerY, sense.fingers.length > 1 && (sense.deltaFingerX = sense.finger2.clientX - sense.clientX, sense.deltaFingerY = sense.finger2.clientY - sense.clientY)) : 1 == i && (sense.deltaFingerX = item.clientX - sense.clientX, sense.deltaFingerY = item.clientY - sense.clientY), !0
        }
        return !1
    }

    function setMouseFinger(sense, id, evt) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id)return item.pageX = getMousePageX(evt), item.pageY = getMousePageY(evt), item.clientX = evt.clientX, item.clientY = evt.clientY, 0 == i ? (sense.pageX = item.pageX - item.deltaFingerX, sense.pageY = item.pageY - item.deltaFingerY, sense.clientX = item.clientX - item.deltaFingerX, sense.clientY = item.clientY - item.deltaFingerY, sense.fingers.length > 1 && (sense.deltaFingerX = sense.finger2.clientX - sense.clientX, sense.deltaFingerY = sense.finger2.clientY - sense.clientY)) : 1 == i && (sense.deltaFingerX = item.clientX - sense.clientX, sense.deltaFingerY = item.clientY - sense.clientY), !0
        }
        return !1
    }

    function removeFinger(sense, id) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id)return sense.fingers.splice(i, 1), 0 == i ? sense.fingers.length > 0 && (sense.finger1 = sense.fingers[0], sense.pageX = sense.finger1.pageX - sense.finger1.deltaFingerX, sense.pageY = sense.finger1.pageY - sense.finger1.deltaFingerY, sense.clientX = sense.finger1.clientX - sense.finger1.deltaFingerX, sense.clientY = sense.finger1.clientY - sense.finger1.deltaFingerY, sense.fingers.length > 1 && (sense.finger2 = sense.fingers[1], sense.deltaFingerX = sense.finger2.clientX - sense.clientX, sense.deltaFingerY = sense.finger2.clientY - sense.clientY)) : 1 == i && sense.fingers.length > 1 && (sense.finger2 = sense.fingers[1], sense.deltaFingerX = sense.finger2.clientX - sense.clientX, sense.deltaFingerY = sense.finger2.clientY - sense.clientY), !0
        }
        return !1
    }

    function hasFinger(sense, id) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id)return !0
        }
        return !1
    }

    function addSourcePoint(sense) {
        sense.sourcePoints.push({x: sense.clientX, y: sense.clientY, t: (new Date).getTime()})
    }

    function add1FingerMove(sense) {
        if (sense.fingers.length <= 0)return !1;
        var fromX = sense.startClientX, fromY = sense.startClientY;
        sense.moves.length > 0 && (fromX = sense.moves[sense.moves.length - 1].x, fromY = sense.moves[sense.moves.length - 1].y);
        var deltaX = sense.clientX - fromX, deltaY = sense.clientY - fromY;
        if (deltaX * deltaX + deltaY * deltaY > sense.options.smallMove * sense.options.smallMove) {
            if (sense.moves.length > 0)if (a4p.isUndefined(sense.moves[sense.moves.length - 1].radius)) {
                var previousX = sense.startClientX, previousY = sense.startClientY;
                sense.moves.length > 1 && (previousX = sense.moves[sense.moves.length - 2].x, previousY = sense.moves[sense.moves.length - 2].y);
                var center = getCircleCenter(previousX, previousY, fromX, fromY, sense.clientX, sense.clientY);
                if (null != center) {
                    var radiusX = sense.clientX - center[0], radiusY = sense.clientY - center[1];
                    if (radiusX * radiusX + radiusY * radiusY < sense.options.arcRadius * sense.options.arcRadius)if (radiusX * radiusX + radiusY * radiusY > sense.options.smallMove * sense.options.smallMove) {
                        var angleStart = Math.atan2(previousY - center[1], previousX - center[0]), angleEnd = Math.atan2(radiusY, radiusX), rotation = angleEnd - angleStart;
                        sense.moves.splice(sense.moves.length - 1, 1, {
                            x: sense.clientX,
                            y: sense.clientY,
                            centerx: center[0],
                            centery: center[1],
                            radius: Math.sqrt(radiusX * radiusX + radiusY * radiusY),
                            start: angleStart,
                            end: angleEnd,
                            direction: rotation >= 0 ? "right" : "left"
                        })
                    } else sense.moves.push({
                        x: sense.clientX,
                        y: sense.clientY,
                        deltaX: deltaX,
                        deltaY: deltaY
                    }); else sense.moves.splice(sense.moves.length - 1, 1, {
                        x: sense.clientX,
                        y: sense.clientY,
                        deltaX: sense.clientX - previousX,
                        deltaY: sense.clientY - previousY
                    })
                } else(fromX - previousX) * deltaX >= 0 ? sense.moves.splice(sense.moves.length - 1, 1, {
                        x: sense.clientX,
                        y: sense.clientY,
                        deltaX: sense.clientX - previousX,
                        deltaY: sense.clientY - previousY
                    }) : sense.moves.push({x: sense.clientX, y: sense.clientY, deltaX: deltaX, deltaY: deltaY})
            } else {
                var radius = sense.moves[sense.moves.length - 1].radius, centerx = sense.moves[sense.moves.length - 1].centerx, centery = sense.moves[sense.moves.length - 1].centery, start = sense.moves[sense.moves.length - 1].start, end = sense.moves[sense.moves.length - 1].end, lastRadiusX = sense.clientX - centerx, lastRadiusY = sense.clientY - centery;
                if (Math.abs(lastRadiusX * lastRadiusX + lastRadiusY * lastRadiusY - radius * radius) <= sense.options.smallMove * sense.options.smallMove) {
                    var lastAngleEnd = Math.atan2(lastRadiusY, lastRadiusX), lastRotation = lastAngleEnd - end;
                    (end - start) * lastRotation >= 0 ? sense.moves.splice(sense.moves.length - 1, 1, {
                            x: sense.clientX,
                            y: sense.clientY,
                            centerx: centerx,
                            centery: centery,
                            radius: radius,
                            start: start,
                            end: lastAngleEnd,
                            direction: lastRotation >= 0 ? "right" : "left"
                        }) : sense.moves.push({
                            x: sense.clientX,
                            y: sense.clientY,
                            centerx: centerx,
                            centery: centery,
                            radius: Math.sqrt(lastRadiusX * lastRadiusX + lastRadiusY * lastRadiusY),
                            start: start,
                            end: lastAngleEnd,
                            direction: lastRotation >= 0 ? "right" : "left"
                        })
                } else sense.moves.push({x: sense.clientX, y: sense.clientY, deltaX: deltaX, deltaY: deltaY})
            } else sense.moves.push({x: sense.clientX, y: sense.clientY, deltaX: deltaX, deltaY: deltaY});
            return !0
        }
        return !1
    }

    function set2FingersScaleAndRotate(sense) {
        if (sense.fingers.length <= 1)return !1;
        var to1X = sense.clientX, to1Y = sense.clientY, to2X = sense.finger2.clientX, to2Y = sense.finger2.clientY, from1X = sense.moves[sense.moves.length - 1].x, from1Y = sense.moves[sense.moves.length - 1].y, from2X = from1X + sense.finger2.deltaFingerX, from2Y = from1Y + sense.finger2.deltaFingerY, delta1X = to1X - from1X, delta1Y = to1Y - from1Y, delta2X = to2X - from2X, delta2Y = to2Y - from2Y;
        if (delta1X * delta1X + delta1Y * delta1Y > sense.options.smallMove * sense.options.smallMove || delta2X * delta2X + delta2Y * delta2Y > sense.options.smallMove * sense.options.smallMove) {
            var angleStart = Math.atan2(sense.finger2.deltaFingerY, sense.finger2.deltaFingerX), angleEnd = Math.atan2(sense.deltaFingerY, sense.deltaFingerX);
            return sense.scale = Math.sqrt((sense.deltaFingerX * sense.deltaFingerX + sense.deltaFingerY * sense.deltaFingerY) / (sense.finger2.deltaFingerX * sense.finger2.deltaFingerX + sense.finger2.deltaFingerY * sense.finger2.deltaFingerY)), sense.rotate = angleEnd - angleStart, Math.abs(sense.scale - 1) <= sense.options.smallScale && (sense.scale = 1), Math.abs(sense.rotate) <= sense.options.smallRotation && (sense.rotate = 0), !0
        }
        return !1
    }

    function onWhichEvent(sense, name, nbFinger) {
        var prefix = "Short";
        sense.hasPaused && (prefix = "Long");
        var onEventName = "on" + prefix + name + nbFinger;
        if (a4p.isDefined(sense[onEventName]) && null != sense[onEventName])return onEventName;
        if (sense.options.prefixPriority) {
            if (onEventName = "on" + prefix + name, a4p.isDefined(sense[onEventName]) && null != sense[onEventName])return onEventName;
            if (onEventName = "on" + name + nbFinger, a4p.isDefined(sense[onEventName]) && null != sense[onEventName])return onEventName
        } else {
            if (onEventName = "on" + name + nbFinger, a4p.isDefined(sense[onEventName]) && null != sense[onEventName])return onEventName;
            if (onEventName = "on" + prefix + name, a4p.isDefined(sense[onEventName]) && null != sense[onEventName])return onEventName
        }
        return onEventName = "on" + name, a4p.isDefined(sense[onEventName]) && null != sense[onEventName] ? onEventName : ""
    }

    function executeEvent(sense, name, evt) {
        var onEventName = onWhichEvent(sense, name, evt.nbFinger);
        if (onEventName.length > 0) {
            try {
                sense[onEventName](evt)
            } catch (exception) {
            }
            return !0
        }
        return !1
    }

    function isEventListened(sense, name, nbFinger) {
        var onEventName = onWhichEvent(sense, name, nbFinger);
        return onEventName.length > 0
    }

    function clearDrops(sense) {
        sense.dropsStarted = [], sense.dropOver = null, sense.dropEvt = {dataType: "text/plain", dataTransfer: ""}
    }

    function dndStart(sense) {
        for (var idx = dndables.length - 1; idx >= 0; idx--) {
            var dropSenseId = dndables[idx], dropSense = dndablesMap[dropSenseId];
            executeEvent(dropSense, GST_DND_START, sense.dropEvt)
        }
    }

    function dndEnd(sense) {
        for (var idx = dndables.length - 1; idx >= 0; idx--) {
            var dropSenseId = dndables[idx], dropSense = dndablesMap[dropSenseId];
            executeEvent(dropSense, GST_DND_END, sense.dropEvt)
        }
    }

    function dndCancel(sense) {
        for (var idx = dndables.length - 1; idx >= 0; idx--) {
            var dropSenseId = dndables[idx], dropSense = dndablesMap[dropSenseId];
            executeEvent(dropSense, GST_DND_CANCEL, sense.dropEvt)
        }
    }

    function dragStart(sense) {
        sense.dropEvt.nbFinger = sense.fingers.length, sense.dropEvt.side = sense.side, sense.dropEvt.scale = sense.scale, sense.dropEvt.rotate = sense.rotate, sense.dropEvt.moves = sense.moves, sense.dropEvt.sourcePoints = sense.sourcePoints, sense.dropEvt.timeStamp = sense.timeStamp, sense.dropEvt.clientX = sense.startClientX, sense.dropEvt.clientY = sense.startClientY, sense.dropEvt.pageX = sense.startPageX, sense.dropEvt.pageY = sense.startPageY;
        var box = sense.DOMelement.getBoundingClientRect();
        sense.dropEvt.elementX = sense.startClientX - box.left, sense.dropEvt.elementY = sense.startClientY - box.top, sense.triggerEvent(GST_DRAG_START, sense.dropEvt), dndStart(sense)
    }

    function dropStart(sense) {
        if (sense.dropEvt.nbFinger = sense.fingers.length, sense.dropEvt.side = sense.side, sense.dropEvt.scale = sense.scale, sense.dropEvt.rotate = sense.rotate, sense.dropEvt.moves = sense.moves, sense.dropEvt.sourcePoints = sense.sourcePoints, sense.dropEvt.timeStamp = sense.timeStamp, sense.dropEvt.clientX = sense.finger1.clientX, sense.dropEvt.clientY = sense.finger1.clientY, sense.dropEvt.pageX = sense.finger1.pageX, sense.dropEvt.pageY = sense.finger1.pageY, null != sense.dropOver) {
            var idx = sense.dropsStarted.indexOf(sense.dropOver);
            idx < 0 && (sense.dropsStarted.push(sense.dropOver), executeEvent(droppablesMap[sense.dropOver], GST_DROP_START, sense.dropEvt))
        }
    }

    function dropEnd(sense) {
        sense.dropEvt.nbFinger = sense.fingers.length, sense.dropEvt.side = sense.side, sense.dropEvt.scale = sense.scale, sense.dropEvt.rotate = sense.rotate, sense.dropEvt.moves = sense.moves, sense.dropEvt.sourcePoints = sense.sourcePoints, sense.dropEvt.timeStamp = sense.timeStamp, sense.dropEvt.clientX = sense.finger1.clientX, sense.dropEvt.clientY = sense.finger1.clientY, sense.dropEvt.pageX = sense.finger1.pageX, sense.dropEvt.pageY = sense.finger1.pageY, sense.dropsStarted.length > 0 ? (null != sense.dropOver && (sense.triggerEvent(GST_DRAG_OVER_LEAVE, sense.dropEvt), executeEvent(droppablesMap[sense.dropOver], GST_DROP_OVER_LEAVE, sense.dropEvt), sense.dropOver = null), sense.scroll && sense.scroll.options.zoom && sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale) && (sense.evtTriggered = !0), sense.triggerEvent(GST_DRAG_END, sense.dropEvt), sense.dropsStarted.forEach(function (targetId) {
                executeEvent(droppablesMap[targetId], GST_DROP_END, sense.dropEvt)
            }), dndEnd(sense), clearDrops(sense)) : dropCancel(sense)
    }

    function dropCancel(sense) {
        sense.dropEvt.nbFinger = sense.fingers.length, sense.dropEvt.side = sense.side, sense.dropEvt.scale = sense.scale, sense.dropEvt.rotate = sense.rotate, sense.dropEvt.moves = sense.moves, sense.dropEvt.sourcePoints = sense.sourcePoints, sense.dropEvt.timeStamp = sense.timeStamp, sense.dropEvt.clientX = sense.finger1.clientX, sense.dropEvt.clientY = sense.finger1.clientY, sense.dropEvt.pageX = sense.finger1.pageX, sense.dropEvt.pageY = sense.finger1.pageY, null != sense.dropOver && (sense.triggerEvent(GST_DRAG_OVER_LEAVE, sense.dropEvt), executeEvent(droppablesMap[sense.dropOver], GST_DROP_OVER_LEAVE, sense.dropEvt), sense.dropOver = null), sense.scroll && sense.scroll.options.zoom && sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale) && (sense.evtTriggered = !0), sense.triggerEvent(GST_DRAG_CANCEL, sense.dropEvt), sense.dropsStarted.forEach(function (targetId) {
            executeEvent(droppablesMap[targetId], GST_DROP_CANCEL, sense.dropEvt)
        }), dndCancel(sense), clearDrops(sense)
    }

    function findDroppableSenseFromCoord(clientX, clientY) {
        for (var dropOverTargetId = null, boxArea = -1, idx = droppables.length - 1; idx >= 0; idx--) {
            var dropSenseId = droppables[idx], dropSense = droppablesMap[dropSenseId], box = dropSense.DOMelement.getBoundingClientRect();
            box.left <= clientX && clientX <= box.right && box.top <= clientY && clientY <= box.bottom && (null == dropOverTargetId || box.height * box.width < boxArea) && (dropOverTargetId = dropSenseId, boxArea = box.height * box.width)
        }
        return dropOverTargetId
    }

    function startHoldGesture(sense) {
        sense.triggerEvent(GST_HOLD_START, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length
        })
    }

    function stopHoldGesture(sense) {
        sense.triggerEvent(GST_HOLD_STOP, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length
        })
    }

    function tapGesture(sense) {
        sense.triggerEvent(GST_TAP, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length
        })
    }

    function tapAndStartGestureIfMoves(sense) {
        add1FingerMove(sense), sense.moves.length > 0 && (tapGesture(sense), startGesture(sense))
    }

    function startGestureIfMoves(sense) {
        add1FingerMove(sense), sense.moves.length > 0 && startGesture(sense)
    }

    function startGesture(sense) {
        var move = sense.moves[sense.moves.length - 1];
        if (0 == move.deltaY || Math.abs(move.deltaX / move.deltaY) > sense.options.axeRatio)if (move.deltaX >= 0) {
            if (sense.side = "right", sense.scroll && !sense.scroll.hasAttainedSideLeft())return void startScrollGesture(sense);
            if ("scroll" == sense.options.axeX)return void startScrollGesture(sense);
            if ("swipe" == sense.options.axeX)return void startSwipeGesture(sense)
        } else {
            if (sense.side = "left", sense.scroll && !sense.scroll.hasAttainedSideRight())return void startScrollGesture(sense);
            if ("scroll" == sense.options.axeX)return void startScrollGesture(sense);
            if ("swipe" == sense.options.axeX)return void startSwipeGesture(sense)
        } else if (0 == move.deltaX || Math.abs(move.deltaY / move.deltaX) > sense.options.axeRatio)if (move.deltaY >= 0) {
            if (sense.side = "bottom", sense.scroll && !sense.scroll.hasAttainedSideTop())return void startScrollGesture(sense);
            if ("scroll" == sense.options.axeY)return void startScrollGesture(sense);
            if ("swipe" == sense.options.axeY)return void startSwipeGesture(sense)
        } else {
            if (sense.side = "top", sense.scroll && !sense.scroll.hasAttainedSideBottom())return void startScrollGesture(sense);
            if ("scroll" == sense.options.axeY)return void startScrollGesture(sense);
            if ("swipe" == sense.options.axeY)return void startSwipeGesture(sense)
        } else if (sense.side = "", sense.scroll && sense.scroll.enabled && sense.scroll.options.zoom)return void startScrollGesture(sense);
        sense.fingers.length > 1 && set2FingersScaleAndRotate(sense), sense.side = "", isEventListened(sense, GST_DRAG_START, sense.fingers.length) ? (sense.gotoState(STATE_DRAGGING), dragStart(sense), dragGesture(sense)) : sense.gotoState(STATE_0CLICK)
    }

    function swipeGesture(sense) {
        sense.inPause && (sense.inPause = !1, sense.startTimer(sense.options.holdTime)), sense.triggerEvent(GST_SWIPE_MOVE, {
            clientX: sense.clientX,
            clientY: sense.clientY,
            pageX: sense.pageX,
            pageY: sense.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        })
    }

    function startSwipeGesture(sense) {
        sense.gotoState(STATE_SWIPING), sense.triggerEvent(GST_SWIPE_START, {
            clientX: sense.startClientX,
            clientY: sense.startClientY,
            pageX: sense.startPageX,
            pageY: sense.startPageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        }), swipeGesture(sense)
    }

    function continueSwipeGesture(sense) {
        add1FingerMove(sense), swipeGesture(sense)
    }

    function cancelSwipeGesture(sense) {
        sense.triggerEvent(GST_SWIPE_CANCEL, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        }), sense.gotoState(STATE_0CLICK)
    }

    function endSwipeGesture(sense) {
        sense.triggerEvent(GST_SWIPE_END, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        }), sense.gotoState(STATE_0CLICK)
    }

    function scrollGesture(sense) {
        sense.inPause && (sense.inPause = !1, sense.startTimer(sense.options.holdTime)), sense.scroll && (sense.scroll.options.zoom || "scroll" == sense.options.axeX || "scroll" == sense.options.axeY) && sense.scroll.onScrollMove(sense.pageX, sense.pageY, sense.timeStamp, sense.scale) && (sense.evtTriggered = !0), sense.triggerEvent(GST_SCROLL_MOVE, {
            clientX: sense.clientX,
            clientY: sense.clientY,
            pageX: sense.pageX,
            pageY: sense.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        })
    }

    function startScrollGesture(sense) {
        sense.gotoState(STATE_SCROLLING), sense.scroll && (sense.scroll.options.zoom || "scroll" == sense.options.axeX || "scroll" == sense.options.axeY) && sense.scroll.onScrollStart(sense.startPageX, sense.startPageY, sense.timeStamp) && (sense.evtTriggered = !0), sense.triggerEvent(GST_SCROLL_START, {
            clientX: sense.startClientX,
            clientY: sense.startClientY,
            pageX: sense.startPageX,
            pageY: sense.startPageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        }), scrollGesture(sense)
    }

    function continueScrollGesture(sense) {
        add1FingerMove(sense), sense.fingers.length > 1 && set2FingersScaleAndRotate(sense), scrollGesture(sense)
    }

    function cancelScrollGesture(sense) {
        sense.scroll && (sense.scroll.options.zoom || "scroll" == sense.options.axeX || "scroll" == sense.options.axeY) && sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale) && (sense.evtTriggered = !0), sense.triggerEvent(GST_SCROLL_CANCEL, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        }), sense.gotoState(STATE_0CLICK)
    }

    function endScrollGesture(sense) {
        sense.scroll && (sense.scroll.options.zoom || "scroll" == sense.options.axeX || "scroll" == sense.options.axeY) && sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale) && (sense.evtTriggered = !0), sense.triggerEvent(GST_SCROLL_END, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        }), sense.gotoState(STATE_0CLICK)
    }

    function dragGesture(sense) {
        sense.inPause && (sense.inPause = !1, sense.startTimer(sense.options.holdTime)), sense.dropEvt.nbFinger = sense.fingers.length, sense.dropEvt.side = sense.side, sense.dropEvt.scale = sense.scale, sense.dropEvt.rotate = sense.rotate, sense.dropEvt.moves = sense.moves, sense.dropEvt.sourcePoints = sense.sourcePoints, sense.dropEvt.timeStamp = sense.timeStamp, sense.dropEvt.clientX = sense.clientX, sense.dropEvt.clientY = sense.clientY, sense.dropEvt.pageX = sense.pageX, sense.dropEvt.pageY = sense.pageY, sense.scroll && sense.scroll.options.zoom && sense.scroll.onScrollMove(sense.pageX, sense.pageY, sense.timeStamp, sense.scale) && (sense.evtTriggered = !0), sense.triggerEvent(GST_DRAG_MOVE, sense.dropEvt);
        var targetId = findDroppableSenseFromCoord(sense.clientX, sense.clientY);
        sense.dropOver != targetId && (null != sense.dropOver && (sense.triggerEvent(GST_DRAG_OVER_LEAVE, sense.dropEvt), executeEvent(droppablesMap[sense.dropOver], GST_DROP_OVER_LEAVE, sense.dropEvt), sense.dropOver = null), null != targetId && (sense.dropOver = targetId, sense.triggerEvent(GST_DRAG_OVER_ENTER, sense.dropEvt), executeEvent(droppablesMap[targetId], GST_DROP_OVER_ENTER, sense.dropEvt))), null != sense.dropOver && executeEvent(droppablesMap[sense.dropOver], GST_DROP_MOVE, sense.dropEvt)
    }

    function continueDragGesture(sense) {
        var viewportWidth = document.documentElement.clientWidth, viewportHeight = document.documentElement.clientHeight;
        sense.finger1.clientX < sense.options.smallMove || sense.finger1.clientX > viewportWidth - sense.options.smallMove || sense.finger1.clientY < sense.options.smallMove || sense.finger1.clientY > viewportHeight - sense.options.smallMove ? (dropCancel(sense), sense.gotoState(STATE_0CLICK)) : (add1FingerMove(sense), sense.fingers.length > 1 && set2FingersScaleAndRotate(sense), dragGesture(sense))
    }

    function getMousePageX(evt) {
        var body = document.body;
        return evt = evt || window.event, evt.pageX || evt.clientX + (document && document.scrollLeft || body && body.scrollLeft || 0) - (document && document.clientLeft || body && body.clientLeft || 0)
    }

    function getMousePageY(evt) {
        var body = document.body;
        return evt = evt || window.event, evt.pageY || evt.clientY + (document && document.scrollTop || body && body.scrollTop || 0) - (document && document.clientTop || body && body.clientTop || 0)
    }

    function getCircleCenter(x1, y1, x2, y2, x3, y3) {
        if (y1 == y2 && y2 == y3)return null;
        var dx3, dx2, dx1, nx3, nx2, nx1, x0, y0;
        return y3 == y2 ? (dx3 = (x2 - x1) / (y2 - y1), dx2 = (x3 - x1) / (y3 - y1), nx2 = (dx2 * (x3 + x1) + (y3 + y1)) / 2, nx3 = (dx3 * (x2 + x1) + (y2 + y1)) / 2, x0 = (nx2 - nx3) / (dx3 - dx2), y0 = dx3 * x0 + nx3) : y2 == y1 ? (dx1 = (x3 - x2) / (y3 - y2), dx2 = (x3 - x1) / (y3 - y1), nx2 = (dx2 * (x3 + x1) + (y3 + y1)) / 2, nx1 = (dx1 * (x3 + x2) + (y3 + y2)) / 2, x0 = (nx2 - nx1) / (dx1 - dx2), y0 = dx1 * x0 + nx1) : (dx3 = (x2 - x1) / (y2 - y1), dx1 = (x3 - x2) / (y3 - y2), nx1 = (dx1 * (x3 + x2) + (y3 + y2)) / 2, nx3 = (dx3 * (x2 + x1) + (y2 + y1)) / 2, x0 = (nx1 - nx3) / (dx3 - dx1), y0 = dx3 * x0 + nx3), [x0, y0]
    }

    function Sense(element, options, scrollOpts) {
        this.id = nextUid(), this.name = this.id, this.state = STATE_0CLICK, this.createScroll = !1, clearFingers(this), clearDrops(this), this.bindTouchStart = !1, this.bindTouchMove = !1, this.bindTouchEnd = !1, this.bindTouchCancel = !1, this.bindMouseDown = !1, this.bindMouseOther = !1, this.hasPaused = !1, this.inPause = !1, this.inMouseMove = !1, this.inTouchMove = !1, this.holdTimer = null, this.scroll = null, this.checkDOMTimer = null, this.timeStamp = 0, this.wheelDeltaX = 0, this.wheelDeltaY = 0, this.element = element, "object" == typeof element ? this.DOMelement = element[0] : this.DOMelement = document.getElementById(element), this.destroyListener = null, this.options = {
            name: "",
            axeX: "",
            axeY: "",
            defaultAction: !1,
            bubble: !1,
            prefixPriority: !1,
            smallMove: 10,
            smallScale: .1,
            smallRotation: .25,
            doubleTime: 250,
            holdTime: 300,
            arcRadius: 500,
            axeRatio: 2.5,
            callApply: !1,
            checkDOMChanges: !1
        }, this.scrollOptions = {name: "", hScroll: scrollOpts.zoom, vScroll: scrollOpts.zoom};
        for (var optKey in options)options.hasOwnProperty(optKey) && (this.options[optKey] = options[optKey], "name" == optKey && (this.name = options[optKey], this.scrollOptions.name = options[optKey]));
        for (var scrollOptKey in scrollOpts)scrollOpts.hasOwnProperty(scrollOptKey) && (this.scrollOptions[scrollOptKey] = scrollOpts[scrollOptKey], this.createScroll = !0);
        "scroll" != this.options.axeX && "scroll" != this.options.axeY || ("scroll" == this.options.axeX && (this.scrollOptions.hScroll = !0, this.createScroll = !0), "scroll" == this.options.axeY && (this.scrollOptions.vScroll = !0, this.createScroll = !0)), bindOnStart(this, this.createScroll);
        var self = this;
        this.element.bind("$destroy", function () {
            self.destroy()
        }), this.createScroll && (self.scroll = new a4p.Scroll(element, self.scrollOptions)), window.setTimeout(function () {
            self.sizeRefresh(), self.options.checkDOMChanges && (self.checkDOMTimer = setInterval(function () {
                self.sizeRefresh()
            }, 500))
        }, 750)
    }

    var dndables = [], dndablesMap = {}, droppables = [], droppablesMap = {}, uid = ["0", "0", "0"], idStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", idNext = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
        6: 7,
        7: 8,
        8: 9,
        9: 10,
        A: 11,
        B: 12,
        C: 13,
        D: 14,
        E: 15,
        F: 16,
        G: 17,
        H: 18,
        I: 19,
        J: 20,
        K: 21,
        L: 22,
        M: 23,
        N: 24,
        O: 25,
        P: 26,
        Q: 27,
        R: 28,
        S: 29,
        T: 30,
        U: 31,
        V: 32,
        W: 33,
        X: 34,
        Y: 35,
        Z: 0
    }, mouseListeners = [], touchListeners = [], timeStampDocMouseMove = 0;
    document.addEventListener("mousemove", handleDocMouseMove, !1), document.addEventListener("mouseup", handleDocMouseUp, !1), Sense.hasTouch = miapp.BrowserCapabilities.hasTouch, Sense.prototype.destroy = function () {
        null != this.destroyListener && this.destroyListener(), unbindStart(this), unbindOther(this), this.checkDOMTimer && (clearInterval(this.checkDOMTimer), this.checkDOMTimer = null);
        var idx = dndables.indexOf(this.id);
        return idx >= 0 && dndables.splice(idx, 1), delete dndablesMap[this.id], idx = droppables.indexOf(this.id), idx >= 0 && droppables.splice(idx, 1), delete droppablesMap[this.id], this.scroll && (this.scroll.destroy && this.scroll.destroy(), this.scroll = null), !0
    }, Sense.prototype.addHandler = function (eventName, handler) {
        this["on" + eventName] = handler;
        var self = this, baseEventName = eventNameWithoutPrefixNorNbFinger(eventName);
        if (baseEventName == GST_DROP_OVER_ENTER || baseEventName == GST_DROP_START) {
            var dropIdx = droppables.indexOf(this.id);
            dropIdx < 0 && droppables.push(this.id), droppablesMap[this.id] = self
        }
        if (baseEventName == GST_DND_START || baseEventName == GST_DND_END || baseEventName == GST_DND_CANCEL) {
            var dndIdx = dndables.indexOf(this.id);
            dndIdx < 0 && dndables.push(this.id), dndablesMap[this.id] = self
        }
    }, Sense.prototype.sizeRefresh = function () {
        if (this.scroll) {
            var self = this;
            window.setTimeout(function () {
                self.scroll && self.scroll.checkDOMChanges() && self.scroll.refresh()
            }, 300)
        }
    }, Sense.prototype.triggerEvent = function (name, evt) {
        var eventFound = executeEvent(this, name, evt);
        return eventFound && (this.evtTriggered = !0), eventFound
    }, Sense.declareDirectives = function (directiveModule) {
        for (var allEvents = [], evtIdx = 0, evtNb = Sense.ALL_EVENTS.length; evtIdx < evtNb; evtIdx++) {
            var name = Sense.ALL_EVENTS[evtIdx];
            allEvents.push(name), allEvents.push("Short" + name), allEvents.push("Long" + name);
            for (var i = 1; i <= 5; i++)allEvents.push(name + i), allEvents.push("Short" + name + i), allEvents.push("Long" + name + i)
        }
        angular.forEach(allEvents, function (name) {
            var directiveName = "sense" + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), eventName = name.charAt(0).toUpperCase() + name.slice(1);
            directiveModule.directive(directiveName, ["$parse", "$rootScope", function ($parse, $rootScope) {
                return function (scope, element, attr) {
                    var sense = element.data("sense");
                    if (a4p.isUndefined(sense)) {
                        sense = Sense.newSense($parse, $rootScope, scope, element, attr);
                        var initFn = $parse(sense.options.init);
                        initFn(scope, {$sense: sense})
                    }
                    var fn = $parse(attr[directiveName]);
                    sense.addHandler(eventName, function (event) {
                        sense.options.callApply ? a4p.safeApply(scope, function () {
                                fn(scope, {$event: event, $element: element})
                            }) : fn(scope, {$event: event, $element: element})
                    })
                }
            }])
        }), directiveModule.directive("senseOpts", ["$parse", "$rootScope", function ($parse, $rootScope) {
            return function (scope, element, attr) {
                var sense = element.data("sense");
                if (a4p.isUndefined(sense)) {
                    sense = Sense.newSense($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(sense.options.init);
                    initFn(scope, {$sense: sense})
                }
            }
        }]), directiveModule.directive("senseScrollopts", ["$parse", "$rootScope", function ($parse, $rootScope) {
            return function (scope, element, attr) {
                var sense = element.data("sense");
                if (a4p.isUndefined(sense)) {
                    sense = Sense.newSense($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(sense.options.init);
                    initFn(scope, {$sense: sense})
                }
            }
        }]), directiveModule.directive("senseLoop", ["$parse", function ($parse) {
            return function (scope, element, attr) {
                var senseWrapper, list = element[0], parent = element[0].parentNode;
                if (a4p.isDefinedAndNotNull(parent))for (senseWrapper = angular.element(parent).data("sense"); a4p.isUndefined(senseWrapper) && a4p.isDefinedAndNotNull(parent.parentNode);)parent = parent.parentNode,
                    senseWrapper = angular.element(parent).data("sense");
                if (a4p.isDefinedAndNotNull(senseWrapper)) {
                    var scrollOptions;
                    scrollOptions = a4p.isDefinedAndNotNull(senseWrapper.scroll) ? senseWrapper.scroll.options : senseWrapper.scrollOptions;
                    var callApply = attr.callApply, onElementMove = $parse(attr.onElementMove);
                    scrollOptions.hScrollbar = !1, scrollOptions.vScrollbar = !1, scrollOptions.virtualLoop = !0, scrollOptions.bounce = !1, scrollOptions.virtualLoop = !0, scrollOptions.onBeforeScrollMove = function (deltaX, deltaY) {
                        var first, last, nb, initX = senseWrapper.scroll.options.x || 0, initY = senseWrapper.scroll.options.y || 0;
                        if (this.y + deltaY > initY) {
                            last = list.children[list.children.length - 1];
                            var lastHeight = last.offsetHeight;
                            nb = Math.round((this.y + deltaY - initY) / lastHeight), nb > 0 && (this.y -= nb * lastHeight, callApply ? a4p.safeApply(scope, function () {
                                    onElementMove(scope, {$side: "top", $nb: nb})
                                }) : onElementMove(scope, {$side: "top", $nb: nb}))
                        } else if (this.y + deltaY < initY) {
                            first = list.children[0];
                            var firstHeight = first.offsetHeight;
                            nb = Math.round((initY - this.y - deltaY) / firstHeight), nb > 0 && (this.y += nb * firstHeight, callApply ? a4p.safeApply(scope, function () {
                                    onElementMove(scope, {$side: "bottom", $nb: nb})
                                }) : onElementMove(scope, {$side: "bottom", $nb: nb}))
                        }
                        if (this.x + deltaX > initX) {
                            last = list.children[list.children.length - 1];
                            var lastWidth = last.offsetWidth;
                            nb = Math.round((this.x + deltaX - initX) / lastWidth), nb > 0 && (this.x -= nb * lastWidth, callApply ? a4p.safeApply(scope, function () {
                                    onElementMove(scope, {$side: "left", $nb: nb})
                                }) : onElementMove(scope, {$side: "left", $nb: nb}))
                        } else if (this.x + deltaX < initX) {
                            first = list.children[0];
                            var firstWidth = first.offsetWidth;
                            nb = Math.round((initX - this.x - deltaX) / firstWidth), nb > 0 && (this.x += nb * firstWidth, callApply ? a4p.safeApply(scope, function () {
                                    onElementMove(scope, {$side: "right", $nb: nb})
                                }) : onElementMove(scope, {$side: "right", $nb: nb}))
                        }
                    }
                }
            }
        }])
    }, Sense.newSense = function ($parse, $rootScope, scope, element, attr) {
        var sense, opts = {}, scrollOpts = {};
        if (a4p.isDefined(attr.senseOpts) && (opts = $parse(attr.senseOpts)(scope, {})), a4p.isDefined(attr.senseScrollopts) && (scrollOpts = $parse(attr.senseScrollopts)(scope, {})), sense = new a4p.Sense(element, opts, scrollOpts), element.data("sense", sense), scope.getSenseId = function () {
                return sense.id
            }, scope.getSenseName = function () {
                return sense.name
            }, sense.createScroll) {
            if (scope.senseScrollToElement = function (eltQuery, timeMs) {
                    sense.scroll.scrollToElement(eltQuery, timeMs)
                }, scope.senseScrollToPage = function (pageX, pageY, timeMs) {
                    sense.scroll.scrollToPage(pageX, pageY, timeMs)
                }, scope.senseScrollTo = function (x, y, timeMs, relative) {
                    sense.scroll.scrollTo(x, y, timeMs, relative)
                }, scope.scrollRefresh = function () {
                    sense.sizeRefresh()
                }, attr.senseAfterscrollend) {
                var scrollOptions;
                scrollOptions = a4p.isDefinedAndNotNull(sense.scroll) ? sense.scroll.options : sense.scrollOptions;
                var fn = $parse(attr.senseAfterscrollend);
                sense.options.callApply ? scrollOptions.onAfterScrollEnd = function () {
                        var x = this.x, y = this.y;
                        a4p.safeApply(scope, function () {
                            fn(scope, {$x: x, $y: y})
                        })
                    } : scrollOptions.onAfterScrollEnd = function () {
                        var x = this.x, y = this.y;
                        fn(scope, {$x: x, $y: y})
                    }
            }
            var resize = element.data("resize");
            a4p.isUndefined(resize) && (resize = a4p.Resize.newResize($parse, $rootScope, scope, element, attr)), resize.toSenseWindow = function () {
                sense.sizeRefresh()
            }, resize.toSenseChanged = function () {
                sense.sizeRefresh()
            }
        }
        if (a4p.isDefined(sense.options.watchRefresh))if ("string" == typeof sense.options.watchRefresh) scope.$watch(sense.options.watchRefresh, function (newValue, oldValue) {
            newValue !== oldValue && sense.sizeRefresh()
        }); else for (var i = 0, nb = sense.options.watchRefresh.length; i < nb; i++)scope.$watch(sense.options.watchRefresh[i], function (newValue, oldValue) {
            newValue !== oldValue && sense.sizeRefresh()
        });
        return sense.sizeRefresh(), sense
    };
    var EVT_TOUCH_START = "Touchstart", EVT_TOUCH_MOVE = "Touchmove", EVT_TOUCH_END = "Touchend", EVT_TOUCH_CANCEL = "Touchcancel", EVT_MOUSE_DOWN = "Mousedown", EVT_MOUSE_MOVE = "Mousemove", EVT_MOUSE_UP = "Mouseup", GST_HOLD_START = "HoldStart", GST_HOLD_STOP = "HoldStop", GST_TAP = "Tap", GST_DOUBLE_TAP = "DoubleTap", GST_DRAG_OVER_ENTER = "DragOverEnter", GST_DRAG_OVER_LEAVE = "DragOverLeave", GST_DRAG_START = "DragStart", GST_DRAG_PAUSE = "DragPause", GST_DRAG_MOVE = "DragMove", GST_DRAG_END = "DragEnd", GST_DRAG_CANCEL = "DragCancel", GST_DROP_OVER_ENTER = "DropOverEnter", GST_DROP_OVER_LEAVE = "DropOverLeave", GST_DROP_START = "DropStart", GST_DROP_MOVE = "DropMove", GST_DROP_END = "DropEnd", GST_DROP_CANCEL = "DropCancel", GST_DND_START = "DndStart", GST_DND_END = "DndEnd", GST_DND_CANCEL = "DndCancel", GST_SWIPE_START = "SwipeStart", GST_SWIPE_PAUSE = "SwipePause", GST_SWIPE_MOVE = "SwipeMove", GST_SWIPE_END = "SwipeEnd", GST_SWIPE_CANCEL = "SwipeCancel", GST_SCROLL_START = "ScrollStart", GST_SCROLL_PAUSE = "ScrollPause", GST_SCROLL_MOVE = "ScrollMove", GST_SCROLL_END = "ScrollEnd", GST_SCROLL_CANCEL = "ScrollCancel";
    Sense.ALL_EVENTS = [EVT_TOUCH_START, EVT_TOUCH_MOVE, EVT_TOUCH_END, EVT_TOUCH_CANCEL, EVT_MOUSE_DOWN, EVT_MOUSE_MOVE, EVT_MOUSE_UP, GST_TAP, GST_DOUBLE_TAP, GST_HOLD_START, GST_HOLD_STOP, GST_DRAG_OVER_ENTER, GST_DRAG_OVER_LEAVE, GST_DRAG_START, GST_DRAG_PAUSE, GST_DRAG_MOVE, GST_DRAG_END, GST_DRAG_CANCEL, GST_DND_START, GST_DND_END, GST_DND_CANCEL, GST_DROP_OVER_ENTER, GST_DROP_OVER_LEAVE, GST_DROP_START, GST_DROP_MOVE, GST_DROP_END, GST_DROP_CANCEL, GST_SWIPE_START, GST_SWIPE_PAUSE, GST_SWIPE_MOVE, GST_SWIPE_END, GST_SWIPE_CANCEL, GST_SCROLL_START, GST_SCROLL_PAUSE, GST_SCROLL_MOVE, GST_SCROLL_END, GST_SCROLL_CANCEL];
    var STATE_0CLICK = "0click", STATE_1DOWN = "1down", STATE_1CLICK = "1click", STATE_2DOWN = "2down", STATE_SWIPING = "swiping", STATE_SCROLLING = "scrolling", STATE_DRAGGING = "dragging", onEnter = {}, onExit = {}, onTimeout = {}, onTouchStart = {}, onTouchMove = {}, onTouchEnd = {}, onTouchCancel = {}, onMouseDown = {}, onMouseMove = {}, onMouseUp = {};
    return Sense.prototype.resetState = function () {
        this.clearTimeout(), clearDrops(this), unbindOther(this), this.hasPaused = !1, this.inPause = !1, this.inMouseMove = !1, this.inTouchMove = !1, this.evtHandled = !1, this.evtTriggered = !1, this.state = STATE_0CLICK, onEnter[STATE_0CLICK].call(this)
    }, Sense.prototype.gotoState = function (state) {
        onExit[this.state].call(this), this.state = state, onEnter[this.state].call(this)
    }, Sense.prototype.handleTimeout = function () {
        this.holdTimer = null, onTimeout[this.state].call(this)
    }, Sense.prototype.clearTimeout = function () {
        null != this.holdTimer && (clearTimeout(this.holdTimer), this.holdTimer = null)
    }, Sense.prototype.startTimer = function (ms) {
        null != this.holdTimer && clearTimeout(this.holdTimer);
        var self = this;
        this.holdTimer = window.setTimeout(function () {
            self.handleTimeout()
        }, ms)
    }, onEnter[STATE_0CLICK] = function () {
        this.hasPaused = !1, this.inPause = !1, clearFingers(this)
    }, onExit[STATE_0CLICK] = function () {
    }, onTimeout[STATE_0CLICK] = function () {
    }, onTouchStart[STATE_0CLICK] = function (evt) {
        if (this.fingers.length <= 0) {
            this.evtHandled = !0;
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var finger = evt.changedTouches[i], id = finger.identifier;
                addTouchFinger(this, id, finger)
            }
            addSourcePoint(this)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_START, evt), this.gotoState(STATE_1DOWN))
    }, onTouchMove[STATE_0CLICK] = function (evt) {
    }, onTouchEnd[STATE_0CLICK] = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_END, evt))
    }, onTouchCancel[STATE_0CLICK] = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_CANCEL, evt))
    }, onMouseDown[STATE_0CLICK] = function (evt) {
        if (this.fingers.length <= 0) {
            this.evtHandled = !0;
            var id = "mouse" + (evt.which || 0);
            addMouseFinger(this, id, evt), addSourcePoint(this)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_DOWN, evt), this.gotoState(STATE_1DOWN))
    }, onMouseMove[STATE_0CLICK] = function (evt) {
    }, onMouseUp[STATE_0CLICK] = function (evt) {
        var id = "mouse" + (evt.which || 0);
        removeFinger(this, id) && (this.evtHandled = !0), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_UP, evt))
    }, onEnter[STATE_1DOWN] = function () {
        this.inPause = !1, this.startTimer(this.options.holdTime)
    }, onExit[STATE_1DOWN] = function () {
        this.clearTimeout()
    }, onTimeout[STATE_1DOWN] = function () {
        startHoldGesture(this), this.inPause = !0, this.hasPaused = !0
    }, onTouchStart[STATE_1DOWN] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            addTouchFinger(this, id, finger)
        }
        evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_START, evt)
    }, onTouchMove[STATE_1DOWN] = function (evt) {
        this.inPause && (this.clearTimeout(), stopHoldGesture(this), this.inPause = !1);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            hasFinger(this, id) && (this.evtHandled = !0, setTouchFinger(this, id, finger), this.finger1.id == id && addSourcePoint(this))
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_MOVE, evt), startGestureIfMoves(this))
    }, onTouchEnd[STATE_1DOWN] = function (evt) {
        this.inPause && (this.clearTimeout(), stopHoldGesture(this), this.inPause = !1);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_END, evt);
            var onEventName = onWhichEvent(this, GST_DOUBLE_TAP, evt.nbFinger);
            onEventName.length > 0 ? this.gotoState(STATE_1CLICK) : (tapGesture(this), this.gotoState(STATE_0CLICK))
        }
    }, onTouchCancel[STATE_1DOWN] = function (evt) {
        this.inPause && (this.clearTimeout(), stopHoldGesture(this), this.inPause = !1);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_CANCEL, evt), this.gotoState(STATE_0CLICK))
    }, onMouseDown[STATE_1DOWN] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        var id = "mouse" + (evt.which || 0);
        addMouseFinger(this, id, evt), evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_DOWN, evt)
    }, onMouseMove[STATE_1DOWN] = function (evt) {
        this.inPause && (this.clearTimeout(), stopHoldGesture(this), this.inPause = !1);
        var id = "mouse" + (evt.which || 0);
        hasFinger(this, id) && (this.evtHandled = !0, setMouseFinger(this, id, evt), this.finger1.id == id && addSourcePoint(this)), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_MOVE, evt), startGestureIfMoves(this))
    }, onMouseUp[STATE_1DOWN] = function (evt) {
        this.inPause && (this.clearTimeout(), stopHoldGesture(this), this.inPause = !1);
        var id = "mouse" + (evt.which || 0);
        if (removeFinger(this, id) && (this.evtHandled = !0), this.evtHandled) {
            evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_UP, evt);
            var onEventName = onWhichEvent(this, GST_DOUBLE_TAP, evt.nbFinger);
            onEventName.length > 0 ? this.gotoState(STATE_1CLICK) : (tapGesture(this), this.gotoState(STATE_0CLICK))
        }
    }, onEnter[STATE_1CLICK] = function () {
        this.startTimer(this.options.doubleTime)
    }, onExit[STATE_1CLICK] = function () {
        this.clearTimeout()
    }, onTimeout[STATE_1CLICK] = function () {
        tapGesture(this), this.gotoState(STATE_0CLICK)
    }, onTouchStart[STATE_1CLICK] = function (evt) {
        if (this.fingers.length <= 0) {
            this.evtHandled = !0;
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var finger = evt.changedTouches[i], id = finger.identifier;
                addTouchFinger(this, id, finger)
            }
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_START, evt), this.gotoState(STATE_2DOWN))
    }, onTouchMove[STATE_1CLICK] = function (evt) {
    }, onTouchEnd[STATE_1CLICK] = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_END, evt))
    }, onTouchCancel[STATE_1CLICK] = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_CANCEL, evt))
    }, onMouseDown[STATE_1CLICK] = function (evt) {
        if (this.fingers.length <= 0) {
            this.evtHandled = !0;
            var id = "mouse" + (evt.which || 0);
            addMouseFinger(this, id, evt)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_DOWN, evt), this.gotoState(STATE_2DOWN))
    }, onMouseMove[STATE_1CLICK] = function (evt) {
    }, onMouseUp[STATE_1CLICK] = function (evt) {
        var id = "mouse" + (evt.which || 0);
        removeFinger(this, id) && (this.evtHandled = !0), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_UP, evt))
    }, onEnter[STATE_2DOWN] = function () {
    }, onExit[STATE_2DOWN] = function () {
    }, onTimeout[STATE_2DOWN] = function () {
    }, onTouchStart[STATE_2DOWN] = function (evt) {
        this.evtHandled = !0;
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            addTouchFinger(this, id, finger)
        }
        evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_START, evt)
    }, onTouchMove[STATE_2DOWN] = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            hasFinger(this, id) && (this.evtHandled = !0, setTouchFinger(this, id, finger), this.finger1.id == id && addSourcePoint(this))
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_MOVE, evt), tapAndStartGestureIfMoves(this))
    }, onTouchEnd[STATE_2DOWN] = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_END, evt), this.triggerEvent(GST_DOUBLE_TAP, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length
        }), this.gotoState(STATE_0CLICK))
    }, onTouchCancel[STATE_2DOWN] = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_CANCEL, evt), tapGesture(this), this.gotoState(STATE_0CLICK))
    }, onMouseDown[STATE_2DOWN] = function (evt) {
        this.evtHandled = !0;
        var id = "mouse" + (evt.which || 0);
        addMouseFinger(this, id, evt), evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_DOWN, evt)
    }, onMouseMove[STATE_2DOWN] = function (evt) {
        var id = "mouse" + (evt.which || 0);
        hasFinger(this, id) && (this.evtHandled = !0, setMouseFinger(this, id, evt), this.finger1.id == id && addSourcePoint(this)), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_MOVE, evt), tapAndStartGestureIfMoves(this))
    }, onMouseUp[STATE_2DOWN] = function (evt) {
        var id = "mouse" + (evt.which || 0);
        removeFinger(this, id) && (this.evtHandled = !0), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_UP, evt), this.triggerEvent(GST_DOUBLE_TAP, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length
        }), this.gotoState(STATE_0CLICK))
    }, onEnter[STATE_SWIPING] = function () {
        this.inPause = !1, this.startTimer(this.options.holdTime)
    }, onExit[STATE_SWIPING] = function () {
        this.clearTimeout()
    }, onTimeout[STATE_SWIPING] = function () {
        this.triggerEvent(GST_SWIPE_PAUSE, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length,
            side: this.side,
            moves: this.moves,
            sourcePoints: this.sourcePoints,
            timeStamp: this.timeStamp
        }), this.inPause = !0
    }, onTouchStart[STATE_SWIPING] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            addTouchFinger(this, id, finger)
        }
        evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_START, evt)
    }, onTouchMove[STATE_SWIPING] = function (evt) {
        this.inPause || this.startTimer(this.options.holdTime);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            hasFinger(this, id) && (this.evtHandled = !0, setTouchFinger(this, id, finger), this.finger1.id == id && addSourcePoint(this))
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_MOVE, evt), continueSwipeGesture(this))
    }, onTouchEnd[STATE_SWIPING] = function (evt) {
        this.inPause || this.clearTimeout();
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_END, evt), endSwipeGesture(this))
    }, onTouchCancel[STATE_SWIPING] = function (evt) {
        this.inPause || this.clearTimeout();
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_CANCEL, evt), cancelSwipeGesture(this))
    }, onMouseDown[STATE_SWIPING] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        var id = "mouse" + (evt.which || 0);
        addMouseFinger(this, id, evt), evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_DOWN, evt)
    }, onMouseMove[STATE_SWIPING] = function (evt) {
        this.inPause || this.startTimer(this.options.holdTime);
        var id = "mouse" + (evt.which || 0);
        hasFinger(this, id) && (this.evtHandled = !0, setMouseFinger(this, id, evt), this.finger1.id == id && addSourcePoint(this)), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_MOVE, evt), continueSwipeGesture(this))
    }, onMouseUp[STATE_SWIPING] = function (evt) {
        this.inPause || this.clearTimeout();
        var id = "mouse" + (evt.which || 0);
        removeFinger(this, id) && (this.evtHandled = !0), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_UP, evt), endSwipeGesture(this))
    }, onEnter[STATE_SCROLLING] = function () {
        this.inPause = !1, this.startTimer(this.options.holdTime)
    }, onExit[STATE_SCROLLING] = function () {
        this.clearTimeout()
    }, onTimeout[STATE_SCROLLING] = function () {
        this.triggerEvent(GST_SCROLL_PAUSE, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length,
            side: this.side,
            moves: this.moves,
            sourcePoints: this.sourcePoints,
            timeStamp: this.timeStamp
        }), this.inPause = !0
    }, onTouchStart[STATE_SCROLLING] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            addTouchFinger(this, id, finger)
        }
        evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_START, evt)
    }, onTouchMove[STATE_SCROLLING] = function (evt) {
        this.inPause || this.startTimer(this.options.holdTime);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            hasFinger(this, id) && (this.evtHandled = !0, setTouchFinger(this, id, finger), this.finger1.id == id && addSourcePoint(this))
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_MOVE, evt), continueScrollGesture(this))
    }, onTouchEnd[STATE_SCROLLING] = function (evt) {
        this.inPause || this.clearTimeout();
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_END, evt), endScrollGesture(this))
    }, onTouchCancel[STATE_SCROLLING] = function (evt) {
        this.inPause || this.clearTimeout();
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_CANCEL, evt), cancelScrollGesture(this))
    }, onMouseDown[STATE_SCROLLING] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        var id = "mouse" + (evt.which || 0);
        addMouseFinger(this, id, evt), evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_DOWN, evt)
    }, onMouseMove[STATE_SCROLLING] = function (evt) {
        this.inPause || this.startTimer(this.options.holdTime);
        var id = "mouse" + (evt.which || 0);
        hasFinger(this, id) && (this.evtHandled = !0, setMouseFinger(this, id, evt), this.finger1.id == id && addSourcePoint(this)), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_MOVE, evt), continueScrollGesture(this))
    }, onMouseUp[STATE_SCROLLING] = function (evt) {
        this.inPause || this.clearTimeout();
        var id = "mouse" + (evt.which || 0);
        removeFinger(this, id) && (this.evtHandled = !0), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_UP, evt), endScrollGesture(this))
    }, onEnter[STATE_DRAGGING] = function () {
        clearDrops(this), this.inPause = !1, this.startTimer(this.options.holdTime)
    }, onExit[STATE_DRAGGING] = function () {
        this.clearTimeout()
    }, onTimeout[STATE_DRAGGING] = function () {
        this.triggerEvent(GST_DRAG_PAUSE, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length,
            side: this.side,
            moves: this.moves,
            sourcePoints: this.sourcePoints,
            timeStamp: this.timeStamp
        }), this.inPause = !0
    }, onTouchStart[STATE_DRAGGING] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            addTouchFinger(this, id, finger)
        }
        evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_START, evt)
    }, onTouchMove[STATE_DRAGGING] = function (evt) {
        this.inPause || this.startTimer(this.options.holdTime);
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            hasFinger(this, id) && (this.evtHandled = !0, setTouchFinger(this, id, finger), this.finger1.id == id && addSourcePoint(this))
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_MOVE, evt), continueDragGesture(this))
    }, onTouchEnd[STATE_DRAGGING] = function (evt) {
        this.inPause || this.clearTimeout();
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            if (hasFinger(this, id)) {
                this.evtHandled = !0;
                break
            }
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_END, evt), dropStart(this), dropEnd(this), this.gotoState(STATE_0CLICK))
    }, onTouchCancel[STATE_DRAGGING] = function (evt) {
        this.inPause || this.clearTimeout();
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i], id = finger.identifier;
            removeFinger(this, id) && (this.evtHandled = !0)
        }
        this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_TOUCH_CANCEL, evt), dropCancel(this), this.gotoState(STATE_0CLICK))
    }, onMouseDown[STATE_DRAGGING] = function (evt) {
        this.evtHandled = !0, this.inPause || this.startTimer(this.options.holdTime);
        var id = "mouse" + (evt.which || 0);
        addMouseFinger(this, id, evt), evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_DOWN, evt)
    }, onMouseMove[STATE_DRAGGING] = function (evt) {
        this.inPause || this.startTimer(this.options.holdTime);
        var id = "mouse" + (evt.which || 0);
        hasFinger(this, id) && (this.evtHandled = !0, setMouseFinger(this, id, evt), this.finger1.id == id && addSourcePoint(this)), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_MOVE, evt), continueDragGesture(this))
    }, onMouseUp[STATE_DRAGGING] = function (evt) {
        this.inPause || this.clearTimeout();
        var id = "mouse" + (evt.which || 0);
        hasFinger(this, id) && (this.evtHandled = !0), this.evtHandled && (evt.nbFinger = this.fingers.length, this.triggerEvent(EVT_MOUSE_UP, evt), dropStart(this), dropEnd(this), this.gotoState(STATE_0CLICK))
    }, Sense
}(navigator, window, document);
var miapp;
miapp || (miapp = {}), miapp.Sha1 = function () {
    "use strict";
    function rstr2binb(input) {
        for (var output = new Array(input.length >> 2), i = 0; i < output.length; i++)output[i] = 0;
        for (var j = 0; j < 8 * input.length; j += 8)output[j >> 5] |= (255 & input.charCodeAt(j / 8)) << 24 - j % 32;
        return output
    }

    function binb2rstr(input) {
        for (var output = "", i = 0; i < 32 * input.length; i += 8)output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 255);
        return output
    }

    function binb_sha1(x, len) {
        x[len >> 5] |= 128 << 24 - len % 32, x[(len + 64 >> 9 << 4) + 15] = len;
        for (var w = new Array(80), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776, i = 0; i < x.length; i += 16) {
            for (var olda = a, oldb = b, oldc = c, oldd = d, olde = e, j = 0; j < 80; j++) {
                j < 16 ? w[j] = x[i + j] : w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d, d = c, c = bit_rol(b, 30), b = a, a = t
            }
            a = safe_add(a, olda), b = safe_add(b, oldb), c = safe_add(c, oldc), d = safe_add(d, oldd), e = safe_add(e, olde)
        }
        return [a, b, c, d, e]
    }

    function sha1_ft(t, b, c, d) {
        return t < 20 ? b & c | ~b & d : t < 40 ? b ^ c ^ d : t < 60 ? b & c | b & d | c & d : b ^ c ^ d
    }

    function sha1_kt(t) {
        return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514
    }

    function safe_add(x, y) {
        var lsw = (65535 & x) + (65535 & y), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | 65535 & lsw
    }

    function bit_rol(num, cnt) {
        return num << cnt | num >>> 32 - cnt
    }

    var Sha1 = {};
    return Sha1.hash = function (input) {
        var s = miapp.Utf8.encode(input);
        return binb2rstr(binb_sha1(rstr2binb(s), 8 * s.length))
    }, Sha1.key256 = function (password) {
        var nBytes = 32, halfLen = password.length / 2, hash1 = miapp.Sha1.hash(password.substr(0, halfLen)), hash2 = miapp.Sha1.hash(password.substr(halfLen));
        return hash1.substr(0, 16) + hash2.substr(0, nBytes - 16)
    }, Sha1
}();
var miapp;
miapp || (miapp = {}), miapp.MemoryStorage = function () {
    "use strict";
    function Storage() {
        this.keyes = [], this.set = {}, this.length = 0
    }

    return Storage.prototype.clear = function () {
        this.keyes = [], this.set = {}, this.length = 0
    }, Storage.prototype.key = function (idx) {
        return this.keyes[idx]
    }, Storage.prototype.getItem = function (key) {
        return miapp.isUndefined(this.set[key]) ? null : this.set[key]
    }, Storage.prototype.setItem = function (key, value) {
        this.set[key] = value;
        for (var i = 0; i < this.keyes.length; i++)if (this.keyes[i] == key)return;
        this.keyes.push(key), this.length = this.keyes.length
    }, Storage.prototype.removeItem = function (key) {
        delete this.set[key];
        for (var i = 0; i < this.keyes.length; i++)this.keyes[i] == key && (this.keyes.splice(i, 1), this.length = this.keyes.length)
    }, Storage
}(), miapp.LocalStorageFactory = function (storageService) {
    "use strict";
    function LocalStorage() {
        if (this.version = "0.1", !miapp.Xml)throw new Error("miapp.Xml needs to be loaded before miapp.LocalStorage!");
        if (!miapp.Json)throw new Error("miapp.Json needs to be loaded before miapp.LocalStorage!");
        if (!miapp.Xml.isXml || !miapp.Xml.xml2String || !miapp.Xml.string2Xml)throw new Error("miapp.Xml with isXml(), xml2String() and string2Xml() needs to be loaded before miapp.LocalStorage!");
        if (!miapp.Json.object2String || !miapp.Json.string2Object)throw new Error("miapp.Json with object2String() and string2Object() needs to be loaded before miapp.LocalStorage!")
    }

    function checkKey(key) {
        if (!key || "string" != typeof key)throw new TypeError("Key type must be string");
        return !0
    }

    var storage = storageService || window.localStorage;
    if (!storage)throw new Error("miapp.LocalStorageFactory needs a storageService!");
    return LocalStorage.prototype.set = function (key, value) {
        checkKey(key);
        var t = typeof value;
        if ("undefined" == t) value = "null"; else if (null === value) value = "null"; else if (miapp.Xml.isXml(value)) value = miapp.Json.object2String({xml: miapp.Xml.xml2String(value)}); else if ("string" == t) value = miapp.Json.object2String({string: value}); else if ("number" == t) value = miapp.Json.object2String({number: value}); else if ("boolean" == t) value = miapp.Json.object2String({bool: value}); else {
            if ("object" != t)throw new TypeError("Value type " + t + " is invalid. It must be null, undefined, xml, string, number, boolean or object");
            value = miapp.Json.object2String({json: value})
        }
        return storage.setItem(key, value), value
    }, LocalStorage.prototype.get = function (key, def) {
        checkKey(key);
        var item = storage.getItem(key);
        if (null !== item) {
            if ("null" == item)return null;
            var value = miapp.Json.string2Object(item);
            return "xml" in value ? miapp.Xml.string2Xml(value.xml) : "string" in value ? value.string : "number" in value ? value.number.valueOf() : "bool" in value ? value.bool.valueOf() : value.json
        }
        return miapp.isUndefined(def) ? null : def
    }, LocalStorage.prototype.remove = function (key) {
        checkKey(key);
        var existed = null !== storage.getItem(key);
        return storage.removeItem(key), existed
    }, LocalStorage.prototype.clear = function () {
        var existed = storage.length > 0;
        return storage.clear(), existed
    }, LocalStorage.prototype.size = function () {
        return storage.length
    }, LocalStorage.prototype.foreach = function (f, context) {
        for (var n = storage.length, i = 0; i < n; i++) {
            var key = storage.key(i), value = this.get(key);
            context ? f.call(context, value) : f(value)
        }
        return n
    }, LocalStorage
}, miapp.FileStorage = function () {
    "use strict";
    function FileStorage($q, $rootScope) {
        this.version = "0.1", this.q = $q, this.rootScope = $rootScope, this.grantedBytes = 0, this.fs = null, this.urlPrefix = "", this.storageType = null, this.initDone = !1, this.initPromises = [], this.initTimer = null
    }

    function initEnd(self) {
        miapp.safeApply(self.rootScope, function () {
            for (var i = 0; i < self.initPromises.length; i++)self.initTrigger(self.initPromises[i]);
            self.initDone = !0, self.initPromises = [], self.initTimer = null
        })
    }

    function launchEnd(self) {
        null === self.initTimer && (self.initTimer = setTimeout(function () {
            initEnd(self)
        }, 100))
    }

    function tryQuota(self, grantBytes) {
        try {
            var fctOnSuccess = function (fs) {
                self.fs = fs, self.urlPrefix = "";
                var pattern = /^(https?)_([^_]+)_(\d+):Persistent$/;
                if (pattern.test(fs.name)) {
                    var name = fs.name;
                    name = name.replace(pattern, "$1://$2:$3"), name = name.replace(/^(.*):0$/, "$1"), self.urlPrefix = "filesystem:" + name + "/persistent"
                }
                self.initTrigger = function (deferred) {
                    deferred.resolve()
                }, launchEnd(self)
            }, fctOnFailure = function (fileError) {
                if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) setTimeout(function () {
                    tryQuota(self, grantBytes / 2)
                }, 100); else {
                    var message = "requestFileSystem failure : " + errorMessage(fileError);
                    self.initTrigger = function (deferred) {
                        deferred.reject(message)
                    }, launchEnd(self)
                }
            }, requestFs = function (grantedBytes) {
                try {
                    miapp.isDefined(window.requestFileSystem) ? window.requestFileSystem(self.storageType, grantedBytes, fctOnSuccess, fctOnFailure) : window.webkitRequestFileSystem(self.storageType, grantedBytes, fctOnSuccess, fctOnFailure)
                } catch (e) {
                    var message = e.message;
                    self.initTrigger = function (deferred) {
                        deferred.reject(message)
                    }, launchEnd(self)
                }
            };
            miapp.isDefined(window.webkitPersistentStorage) ? miapp.isDefined(window.webkitPersistentStorage.requestQuota) ? window.webkitPersistentStorage.requestQuota(grantBytes, function (grantedBytes) {
                        self.grantedBytes = grantedBytes, requestFs(grantedBytes)
                    }, function (fileError) {
                        if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) setTimeout(function () {
                            tryQuota(self, grantBytes / 2)
                        }, 100); else {
                            var message = "requestQuota failure : " + errorMessage(fileError);
                            self.initTrigger = function (deferred) {
                                deferred.reject(message)
                            }, launchEnd(self)
                        }
                    }) : requestFs(grantBytes) : miapp.isDefined(navigator.webkitPersistentStorage) && miapp.isDefined(navigator.webkitPersistentStorage.requestQuota) ? navigator.webkitPersistentStorage.requestQuota(self.storageType, grantBytes, function (grantedBytes) {
                        self.grantedBytes = grantedBytes, requestFs(grantedBytes)
                    }, function (fileError) {
                        if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) setTimeout(function () {
                            tryQuota(self, grantBytes / 2)
                        }, 100); else {
                            var message = "requestQuota failure : " + errorMessage(fileError);
                            self.initTrigger = function (deferred) {
                                deferred.reject(message)
                            }, launchEnd(self)
                        }
                    }) : requestFs(grantBytes)
        } catch (e) {
            var message = e.message;
            self.initTrigger = function (deferred) {
                deferred.reject(message)
            }, launchEnd(self)
        }
    }

    function errorMessage(fileError) {
        var msg = "";
        switch (fileError.code) {
            case FileError.NOT_FOUND_ERR:
                msg = "File not found";
                break;
            case FileError.SECURITY_ERR:
                msg = "Security error";
                break;
            case FileError.ABORT_ERR:
                msg = "Aborted";
                break;
            case FileError.NOT_READABLE_ERR:
                msg = "File not readable";
                break;
            case FileError.ENCODING_ERR:
                msg = "Encoding error";
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                msg = "File not modifiable";
                break;
            case FileError.INVALID_STATE_ERR:
                msg = "Invalid state";
                break;
            case FileError.SYNTAX_ERR:
                msg = "Syntax error";
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = "Invalid modification";
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = "Quota exceeded";
                break;
            case FileError.TYPE_MISMATCH_ERR:
                msg = "Type mismatch";
                break;
            case FileError.PATH_EXISTS_ERR:
                msg = "File already exists";
                break;
            default:
                msg = "Unknown FileError code (code= " + fileError.code + ", type=" + typeof fileError + ")"
        }
        return msg
    }

    function getDirEntry(dirEntry, dirOptions, dirs, onSuccess, onFailure) {
        if (dirs.length <= 0)return void(onSuccess && onSuccess(dirEntry));
        var bWillThrow = !1, dirName = dirs[0];
        dirs = dirs.slice(1), dirEntry.getDirectory(dirName, dirOptions, function (dirEntry) {
            bWillThrow = !0, dirs.length ? getDirEntry(dirEntry, dirOptions, dirs, onSuccess, onFailure) : onSuccess && onSuccess(dirEntry)
        }, function (fileError) {
            bWillThrow = !0, onFailure && onFailure("getDirectory " + dirName + " from " + dirEntry.fullPath + " failure : " + errorMessage(fileError))
        })
    }

    function getFileEntry(rootEntry, filePath, fileOptions, onSuccess, onFailure) {
        for (var names = filePath.split("/"), max = names.length - 1, fileName = names[max], dirs = [], i = 0; i < max; i++)"." !== names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions;
        dirOptions = fileOptions.create ? {create: !0, exclusive: !1} : {
                create: !1,
                exclusive: !1
            }, getDirEntry(rootEntry, dirOptions, dirs, function (dirEntry) {
            dirEntry.getFile(fileName, fileOptions, function (fileEntry) {
                onSuccess && onSuccess(fileEntry)
            }, function (fileError) {
                onFailure && onFailure("getFile " + fileName + " from " + dirEntry.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }

    return FileStorage.prototype.init = function () {
        var deferred = this.q.defer();
        this.initPromises.push(deferred);
        var message;
        if (this.initDone) launchEnd(this); else if (1 == this.initPromises.length)if (this.initPromises.push(deferred), miapp.isUndefinedOrNull(LocalFileSystem) ? this.storageType = window.PERSISTENT : this.storageType = LocalFileSystem.PERSISTENT, window.File && window.FileReader && window.Blob)if (miapp.isUndefined(window.requestFileSystem) && miapp.isUndefined(window.webkitRequestFileSystem)) message = "window.requestFileSystem() or window.webkitRequestFileSystem() required by miapp.FileStorage!", this.initTrigger = function (deferred) {
            deferred.reject(message)
        }, launchEnd(this); else if (miapp.isUndefined(window.resolveLocalFileSystemURL) && miapp.isUndefined(window.webkitResolveLocalFileSystemURL) && miapp.isUndefined(window.resolveLocalFileSystemURI) && miapp.isUndefined(window.webkitResolveLocalFileSystemURI)) message = "window.resolveLocalFileSystemURI or equivalent required by miapp.FileStorage!", this.initTrigger = function (deferred) {
            deferred.reject(message)
        }, launchEnd(this); else {
            var grantBytes = 4294967296, self = this;
            setTimeout(function () {
                tryQuota(self, grantBytes)
            }, 100)
        } else message = "window.File, window.FileReader and window.Blob need to be loaded before miapp.FileStorage!", this.initTrigger = function (deferred) {
            deferred.reject(message)
        }, launchEnd(this);
        return deferred.promise
    }, FileStorage.prototype.getFS = function () {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        return this.fs
    }, FileStorage.prototype.createDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var names = dirPath.split("/"), max = names.length, dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !0, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, function (dirEntry) {
            onSuccess && onSuccess(dirEntry)
        }, onFailure)
    }, FileStorage.prototype.getDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var names = dirPath.split("/"), max = names.length, dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !1, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, onSuccess, onFailure)
    }, FileStorage.prototype.readDirectory = function (dirPath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var names = dirPath.split("/"), max = names.length, dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !1, exclusive: !1}, dirContentReader = function (dirEntry) {
            var dirReader = dirEntry.createReader(), fileEntries = [], dirEntries = [], readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (results.length) {
                        for (var max = results.length, i = 0; i < max; i++)results[i].isFile ? fileEntries.push(results[i].name) : dirEntries.push(results[i].name);
                        readEntries()
                    } else onSuccess && (dirEntries.sort(), fileEntries.sort(), onSuccess(dirEntries, fileEntries))
                }, function (fileError) {
                    onFailure && onFailure("readEntries from " + dirEntry.fullPath + " failure : " + errorMessage(fileError))
                })
            };
            readEntries()
        };
        getDirEntry(this.fs.root, dirOptions, dirs, dirContentReader, onFailure)
    }, FileStorage.prototype.readFullDirectory = function (dirPath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var names = dirPath.split("/"), max = names.length, dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {
            create: !1,
            exclusive: !1
        }, dirEntries = [], fileEntries = [], dirContentReader = function (dirEntry) {
            var dirReader = dirEntry.createReader(), readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (results.length) {
                        for (var max = results.length, i = 0; i < max; i++)results[i].isFile ? fileEntries.push(results[i].fullPath) : dirEntries.push(results[i]);
                        readEntries()
                    } else dirEntries.length <= 0 ? onSuccess && (fileEntries.sort(), onSuccess(fileEntries)) : dirContentReader(dirEntries.shift())
                }, function (fileError) {
                    onFailure && onFailure("readEntries from " + dirEntry.fullPath + " failure : " + errorMessage(fileError))
                })
            };
            readEntries()
        };
        getDirEntry(this.fs.root, dirOptions, dirs, dirContentReader, onFailure)
    }, FileStorage.prototype.deleteDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var names = dirPath.split("/"), max = names.length, dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !1, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, function (dirEntry) {
            dirEntry.remove(function () {
                onSuccess && onSuccess()
            }, function (fileError) {
                onFailure && onFailure("remove " + dirEntry.fullPath + " failure : " + errorMessage(fileError))
            })
        }, function (message) {
            onSuccess && onSuccess()
        })
    }, FileStorage.prototype.deleteFullDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var names = dirPath.split("/"), max = names.length, dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !1, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, function (dirEntry) {
            dirEntry.removeRecursively(function () {
                onSuccess && onSuccess()
            }, function (fileError) {
                onFailure && onFailure("removeRecursively " + dirEntry.fullPath + " failure : " + errorMessage(fileError))
            })
        }, function (message) {
            onSuccess && onSuccess()
        })
    }, FileStorage.prototype.getFileFromUrl = function (fileUrl, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        fileUrl = fileUrl.replace("/private/", "/"), fileUrl = fileUrl.replace("/localhost/", "/"), miapp.isDefined(window.resolveLocalFileSystemURL) ? window.resolveLocalFileSystemURL(fileUrl, function (fileEntry) {
                onSuccess && onSuccess(fileEntry)
            }, function (fileError) {
                onFailure && onFailure("resolveLocalFileSystemURL " + fileUrl + " failure : " + errorMessage(fileError))
            }) : miapp.isDefined(window.webkitResolveLocalFileSystemURL) ? window.webkitResolveLocalFileSystemURL(fileUrl, function (fileEntry) {
                    onSuccess && onSuccess(fileEntry)
                }, function (fileError) {
                    onFailure && onFailure("webkitResolveLocalFileSystemURL " + fileUrl + " failure : " + errorMessage(fileError))
                }) : this.getFileFromUri(fileUrl, onSuccess, onFailure)
    }, FileStorage.prototype.getFileFromUri = function (fileUri, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        fileUri = fileUri.replace("/private/", "/"), fileUri = fileUri.replace("/localhost/", "/"), miapp.isDefined(window.resolveLocalFileSystemURI) ? window.resolveLocalFileSystemURI(fileUri, function (fileEntry) {
                onSuccess && onSuccess(fileEntry)
            }, function (fileError) {
                onFailure && onFailure("resolveLocalFileSystemURI " + fileUri + " failure : " + errorMessage(fileError))
            }) : miapp.isDefined(window.webkitResolveLocalFileSystemURI) ? window.webkitResolveLocalFileSystemURI(fileUri, function (fileEntry) {
                    onSuccess && onSuccess(fileEntry)
                }, function (fileError) {
                    onFailure && onFailure("webkitResolveLocalFileSystemURI " + fileUri + " failure : " + errorMessage(fileError))
                }) : this.getFileFromUrl(self.urlPrefix + fileUri, onSuccess, onFailure)
    }, FileStorage.prototype.getUrlFromFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            miapp.isDefined(fileEntry.toNativeURL) ? onSuccess && onSuccess(fileEntry.toNativeURL()) : onSuccess && onSuccess(fileEntry.toURL())
        }, onFailure)
    }, FileStorage.prototype.getUriFromFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            onSuccess && onSuccess(fileEntry.toURI())
        }, onFailure)
    }, FileStorage.prototype.getModificationTimeFromFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            fileEntry.getMetadata(function (metadata) {
                onSuccess && onSuccess(metadata.modificationTime)
            }, function (fileError) {
                onFailure && onFailure("getMetadata " + fileEntry.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage.prototype.getFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, onSuccess, onFailure)
    }, FileStorage.prototype.newFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !0, exclusive: !0}, onSuccess, onFailure)
    }, FileStorage.prototype.getOrNewFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !0, exclusive: !1}, onSuccess, onFailure)
    }, FileStorage.prototype.readFileAsDataURL = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader;
                onSuccess && (reader.onload = function (evt) {
                    onSuccess(evt.target.result)
                }), onFailure && (reader.onerror = function (fileError) {
                    onFailure("readAsDataURL " + file.fullPath + " failure : " + errorMessage(fileError))
                }), reader.readAsDataURL(file)
            }, function (fileError) {
                onFailure && onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage.prototype.readFileAsText = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader;
                onSuccess && (reader.onload = function (evt) {
                    onSuccess(evt.target.result)
                }), onFailure && (reader.onerror = function (fileError) {
                    onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError))
                }), reader.readAsText(file)
            }, function (fileError) {
                onFailure && onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage.prototype.readFileAsArrayBuffer = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader;
                onSuccess && (reader.onload = function (evt) {
                    onSuccess(evt.target.result)
                }), onFailure && (reader.onerror = function (fileError) {
                    onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError))
                }), reader.readAsArrayBuffer(file)
            }, function (fileError) {
                onFailure && onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage.prototype.readFileAsBinaryString = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader;
                onSuccess && (reader.onload = function (evt) {
                    onSuccess(evt.target.result)
                }), onFailure && (reader.onerror = function (fileError) {
                    onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError))
                }), reader.readAsBinaryString(file)
            }, function (fileError) {
                onFailure && onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage.prototype.writeFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, toFilePath, {create: !0, exclusive: !1}, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (evt) {
                    fileWriter.onwriteend = null, onSuccess && (fileWriter.onwrite = function (evt) {
                        onSuccess(fileEntry)
                    }), onFailure && (fileWriter.onerror = function (fileError) {
                        onFailure("write or truncate " + fileEntry.fullPath + " failure : " + errorMessage(fileError))
                    }), fileWriter.write(fromBlob)
                }, fileWriter.truncate(0)
            }, function (fileError) {
                onFailure && onFailure("createWriter " + fileEntry.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage.prototype.appendFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, toFilePath, {create: !0, exclusive: !1}, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                onSuccess && (fileWriter.onwrite = function (e) {
                    onSuccess(fileEntry)
                }), onFailure && (fileWriter.onerror = function (fileError) {
                    onFailure("write or seek " + fileEntry.fullPath + " failure : " + errorMessage(fileError))
                }), fileWriter.seek(fileWriter.length), fileWriter.write(fromBlob)
            }, function (fileError) {
                onFailure && onFailure("createWriter " + fileEntry.fullPath + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage.prototype.deleteFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        getFileEntry(this.fs.root, filePath, {create: !1, exclusive: !1}, function (fileEntry) {
            fileEntry.remove(function () {
                onSuccess && onSuccess()
            }, function (fileError) {
                onFailure && onFailure("remove " + fileEntry.fullPath + " failure : " + errorMessage(fileError))
            })
        }, function (message) {
            onSuccess && onSuccess()
        })
    }, FileStorage.prototype.copyFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var self = this, names = toFilePath.split("/"), max = names.length - 1, fileName = names[max], dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !0, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, function (dirEntry) {
            getFileEntry(self.fs.root, fromFilePath, {create: !1, exclusive: !1}, function (fileEntry) {
                fileEntry.copyTo(dirEntry, fileName, function (toFileEntry) {
                    onSuccess && onSuccess(toFileEntry)
                }, function (fileError) {
                    onFailure && onFailure("copy " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError))
                })
            }, onFailure)
        }, onFailure)
    }, FileStorage.prototype.copyFileFromUrl = function (fromFileUrl, toFilePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var self = this, names = toFilePath.split("/"), max = names.length - 1, fileName = names[max], dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !0, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, function (dirEntry) {
            self.getFileFromUrl(fromFileUrl, function (fileEntry) {
                fileEntry.copyTo(dirEntry, fileName, function (toFileEntry) {
                    onSuccess && onSuccess(toFileEntry)
                }, function (fileError) {
                    onFailure && onFailure("copy " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError))
                })
            }, onFailure)
        }, onFailure)
    }, FileStorage.prototype.moveFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var self = this, names = toFilePath.split("/"), max = names.length - 1, fileName = names[max], dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !0, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, function (dirEntry) {
            getFileEntry(self.fs.root, fromFilePath, {create: !1, exclusive: !1}, function (fileEntry) {
                fileEntry.moveTo(dirEntry, fileName, function (toFileEntry) {
                    onSuccess && onSuccess(toFileEntry)
                }, function (fileError) {
                    onFailure && onFailure("move " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError))
                })
            }, onFailure)
        }, onFailure)
    }, FileStorage.prototype.moveFileEntry = function (fromFileEntry, toFilePath, onSuccess, onFailure) {
        if (!this.fs)throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        for (var names = toFilePath.split("/"), max = names.length - 1, fileName = names[max], dirs = [], i = 0; i < max; i++)"." != names[i] && "" !== names[i] && dirs.push(names[i]);
        var dirOptions = {create: !0, exclusive: !1};
        getDirEntry(this.fs.root, dirOptions, dirs, function (dirEntry) {
            fromFileEntry.moveTo(dirEntry, fileName, function (toFileEntry) {
                onSuccess && onSuccess(toFileEntry)
            }, function (fileError) {
                onFailure && onFailure("move " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError))
            })
        }, onFailure)
    }, FileStorage
}(), miapp.PredefinedFileStorage = function () {
    function PredefinedFileStorage(fileSystem, grantedBytes) {
        this.version = "0.1", this.fs = fileSystem, this.grantedBytes = grantedBytes
    }

    return PredefinedFileStorage.prototype = miapp.FileStorage.prototype, PredefinedFileStorage
}();
var miapp;
miapp || (miapp = {}), miapp.Utf8 = function () {
    "use strict";
    var Utf8 = {};
    return Utf8.encode = function (input) {
        for (var nChr, utftext = "", nStrLen = input.length, nChrIdx = 0; nChrIdx < nStrLen; nChrIdx++)nChr = input.charCodeAt(nChrIdx), nChr < 128 ? utftext += String.fromCharCode(nChr) : nChr < 2048 ? (utftext += String.fromCharCode(192 + (nChr >>> 6)), utftext += String.fromCharCode(128 + (63 & nChr))) : nChr < 65536 ? (utftext += String.fromCharCode(224 + (nChr >>> 12)), utftext += String.fromCharCode(128 + (nChr >>> 6 & 63)), utftext += String.fromCharCode(128 + (63 & nChr))) : nChr < 2097152 ? (utftext += String.fromCharCode(240 + (nChr >>> 18)), utftext += String.fromCharCode(128 + (nChr >>> 12 & 63)), utftext += String.fromCharCode(128 + (nChr >>> 6 & 63)), utftext += String.fromCharCode(128 + (63 & nChr))) : nChr < 67108864 ? (utftext += String.fromCharCode(248 + (nChr >>> 24)), utftext += String.fromCharCode(128 + (nChr >>> 18 & 63)), utftext += String.fromCharCode(128 + (nChr >>> 12 & 63)), utftext += String.fromCharCode(128 + (nChr >>> 6 & 63)), utftext += String.fromCharCode(128 + (63 & nChr))) : (utftext += String.fromCharCode(252 + nChr / 1073741824), utftext += String.fromCharCode(128 + (nChr >>> 24 & 63)), utftext += String.fromCharCode(128 + (nChr >>> 18 & 63)), utftext += String.fromCharCode(128 + (nChr >>> 12 & 63)), utftext += String.fromCharCode(128 + (nChr >>> 6 & 63)), utftext += String.fromCharCode(128 + (63 & nChr)));
        return utftext
    }, Utf8.encodeToUint8Array = function (input) {
        for (var aBytes, nChr, nStrLen = input.length, nArrLen = 0, nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++)nChr = input.charCodeAt(nMapIdx), nArrLen += nChr < 128 ? 1 : nChr < 2048 ? 2 : nChr < 65536 ? 3 : nChr < 2097152 ? 4 : nChr < 67108864 ? 5 : 6;
        aBytes = new Uint8Array(nArrLen);
        for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++)nChr = input.charCodeAt(nChrIdx), nChr < 128 ? aBytes[nIdx++] = nChr : nChr < 2048 ? (aBytes[nIdx++] = 192 + (nChr >>> 6), aBytes[nIdx++] = 128 + (63 & nChr)) : nChr < 65536 ? (aBytes[nIdx++] = 224 + (nChr >>> 12), aBytes[nIdx++] = 128 + (nChr >>> 6 & 63), aBytes[nIdx++] = 128 + (63 & nChr)) : nChr < 2097152 ? (aBytes[nIdx++] = 240 + (nChr >>> 18), aBytes[nIdx++] = 128 + (nChr >>> 12 & 63), aBytes[nIdx++] = 128 + (nChr >>> 6 & 63), aBytes[nIdx++] = 128 + (63 & nChr)) : nChr < 67108864 ? (aBytes[nIdx++] = 248 + (nChr >>> 24), aBytes[nIdx++] = 128 + (nChr >>> 18 & 63), aBytes[nIdx++] = 128 + (nChr >>> 12 & 63), aBytes[nIdx++] = 128 + (nChr >>> 6 & 63), aBytes[nIdx++] = 128 + (63 & nChr)) : (aBytes[nIdx++] = 252 + nChr / 1073741824, aBytes[nIdx++] = 128 + (nChr >>> 24 & 63), aBytes[nIdx++] = 128 + (nChr >>> 18 & 63), aBytes[nIdx++] = 128 + (nChr >>> 12 & 63), aBytes[nIdx++] = 128 + (nChr >>> 6 & 63), aBytes[nIdx++] = 128 + (63 & nChr));
        return aBytes
    }, Utf8.decode = function (input) {
        for (var nChr, nCode, sView = "", nStrLen = input.length, nChrIdx = 0; nChrIdx < nStrLen; nChrIdx++)nChr = input.charCodeAt(nChrIdx), nChr >= 252 && nChr <= 253 && nChrIdx + 5 < nStrLen ? (nCode = 1073741824 * (1 & nChr), nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 24, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 18, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 12, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 6, nChr = input.charCodeAt(++nChrIdx), nCode |= 63 & nChr, sView += String.fromCharCode(nCode)) : nChr >= 248 && nChr <= 251 && nChrIdx + 4 < nStrLen ? (nCode = (3 & nChr) << 24, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 18, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 12, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 6, nChr = input.charCodeAt(++nChrIdx), nCode |= 63 & nChr, sView += String.fromCharCode(nCode)) : nChr >= 240 && nChr <= 247 && nChrIdx + 3 < nStrLen ? (nCode = (7 & nChr) << 18, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 12, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 6, nChr = input.charCodeAt(++nChrIdx), nCode |= 63 & nChr, sView += String.fromCharCode(nCode)) : nChr >= 224 && nChr <= 239 && nChrIdx + 2 < nStrLen ? (nCode = (15 & nChr) << 12, nChr = input.charCodeAt(++nChrIdx), nCode |= (63 & nChr) << 6, nChr = input.charCodeAt(++nChrIdx), nCode |= 63 & nChr, sView += String.fromCharCode(nCode)) : nChr >= 192 && nChr <= 223 && nChrIdx + 1 < nStrLen ? (nCode = (31 & nChr) << 6, nChr = input.charCodeAt(++nChrIdx), nCode |= 63 & nChr, sView += String.fromCharCode(nCode)) : sView += String.fromCharCode(127 & nChr);
        return sView
    }, Utf8.decodeFromUint8Array = function (aBytes) {
        for (var nPart, nCode, sView = "", nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++)nPart = aBytes[nIdx], nPart >= 252 && nPart <= 253 && nIdx + 5 < nLen ? (nCode = 1073741824 * (1 & nPart), nPart = aBytes[++nIdx], nCode += (63 & nPart) << 24, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 18, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 12, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 6, nPart = aBytes[++nIdx], nCode += 63 & nPart, sView += String.fromCharCode(nCode)) : nPart >= 248 && nPart <= 251 && nIdx + 4 < nLen ? (nCode = (3 & nPart) << 24, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 18, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 12, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 6, nPart = aBytes[++nIdx], nCode += 63 & nPart, sView += String.fromCharCode(nCode)) : nPart >= 240 && nPart <= 247 && nIdx + 3 < nLen ? (nCode = (7 & nPart) << 18, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 12, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 6, nPart = aBytes[++nIdx], nCode += 63 & nPart, sView += String.fromCharCode(nCode)) : nPart >= 224 && nPart <= 239 && nIdx + 2 < nLen ? (nCode = (15 & nPart) << 12, nPart = aBytes[++nIdx], nCode += (63 & nPart) << 6, nPart = aBytes[++nIdx], nCode += 63 & nPart, sView += String.fromCharCode(nCode)) : nPart >= 192 && nPart <= 223 && nIdx + 1 < nLen ? (nCode = (31 & nPart) << 6, nPart = aBytes[++nIdx], nCode += 63 & nPart, sView += String.fromCharCode(nCode)) : sView += String.fromCharCode(127 & nPart);
        return sView
    }, Utf8
}();
var miapp;
miapp || (miapp = {}), miapp.Xml = function () {
    function Xml() {
        this.version = "0.1"
    }

    Xml.isXml = function (elm) {
        var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
        return !!documentElement && "HTML" !== documentElement.nodeName
    }, Xml.xml2String = function (xmlNode) {
        if (!Xml.isXml(xmlNode))return !1;
        try {
            return (new XMLSerializer).serializeToString(xmlNode)
        } catch (E1) {
            try {
                return xmlNode.xml
            } catch (E2) {
            }
        }
        return !1
    }, Xml.string2Xml = function (xmlString) {
        if (!dom_parser)return !1;
        var resultXML = dom_parser.call("DOMParser" in window && new DOMParser || window, xmlString, "text/xml");
        return !!this.isXml(resultXML) && resultXML
    };
    var dom_parser = "DOMParser" in window && (new DOMParser).parseFromString || window.ActiveXObject && function (_xmlString) {
            var xml_doc = new ActiveXObject("Microsoft.XMLDOM");
            return xml_doc.async = "false", xml_doc.loadXML(_xmlString), xml_doc
        };
    return Xml
}();
var miapp;
miapp || (miapp = {}), miapp.angularService = function () {
    "use strict";
    function Service($log, $q) {
        this.logger = $log, this.promise = $q, this.miappService = null
    }

    return Service.prototype.init = function (miappId, miappSalt, _forceOnline, _forceEndpoint) {
        return this.miappService ? this.promise.reject("miapp.sdk.angular.init : already initialized.") : (this.miappService = new SrvMiapp(this.logger, this.promise), _forceEndpoint && this.miappService.setAuthEndpoint(_forceEndpoint), this.miappService.miappInit(miappId, miappSalt, _forceOnline))
    }, Service.prototype.login = function (login, password, forceOnline) {
        return this.miappService ? this.miappService.miappLogin(login, password, forceOnline) : this.promise.reject("miapp.sdk.angular.login : not initialized.")
    }, Service.prototype.isLoggedIn = function () {
        return this.miappService ? this.miappService.miappIsLogin() : this.promise.reject("miapp.sdk.angular.isLoggedIn : not initialized.")
    }, Service.prototype.logoff = function () {
        return this.miappService ? this.miappService.miappLogoff() : this.promise.reject("miapp.sdk.angular.miappLogoff : not initialized.")
    }, Service.prototype.sync = function (fnInitFirstData, forceOnline) {
        return this.miappService ? this.miappService.miappSync(fnInitFirstData, this, forceOnline) : this.promise.reject("miapp.sdk.angular.sync : not initialized.")
    }, Service.prototype.put = function (data) {
        return this.miappService ? this.miappService.miappPutInDb(data) : this.promise.reject("miapp.sdk.angular.put : not initialized.")
    }, Service.prototype.find = function (id) {
        return this.miappService ? this.miappService.miappFindInDb(id) : this.promise.reject("miapp.sdk.angular.find : not initialized.")
    }, Service.prototype.findAll = function () {
        return this.miappService ? this.miappService.miappFindAllInDb() : this.promise.reject("miapp.sdk.angular.findAll : not initialized.")
    }, Service.prototype._testPromise = function () {
        return this.miappService ? this.miappService._testPromise() : this.promise.reject("miapp.sdk.angular.testPromise : not initialized.")
    }, Service
}(), "undefined" != typeof angular && (angular.module("MiappService", []).factory("MiappService", function ($log, $q) {
    return new miapp.angularService($log, $q)
}), angular.module("miapp.services", []).factory("srvLocalStorage", function () {
    var LocalStorage = miapp.LocalStorageFactory(window.localStorage);
    return new LocalStorage
}));
var miappSdk;
miappSdk || (miappSdk = {}), window.console = window.console || {}, window.console.log = window.console.log || function () {
    };
var miappSdkEventable = function () {
    throw Error("'miappSdkEventable' is not intended to be invoked directly")
};
miappSdkEventable.prototype = {
    bind: function (event, fn) {
        this._events = this._events || {}, this._events[event] = this._events[event] || [], this._events[event].push(fn)
    }, unbind: function (event, fn) {
        this._events = this._events || {}, event in this._events != !1 && this._events[event].splice(this._events[event].indexOf(fn), 1)
    }, trigger: function (event) {
        if (this._events = this._events || {}, event in this._events != !1)for (var i = 0; i < this._events[event].length; i++)this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
    }
}, miappSdkEventable.mixin = function (destObject) {
    for (var props = ["bind", "unbind", "trigger"], i = 0; i < props.length; i++)props[i] in destObject.prototype && (destObject.prototype["_" + props[i]] = destObject.prototype[props[i]]), destObject.prototype[props[i]] = miappSdkEventable.prototype[props[i]]
}, function (global) {
    function Logger(name) {
        this.logEnabled = !0, this.init(name, !0)
    }

    var name = "Logger", overwrittenName = global[name];
    return Logger.METHODS = ["log", "error", "warn", "info", "debug", "assert", "clear", "count", "dir", "dirxml", "exception", "group", "groupCollapsed", "groupEnd", "profile", "profileEnd", "table", "time", "timeEnd", "trace"], Logger.prototype.init = function (name, logEnabled) {
        this.name = name || "UNKNOWN", this.logEnabled = logEnabled || !0;
        var addMethod = function (method) {
            this[method] = this.createLogMethod(method)
        }.bind(this);
        Logger.METHODS.forEach(addMethod)
    }, Logger.prototype.createLogMethod = function (method) {
        return Logger.prototype.log.bind(this, method)
    }, Logger.prototype.prefix = function (method, args) {
        var prepend = "[" + method.toUpperCase() + "][" + name + "]:\t";
        return ["log", "error", "warn", "info"].indexOf(method) !== -1 && ("string" == typeof args[0] ? args[0] = prepend + args[0] : args.unshift(prepend)), args
    }, Logger.prototype.log = function () {
        var args = [].slice.call(arguments), method = args.shift();
        Logger.METHODS.indexOf(method) === -1 && (method = "log"), this.logEnabled && console && console[method] && (args = this.prefix(method, args))
    }, Logger.prototype.setLogEnabled = function (logEnabled) {
        this.logEnabled = logEnabled || !0
    }, Logger.mixin = function (destObject) {
        destObject.__logger = new Logger(destObject.name || "UNKNOWN");
        var addMethod = function (method) {
            method in destObject.prototype && (destObject.prototype["_" + method] = destObject.prototype[method]), destObject.prototype[method] = destObject.__logger.createLogMethod(method)
        };
        Logger.METHODS.forEach(addMethod)
    }, global[name] = Logger, global[name].noConflict = function () {
        return overwrittenName && (global[name] = overwrittenName), Logger
    }, global[name]
}(this || window), function (global) {
    function miappSdkPromise() {
        this.complete = !1, this.error = null, this.result = null, this.callbacks = []
    }

    var name = "miappSdkPromise", overwrittenName = global[name];
    return miappSdkPromise.prototype.then = function (callback, context) {
        var f = function () {
            return callback.apply(context, arguments)
        };
        this.complete ? f(this.error, this.result) : this.callbacks.push(f)
    }, miappSdkPromise.prototype.done = function (error, result) {
        if (this.complete = !0, this.error = error, this.result = result, this.callbacks) {
            for (var i = 0; i < this.callbacks.length; i++)this.callbacks[i](error, result);
            this.callbacks.length = 0
        }
    }, miappSdkPromise.join = function (promises) {
        function notifier(i) {
            return function (error, result) {
                completed += 1, errors[i] = error, results[i] = result, completed === total && p.done(errors, results)
            }
        }

        for (var p = new miappSdkPromise, total = promises.length, completed = 0, errors = [], results = [], i = 0; i < total; i++)promises[i]().then(notifier(i));
        return p
    }, miappSdkPromise.chain = function (promises, error, result) {
        var p = new miappSdkPromise;
        return null === promises || 0 === promises.length ? p.done(error, result) : promises[0](error, result).then(function (res, err) {
                promises.splice(0, 1), promises ? miappSdkPromise.chain(promises, res, err).then(function (r, e) {
                        p.done(r, e)
                    }) : p.done(res, err)
            }), p
    }, global[name] = miappSdkPromise, global[name].noConflict = function () {
        return overwrittenName && (global[name] = overwrittenName), miappSdkPromise
    }, global[name]
}(this || window), function (global) {
    function partial() {
        var args = Array.prototype.slice.call(arguments), fn = args.shift();
        return fn.bind(this, args)
    }

    function Ajax() {
        function encode(data) {
            var result = "";
            if ("string" == typeof data) result = data; else {
                var e = encodeURIComponent;
                for (var i in data)data.hasOwnProperty(i) && (result += "&" + e(i) + "=" + e(data[i]))
            }
            return result
        }

        function request(m, u, d, token) {
            var timeout, p = new miappSdkPromise;
            return function (xhr) {
                try {
                    xhr.onreadystatechange = function () {
                        if (4 === xhr.readyState) {
                            clearTimeout(timeout);
                            var status = xhr.status ? parseInt(xhr.status) : 0, statusGroup = status - status % 100, success = !1;
                            switch (statusGroup) {
                                case 200:
                                    success = !0;
                                    break;
                                default:
                                    success = !1
                            }
                            if (success) p.done(null, this); else {
                                var errStatus = "" + xhr.status;
                                xhr.abort();
                                var error = new miappSdkError("Miapp.io SDK request fail.", errStatus);
                                p.done(error, null)
                            }
                        }
                    }, xhr.onerror = function (response) {
                        clearTimeout(timeout), response && response.target && 2e3 === response.target.timeout && (response.error = "request_timeout", response.error_description = "API Call timed out."), p.done(response, null)
                    }, xhr.oncomplete = function (response) {
                        clearTimeout(timeout)
                    }, xhr.open(m, u), d && ("object" == typeof d && (d = JSON.stringify(d)), xhr.setRequestHeader("Content-Type", "application/json"), xhr.setRequestHeader("Accept", "application/json")), xhr.timeout = 2e3, timeout = setTimeout(function () {
                        xhr.abort(), p.done("API Call timed out.", null)
                    }, 3e4), xhr.send(encode(d))
                } catch (err) {
                    p.done(err, null)
                }
            }(new XMLHttpRequest), p
        }

        this.logger = new global.Logger(name);
        this.request = request, this.get = partial(request, "GET"), this.post = partial(request, "POST"), this.put = partial(request, "PUT"), this.delete = partial(request, "DELETE")
    }

    var exports, name = "Ajax", overwrittenName = global[name];
    return global[name] = new Ajax, global[name].noConflict = function () {
        return overwrittenName && (global[name] = overwrittenName),
            exports
    }, global[name]
}(this || window);
var uuidValueRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
!function (global) {
    function miappSdk() {
        self.logger = new Logger(name)
    }

    var self = this, name = "miappSdk", overwrittenName = global[name], VALID_REQUEST_METHODS = ["GET", "POST", "PUT", "DELETE"];
    return miappSdk.isValidEndpoint = function (endpoint) {
        return !0
    }, miappSdk.Request = function (method, endpoint, query_params, data, callback) {
        var p = new miappSdkPromise;
        self.logger = new global.Logger("miappSdk.Request"), self.logger.time("process request " + method + " " + endpoint), self.logger.info("REQUEST launch " + method + " " + endpoint), self.endpoint = endpoint;
        var encodedPms = encodeParams(query_params);
        if (encodedPms && (self.endpoint += "?" + encodedPms), self.method = method.toUpperCase(), self.data = "object" == typeof data ? JSON.stringify(data) : data, VALID_REQUEST_METHODS.indexOf(self.method) === -1)throw new miappSdkInvalidHTTPMethodError("invalid request method '" + self.method + "'");
        if (!isValidUrl(self.endpoint))throw self.logger.error(endpoint, self.endpoint, /^https:\/\//.test(endpoint)), new miappSdkInvalidURIError("The provided endpoint is not valid: " + self.endpoint);
        var token = null;
        query_params && (token = query_params.access_token);
        var request = function () {
            return Ajax.request(self.method, self.endpoint, self.data, token)
        }.bind(self), response = function (err, request) {
            return new miappSdk.Response(err, request)
        }.bind(self), oncomplete = function (err, response) {
            p.done(err, response), doCallback(callback, [err, response])
        }.bind(self);
        return miappSdkPromise.chain([request, response]).then(oncomplete), p
    }, miappSdk.Response = function (err, response) {
        var p = new miappSdkPromise, data = null;
        try {
            data = JSON.parse(response.responseText)
        } catch (e) {
            data = {}
        }
        switch (Object.keys(data).forEach(function (key) {
            self[key] = data[key]
        }), self.status = response ? parseInt(response.status) : 0, self.statusGroup = self.status - self.status % 100, self.statusGroup) {
            case 200:
                self.success = !0;
                break;
            case 400:
            case 500:
            case 300:
            case 100:
            default:
                self.success = !1
        }
        if (self.success) p.done(null, self); else {
            var errorSdk = err;
            !err instanceof miappSdkError && (errorSdk = miappSdkError.fromResponse(err)), p.done(errorSdk, self)
        }
        return p
    }, miappSdk.Response.prototype.getEntities = function () {
        var entities;
        return self.success && (entities = self.data ? self.data.entities : self.entities), entities || []
    }, miappSdk.Response.prototype.getEntity = function () {
        var entities = self.getEntities();
        return entities[0]
    }, miappSdk.VERSION = miappSdk.USERGRID_SDK_VERSION = "0.11.0", global[name] = miappSdk, global[name].noConflict = function () {
        return overwrittenName && (global[name] = overwrittenName), miappSdk
    }, global[name]
}(this || window), function (global) {
    var exports, name = "Client", overwrittenName = global[name];
    return miappSdk.Client = function (options) {
        this.URI = options.URI, options.orgName && this.set("orgName", options.orgName), options.appName && this.set("appName", options.appName), options.qs && this.setObject("default_qs", options.qs), this.buildCurl = options.buildCurl || !1, this.logging = options.logging || !1
    }, miappSdk.Client.prototype.request = function (options, callback) {
        var uri, method = options.method || "GET", endpoint = options.endpoint, body = options.body || {}, qs = options.qs || {}, mQuery = options.mQuery || !1, orgName = this.get("orgName"), appName = this.get("appName"), default_qs = this.getObject("default_qs");
        if (!mQuery && !orgName && !appName)return logoutCallback();
        uri = mQuery ? this.URI + "/" + endpoint : this.URI + "/" + orgName + "/" + appName + "/" + endpoint, this.getToken() && (qs.access_token = this.getToken()), default_qs && (qs = propCopy(qs, default_qs));
        var self = this;
        new miappSdk.Request(method, uri, qs, body, function (err, response) {
            err ? doCallback(callback, [err, response, self], self) : doCallback(callback, [null, response, self], self)
        })
    }, miappSdk.Client.prototype.buildAssetURL = function (uuid) {
        var self = this, qs = {}, assetURL = this.URI + "/" + this.orgName + "/" + this.appName + "/assets/" + uuid + "/data";
        self.getToken() && (qs.access_token = self.getToken());
        var encoded_params = encodeParams(qs);
        return encoded_params && (assetURL += "?" + encoded_params), assetURL
    }, miappSdk.Client.prototype.createGroup = function (options, callback) {
        var group = new miappSdk.Group({path: options.path, client: this, data: options});
        group.save(function (err, response) {
            doCallback(callback, [err, response, group], group)
        })
    }, miappSdk.Client.prototype.createEntity = function (options, callback) {
        var entity = new miappSdk.Entity({client: this, data: options});
        entity.save(function (err, response) {
            doCallback(callback, [err, response, entity], entity)
        })
    }, miappSdk.Client.prototype.getEntity = function (options, callback) {
        var entity = new miappSdk.Entity({client: this, data: options});
        entity.fetch(function (err, response) {
            doCallback(callback, [err, response, entity], entity)
        })
    }, miappSdk.Client.prototype.restoreEntity = function (serializedObject) {
        var data = JSON.parse(serializedObject), options = {
            client: this,
            data: data
        }, entity = new miappSdk.Entity(options);
        return entity
    }, miappSdk.Client.prototype.createCounter = function (options, callback) {
        var counter = new miappSdk.Counter({client: this, data: options});
        counter.save(callback)
    }, miappSdk.Client.prototype.createAsset = function (options, callback) {
        var file = options.file;
        file && (options.name = options.name || file.name, options["content-type"] = options["content-type"] || file.type, options.path = options.path || "/", delete options.file);
        var asset = new miappSdk.Asset({client: this, data: options});
        asset.save(function (err, response, asset) {
            file && !err ? asset.upload(file, callback) : doCallback(callback, [err, response, asset], asset)
        })
    }, miappSdk.Client.prototype.createCollection = function (options, callback) {
        return options.client = this, new miappSdk.Collection(options, function (err, data, collection) {
            doCallback(callback, [err, collection, data])
        })
    }, miappSdk.Client.prototype.restoreCollection = function (serializedObject) {
        var data = JSON.parse(serializedObject);
        data.client = this;
        var collection = new miappSdk.Collection(data);
        return collection
    }, miappSdk.Client.prototype.getFeedForUser = function (username, callback) {
        var options = {method: "GET", endpoint: "users/" + username + "/feed"};
        this.request(options, function (err, data) {
            err ? doCallback(callback, [err]) : doCallback(callback, [err, data, data.getEntities()])
        })
    }, miappSdk.Client.prototype.createUserActivity = function (user, options, callback) {
        options.type = "users/" + user + "/activities", options = {client: this, data: options};
        var entity = new miappSdk.Entity(options);
        entity.save(function (err, data) {
            doCallback(callback, [err, data, entity])
        })
    }, miappSdk.Client.prototype.createUserActivityWithEntity = function (user, content, callback) {
        var username = user.get("username"), options = {
            actor: {
                displayName: username,
                uuid: user.get("uuid"),
                username: username,
                email: user.get("email"),
                picture: user.get("picture"),
                image: {duration: 0, height: 80, url: user.get("picture"), width: 80}
            }, verb: "post", content: content
        };
        this.createUserActivity(username, options, callback)
    }, miappSdk.Client.prototype.calcTimeDiff = function () {
        var seconds = 0, time = this._end - this._start;
        try {
            seconds = (time / 10 / 60).toFixed(2)
        } catch (e) {
            return 0
        }
        return seconds
    }, miappSdk.Client.prototype.setToken = function (token) {
        this.set("token", token)
    }, miappSdk.Client.prototype.setMiappURL = function (url) {
        this.set("miappURL", url), this.URI = url
    }, miappSdk.Client.prototype.setMiappDBURL = function (url) {
        this.set("miappDBURL", url)
    }, miappSdk.Client.prototype.setUserId = function (userId) {
        this.set("userid", userId)
    }, miappSdk.Client.prototype.setAppId = function (appId) {
        this.set("miappSdkid", appId)
    }, miappSdk.Client.prototype.getToken = function () {
        return this.get("token")
    }, miappSdk.Client.prototype.getEndpoint = function () {
        return this.get("endpoint")
    }, miappSdk.Client.prototype.getUserId = function () {
        return this.get("userid")
    }, miappSdk.Client.prototype.getAppId = function () {
        return this.get("miappSdkid")
    }, miappSdk.Client.prototype.setObject = function (key, value) {
        value && (value = JSON.stringify(value)), this.set(key, value)
    }, miappSdk.Client.prototype.set = function (key, value) {
        var keyStore = "miappstore_" + key;
        this[key] = value, "undefined" != typeof Storage && (value ? localStorage.setItem(keyStore, value) : localStorage.removeItem(keyStore))
    }, miappSdk.Client.prototype.getObject = function (key) {
        return JSON.parse(this.get(key))
    }, miappSdk.Client.prototype.get = function (key) {
        var keyStore = "miappstore_" + key, value = null;
        return this[key] ? value = this[key] : "undefined" != typeof Storage && (value = localStorage.getItem(keyStore)), value
    }, miappSdk.Client.prototype.signup = function (username, password, email, name, callback) {
        var options = {type: "users", username: username, password: password, email: email, name: name};
        this.createEntity(options, callback)
    }, miappSdk.Client.prototype.login = function (username, password, callback) {
        var self = this, options = {
            method: "POST",
            endpoint: "token",
            body: {username: username, password: password, grant_type: "password"}
        };
        self.request(options, function (err, response) {
            var user = {};
            if (!err) {
                var options = {client: self, data: response.user};
                user = new miappSdk.Entity(options), self.setToken(response.access_token)
            }
            doCallback(callback, [err, response, user])
        })
    }, miappSdk.Client.prototype.authMLE = function (callback) {
        var self = this, userId = self.getUserId(), appId = self.getAppId(), options = {
            method: "POST",
            mQuery: !0,
            endpoint: "auth",
            body: {userId: userId, appId: appId, userSrc: "miappSdk_fwk"}
        };
        self.request(options, function (err, response) {
            err || (response.access_token || (err = "no data in auth response"), self.setToken(response.access_token)), doCallback(callback, [err, response.miapp_url, response.miapp_db_url, response.end_date])
        })
    }, miappSdk.Client.prototype.loginMLE = function (appid, login, password, updateProperties, callback) {
        var self = this;
        self.setAppId(appid);
        var user = {name: login, username: login, email: login, password: password}, options = {
            method: "POST",
            mQuery: !0,
            endpoint: "users",
            body: user
        };
        options.body.grant_type = "password";
        try {
            self.request(options, function (err, response) {
                err ? doCallback(callback, [err, user]) : (user._id = response._id, self.setUserId(user._id), self.authMLE(function (errAuth, miappURL, miappDBURL, endDate) {
                        errAuth || (user.access_token = self.getToken(), miappURL && (user.miappURL = miappURL), miappDBURL && (user.miappDBURL = miappDBURL), endDate && (user.miappNeedRefresh = new Date(endDate))), doCallback(callback, [errAuth, user])
                    }))
            })
        } catch (e) {
            doCallback(callback, [e, user])
        }
    }, miappSdk.Client.prototype.deleteUserMLE = function (userIDToDelete, callback) {
        var self = this, options = {method: "DELETE", mQuery: !0, endpoint: "users/" + userIDToDelete};
        self.request(options, function (err, response) {
            doCallback(callback, [err, response])
        })
    }, miappSdk.Client.prototype.reAuthenticateLite = function (callback) {
        var self = this, options = {method: "GET", endpoint: "management/me", mQuery: !0};
        self.request(options, function (err, response) {
            err || self.setToken(response.data.access_token), doCallback(callback, [err])
        })
    }, miappSdk.Client.prototype.reAuthenticateMLE = function (callback) {
        var self = this, options = {method: "GET", endpoint: "auth/" + self.getToken(), mQuery: !0};
        try {
            self.request(options, function (err, response) {
                err || response.data.access_token && self.setToken(response.data.access_token), doCallback(callback, [err])
            })
        } catch (e) {
            doCallback(callback, [e])
        }
    }, miappSdk.Client.prototype.reAuthenticate = function (email, callback) {
        var self = this, options = {method: "GET", endpoint: "management/users/" + email, mQuery: !0};
        self.request(options, function (err, response) {
            var data, organizations = {}, applications = {}, user = {};
            if (!err) {
                data = response.data, self.setToken(data.token), self.set("email", data.email), localStorage.setItem("accessToken", data.token), localStorage.setItem("userUUID", data.uuid), localStorage.setItem("userEmail", data.email);
                var userData = {
                    username: data.username,
                    email: data.email,
                    name: data.name,
                    uuid: data.uuid
                }, options = {client: self, data: userData};
                user = new miappSdk.Entity(options), organizations = data.organizations;
                var org = "";
                try {
                    var existingOrg = self.get("orgName");
                    org = organizations[existingOrg] ? organizations[existingOrg] : organizations[Object.keys(organizations)[0]], self.set("orgName", org.name)
                } catch (e) {
                    err = !0
                }
                applications = self.parseApplicationsArray(org), self.selectFirstApp(applications), self.setObject("organizations", organizations), self.setObject("applications", applications)
            }
            doCallback(callback, [err, data, user, organizations, applications], self)
        })
    }, miappSdk.Client.prototype.loginFacebook = function (facebookToken, callback) {
        var self = this, options = {method: "GET", endpoint: "auth/facebook", qs: {fb_access_token: facebookToken}};
        this.request(options, function (err, data) {
            var user = {};
            if (!err) {
                var options = {client: self, data: data.user};
                user = new miappSdk.Entity(options), self.setToken(data.access_token)
            }
            doCallback(callback, [err, data, user], self)
        })
    }, miappSdk.Client.prototype.getLoggedInUser = function (callback) {
        var self = this;
        if (this.getToken()) {
            var options = {method: "GET", endpoint: "users/me"};
            this.request(options, function (err, response) {
                if (err) doCallback(callback, [err, response, self], self); else {
                    var options = {client: self, data: response.getEntity()}, user = new miappSdk.Entity(options);
                    doCallback(callback, [null, response, user], self)
                }
            })
        } else doCallback(callback, [new miappSdkError("Access Token not set"), null, self], self)
    }, miappSdk.Client.prototype.isLoggedIn = function () {
        var token = this.getToken();
        return "undefined" != typeof token && null !== token
    }, miappSdk.Client.prototype.logout = function () {
        this.setToken()
    }, miappSdk.Client.prototype.destroyToken = function (username, token, revokeAll, callback) {
        var options = {client: self, method: "PUT"};
        revokeAll === !0 ? options.endpoint = "users/" + username + "/revoketokens" : null === token ? options.endpoint = "users/" + username + "/revoketoken?token=" + this.getToken() : options.endpoint = "users/" + username + "/revoketoken?token=" + token, this.request(options, function (err, data) {
            err ? doCallback(callback, [err, data, null], self) : doCallback(callback, [err, data, null], self)
        })
    }, miappSdk.Client.prototype.logoutAndDestroyToken = function (username, token, revokeAll, callback) {
        null !== username && (this.destroyToken(username, token, revokeAll, callback), revokeAll !== !0 && token !== this.getToken() && null !== token || this.setToken(null))
    }, miappSdk.Client.prototype.buildCurlCall = function (options) {
        var curl = ["curl"], method = (options.method || "GET").toUpperCase(), body = options.body, uri = options.uri;
        return curl.push("-X"), curl.push(["POST", "PUT", "DELETE"].indexOf(method) >= 0 ? method : "GET"), curl.push(uri), "object" == typeof body && Object.keys(body).length > 0 && ["POST", "PUT"].indexOf(method) !== -1 && (curl.push("-d"), curl.push("'" + JSON.stringify(body) + "'")), curl = curl.join(" ")
    }, miappSdk.Client.prototype.getDisplayImage = function (email, picture, size) {
        size = size || 50;
        var image = "https://apigee.com/miappSdk/images/user_profile.png";
        try {
            picture ? image = picture : email.length && (image = "https://secure.gravatar.com/avatar/" + MD5(email) + "?s=" + size + encodeURI("&d=https://apigee.com/miappSdk/images/user_profile.png"))
        } catch (e) {
        } finally {
            return image
        }
    }, global[name] = miappSdk.Client, global[name].noConflict = function () {
        return overwrittenName && (global[name] = overwrittenName), exports
    }, global[name]
}(this || window);
var ENTITY_SYSTEM_PROPERTIES = ["metadata", "created", "modified", "oldpassword", "newpassword", "type", "activated", "uuid"];
miappSdk.Entity = function (options) {
    this._data = {}, this._client = void 0, options && (this.set(options.data || {}), this._client = options.client || {})
}, miappSdk.Entity.isEntity = function (obj) {
    return obj && obj instanceof miappSdk.Entity
}, miappSdk.Entity.isPersistedEntity = function (obj) {
    return isEntity(obj) && isUUID(obj.get("uuid"))
}, miappSdk.Entity.prototype.serialize = function () {
    return JSON.stringify(this._data)
}, miappSdk.Entity.prototype.get = function (key) {
    var value;
    if (0 === arguments.length ? value = this._data : arguments.length > 1 && (key = [].slice.call(arguments).reduce(function (p, c, i, a) {
                return c instanceof Array ? p = p.concat(c) : p.push(c), p
            }, [])), key instanceof Array) {
        var self = this;
        value = key.map(function (k) {
            return self.get(k)
        })
    } else"undefined" != typeof key && (value = this._data[key]);
    return value
}, miappSdk.Entity.prototype.set = function (key, value) {
    if ("object" == typeof key)for (var field in key)this._data[field] = key[field]; else"string" == typeof key ? null === value ? delete this._data[key] : this._data[key] = value : this._data = {}
}, miappSdk.Entity.prototype.getEndpoint = function () {
    var name, type = this.get("type"), nameProperties = ["uuid", "name"];
    if (void 0 === type)throw new miappSdkError("cannot fetch entity, no entity type specified", "no_type_specified");
    return /^users?$/.test(type) && nameProperties.unshift("username"), name = this.get(nameProperties).filter(function (x) {
        return null !== x && "undefined" != typeof x
    }).shift(), name ? [type, name].join("/") : type
}, miappSdk.Entity.prototype.save = function (callback) {
    var self = this, type = this.get("type"), method = "POST", entityId = this.get("uuid"), entityData = this.get(), options = {
        method: method,
        endpoint: type
    };
    entityId && (options.method = "PUT", options.endpoint += "/" + entityId), options.body = Object.keys(entityData).filter(function (key) {
        return ENTITY_SYSTEM_PROPERTIES.indexOf(key) === -1
    }).reduce(function (data, key) {
        return data[key] = entityData[key], data
    }, {}), self._client.request(options, function (err, response) {
        var entity = response.getEntity();
        entity && (self.set(entity), self.set("type", /^\//.test(response.path) ? response.path.substring(1) : response.path)), doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Entity.prototype.changePassword = function (oldpassword, newpassword, callback) {
    var self = this;
    if ("function" == typeof oldpassword && void 0 === callback && (callback = oldpassword, oldpassword = self.get("oldpassword"), newpassword = self.get("newpassword")), self.set({
            password: null,
            oldpassword: null,
            newpassword: null
        }), !(/^users?$/.test(self.get("type")) && oldpassword && newpassword))throw new miappSdkInvalidArgumentError("Invalid arguments passed to 'changePassword'");
    var options = {
        method: "PUT",
        endpoint: "users/" + self.get("uuid") + "/password",
        body: {
            uuid: self.get("uuid"),
            username: self.get("username"),
            oldpassword: oldpassword,
            newpassword: newpassword
        }
    };
    self._client.request(options, function (err, response) {
        doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Entity.prototype.fetch = function (callback) {
    var endpoint, self = this;
    endpoint = this.getEndpoint();
    var options = {method: "GET", endpoint: endpoint};
    this._client.request(options, function (err, response) {
        var entity = response.getEntity();
        entity && self.set(entity), doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Entity.prototype.destroy = function (callback) {
    var self = this, endpoint = this.getEndpoint(), options = {method: "DELETE", endpoint: endpoint};
    this._client.request(options, function (err, response) {
        err || self.set(null), doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Entity.prototype.connect = function (connection, entity, callback) {
    this.addOrRemoveConnection("POST", connection, entity, callback)
}, miappSdk.Entity.prototype.disconnect = function (connection, entity, callback) {
    this.addOrRemoveConnection("DELETE", connection, entity, callback)
}, miappSdk.Entity.prototype.addOrRemoveConnection = function (method, connection, entity, callback) {
    var self = this;
    if (["POST", "DELETE"].indexOf(method.toUpperCase()) == -1)throw new miappSdkInvalidArgumentError("invalid method for connection call. must be 'POST' or 'DELETE'");
    var connecteeType = entity.get("type"), connectee = this.getEntityId(entity);
    if (!connectee)throw new miappSdkInvalidArgumentError("connectee could not be identified");
    var connectorType = this.get("type"), connector = this.getEntityId(this);
    if (!connector)throw new miappSdkInvalidArgumentError("connector could not be identified");
    var endpoint = [connectorType, connector, connection, connecteeType, connectee].join("/"), options = {
        method: method,
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Entity.prototype.getEntityId = function (entity) {
    var id;
    return id = isUUID(entity.get("uuid")) ? entity.get("uuid") : "users" === this.get("type") || "user" === this.get("type") ? entity.get("username") : entity.get("name")
}, miappSdk.Entity.prototype.getConnections = function (connection, callback) {
    var self = this, connectorType = this.get("type"), connector = this.getEntityId(this);
    if (connector) {
        var endpoint = connectorType + "/" + connector + "/" + connection + "/", options = {
            method: "GET",
            endpoint: endpoint
        };
        this._client.request(options, function (err, data) {
            self[connection] = {};
            for (var length = data && data.entities ? data.entities.length : 0, i = 0; i < length; i++)"user" === data.entities[i].type ? self[connection][data.entities[i].username] = data.entities[i] : self[connection][data.entities[i].name] = data.entities[i];
            doCallback(callback, [err, data, data.entities], self)
        })
    } else if ("function" == typeof callback) {
        var error = "Error in getConnections - no uuid specified.";
        doCallback(callback, [!0, error], self)
    }
}, miappSdk.Entity.prototype.getGroups = function (callback) {
    var self = this, endpoint = "users/" + this.get("uuid") + "/groups", options = {method: "GET", endpoint: endpoint};
    this._client.request(options, function (err, data) {
        self.groups = data.entities, doCallback(callback, [err, data, data.entities], self)
    })
}, miappSdk.Entity.prototype.getActivities = function (callback) {
    var self = this, endpoint = this.get("type") + "/" + this.get("uuid") + "/activities", options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        for (var entity in data.entities)data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
        self.activities = data.entities, doCallback(callback, [err, data, data.entities], self)
    })
}, miappSdk.Entity.prototype.getFollowing = function (callback) {
    var self = this, endpoint = "users/" + this.get("uuid") + "/following", options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image
        }
        self.following = data.entities, doCallback(callback, [err, data, data.entities], self)
    })
}, miappSdk.Entity.prototype.getFollowers = function (callback) {
    var self = this, endpoint = "users/" + this.get("uuid") + "/followers", options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image
        }
        self.followers = data.entities, doCallback(callback, [err, data, data.entities], self)
    })
}, miappSdk.Client.prototype.createRole = function (roleName, permissions, callback) {
    var options = {type: "role", name: roleName};
    this.createEntity(options, function (err, response, entity) {
        err ? doCallback(callback, [err, response, self]) : entity.assignPermissions(permissions, function (err, data) {
                err ? doCallback(callback, [err, response, self]) : doCallback(callback, [err, data, data.data], self)
            })
    })
}, miappSdk.Entity.prototype.getRoles = function (callback) {
    var self = this, endpoint = this.get("type") + "/" + this.get("uuid") + "/roles", options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        self.roles = data.entities, doCallback(callback, [err, data, data.entities], self)
    })
}, miappSdk.Entity.prototype.assignRole = function (roleName, callback) {
    var entityID, self = this, type = self.get("type"), collection = type + "s";
    "user" == type && null != this.get("username") ? entityID = self.get("username") : "group" == type && null != this.get("name") ? entityID = self.get("name") : null != this.get("uuid") && (entityID = self.get("uuid")), "users" != type && "groups" != type && doCallback(callback, [new miappSdkError("entity must be a group or user", "invalid_entity_type"), null, this], this);
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID, options = {
        method: "POST",
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        doCallback(callback, [err, response, self])
    })
}, miappSdk.Entity.prototype.removeRole = function (roleName, callback) {
    var entityID, self = this, type = self.get("type"), collection = type + "s";
    "user" == type && null != this.get("username") ? entityID = this.get("username") : "group" == type && null != this.get("name") ? entityID = this.get("name") : null != this.get("uuid") && (entityID = this.get("uuid")), "users" != type && "groups" != type && doCallback(callback, [new miappSdkError("entity must be a group or user", "invalid_entity_type"), null, this], this);
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID, options = {
        method: "DELETE",
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        doCallback(callback, [err, response, self])
    })
}, miappSdk.Entity.prototype.assignPermissions = function (permissions, callback) {
    var entityID, self = this, type = this.get("type");
    "user" != type && "users" != type && "group" != type && "groups" != type && "role" != type && "roles" != type && doCallback(callback, [new miappSdkError("entity must be a group, user, or role", "invalid_entity_type"), null, this], this), "user" == type && null != this.get("username") ? entityID = this.get("username") : "group" == type && null != this.get("name") ? entityID = this.get("name") : null != this.get("uuid") && (entityID = this.get("uuid"));
    var endpoint = type + "/" + entityID + "/permissions", options = {
        method: "POST",
        endpoint: endpoint,
        body: {permission: permissions}
    };
    this._client.request(options, function (err, data) {
        doCallback(callback, [err, data, data.data], self)
    })
}, miappSdk.Entity.prototype.removePermissions = function (permissions, callback) {
    var entityID, self = this, type = this.get("type");
    "user" != type && "users" != type && "group" != type && "groups" != type && "role" != type && "roles" != type && doCallback(callback, [new miappSdkError("entity must be a group, user, or role", "invalid_entity_type"), null, this], this), "user" == type && null != this.get("username") ? entityID = this.get("username") : "group" == type && null != this.get("name") ? entityID = this.get("name") : null != this.get("uuid") && (entityID = this.get("uuid"));
    var endpoint = type + "/" + entityID + "/permissions", options = {
        method: "DELETE",
        endpoint: endpoint,
        qs: {permission: permissions}
    };
    this._client.request(options, function (err, data) {
        doCallback(callback, [err, data, data.params.permission], self)
    })
}, miappSdk.Entity.prototype.getPermissions = function (callback) {
    var self = this, endpoint = this.get("type") + "/" + this.get("uuid") + "/permissions", options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        var permissions = [];
        if (data.data) {
            var perms = data.data, count = 0;
            for (var i in perms) {
                count++;
                var perm = perms[i], parts = perm.split(":"), ops_part = "", path_part = parts[0];
                parts.length > 1 && (ops_part = parts[0], path_part = parts[1]), ops_part = ops_part.replace("*", "get,post,put,delete");
                var ops = ops_part.split(","), ops_object = {};
                ops_object.get = "no", ops_object.post = "no", ops_object.put = "no", ops_object.delete = "no";
                for (var j in ops)ops_object[ops[j]] = "yes";
                permissions.push({operations: ops_object, path: path_part, perm: perm})
            }
        }
        self.permissions = permissions, doCallback(callback, [err, data, data.entities], self)
    })
}, miappSdk.Collection = function (options) {
    if (options && (this._client = options.client, this._type = options.type, this.qs = options.qs || {}, this._list = options.list || [], this._iterator = options.iterator || -1, this._previous = options.previous || [], this._next = options.next || null, this._cursor = options.cursor || null, options.list))for (var count = options.list.length, i = 0; i < count; i++) {
        var entity = this._client.restoreEntity(options.list[i]);
        this._list[i] = entity
    }
}, miappSdk.isCollection = function (obj) {
    return obj && obj instanceof miappSdk.Collection
}, miappSdk.Collection.prototype.serialize = function () {
    var data = {};
    data.type = this._type, data.qs = this.qs, data.iterator = this._iterator, data.previous = this._previous, data.next = this._next, data.cursor = this._cursor, this.resetEntityPointer();
    var i = 0;
    for (data.list = []; this.hasNextEntity();) {
        var entity = this.getNextEntity();
        data.list[i] = entity.serialize(), i++
    }
    return data = JSON.stringify(data)
}, miappSdk.Collection.prototype.fetch = function (callback) {
    var self = this, qs = this.qs;
    this._cursor ? qs.cursor = this._cursor : delete qs.cursor;
    var options = {method: "GET", endpoint: this._type, qs: this.qs};
    this._client.request(options, function (err, response) {
        err || (self.saveCursor(response.cursor || null), self.resetEntityPointer(), self._list = response.getEntities().filter(function (entity) {
            return isUUID(entity.uuid)
        }).map(function (entity) {
            var ent = new miappSdk.Entity({client: self._client});
            return ent.set(entity), ent.type = self._type, ent
        })), doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Collection.prototype.addEntity = function (entityObject, callback) {
    var self = this;
    entityObject.type = this._type, this._client.createEntity(entityObject, function (err, response, entity) {
        err || self.addExistingEntity(entity), doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Collection.prototype.addExistingEntity = function (entity) {
    var count = this._list.length;
    this._list[count] = entity
}, miappSdk.Collection.prototype.destroyEntity = function (entity, callback) {
    var self = this;
    entity.destroy(function (err, response) {
        err ? doCallback(callback, [err, response, self], self) : self.fetch(callback), self.removeEntity(entity)
    })
}, miappSdk.Collection.prototype.getEntitiesByCriteria = function (criteria) {
    return this._list.filter(criteria)
}, miappSdk.Collection.prototype.getEntityByCriteria = function (criteria) {
    return this.getEntitiesByCriteria(criteria).shift()
}, miappSdk.Collection.prototype.removeEntity = function (entity) {
    var removedEntity = this.getEntityByCriteria(function (item) {
        return entity.uuid === item.get("uuid")
    });
    return delete this._list[this._list.indexOf(removedEntity)], removedEntity
}, miappSdk.Collection.prototype.getEntityByUUID = function (uuid, callback) {
    var entity = this.getEntityByCriteria(function (item) {
        return item.get("uuid") === uuid
    });
    if (entity) doCallback(callback, [null, entity, entity], this); else {
        var options = {data: {type: this._type, uuid: uuid}, client: this._client};
        entity = new miappSdk.Entity(options), entity.fetch(callback)
    }
}, miappSdk.Collection.prototype.getFirstEntity = function () {
    var count = this._list.length;
    return count > 0 ? this._list[0] : null
}, miappSdk.Collection.prototype.getLastEntity = function () {
    var count = this._list.length;
    return count > 0 ? this._list[count - 1] : null
}, miappSdk.Collection.prototype.hasNextEntity = function () {
    var next = this._iterator + 1, hasNextElement = next >= 0 && next < this._list.length;
    return !!hasNextElement
}, miappSdk.Collection.prototype.getNextEntity = function () {
    this._iterator++;
    var hasNextElement = this._iterator >= 0 && this._iterator <= this._list.length;
    return !!hasNextElement && this._list[this._iterator]
}, miappSdk.Collection.prototype.hasPrevEntity = function () {
    var previous = this._iterator - 1, hasPreviousElement = previous >= 0 && previous < this._list.length;
    return !!hasPreviousElement
}, miappSdk.Collection.prototype.getPrevEntity = function () {
    this._iterator--;
    var hasPreviousElement = this._iterator >= 0 && this._iterator <= this._list.length;
    return !!hasPreviousElement && this._list[this._iterator]
}, miappSdk.Collection.prototype.resetEntityPointer = function () {
    this._iterator = -1
}, miappSdk.Collection.prototype.saveCursor = function (cursor) {
    this._next !== cursor && (this._next = cursor)
}, miappSdk.Collection.prototype.resetPaging = function () {
    this._previous = [], this._next = null, this._cursor = null
}, miappSdk.Collection.prototype.hasNextPage = function () {
    return this._next
}, miappSdk.Collection.prototype.getNextPage = function (callback) {
    this.hasNextPage() && (this._previous.push(this._cursor), this._cursor = this._next, this._list = [], this.fetch(callback))
}, miappSdk.Collection.prototype.hasPreviousPage = function () {
    return this._previous.length > 0
}, miappSdk.Collection.prototype.getPreviousPage = function (callback) {
    this.hasPreviousPage() && (this._next = null, this._cursor = this._previous.pop(), this._list = [], this.fetch(callback))
}, miappSdk.Group = function (options, callback) {
    this._path = options.path, this._list = [], this._client = options.client, this._data = options.data || {}, this._data.type = "groups"
}, miappSdk.Group.prototype = new miappSdk.Entity, miappSdk.Group.prototype.fetch = function (callback) {
    var self = this, groupEndpoint = "groups/" + this._path, memberEndpoint = "groups/" + this._path + "/users", groupOptions = {
        method: "GET",
        endpoint: groupEndpoint
    }, memberOptions = {method: "GET", endpoint: memberEndpoint};
    this._client.request(groupOptions, function (err, response) {
        if (err) doCallback(callback, [err, response], self); else {
            var entities = response.getEntities();
            if (entities && entities.length) {
                entities.shift();
                self._client.request(memberOptions, function (err, response) {
                    err && self._client.logging || (self._list = response.getEntities().filter(function (entity) {
                        return isUUID(entity.uuid)
                    }).map(function (entity) {
                        return new miappSdk.Entity({
                            type: entity.type,
                            client: self._client,
                            uuid: entity.uuid,
                            response: entity
                        })
                    })), doCallback(callback, [err, response, self], self)
                })
            }
        }
    })
}, miappSdk.Group.prototype.members = function (callback) {
    return this._list
}, miappSdk.Group.prototype.add = function (options, callback) {
    var self = this;
    options.user ? (options = {
            method: "POST", endpoint: "groups/" + this._path + "/users/" + options.user.get("username")
        }, this._client.request(options, function (error, response) {
            error ? doCallback(callback, [error, response, self], self) : self.fetch(callback)
        })) : doCallback(callback, [new miappSdkError("no user specified", "no_user_specified"), null, this], this)
}, miappSdk.Group.prototype.remove = function (options, callback) {
    var self = this;
    options.user ? (options = {
            method: "DELETE",
            endpoint: "groups/" + this._path + "/users/" + options.user.username
        }, this._client.request(options, function (error, response) {
            error ? doCallback(callback, [error, response, self], self) : self.fetch(callback)
        })) : doCallback(callback, [new miappSdkError("no user specified", "no_user_specified"), null, this], this)
}, miappSdk.Group.prototype.feed = function (callback) {
    var self = this, options = {method: "GET", endpoint: "groups/" + this._path + "/feed"};
    this._client.request(options, function (err, response) {
        doCallback(callback, [err, response, self], self)
    })
}, miappSdk.Group.prototype.createGroupActivity = function (options, callback) {
    var self = this, user = options.user, entity = new miappSdk.Entity({
        client: this._client,
        data: {
            actor: {
                displayName: user.get("username"),
                uuid: user.get("uuid"),
                username: user.get("username"),
                email: user.get("email"),
                picture: user.get("picture"),
                image: {duration: 0, height: 80, url: user.get("picture"), width: 80}
            }, verb: "post", content: options.content, type: "groups/" + this._path + "/activities"
        }
    });
    entity.save(function (err, response, entity) {
        doCallback(callback, [err, response, self])
    })
}, miappSdk.Counter = function (options) {
    this._client = options.client, this._data = options.data || {}, this._data.category = options.category || "UNKNOWN", this._data.timestamp = options.timestamp || 0, this._data.type = "events", this._data.counters = options.counters || {}
};
var COUNTER_RESOLUTIONS = ["all", "minute", "five_minutes", "half_hour", "hour", "six_day", "day", "week", "month"];
miappSdk.Counter.prototype = new miappSdk.Entity, miappSdk.Counter.prototype.fetch = function (callback) {
    this.getData({}, callback)
}, miappSdk.Counter.prototype.increment = function (options, callback) {
    var self = this, name = options.name, value = options.value;
    return name ? isNaN(value) ? doCallback(callback, [new miappSdkInvalidArgumentError("'value' for increment, decrement must be a number"), null, self], self) : (self._data.counters[name] = parseInt(value) || 1, self.save(callback)) : doCallback(callback, [new miappSdkInvalidArgumentError("'name' for increment, decrement must be a number"), null, self], self)
}, miappSdk.Counter.prototype.decrement = function (options, callback) {
    var self = this, name = options.name, value = options.value;
    self.increment({name: name, value: -(parseInt(value) || 1)}, callback)
}, miappSdk.Counter.prototype.reset = function (options, callback) {
    var self = this, name = options.name;
    self.increment({name: name, value: 0}, callback)
}, miappSdk.Counter.prototype.getData = function (options, callback) {
    var start_time, end_time, start = options.start || 0, end = options.end || Date.now(), resolution = (options.resolution || "all").toLowerCase(), counters = options.counters || Object.keys(this._data.counters), res = (resolution || "all").toLowerCase();
    COUNTER_RESOLUTIONS.indexOf(res) === -1 && (res = "all"), start_time = getSafeTime(start), end_time = getSafeTime(end);
    var self = this, params = Object.keys(counters).map(function (counter) {
        return ["counter", encodeURIComponent(counters[counter])].join("=")
    });
    params.push("resolution=" + res), params.push("start_time=" + String(start_time)), params.push("end_time=" + String(end_time));
    var endpoint = "counters?" + params.join("&");
    this._client.request({endpoint: endpoint}, function (err, data) {
        return data.counters && data.counters.length && data.counters.forEach(function (counter) {
            self._data.counters[counter.name] = counter.value || counter.values
        }), doCallback(callback, [err, data, self], self)
    })
}, miappSdk.Folder = function (options, callback) {
    var self = this;
    self._client = options.client, self._data = options.data || {}, self._data.type = "folders";
    var missingData = ["name", "owner", "path"].some(function (required) {
        return !(required in self._data)
    });
    return missingData ? doCallback(callback, [new miappSdkInvalidArgumentError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self], self) : void self.save(function (err, response) {
            err ? doCallback(callback, [new miappSdkError(response), response, self], self) : (response && response.entities && response.entities.length && self.set(response.entities[0]), doCallback(callback, [null, response, self], self))
        })
}, miappSdk.Folder.prototype = new miappSdk.Entity, miappSdk.Folder.prototype.fetch = function (callback) {
    var self = this;
    miappSdk.Entity.prototype.fetch.call(self, function (err, data) {
        err ? doCallback(callback, [null, data, self], self) : self.getAssets(function (err, response) {
                err ? doCallback(callback, [new miappSdkError(response), resonse, self], self) : doCallback(callback, [null, self], self)
            })
    })
}, miappSdk.Folder.prototype.addAsset = function (options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
            case"object":
                asset = options.asset, asset instanceof miappSdk.Entity || (asset = new miappSdk.Asset(asset));
                break;
            case"string":
                isUUID(options.asset) && (asset = new miappSdk.Asset({
                    client: self._client,
                    data: {uuid: options.asset, type: "assets"}
                }))
        }
        asset && asset instanceof miappSdk.Entity && asset.fetch(function (err, data) {
            if (err) doCallback(callback, [new miappSdkError(data), data, self], self); else {
                var endpoint = ["folders", self.get("uuid"), "assets", asset.get("uuid")].join("/"), options = {
                    method: "POST",
                    endpoint: endpoint
                };
                self._client.request(options, callback)
            }
        })
    } else doCallback(callback, [new miappSdkInvalidArgumentError("No asset specified"), null, self], self)
}, miappSdk.Folder.prototype.removeAsset = function (options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
            case"object":
                asset = options.asset;
                break;
            case"string":
                isUUID(options.asset) && (asset = new miappSdk.Asset({
                    client: self._client,
                    data: {uuid: options.asset, type: "assets"}
                }))
        }
        if (asset && null !== asset) {
            var endpoint = ["folders", self.get("uuid"), "assets", asset.get("uuid")].join("/");
            self._client.request({method: "DELETE", endpoint: endpoint}, function (err, response) {
                err ? doCallback(callback, [new miappSdkError(response), response, self], self) : doCallback(callback, [null, response, self], self)
            })
        }
    } else doCallback(callback, [new miappSdkInvalidArgumentError("No asset specified"), null, self], self)
}, miappSdk.Folder.prototype.getAssets = function (callback) {
    return this.getConnections("assets", callback)
}, XMLHttpRequest.prototype.sendAsBinary || (XMLHttpRequest.prototype.sendAsBinary = function (sData) {
    for (var nBytes = sData.length, ui8Data = new Uint8Array(nBytes), nIdx = 0; nIdx < nBytes; nIdx++)ui8Data[nIdx] = 255 & sData.charCodeAt(nIdx);
    this.send(ui8Data)
}), miappSdk.Asset = function (options, callback) {
    var self = this;
    self._client = options.client, self._data = options.data || {}, self._data.type = "assets";
    var missingData = ["name", "owner", "path"].some(function (required) {
        return !(required in self._data)
    });
    missingData ? doCallback(callback, [new miappSdkError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self], self) : self.save(function (err, data) {
            err ? doCallback(callback, [new miappSdkError(data), data, self], self) : (data && data.entities && data.entities.length && self.set(data.entities[0]), doCallback(callback, [null, data, self], self))
        })
}, miappSdk.Asset.prototype = new miappSdk.Entity, miappSdk.Asset.prototype.addToFolder = function (options, callback) {
    var self = this;
    if ("folder" in options && isUUID(options.folder)) {
        miappSdk.Folder({uuid: options.folder}, function (err, folder) {
            if (err) doCallback(callback, [miappSdkError.fromResponse(folder), folder, self], self); else {
                var endpoint = ["folders", folder.get("uuid"), "assets", self.get("uuid")].join("/"), options = {
                    method: "POST",
                    endpoint: endpoint
                };
                this._client.request(options, function (err, response) {
                    err ? doCallback(callback, [miappSdkError.fromResponse(folder), response, self], self) : doCallback(callback, [null, folder, self], self)
                })
            }
        })
    } else doCallback(callback, [new miappSdkError("folder not specified"), null, self], self)
}, miappSdk.Entity.prototype.attachAsset = function (file, callback) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob))return void doCallback(callback, [new miappSdkError("The File APIs are not fully supported by your browser."), null, this], this);
    var self = this, args = arguments, type = this._data.type, attempts = self.get("attempts");
    if (isNaN(attempts) && (attempts = 3), "assets" != type && "asset" != type)var endpoint = [this._client.URI, this._client.orgName, this._client.appName, type, self.get("uuid")].join("/"); else {
        self.set("content-type", file.type), self.set("size", file.size);
        var endpoint = [this._client.URI, this._client.orgName, this._client.appName, "assets", self.get("uuid"), "data"].join("/")
    }
    var xhr = new XMLHttpRequest;
    xhr.open("POST", endpoint, !0), xhr.onerror = function (err) {
        doCallback(callback, [new miappSdkError("The File APIs are not fully supported by your browser.")], xhr, self)
    }, xhr.onload = function (ev) {
        xhr.status >= 500 && attempts > 0 ? (self.set("attempts", --attempts), setTimeout(function () {
                self.attachAsset.apply(self, args)
            }, 100)) : xhr.status >= 300 ? (self.set("attempts"), doCallback(callback, [new miappSdkError(JSON.parse(xhr.responseText)), xhr, self], self)) : (self.set("attempts"), self.fetch(), doCallback(callback, [null, xhr, self], self))
    };
    var fr = new FileReader;
    fr.onload = function () {
        var binary = fr.result;
        "assets" !== type && "asset" !== type || (xhr.overrideMimeType("application/octet-stream"), xhr.setRequestHeader("Content-Type", "application/octet-stream")), xhr.sendAsBinary(binary)
    }, fr.readAsBinaryString(file)
}, miappSdk.Asset.prototype.upload = function (data, callback) {
    this.attachAsset(data, function (err, response) {
        err ? doCallback(callback, [new miappSdkError(err), response, self], self) : doCallback(callback, [null, response, self], self)
    })
}, miappSdk.Entity.prototype.downloadAsset = function (callback) {
    var endpoint, self = this, type = this._data.type, xhr = new XMLHttpRequest;
    endpoint = "assets" != type && "asset" != type ? [this._client.URI, this._client.orgName, this._client.appName, type, self.get("uuid")].join("/") : [this._client.URI, this._client.orgName, this._client.appName, "assets", self.get("uuid"), "data"].join("/"), xhr.open("GET", endpoint, !0), xhr.responseType = "blob", xhr.onload = function (ev) {
        var blob = xhr.response;
        "assets" != type && "asset" != type ? doCallback(callback, [null, blob, xhr], self) : doCallback(callback, [null, xhr, self], self)
    }, xhr.onerror = function (err) {
        callback(!0, err), doCallback(callback, [new miappSdkError(err), xhr, self], self)
    }, "assets" != type && "asset" != type ? xhr.setRequestHeader("Accept", self._data["file-metadata"]["content-type"]) : xhr.overrideMimeType(self.get("content-type")), xhr.send()
}, miappSdk.Asset.prototype.download = function (callback) {
    this.downloadAsset(function (err, response) {
        err ? doCallback(callback, [new miappSdkError(err), response, self], self) : doCallback(callback, [null, response, self], self)
    })
}, function (global) {
    function miappSdkError(message, name, timestamp, duration, exception) {
        this.message = message, this.name = name, this.timestamp = timestamp || Date.now(), this.duration = duration || 0, this.exception = exception
    }

    function miappSdkHTTPResponseError(message, name, timestamp, duration, exception) {
        this.message = message, this.name = name, this.timestamp = timestamp || Date.now(), this.duration = duration || 0, this.exception = exception
    }

    function miappSdkInvalidHTTPMethodError(message, name, timestamp, duration, exception) {
        this.message = message, this.name = name || "invalid_http_method", this.timestamp = timestamp || Date.now(), this.duration = duration || 0, this.exception = exception
    }

    function miappSdkInvalidURIError(message, name, timestamp, duration, exception) {
        this.message = message, this.name = name || "invalid_uri", this.timestamp = timestamp || Date.now(), this.duration = duration || 0, this.exception = exception
    }

    function miappSdkInvalidArgumentError(message, name, timestamp, duration, exception) {
        this.message = message, this.name = name || "invalid_argument", this.timestamp = timestamp || Date.now(), this.duration = duration || 0, this.exception = exception
    }

    function miappSdkKeystoreDatabaseUpgradeNeededError(message, name, timestamp, duration, exception) {
        this.message = message, this.name = name, this.timestamp = timestamp || Date.now(), this.duration = duration || 0, this.exception = exception
    }

    var short, name = "miappSdkError", _name = global[name], _short = short && void 0 !== short ? global[short] : void 0;
    return miappSdkError.prototype = new Error, miappSdkError.prototype.constructor = miappSdkError, miappSdkError.fromResponse = function (response) {
        return response && "undefined" != typeof response ? new miappSdkError(response.error_description, response.error, response.timestamp, response.duration, response.exception) : new miappSdkError
    }, miappSdkError.createSubClass = function (name) {
        return name in global && global[name] ? global[name] : (global[name] = function () {
            }, global[name].name = name, global[name].prototype = new miappSdkError, global[name])
    }, miappSdkHTTPResponseError.prototype = new miappSdkError, miappSdkInvalidHTTPMethodError.prototype = new miappSdkError, miappSdkInvalidURIError.prototype = new miappSdkError, miappSdkInvalidArgumentError.prototype = new miappSdkError, miappSdkKeystoreDatabaseUpgradeNeededError.prototype = new miappSdkError, global.miappSdkHTTPResponseError = miappSdkHTTPResponseError, global.miappSdkInvalidHTTPMethodError = miappSdkInvalidHTTPMethodError, global.miappSdkInvalidURIError = miappSdkInvalidURIError, global.miappSdkInvalidArgumentError = miappSdkInvalidArgumentError, global.miappSdkKeystoreDatabaseUpgradeNeededError = miappSdkKeystoreDatabaseUpgradeNeededError, global[name] = miappSdkError, void 0 !== short && (global[short] = miappSdkError), global[name].noConflict = function () {
        return _name && (global[name] = _name), void 0 !== short && (global[short] = _short), miappSdkError
    }, global[name]
}(this || window);
var SrvMiapp = function () {
    "use strict";
    function Service(logger, promise) {
        this.logger = logger, this.promise = promise, this.logger.log("miapp.sdk.service : init"), this.miappClient = null, this.currentUser = _getObjectFromLocalStorage("miappCurrentUser") || null, this.miappId = null, this.miappSalt = "miappDefaultSalt", this.miappOrg = "miapp.io", this.miappAppVersion = "draft", this.miappIsOffline = _getObjectFromLocalStorage("miappIsOffline") || !1, this.miappURL = _getObjectFromLocalStorage("miappURL") || "https://miapp.io/api", this.miappDBURL = _getObjectFromLocalStorage("miappDBURL") || "https://couchdb01.miapp.io", this.miappAuthEndDate = new Date, this.miappAuthEndDate.setDate(this.miappAuthEndDate.getDate() + 1);
        var ls = _getObjectFromLocalStorage("miappAuthEndDate"), miappAuthEndDate = ls;
        miappAuthEndDate && (this.miappAuthEndDate = new Date(miappAuthEndDate)), this._db = new PouchDB("miapp_db", {adapter: "websql"}), this._dbRecordCount = 0, this._dbInitialized = !1
    }

    function _setObjectFromLocalStorage(id, object) {
        var jsonObj = JSON.stringify(object);
        return window.localStorage && window.localStorage.setItem(id, jsonObj), jsonObj
    }

    function _getObjectFromLocalStorage(id) {
        var retrievedObject;
        window.localStorage && (retrievedObject = window.localStorage.getItem(id));
        var obj = JSON.parse(retrievedObject);
        return obj
    }

    function _removeObjectFromLocalStorage(id) {
        window.localStorage && window.localStorage.removeItem(id)
    }

    function _generateObjectUniqueId(appName, type, name) {
        var now = new Date, simpleDate = "" + now.getYear() + now.getMonth() + now.getDate() + now.getHours() + now.getMinutes(), sequId = ++_srvDataUniqId, UId = "";
        return appName && appName.charAt(0) && (UId += appName.charAt(0) + ""), type && type.length > 3 && (UId += type.substring(0, 4)), name && name.length > 3 && (UId += name.substring(0, 4)), UId += simpleDate + "" + sequId
    }

    Service.prototype.miappInit = function (miappId, miappSalt, forceOnline) {
        this.logger.log("miapp.sdk.service.miappInit : " + miappId + " ? " + forceOnline), this.miappIsOffline = "undefined" == typeof forceOnline ? this.miappIsOffline : !forceOnline, this.miappIsOffline || (this.miappClient = new miappSdk.Client({
            orgName: "miappio",
            appName: miappId,
            logging: !0,
            buildCurl: !1,
            URI: this.miappURL
        })), this.miappId = miappId, this.miappSalt = miappSalt
    }, Service.prototype.miappLogin = function (login, password, forceOnline) {
        var self = this;
        self.logger.log("miapp.sdk.service.miappLogin");
        var now = new Date, isDeprecated = self.miappAuthEndDate < now;
        return self.logger.log("miapp.sdk.service.miappLogin : is isDeprecated ? ", isDeprecated, self.miappAuthEndDate, now), self._dbInitialized && self.currentUser && !forceOnline && !isDeprecated ? self.promise.resolve(self.currentUser) : ((forceOnline || isDeprecated) && self.setOffline(!1), new self.promise(function (resolve, reject) {
                self.isDbEmpty().then(function (isEmpty) {
                    if (self.logger.log("miapp.sdk.service.miappLogin : is empty ? ", isEmpty), forceOnline || isDeprecated)return self.logger.log("miapp.sdk.service.miappLogin : self.miappAuthEndDate ? ", self.miappAuthEndDate), void self.loginInternal(login, password).then(function (firstUser) {
                        firstUser && (self.logger.log("miapp.sdk.service.miappLogin : login done for the first time."), self.setCurrentUser(firstUser)), self.syncDb().finally(function (ret) {
                            self.logger.log("miapp.sdk.service.miappLogin : self.currentUser", self.currentUser), self.currentUser ? (self._dbInitialized = !0, resolve(self.currentUser)) : reject("miapp.sdk.service.miappLogin : Pb with user get." + ret)
                        })
                    }).catch(function (err) {
                        var errMsg = "miapp.sdk.service.miappLogin : " + err;
                        self.logger.error(errMsg), reject(errMsg)
                    });
                    if (!isEmpty && self.currentUser)return self.logger.log("miapp.sdk.service.miappLogin : self.miappAuthEndDate ? ", self.miappAuthEndDate), self._dbInitialized = !0, void resolve(self.currentUser);
                    var nextFn = function () {
                        return self.loginInternal(login, password).then(function (firstUser) {
                            self.logger.log(self.currentUser), firstUser && !self.currentUser && (self.logger.log("miapp.sdk.service.miappLogin : login done for the first time.."), self.setCurrentUser(firstUser)), self.logger.log("miapp.sdk.service.miappLogin : sync DB..."), self.syncDb().finally(function (ret) {
                                self.logger.log(self.currentUser), self.currentUser ? (self._dbInitialized = !0, resolve(self.currentUser)) : reject("miapp.sdk.service.miappLogin : Pb with user get." + ret)
                            })
                        }).catch(function (err) {
                            self.logger.error("miapp.sdk.service.miappLogin : err ..: ", err), reject(err)
                        })
                    };
                    isEmpty ? nextFn() : self.becarefulCleanDb().then(nextFn)
                }).catch(function (err) {
                    self.logger.error("miapp.sdk.service.miappLogin : err : ", err), reject(err)
                })
            }))
    }, Service.prototype.miappIsLogin = function () {
        return !!this.currentUser
    }, Service.prototype.miappLogoff = function () {
        var self = this;
        return self.currentUser ? (self.currentUser = null, _removeObjectFromLocalStorage("miappCurrentUser"), self.becarefulCleanDb()) : self.promise.reject("miapp.sdk.service not login")
    }, Service.prototype.miappSync = function (fnInitFirstData, service, forceOnline) {
        var self = this;
        return self.logger.log("miapp.sdk.service.miappSync"), self.currentUser && self._db ? (forceOnline && self.setOffline(!1), new self.promise(function (resolve, reject) {
                self.isDbEmpty().then(function (isEmpty) {
                    if (isEmpty && fnInitFirstData) {
                        var ret = fnInitFirstData(service);
                        if (ret && ret.catch instanceof Function)return ret;
                        "string" == typeof ret && self.logger.log(ret)
                    }
                    return self.promise.resolve("miapp.sdk.service.miappSync : ready to sync")
                }).then(function (ret) {
                    return "string" == typeof ret && self.logger.log(ret), self.syncDb()
                }).then(function (err) {
                    return err ? reject(err) : (self.logger.log("miapp.sdk.service.miappSync sync resolved"), self._db.info())
                }).then(function (result) {
                    self._dbRecordCount = 0, result && result.doc_count && (self._dbRecordCount = result.doc_count), self.logger.log("miapp.sdk.service.miappSync _dbRecordCount : " + self._dbRecordCount), resolve(self._dbRecordCount)
                }).catch(function (err) {
                    var errMessage = "miapp.sdk.service.miappSync : DB pb with getting data (" + err + ")";
                    reject(errMessage)
                })
            })) : self.promise.reject("miapp.sdk.service.miappSync : DB sync impossible. Did you miapp.sdk.service.miappLogin() ?")
    }, Service.prototype.miappPutInDb = function (data) {
        var self = this;
        if (self.logger.log("miapp.sdk.service.miappPutInDb"), self.logger.log(data), !self.currentUser || !self.currentUser._id || !self._db)return self.promise.reject("miapp.sdk.service.miappPutInDb : DB put impossible. Need a user logged in. (" + self.currentUser + ")");
        data.miappUserId = self.currentUser._id, data.miappOrgId = self.miappOrg, data.miappAppVersion = self.miappAppVersion;
        var dataId = data._id;
        return dataId || (dataId = _generateObjectUniqueId(self.appName)), delete data._id, data._id = dataId, new self.promise(function (resolve, reject) {
            self._db.put(data, function (err, response) {
                return response && response.ok && response.id && response.rev ? (data._id = response.id, data._rev = response.rev, self._dbRecordCount++, self.logger.log("updatedData: " + data._id + " - " + data._rev), void resolve(data)) : void reject(err)
            })
        })
    }, Service.prototype.miappFindInDb = function (id) {
        var self = this;
        return self.currentUser && self.currentUser._id && self._db ? self._db.get(id) : self.promise.reject("miapp.sdk.service.miappFindInDb : need a user logged in. (" + self.currentUser + ")")
    }, Service.prototype.miappFindAllInDb = function () {
        var self = this;
        return self.currentUser && self.currentUser._id && self._db ? self._db.allDocs({
                include_docs: !0,
                descending: !0
            }) : self.promise.reject("miapp.sdk.service.miappFindAllInDb : need a user logged in. (" + self.currentUser + ")")
    }, Service.prototype.setAuthEndpoint = function (endpointURI) {
        this.miappURL = endpointURI, this.miappURL && _setObjectFromLocalStorage("miappURL", this.miappURL), this.miappClient && this.miappURL && this.miappClient.setMiappURL(this.miappURL)
    }, Service.prototype.setDBEndpoint = function (endpointURI) {
        this.miappDBURL = endpointURI, this.miappDBURL && _setObjectFromLocalStorage("miappDBURL", this.miappDBURL)
    }, Service.prototype.setAuthEndDate = function (endDate) {
        this.miappAuthEndDate = endDate, this.miappAuthEndDate && _setObjectFromLocalStorage("miappAuthEndDate", this.miappAuthEndDate)
    }, Service.prototype.setOffline = function (b) {
        this.miappIsOffline = 1 == b, _setObjectFromLocalStorage("miappIsOffline", this.miappIsOffline)
    }, Service.prototype.loginInternal = function (login, password, updateProperties) {
        var self = this;
        return new self.promise(function (resolve, reject) {
            if (!self.miappClient && !self.miappIsOffline)return void reject("miapp.sdk.service.loginInternal : not initialized. Did you miapp.sdk.service.miappInit() ?");
            var encrypted_json_str = password;
            if (self.logger.log("miapp.sdk.service.loginInternal : " + login + " / " + encrypted_json_str), !self.miappClient || self.miappIsOffline) {
                var offlineUser = {};
                return login && (offlineUser.email = login), encrypted_json_str && (offlineUser.password = encrypted_json_str), self.setCurrentUser(offlineUser), void resolve(self.currentUser)
            }
            var fullLogin = function () {
                self.logger.log("miapp.sdk.service.loginInternal Check Full Login"), self.miappClient.logout(), self.currentUser && self.currentUser.access_token && delete self.currentUser.access_token, self.miappClient.loginMLE(self.miappId, login, encrypted_json_str, updateProperties, function (err, loginUser) {
                    return err || !loginUser ? (self.logger.error("miapp.sdk.service.loginInternal error : " + err), reject(err)) : (loginUser.email = login, loginUser.miappURL && self.setAuthEndpoint(loginUser.miappURL), loginUser.miappDBURL && self.setDBEndpoint(loginUser.miappDBURL), loginUser.miappNeedRefresh && self.setAuthEndDate(loginUser.miappNeedRefresh), delete loginUser.miappURL, delete loginUser.miappDBURL, delete loginUser.miappNeedRefresh, self.setCurrentUser(loginUser), void resolve(self.currentUser))
                })
            }, sameUser = self.currentUser && self.currentUser.email === login && self.currentUser.password === encrypted_json_str, noUser = !login && !password;
            self.currentUser && self.currentUser.access_token && (noUser || sameUser) ? (login = self.currentUser.email, self.logger.log("miapp.sdk.service.loginInternal Check Token"), self.miappClient.reAuthenticateMLE(function (err) {
                    err ? (self.logger.error("miapp.sdk.service.loginInternal Check Token error : " + err), noUser ? reject("Need to login again ...") : fullLogin()) : resolve(self.currentUser)
                })) : fullLogin()
        })
    }, Service.prototype.deleteUser = function (userIDToDelete) {
        var self = this;
        return self.miappIsOffline ? self.promise.resolve(null) : self.miappClient ? new self.promise(function (resolve, reject) {
                    self.miappClient.deleteUserMLE(userIDToDelete, function (err) {
                        return err ? reject(err) : resolve()
                    })
                }) : self.promise.reject("miapp.sdk.service not initialized")
    }, Service.prototype.isDbEmpty = function () {
        var self = this;
        if (self.logger.log("miapp.sdk.service.isDbEmpty .."), !self._db) {
            var error = "miapp.sdk.service.isDbEmpty : DB search impossible. Need a user logged in. (" + self.currentUser + ")";
            return self.logger.error(error), self.promise.reject(error)
        }
        return self.logger.log("miapp.sdk.service.isDbEmpty call"), new self.promise(function (resolve, reject) {
            self._db.allDocs({}, function (err, response) {
                return self.logger.log("miapp.sdk.service.isDbEmpty callback"), err || !response ? void reject(err) : (self._dbRecordCount = response.total_rows, response.total_rows && response.total_rows > 0 ? void resolve(!1) : (self.logger.log("miapp.sdk.service.isDbEmpty callback: " + response.total_rows), void resolve(!0)))
            })
        })
    }, Service.prototype.syncDb = function () {
        var self = this;
        if (self.logger.log("miapp.sdk.service.syncDb"), self.miappIsOffline)return self.promise.resolve();
        var pouchdbEndpoint = self.miappDBURL, getendpoint = self.miappClient ? self.miappClient.getEndpoint() : null;
        return !pouchdbEndpoint && getendpoint && (pouchdbEndpoint = getendpoint), self.currentUser && self.currentUser.email && pouchdbEndpoint && self._db && self._db.sync ? (self.logger.log("miapp.sdk.service.syncDb call"), new self.promise(function (resolve, reject) {
                try {
                    self._db.sync(pouchdbEndpoint, {
                        filter: function (doc) {
                            if (self.currentUser && self.currentUser._id)return doc.miappUserId === self.currentUser._id ? doc : void 0
                        }
                    }).on("complete", function (info) {
                        self.logger.log("miapp.sdk.service.syncDb : db complete : " + info), resolve()
                    }).on("error", function (err) {
                        self.logger.error("miapp.sdk.service.syncDb : db error, we set db temporary offline : " + err), self.miappIsOffline = !0, reject("Connection problem  ...")
                    }).on("change", function (info) {
                        self.logger.log("miapp.sdk.service.syncDb : db change : " + info)
                    }).on("paused", function (err) {
                        self.logger.log("miapp.sdk.service.syncDb : db paused : " + err)
                    }).on("active", function () {
                        self.logger.log("miapp.sdk.service.syncDb : db activate")
                    }).on("denied", function (info) {
                        self.logger.error("miapp.sdk.service.syncDb : db denied, we set db temporary offline_ : " + info), self.miappIsOffline = !0, reject("miapp.sdk.service.syncDb : db denied : " + info)
                    })
                } catch (err) {
                    reject("miapp.sdk.service.syncDb : erreur catched : " + err)
                }
            })) : self.promise.reject("miapp.sdk.service.syncDb : DB sync impossible. Need a user logged in. (" + pouchdbEndpoint + " -" + self.currentUser + ")")
    }, Service.prototype.setCurrentUser = function (user) {
        var self = this;
        if (!user)return self.logger.log("miapp.sdk.service.setCurrentUser : need a valid user");
        self.currentUser || (self.currentUser = {});
        var firstUserId = user._id;
        firstUserId || (firstUserId = self.currentUser._id), firstUserId || (firstUserId = _generateObjectUniqueId(self.miappAppVersion, "user")), user._id = firstUserId, user.miappUserId = firstUserId, user.miappOrgId = self.miappOrgId, user.miappAppVersion = self.miappAppVersion;
        for (var attrname in user)user[attrname] && (self.currentUser[attrname] = user[attrname]);
        delete self.currentUser._rev, _setObjectFromLocalStorage("miappCurrentUser", self.currentUser), self.logger.log("miapp.sdk.service.setCurrentUser :", self.currentUser)
    }, Service.prototype.putFirstUserInEmptyDb = function (firstUser) {
        var self = this;
        if (self.logger.log("miapp.sdk.service.putFirstUserInEmptyBd"), !(firstUser && self.currentUser && self.currentUser.email && self._db && self._db.put))return self.promise.reject("miapp.sdk.service.putFirstUserInEmptyBd : DB put impossible. Need a user logged in. (" + self.currentUser + ")_");
        var firstUserId = firstUser._id;
        return firstUserId || (firstUserId = self.currentUser._id), firstUserId || (firstUserId = _generateObjectUniqueId(self.appName, "user")), firstUser.miappUserId = firstUserId, firstUser.miappOrgId = self.miappOrg, firstUser.miappAppVersion = self.miappAppVersion, delete firstUser._id, firstUser._id = firstUserId, new self.promise(function (resolve, reject) {
            try {
                self.logger.log("miapp.sdk.service.putFirstUserInEmptyBd : put ..."), self._db.put(firstUser).then(function (response) {
                    self.logger.log("miapp.sdk.service.putFirstUserInEmptyBd : then ..."), response && response.ok && response.id && response.rev ? (firstUser._id = response.id, firstUser._rev = response.rev, self.logger.log("miapp.sdk.service.putFirstUserInEmptyBd : firstUser: " + firstUser._id + " - " + firstUser._rev), self._dbRecordCount++, self.setCurrentUser(firstUser), resolve(firstUser)) : reject("miapp.sdk.service.putFirstUserInEmptyBd : bad response")
                }).catch(function (err) {
                    self.logger.log("miapp.sdk.service.putFirstUserInEmptyBd : catched : " + err), reject(err)
                })
            } catch (err) {
                self.logger.log("miapp.sdk.service.putFirstUserInEmptyBd : catched ...: " + err), reject(err)
            }
        })
    }, Service.prototype.becarefulCleanDb = function () {
        var self = this;
        return self.logger.log("miapp.sdk.service.becarefulCleanDb"), self._db && self._db.destroy ? new self.promise(function (resolve, reject) {
                self._db.destroy(function (err, info) {
                    return err ? reject(err) : (self._db = new PouchDB("miapp_db", {adapter: "websql"}), self._dbRecordCount = 0, self.logger.log("miapp.sdk.service.becarefulCleanDb .. done : " + info), resolve())
                })
            }) : self.promise.reject("miapp.sdk.service.becarefulCleanDb : DB clean impossible.")
    }, Service.prototype._testPromise = function (a) {
        return a ? this.promise.resolve("test promise ok " + a) : new this.promise(function (resolve, reject) {
                resolve("test promise ok")
            })
    };
    var _srvDataUniqId = 0;
    return Service
}();