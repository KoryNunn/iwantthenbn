;(function(){
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

    function round(number, places){
        var placesTimesTen = places * 10;
        return parseInt(number * placesTimesTen) / placesTimesTen;
    }

    var appData = {
            chartTime: 0,
            rate:0,
            displayRate: 0,
            displayCount: 0,
            signatureCount: 0
        },
        rateChart,
        dataInterval = 3000,
        displayInterval = 20,
        dataDisplayRatio = dataInterval / displayInterval,
        signatureCountElement,
        signatureRateElement,
        results = crel('div', {'class':'results'},
            crel('div', {'class':'countWrapper'},
                crel('span','Number of signatures:'),
                signatureCountElement = crel('span',{'class':'count'}, 'Loading..')
            ),
            crel('div', {'class':'rateWrapper'},
                crel('span','Signatures per second:'),
                signatureRateElement = crel('span',{'class':'rate'}, 'Loading..')
            )
        );

    function updateRateElement(rate){
        signatureRateElement.textContent = rate ? round(rate, 1) : 'loading..';
        signatureRateElement.style['font-size'] = Math.min(((rate + 1) * 50), 300) + 'px';
        var color = 'hsl(' + (50-(rate * 4)) + ',' + (rate * 100) + '%,' + rate * 100 + '%)';
        var shadowColor = 'hsl(' + (50-(rate * 4)) + ',' + (rate * 100) + '%,50%)';
        var shadow = '0 0 ' + rate * 100 + 'px ' + shadowColor;
        signatureRateElement.style['color'] = color;
        signatureRateElement.style['text-shadow'] = shadow + ', ' + shadow;
    }
    
    function updateRateGraph(){
        if(rateChart){
            var series = rateChart.series[0],
                shift = series.data.length > 20;

            rateChart.series[0].addPoint([appData.chartTime+=10, round(appData.displayRate, 2)], true, shift);
        }
    }

    function updateRate(){
        if(!appData.displayRate){
            appData.displayRate = appData.rate;
        }
        appData.displayRate += (appData.rate - appData.displayRate) / dataDisplayRatio;
        updateRateElement(appData.displayRate);
    }

    function setRate(rate){
        appData.rate = rate;
    }

    function handleData(data){
        var result = JSON.parse(data);

        appData.rate = result.rate;
        appData.signatureCount = result.signatureCount;
        setRate(appData.rate);
    }

    function getData(){
        var xhr = createXHR();
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState === 4)
            {
                handleData(xhr.responseText);
            }
        };
        xhr.open('GET', '/signatures?_=' + new Date().getTime(), true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send();
    }

    function updateTotal(){
        if (!appData.displayCount) {
            // Set the initial value
            appData.displayCount = appData.signatureCount ? appData.signatureCount : 0;
        }
        // play catchup
        appData.displayCount += (appData.signatureCount - appData.displayCount) / dataDisplayRatio;
        signatureCountElement.textContent = parseInt(appData.displayCount) || 'loading..';
    }

    function initialiseTotal(){
        setInterval(function(){
            updateTotal();
            updateRate();
        }, displayInterval);
    }

    function initialiseRateChart(){
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
        setInterval(updateRateGraph, displayInterval * 50);
    }

    function initialiseDataPoll(){
        getData();
        setInterval(getData, dataInterval);
    }

    function initialseDOMStructure(){
        document.getElementsByClassName('current')[0].appendChild(results);
    }

    window.onload = function(){
        initialseDOMStructure();
        initialiseDataPoll();
        initialiseTotal();
        initialiseRateChart();
    };
}());