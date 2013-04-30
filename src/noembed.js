//= include "json2.js"
//= include "DOMReady.js"

var noembed = {
  patterns : [],
  callbacks : {},
  callback_counter: 0,

  setup : function(selector) {
    if (!selector) selector = "a[href]";
    var elems = document.querySelectorAll(selector);
    if (elems.length) {
      noembed.get_patterns(function() {
        noembed.setup_links(elems);
      });
    }
  },

  setup_links : function(elems) {
    var length = elems.length,
        patterns_length = noembed.patterns.length;

    for (var i=0; i < length; i++) {
      var elem = elems[i];
      if (elem.nodeName != "A") {
        noembed.find_links(elem);
      }
      else {
        for (var j=0; j < patterns_length; j++) {
          if (noembed.patterns[j].test(elem.href)) {
            noembed.setup_embeddable(elem);
            continue;
          }
        }
      }
    }
  },

  setup_embeddable : function(elem) {
    var toggle = document.createElement("a");
    toggle.className = "noembed-toggle";
    toggle.href = elem.href;
    toggle.innerHTML = "embed";
    elem.parentNode.insertBefore(toggle, elem.nextSibling);
    toggle.addEventListener("click", noembed.toggle_embed);
  },

  toggle_embed : function(e) {
    e.preventDefault();
    var elem = this,
        url = elem.href;

    // this was already embedded, just toggle
    if (elem['embed-content']) {
      if (elem['embed-node']) {
        var node = elem['embed-node'];
        node.parentNode.removeChild(node);
        delete elem['embed-node'];
      }
      else {
        noembed.insert_content(elem, elem['embed-content']);
      }
      return;
    }

    noembed.json_request('//noembed.com/embed?url='+escape(url), function(data) {
      if (!data || !data['html']) {
        elem.parentNode.removeChild(elem);
        return;
      }
      noembed.insert_content(elem, data['html']);
    });
  },

  insert_content : function(elem, content) {
    var div = document.createElement("DIV");
    div.className = "noembed-embed";
    div.innerHTML = content;

    elem['embed-node'] = div;
    elem['embed-content'] = content;

    // look forward for a new block element
    var forward = elem;
    while (!forward.nodeName.match(/^(br|p|div)$/i)) {
      forward = forward.nextSibling;
      if (!forward) break; //no more siblings in front
    }
    
    // insert before
    if (forward) {
      forward.parentNode.insertBefore(div, forward);
      return;  
    }

    // look up for a containing block element
    var up = elem;
    while (!up.nodeName.match(/^(p|div|td|li)$/i)) {
      up = up.parentNode;
      if (!up) break; // no more parents!
    }

    if (up) {
      up.appendChild(div);
      return;
    }

    elem.parentNode.appendChild(div);
  },

  get_patterns : function(callback) {
    noembed.patterns = []; // reset
    noembed.json_request('//noembed.com/providers', function(data) {
      var length = data.length;
      for (var i=0; i < length; i++) {
        var patterns = data[i]['patterns'];
        var patterns_length = patterns.length;
        for (var j=0; j < patterns_length; j++) {
          noembed.patterns.push(new RegExp(patterns[j]));
        }
      }
      callback();
    });
  },

  json_request : function(url, callback) {
    // IE doesn't do CORS so we need to use JSONP
    if (navigator.userAgent.match(/Explorer/)) {
      noembed.jsonp_request(url, callback);
    }
    else {
      var req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.onreadystatechange = function(e) {
        if (req.readyState == 4) {
          var data;
          if (req.status == 200) {
            try {
              data = JSON.parse(req.responseText);
            } catch(e) {}
          }
          callback(data);
        }
      };
      req.send();
    }
  },

  add_jsonp_callback : function(callback) {
    var name = "noembed_callback_" + noembed.callback_counter++;

    window[name] = function(data) {
      delete window[name];
      callback(data);
    };

    return name;
  },

  jsonp_request : function(url, callback) {
    var callback_name = noembed.add_jsonp_callback(callback);
    var script = document.createElement("SCRIPT");

    if (url.match(/\?.+/)) {
      url += "&callback="+callback_name;
    }
    else {
      url += "?callback="+callback_name;
    }

    script.src = url;
    document.body.appendChild(script);
  }
};

DOMReady.add(noembed.setup);
