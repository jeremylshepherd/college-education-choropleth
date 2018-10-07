var countyJSON = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

var educationJSON = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

var $$ = function $$(q) {return document.querySelector(q);};
var h = 800;
var w = 1080;
var margin = { top: 30, right: 50, bottom: 30, left: 50 };

var toolTip = d3.select('body').
append('div').
attr('id', 'tooltip').
style('opacity', 0);

var svg = d3.select("svg");
console.log(toolTip);
svg.style('height', h);
svg.style('width', w);
var path = d3.geoPath();
var colorRange = ['#c0def1', '#050e15'];
var colorScale = d3.scaleLinear().domain([0, 100]).range(colorRange);

var getEdu = function getEdu(id, arr) {
  var fips = arr.map(function (a) {return a.fips;});
  var idx = fips.indexOf(id);
  return arr[idx];
};

d3.json(countyJSON, function (error, us) {
  if (error) throw error;

  d3.json(educationJSON, function (error, edu) {
    if (error) throw error;

    // let geom = us.objects.counties.geometries;
    // let ids = geom.map(g => g.id);
    // let fips = edu.map(e => e.fips);    

    var counties = svg.append("g").
    attr('width', w - (margin.right + margin.left)).
    attr('height', h - (margin.top + margin.bottom)).
    attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')').
    selectAll("path").
    data(topojson.feature(us, us.objects.counties).features).
    enter().append("path").
    attr("class", "county").
    attr('data-fips', function (d) {return d.id;}).
    attr('data-education', function (d) {return getEdu(d.id, edu).bachelorsOrHigher;}).
    attr("d", path).
    style('fill', function (d) {return colorScale(getEdu(d.id, edu).bachelorsOrHigher);});


    svg.append("path").
    attr('width', w - (margin.right + margin.left)).
    attr('height', h - (margin.top + margin.bottom)).
    attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')').
    attr("class", "state-borders").
    attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) {return a !== b;})));

    counties.on('mouseover', function (d) {
      var text = getEdu(d.id, edu).area_name + ', ' + getEdu(d.id, edu).state + ': ' + getEdu(d.id, edu).bachelorsOrHigher + '%';
      var dataEdu = getEdu(d.id, edu).bachelorsOrHigher;
      toolTip.style('left', d3.event.pageX + 'px').
      style('top', d3.event.pageY - 60 + 'px').
      style('opacity', 1).
      attr('data-education', dataEdu).
      text(text);
    }).
    on('mouseout', function (d) {
      toolTip.style('opacity', 0);
    });

    var colorLegend = d3.legendColor().
    labelFormat(d3.format("")).
    orient('horizontal').
    scale(colorScale).
    title('% of Adults 25 and over').
    shapeWidth(50).
    shapeHeight(25).
    shapePadding(0).
    labelOffset(10);

    svg.append("g").
    attr("transform", "translate(675, 30)").
    attr('id', 'legend').
    call(colorLegend);
  });

});