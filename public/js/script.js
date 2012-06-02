var chartOptions, colorGen, dataurl, displayGraph, lineOptionsHL;

dataurl = "data";

colorGen = function() {
  var colors, i, j, _i, _j, _len, _len2, _ref, _ref2;
  colors = [];
  _ref = [65, 20];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    j = _ref[_i];
    _ref2 = [0, 60, 130, 200, 280, 310];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      i = _ref2[_j];
      colors.push('hsla(' + i + ',100%,' + j + '%,0.9)');
    }
  }
  return function() {
    return colors.shift();
  };
};

chartOptions = {
  minValue: 0,
  millisPerPixel: 2000,
  grid: {
    millisPerLine: 1000 * 60,
    verticalSections: 0,
    strokeStyle: "#333"
  }
};

lineOptionsHL = {
  strokeStyle: "#fee",
  lineWidth: 4
};

$(document).ready(function() {
  return $.ajax({
    url: 'js/sites.json',
    dataType: "json",
    success: function(data) {
      return displayGraph(data);
    }
  });
});

displayGraph = function(sites) {
  var canvas, halfsec, key, nextColor, refit, section, site, smoothie, _i, _len;
  nextColor = colorGen();
  for (_i = 0, _len = sites.length; _i < _len; _i++) {
    site = sites[_i];
    site.color = nextColor();
  }
  section = $("<div class=\"sitegroup\" />").appendTo("body");
  key = $("<ul />").css("float", "right").css("margin", "20px").appendTo(section);
  smoothie = new SmoothieChart(chartOptions);
  canvas = $("<canvas />").appendTo(section)[0];
  refit = function() {
    canvas.height = window.innerHeight - 20;
    canvas.width = window.innerWidth - 280;
    return smoothie.streamTo(canvas, 30 * 1000);
  };
  refit();
  $(window).resize(refit);
  halfsec = new TimeSeries();
  halfsec.append(new Date().getTime() - 2000000000, 500);
  halfsec.append(new Date().getTime() + 2000000000, 500);
  smoothie.addTimeSeries(halfsec, {
    strokeStyle: "#666",
    lineWidth: 1
  });
  return $.each(sites, function(index, site) {
    var history, label, lastPing, line, lineOptions, randomDelay, update;
    label = $("<li />").html(site.name).css("border-left-style", "solid").css("border-left-color", site.color).css("border-left-width", "15px").appendTo(key);
    lastPing = $("<span class=\"last\"/>").css("padding-left", "1em").appendTo(label);
    line = new TimeSeries();
    lineOptions = {
      strokeStyle: site.color,
      lineWidth: 2
    };
    smoothie.addTimeSeries(line, lineOptions);
    history = dataurl + '/' + site.hash + "/70";
    $.get(history, function(data) {
      var item, _j, _len2, _ref, _results;
      _ref = data.reverse();
      _results = [];
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        item = _ref[_j];
        _results.push(line.append(item.e, item.rt));
      }
      return _results;
    });
    label.click(function() {
      var series, _j, _len2, _ref;
      label.toggleClass("removed");
      _ref = smoothie.seriesSet;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        series = _ref[_j];
        if (series.timeSeries === line) {
          smoothie.removeTimeSeries(series);
          return;
        }
      }
      return smoothie.addTimeSeries(line, lineOptions);
    });
    label.hover(function() {
      var series, _j, _len2, _ref;
      _ref = smoothie.seriesSet;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        series = _ref[_j];
        if (series.timeSeries === line) {
          smoothie.removeTimeSeries(series);
          smoothie.addTimeSeries(line, lineOptionsHL);
          return;
        }
      }
    }, function() {
      var series, _j, _len2, _ref;
      _ref = smoothie.seriesSet;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        series = _ref[_j];
        if (series.timeSeries === line) {
          smoothie.removeTimeSeries(series);
          smoothie.addTimeSeries(line, lineOptions);
          return;
        }
      }
    });
    update = function() {
      var recent;
      recent = dataurl + '/' + site.hash + "/1";
      return $.get(recent, function(data) {
        var item, _j, _len2, _results;
        if ((data != null)) {
          _results = [];
          for (_j = 0, _len2 = data.length; _j < _len2; _j++) {
            item = data[_j];
            if (item.m === "Success") {
              label.removeClass("down");
            } else {
              label.addClass("down");
            }
            if (line.data[line.data.length - 1][0] !== item.e) {
              line.append(item.e, item.rt);
            }
            _results.push(lastPing.html(item.rt));
          }
          return _results;
        }
      });
    };
    randomDelay = Math.round(Math.random() * 10000);
    setInterval(update, 40 * 1000 + randomDelay);
    return setTimeout(update, randomDelay);
  });
};
