dataurl = "data"

# function for generating a rainbow of colors
colorGen = ->
  colors = []
  for j in [65,20]
    for i in [0,60,130,200,280,310]
      colors.push 'hsla('+i+',100%,'+j+'%,0.9)'
  -> do colors.shift
  

chartOptions =
  minValue: 0
  millisPerPixel: 2000
  grid:
    millisPerLine: 1000*60
    verticalSections: 0
    strokeStyle: "#333"
# heavy white line on mouseover
lineOptionsHL =
  strokeStyle: "#fee"
  lineWidth: 4

$(document).ready ->
  $.ajax
    url: 'js/sites.json'
    dataType: "json"
    success: (data)->
      displayGraph data


displayGraph = (sites)->
  
  # Assign a color to each site
  nextColor = do colorGen
  site.color = do nextColor for site in sites

  section = $("<div class=\"sitegroup\" />").appendTo("body")
  key = $("<ul />").css("float", "right").css("margin", "20px").appendTo(section)

  smoothie = new SmoothieChart(chartOptions)
  canvas = $("<canvas />").appendTo(section)[0]
  refit = ->
    canvas.height = window.innerHeight - 20
    canvas.width = window.innerWidth - 280
    smoothie.streamTo(canvas, 30*1000)
  do refit
  $(window).resize refit

  # fake time series for 500ms benchmark
  halfsec = new TimeSeries()
  halfsec.append(new Date().getTime()-2000000000,500)
  halfsec.append(new Date().getTime()+2000000000,500)
  smoothie.addTimeSeries(halfsec,{strokeStyle: "#666", lineWidth:1})

  $.each sites, (index, site)->
    label = $("<li />").html(site.name)
      # .css("color", site.color)
      .css("border-left-style", "solid")
      .css("border-left-color", site.color)
      .css("border-left-width", "15px")
      .appendTo(key)
    lastPing = $("<span class=\"last\"/>").css("padding-left","1em").appendTo(label)

    line = new TimeSeries()
    lineOptions =
      strokeStyle:site.color
      lineWidth: 2
    smoothie.addTimeSeries(line, lineOptions)

    history = dataurl+'/'+site.hash+"/70" # get recent history
    $.get history, (data)->
      line.append(item.e, item.rt) for item in data.reverse()

    label.click -> # toggle visibility on click
      label.toggleClass("removed")
      for series in smoothie.seriesSet
        if series.timeSeries is line
          smoothie.removeTimeSeries(series)
          return
      smoothie.addTimeSeries(line, lineOptions)

    label.hover -> # highlight line on label hover
      for series in smoothie.seriesSet
        if series.timeSeries is line
          smoothie.removeTimeSeries(series)
          smoothie.addTimeSeries(line, lineOptionsHL)
          return
    , ->           # return to normal state on hover out
      for series in smoothie.seriesSet
        if series.timeSeries is line
          smoothie.removeTimeSeries(series)
          smoothie.addTimeSeries(line, lineOptions)
          return

    update = ->
      recent = dataurl+'/'+site.hash+"/1" # get most recent datapoint
      $.get recent, (data)->
        if (data?)
          for item in data
            if item.m is "Success"
              label.removeClass("down")
            else
              label.addClass("down")
            if line.data[line.data.length-1][0] != item.e
              line.append(item.e, item.rt)
            lastPing.html(item.rt) # show last ping time in label
    randomDelay = Math.round(Math.random()*10000) # slightly out of sync 
    setInterval(update, 40*1000 + randomDelay)    # new data every 40-50 sec
    setTimeout(update, randomDelay)               # do one very soon
