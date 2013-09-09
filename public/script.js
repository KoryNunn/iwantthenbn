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
    chart,
    chartTime = 0,
    signatureCount,
    signatureRate,
    results = crel('div', {'class':'results'},
        crel('div',
            crel('span','Number of signatures:'),
            signatureCount = crel('span',{'class':'count'}, 'Loading..')
        ),
        crel('div',
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

            signatureCount.textContent = result.signatureCount ? result.signatureCount : 'loading..';
            signatureRate.textContent = result.rate ? parseInt(result.rate * 10) / 10 : 'loading..';

            if(chart){
                var series = chart.series[0],
                    shift = series.data.length > 20; // shift if the series is longer than 20

                // add the point
                chart.series[0].addPoint([chartTime+=10, result.rate], true, shift);
            }

        }
    }
    xhr.open('GET', '/signatures', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

window.addEventListener('load', function(){

    document.querySelector('.current').appendChild(results);
    getData();

    setInterval(getData,3000);
    setInterval(function(){
        result.signatureCount = result.signatureCount + result.rate/3;
        signatureCount.textContent = parseInt(result.signatureCount) || 'loading..';

        signatureRate.style['font-size'] = Math.min(((result.rate + 1) * 50), 300) + 'px';
        var color = 'hsl(' + (50-(result.rate * 4)) + ',' + (result.rate * 100) + '%,' + result.rate * 100 + '%)';
        var shadowColor = 'hsl(' + (50-(result.rate * 4)) + ',' + (result.rate * 100) + '%,50%)';
        var shadow = '0 0 ' + result.rate * 100 + 'px ' + shadowColor;
        signatureRate.style['color'] = color;
        signatureRate.style['text-shadow'] = shadow + ', ' + shadow;
    },100);


    chart = new Highcharts.Chart({
            chart: {
                renderTo: 'container',
                defaultSeriesType: 'spline',
                backgroundColor: {
                    linearGradient: [0, 0, 500, 500],
                    stops: [
                        [0, 'rgb(0, 0, 0)'],
                        [1, 'rgb(10, 10, 10)']
                    ]
                }
            },
            title: {
                text: 'Signatures per second over time'
            },
            xAxis: {
                categories: ['seconds'],
                tickInterval: 10
            },
            yAxis: {
                title: {
                    text: 'Signatures'
                }
            },
            series:[{
                name: 'Signature Rate',
                data: []
            }]
        });
});