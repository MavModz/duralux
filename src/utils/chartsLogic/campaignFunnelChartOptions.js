export const campaignFunnelChartOptions = (funnelData) => {
    // Map API response to chart data
    const categories = ['Open Lead', 'In Progress', 'Hot Lead', 'Converted Lead']
    const data = [
        funnelData['Open Lead'] || 0,
        funnelData['In Progress'] || 0,
        funnelData['Hot Lead'] || 0,
        funnelData['Converted Lead'] || 0
    ]
    
    const colors = ['#6750a3', '#008ce4', '#ffa217', '#00aca5']

    const chartOptions = {
        chart: { 
            type: "bar", 
            height: 400, 
            fontFamily: "inherit", 
            toolbar: { show: false } 
        },
        legend: { show: false },
        series: [{ name: "Leads", data: data }],
        colors: colors,
        grid: { 
            strokeDashArray: 4, 
            position: "back", 
            xaxis: { lines: { show: true } }, 
            yaxis: { lines: { show: false } } 
        },
        plotOptions: {
            bar: {
                columnWidth: "15%",
                horizontal: false,
                distributed: true,
                borderRadius: 6,
                borderRadiusApplication: "end",
                dataLabels: {
                    position: "top"
                }
            }
        },
        labels: { show: false },
        dataLabels: { enabled: false },
        stroke: { show: false },
        xaxis: { 
            categories: categories, 
            axisTicks: { show: true }, 
            axisBorder: { show: false } 
        },
        yaxis: { 
            labels: { show: true }, 
            axisTicks: { show: false }, 
            axisBorder: { show: false } 
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val;
                },
            },
        },
    }
    return chartOptions
}

