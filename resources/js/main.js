

d3.csv("resources/data/data.csv", function(error, data) {
  if (error) throw error;
    
    var filteredData = data.filter(function(d) { return d.Anio == "2006"; }); 
    
    createParallelChart(filteredData);
    
    createStackedChart(filteredData);    
    
    
});