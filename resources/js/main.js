



d3.csv("resources/data/data.csv", function(error, data) {
  if (error) throw error;
    
    var anios = d3.keys(data[0]);
    console.log(anios);
    var select = d3.select('.selection')
      .append('select')
        .attr('class','select')
        .on('change',onchange)

    var options = select
      .selectAll('option')
        .data(anios).enter()
        .append('option')
            .text(function (d) { return d; });

    function onchange() {
        selectValue = d3.select('select').property('value');
    
        var filteredData = data.filter(function(d) { return d.Anio == selectValue; }); 
        
        createParallelChart(filteredData);
    
        createStackedChart(filteredData);
    };
    
    var filteredData = data.filter(function(d) { return d.Anio == "2006"; }); 
    
    createParallelChart(filteredData);
    
    createStackedChart(filteredData);
    
    
});