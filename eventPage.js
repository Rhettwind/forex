//var forex_url = 'https://finance.yahoo.com/webservice/v1/symbols/RUB=X,EURRUB=X,BTCUSD=X,XAUUSD=X,###/quote?format=json';
//var forex_url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22RUB%3DX%2CEURRUB%3DX%2CBTCUSD%3DX%2CXAUUSD%3DX%2C###%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
//var forex_url_f = 'https://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quote where symbol in ("RUB=X,EURRUB=X,BTCUSD=X,GC=F,BZ=F")&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
var forex_url_f = 'https://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote?format=json'
var forex_url = "";
var ya_oil_url = 'https://export.yandex.ru/bar/quotes.xml?id=1006';
var cbr_url_prev_f = 'http://www.cbr.ru/scripts/XML_daily.asp?date_req=###'
var cbr_url_prev="";
var cbr_url = 'http://www.cbr.ru/scripts/XML_daily.asp';
//var btc_url = 'http://api.bitcoincharts.com/v1/markets.json'
var btc_url = 'https://www.bitstamp.net/api/ticker/'
var rates = [[],[],[],[],[],[],[],[]];

chrome.runtime.onInstalled.addListener(function(details){

    localStorage.visibl = localStorage.visibl || "1111111001000000000010000000000000100100000000000000000000";
    localStorage.refresh = localStorage.refresh || 3;
    localStorage.cur = localStorage.cur || 0;
    localStorage.se1 = localStorage.se1 || 0;
    localStorage.se12 = localStorage.sel2 || 1;
    localStorage.graph = localStorage.graph || 1;
    chrome.browserAction.setBadgeText({text:"wait"});
    chrome.browserAction.setBadgeBackgroundColor({color: "#3A6E1B"});
    localStorage.init = 0;
    localStorage.rates = "[]";
    get_all();
});


chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == 'timer') {
        get_all();
    }
});

chrome.alarms.create('timer', {
    delayInMinutes: 1,
    periodInMinutes: (parseInt(localStorage.refresh) || 3)
});


function get_all() {
    var d = new Date();
    d.setMonth(d.getMonth() + 2);
    var month = ["F","G","H","J","K","M","N","Q","U","V","X","Z"];
    localStorage.oil_graph = "NYMEX:J26" + month[d.getMonth()] + (d.getFullYear()).toString();
    var sym = "BZ" + month[d.getMonth()] + (d.getFullYear()).toString().substr(2,2) + ".NYM";
    forex_url = forex_url_f.replace("###", sym);
    console.log(forex_url);
    get_cur(forex_url);
    get_cur(ya_oil_url);
    get_cur(btc_url);

    localStorage.CB = 0;
    if (chrome.extension.getViews({ type: "popup" }).length > 0 && document.getElementById("CBdate").value != "") {
        var dd = document.getElementById("CBdate").value.split("-");
        var cur = dd[2] + "/" + dd[1] + "/" + dd[0];
        cbr_url = cbr_url_prev_f.replace("###", cur);
    }
    else {
        cbr_url = 'http://www.cbr.ru/scripts/XML_daily.asp';
    }
    get_cur(cbr_url);

    if (localStorage.DateCB) {
        var cur = new Date(Date.parse(localStorage.DateCB.substr(3,2)+'/'+localStorage.DateCB.substr(0,2)+'/'+localStorage.DateCB.substr(6,4)));
        cur.setDate(cur.getDate()-1);
        function pad(s) { return (s < 10) ? '0' + s : s; }
        cur = [pad(cur.getDate()), pad(cur.getMonth()+1), cur.getFullYear()].join('/');
        cbr_url_prev = cbr_url_prev_f.replace("###", cur);
        get_cur(cbr_url_prev);
    }
}


function get_cur(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    console.log("call: " + url);

    xhr.send();

    xhr.onerror = function() {
            chrome.browserAction.setBadgeBackgroundColor({color: "#CCC"});
	    };

    xhr.onload = function() {
        if ( xhr.status != 200 ) {
            //if (localStorage.refresh > 1) setTimeout(function() { get_cur(url) }, 60000);
            chrome.browserAction.setBadgeBackgroundColor({color: "#CCC"});
            console.log(xhr.status + ":" + url);
            return;
        }
        var json = xhr.responseText;
        if (url==forex_url || url == btc_url) {
            //json = json.replace(/^[^(]*\(([\S\s]+)\);?$/, '$1'); // Turn JSONP in JSON
            json = JSON.parse(json);
        }
        if (json.error) {
            chrome.browserAction.setBadgeBackgroundColor({color: "#CCC"});
            return;
            }
        else {
            if (localStorage.rates) { rates = JSON.parse(localStorage.rates); }
            switch (url) {
                case forex_url:
                    //rates[0] = ["USD", json.query.results.quote["0"].LastTradePriceOnly, "USD",1,"Доллар США", "FX_IDC:USDRUB", json.query.results.quote["0"].Change];
                    //rates[1] = ["EUR", json.query.results.quote["1"].LastTradePriceOnly, "EUR",1,"Евро", "FX_IDC:EURRUB", json.query.results.quote["1"].Change];
                    //rates[2] = ["BTC", json.query.results.quote["2"].LastTradePriceOnly, "BTC",1,"Биткоин (цена в долларах)", "BITSTAMP:BTCUSD", json.query.results.quote["2"].Change];
                    //rates[3] = ["GLD", json.query.results.quote["3"].LastTradePriceOnly, "GOLD",1,"Тройскую унцию золота (цена в долларах)","FX_IDC:XAUUSD", json.query.results.quote["3"].Change];
                    //rates[4] = ["OIL", json.query.results.quote["4"].LastTradePriceOnly, "OIL",1,"Баррель нефти BRENT (цена в долларах)", localStorage.oil_graph, json.query.results.quote["4"].Change];
                    usd = json.list.resources.filter(function(v){return v.resource.fields.name=="USD/RUB"})[0].resource.fields.price;
                    rates[0] = ["USD", usd, "USD",1,"Доллар США", "FX_IDC:USDRUB", 0];
                    eur = usd / json.list.resources.filter(function(v){return v.resource.fields.name=="USD/EUR"})[0].resource.fields.price;
                    rates[1] = ["EUR", eur, "EUR",1,"Евро", "FX_IDC:EURRUB", 0];
                    gld = 1 / json.list.resources.filter(function(v){return v.resource.fields.name=="XAU=X"})[0].resource.fields.price;
                    rates[3] = ["GLD", gld, "GOLD",1,"Тройскую унцию золота (цена в долларах)","FX_IDC:XAUUSD", 0];
                    break;
                case btc_url:
                    //rates[2] = ["BTC", json.filter(function(v){return v.symbol=="bitstampUSD"})[0].close, "BTC",1,"Биткоин (цена в долларах)", "BITSTAMP:BTCUSD", 0]; //bitcoincharts
                    rates[2] = ["BTC", json.last, "BTC",1,"Биткоин (цена в долларах)", "BITSTAMP:BTCUSD", 0];
                    break;
                case ya_oil_url:
                    rates[4] = ["OIL", xhr.responseXML.getElementsByTagName('value')[0].childNodes[0].nodeValue, "OIL",1,"Баррель нефти BRENT (цена в долларах)", "FX_IDC:USDBRO", xhr.responseXML.getElementsByTagName('change')[0].childNodes[0].nodeValue];
                    break;
                case cbr_url_prev:
                    var valutes = xhr.responseXML.getElementsByTagName("Valute");
                    localStorage.old_rates="";
                    for (var i = 0; i < valutes.length; i++){
                        localStorage.old_rates += valutes[i].children[1].innerHTML;
                        localStorage.old_rates += (valutes[i].children[4].innerHTML).replace(',', '.') + "#";
                    }
                    if (chrome.extension.getViews({ type: "popup" }).length > 0) {
                        if (document.activeElement.id == "CBdate") location.reload(true);
                    }
                    break;
                case cbr_url:
                    localStorage.DateCB = xhr.responseXML.getElementsByTagName("ValCurs")[0].attributes[0].nodeValue;
                    var valutes = xhr.responseXML.getElementsByTagName("Valute");
                    var k=0;
                    for (var i = 0; i < valutes.length; i++){
                        var sym = valutes[i].children[1].innerHTML;
                        rates[i+7+k]= [sym, (valutes[i].children[4].innerHTML).replace(',', '.'), "",
                                       valutes[i].children[2].innerHTML,valutes[i].children[3].innerHTML, sym + "RUB"];

                        if (localStorage.old_rates) {
                            var beg = localStorage.old_rates.indexOf(sym)+3;
                            var end = localStorage.old_rates.indexOf("#", beg);
                            rates[i+7+k][6] = (rates[i+7+k][1] - localStorage.old_rates.substr(beg, end - beg)).toFixed(4);
                            }
                        if (valutes[i].children[1].innerHTML=="USD") { rates[5]=rates[i+7+k]; rates[5][2]="CBR_USD"; k--}
                        if (valutes[i].children[1].innerHTML=="EUR") { rates[6]=rates[i+7+k]; rates[6][2]="CBR_EUR"; k--}
                        }
                    break;
                }
            localStorage.rates = JSON.stringify(rates);
            localStorage.lasttime = ("0" + (new Date()).getHours()).slice(-2) + ":" + ("0" + (new Date()).getMinutes()).slice(-2);

            if ( rates[localStorage.cur] && rates[localStorage.cur]!="" ) {
                if ( localStorage.init==0 ) {
                    chrome.browserAction.setIcon( {path: { "19": src_icon(localStorage.cur, 19),
                                                           "38": src_icon(localStorage.cur, 38)}});
                    localStorage.init = 1;
                }
                var badge = parseFloat(rates[localStorage.cur][1]).toFixed(1);
                if ( badge>99 && badge<999) badge=badge.substring(0,3);
                if ( badge>999) badge=(badge/1000).toString().substring(0,4);
                chrome.browserAction.setBadgeText({text:badge});
                chrome.browserAction.setBadgeBackgroundColor({color: "#3A6E1B"});
                var title = "Время запроса: " + localStorage.lasttime + "\n\n" + "Биржевые курсы:\n";
                for (i=0; i<7; i++) {
                    if (rates[i]) {title+= rates[i][0] + "\t" + (parseFloat(rates[i][1])).toFixed(2) + "\n"; }
                    if (i==4) title+="\nКурсы ЦБ на " + localStorage.DateCB +"\n"
                }
                chrome.browserAction.setTitle({title:   title });
            }
        }
    };
}
