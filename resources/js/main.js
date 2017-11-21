

d3.csv("resources/data/data.csv", function(error, data) {
  if (error) throw error;
    
    var csData = crossfilter(data); 
    
    var dimMun = csData.dimension(function (d){
        return d.Municipio;
    });
    
    dimMun.filter("AL");
    
    console.log("hola" + dimMun);
    
    createParallelChart(data);
    
    createStackedChart(data);    
    
    
});