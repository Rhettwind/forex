function list_rates() {

    if (localStorage.graph == 0) document.getElementById('gr_tab').style.display="none";
    var sel1 = document.getElementById('sel1');
    var sel2 = document.getElementById('sel2');
    var rates_div = document.getElementById('rates');
    var rates = JSON.parse(localStorage.rates);
    for (var i=0; i < rates.length; i++){
        var itm = document.getElementById("rate");
        var cln = itm.cloneNode(true);
        cln.id=i;
        cln.style.display="inline-block";
        if ( localStorage.visibl.charAt(i) == 0 ) cln.style.display="none";
        cln.childNodes[1].src = src_icon(i,38);
        cln.childNodes[2].innerHTML = rates[i][0];
        cln.childNodes[3].innerHTML = parseFloat(rates[i][1]).toFixed(2);
        cln.setAttribute('data', parseFloat(rates[i][1]).toFixed(4));
        cln.title = "за " + rates[i][3] +" " + rates[i][4];
        rates_div.appendChild(cln);

        var cln2 = cln.cloneNode(true);
        cln2.style.display="inline-block";
        cln2.id = "e"+ i.toString();
        cln2.style.opacity = localStorage.visibl.charAt(i) * 0.5 + 0.5;
        document.getElementById('edit_cb_win').appendChild(cln2);

        var change = (parseFloat(rates[i][6])).toFixed(2);
        if (change > 0) {
            change = "+" + change;
            cln.childNodes[4].style.color = "green";
        }
        if (change == 0) cln.childNodes[4].style.color = "#F000";
        cln.childNodes[4].innerHTML = change;

        if ( i==4) {
            cln = document.getElementById("CB");
            cln.childNodes[1].innerHTML+=localStorage.DateCB;
            cln.style.display="block";
            rates_div.appendChild(cln);
        }


        var opt = document.createElement('option');
        opt.innerHTML = rates[i][0];
        if ( i>4 ) opt.innerHTML += " ЦБ";
        opt.value = parseFloat(rates[i][1])/parseFloat(rates[i][3]);
        if ( i==2 || i==3 || i==4 ) opt.value = parseFloat(rates[0][1]) * parseFloat(rates[i][1]) / parseFloat(rates[i][3]);
        sel1.appendChild(opt);
        var opt2 = opt.cloneNode(true);
        sel2.appendChild(opt2);
    }
    document.getElementById("time").innerHTML = localStorage.lasttime;
    document.getElementById(localStorage.cur).style.background = "#E0E0E0";
    document.getElementById('interval').value = localStorage.refresh;
    document.getElementById("sel1").selectedIndex = localStorage.sel1;
    document.getElementById("sel2").selectedIndex = localStorage.sel2;

    document.getElementById("gr_tab").checked = localStorage.graph * 1;
    graph(rates[localStorage.cur][5]);
}


document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById("rate")) return;
    list_rates();
    var rate_div = document.getElementsByClassName("rate");
    for (var i=0;i<rate_div.length;i++){
        rate_div[i].onclick = function(){click_div(event)};
    }
    document.getElementById("val1").oninput = function() { calc(1); };
    document.getElementById("sel1").onchange = function() { calc(1); };
    document.getElementById("val2").oninput = function() { calc(0); };
    document.getElementById("sel2").onchange = function() { calc(0); }
    document.getElementById("edit_cb").onclick = function() { edit_cb(); }
    document.getElementById("overlay").onclick = function() { location.reload(true); }
    document.getElementById("close").onclick = function() { location.reload(true); }
    document.getElementById("graph_tab").onclick = function() { localStorage.graph = 1 - localStorage.graph; location.reload(true); }
    document.getElementById("CBdate").onchange = function() { get_all(); }

    var refresh = document.getElementById("interval");
    refresh.oninput = function() {
        if (refresh.value > 0) { localStorage.refresh = refresh.value; }
        else { refresh.value = localStorage.refresh; }
        };
});


function graph(symbol) {
    if (localStorage.graph==0) return;

    setTimeout(function(){
        new TradingView.widget({
          "container_id": "graph",
          "width": 750,
          "height": 230,
          "symbol": symbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "White",
          "style": "1",
          "locale": "ru",
          "toolbar_bg": "#f1f3f6",
          //"hide_top_toolbar": true,
          "allow_symbol_change": true,
          "save_image": false,
          "hideideas": true
        });
    },0);
}


function calc(f) {

    var sel1 = document.getElementById("sel1");
    var s1 = parseFloat(sel1.options[sel1.selectedIndex].value);
    var sel2 = document.getElementById("sel2");
    var s2 = parseFloat(sel2.options[sel2.selectedIndex].value);
    var v1 = parseFloat(document.getElementById("val1").value);
    var v2 = parseFloat(document.getElementById("val2").value);
    localStorage.sel1 = sel1.selectedIndex;
    localStorage.sel2 = sel2.selectedIndex;

    if (f) { document.getElementById('val2').value = (v1*s1/s2).toFixed(4) }
    else { document.getElementById('val1').value = (v2*s2/s1).toFixed(4) }
}


function click_div(event) {

    var rates = JSON.parse(localStorage.rates);
    var id = event.currentTarget.id;
    if ( id.charAt(0)=="e" ) {
        id = parseInt(id.substr(1));
        var visibl = parseInt(localStorage.visibl.charAt(id))^1;
        localStorage.visibl = localStorage.visibl.substr(0,id) + visibl + localStorage.visibl.substr(id+1);
        event.currentTarget.style.opacity = visibl * 0.5 + 0.5;
        return;
    }
    document.getElementById(localStorage.cur).style.background = "";
    localStorage.cur = id;
    document.getElementById(localStorage.cur).style.background = "#E0E0E0";
    chrome.browserAction.setIcon( {path: { "19": src_icon(localStorage.cur, 19),
                                           "38": src_icon(localStorage.cur, 38)}});
    var cur = parseFloat(document.getElementById(id).getAttribute("data")); //parseFloat(rates[localStorage.cur][1]);
    chrome.browserAction.setBadgeText({text:cur.toFixed(1)});
    copyToClipboard(cur);
    var div = document.getElementById('copy');
    div.innerHTML = 'скопировано ' + cur; //.toFixed(4);
    graph(rates[localStorage.cur][5]);
}


function src_icon (i, size) {

  var rates = JSON.parse(localStorage.rates);
  if (rates[i]==null) return "";
  if ( rates[i][2] !="" ) { return rates[i][2] + size + '.png'}

  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  var context = canvas.getContext('2d');
  context.fillStyle = "#FFF";
  context.rect(0,0,size,size);
  context.fill();

  context.textAlign = "center";
  context.fillStyle = "#5A5A5A";
  if ( size > 19 ) { context.font = "17px Arial"; }
  else { context.font = "9px Arial"; }
  context.fillText(rates[i][0], size/2, size/2-1);

  return canvas.toDataURL("image/png");
}

function copyToClipboard(text) {
  const input = document.createElement('input');
  input.style.position = 'fixed';
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
};

function edit_cb() {
    document.body.style.minHeight = "430px";
    document.getElementById('overlay').style.display = "block";
    document.getElementById('edit_cb_win').style.display = "block";
}
