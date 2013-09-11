function createXHR()
{
    var xhr;
    if (window.ActiveXObject)
    {
        try
        {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch(e)
        {
            alert(e.message);
            xhr = null;
        }
    }
    else
    {
        xhr = new XMLHttpRequest();
    }

    return xhr;
}

var result,
    rateChart,
    popChart,
    chartTime = 0,
    dataInterval = 3000,
    displayInterval = 100,
    dataDisplayRatio = dataInterval / displayInterval,
    displayCount = 0,
    signatureCount,
    signatureRate,
    results = crel('div', {'class':'results'},
        crel('div', {'class':'countWrapper'},
            crel('span','Number of signatures:'),
            signatureCount = crel('span',{'class':'count'}, 'Loading..')
        ),
        crel('div', {'class':'rateWrapper'},
            crel('span','Signatures per second:'),
            signatureRate = crel('span',{'class':'rate'}, 'Loading..')
        )
    );

function getData(){
    var xhr = createXHR();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            result = JSON.parse(xhr.responseText);

            if (!displayCount) {
                // Set the initial value
                displayCount = result.signatureCount ? result.signatureCount : 0;
            }
            signatureRate.textContent = result.rate ? parseInt(result.rate * 10) / 10 : 'loading..';

            if(rateChart){
                var series = rateChart.series[0],
                    shift = series.data.length > 20; // shift if the series is longer than 20

                // add the point
                rateChart.series[0].addPoint([chartTime+=10, result.rate], true, shift);
            }

        }
    };
    xhr.open('GET', '/signatures?_=' + new Date().getTime(), true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

window.onload = function(){

    document.getElementsByClassName('current')[0].appendChild(results);
    getData();

    setInterval(getData, dataInterval);

    setInterval(function(){
        if (!result) {
            return;
        }
        // play catchup
        displayCount += (result.signatureCount - displayCount) / dataDisplayRatio;
        signatureCount.textContent = parseInt(displayCount) || 'loading..';

        // this should probably be in the data update?
        signatureRate.style['font-size'] = Math.min(((result.rate + 1) * 50), 300) + 'px';
        var color = 'hsl(' + (50-(result.rate * 4)) + ',' + (result.rate * 100) + '%,' + result.rate * 100 + '%)';
        var shadowColor = 'hsl(' + (50-(result.rate * 4)) + ',' + (result.rate * 100) + '%,50%)';
        var shadow = '0 0 ' + result.rate * 100 + 'px ' + shadowColor;
        signatureRate.style['color'] = color;
        signatureRate.style['text-shadow'] = shadow + ', ' + shadow;
    }, displayInterval);

    var rateChartWrapper = document.getElementById('ratechart');

    rateChart = new Highcharts.Chart({
        chart: {
            renderTo: rateChartWrapper,
            defaultSeriesType: 'spline',
            backgroundColor: 'transparent'
        },
        colors:[
            'white'
        ],
        title: {
            text: 'Signatures per second over time',
            style:{
                color: 'white'
            }
        },
        tooltip:{
            backgroundColor: 'black',
            color: 'white'
        },
        xAxis: {
            categories: ['seconds'],
            tickInterval: 10,
            gridLineWidth:0,
            labels:{
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'Signatures'
            },
            labels:{
                style:{
                    color: 'white'
                }
            },
            title:{
                style:{
                    color: 'white'
                }
            },
            gridLineWidth:0
        },
        series:[{
            name: 'Signature Rate',
            data: []
        }]
    });
};