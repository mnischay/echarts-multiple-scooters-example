import React, {useRef, useEffect } from "react";
import { getInstanceByDom, init, connect } from "echarts";


const Chart = () => {
    const chartRef = useRef(null);
    const chartRef2 = useRef(null);

    const legends = ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']

    let legendsObj = {'Email':  true, 'Union Ads': true, 'Video Ads': true, 'Direct': true, 'Search Engine': true}

    let legendState = useRef({ ...legendsObj})
    let lineHoverState = useRef({ 'Email':  false, 'Union Ads': false, 'Video Ads': false, 'Direct': false, 'Search Engine': false })

    useEffect(() => {
        // Initialize chart
        let chart;
        let chart2;
        if (chartRef.current !== null) {
            chart = init(chartRef.current, "dark");
        }

        if (chartRef2.current !== null) {
            chart2 = init(chartRef2.current, "dark");
        }

        if(chartRef.current !== null && chartRef2.current !== null) {
            connect([chart, chart2]);
        }
        // Add chart resize listener
        // ResizeObserver is leading to a bit janky UX
        const resizeChart = ()  => {
            chart?.resize();
            chart2.resize();
        }
        window.addEventListener("resize", resizeChart);

        // Return cleanup function
        return () => {
            chart?.dispose();
            chart2?.dispose();
            window.removeEventListener("resize", resizeChart);
        };
    },);


    let options = {
        graphic: [],
        title: {
            text: 'Stacked Line'
        },
        tooltip: {
            confine: false,
            trigger: "axis",
        },
        legend: {
            data: legends,
        },
        grid: {
            show: true,
            left: '50',
            right: '50',
            top: '50',
            bottom: '50',
            containLabel: false
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            id: 'xAxis',
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Email',
                type: 'line',
                data: [120, 132, 101, 134, 90, 230, 210],
                emphasis: {
                    focus: 'series'
                },
                triggerLineEvent: true,
            },
            {
                name: 'Union Ads',
                type: 'line',
                emphasis: {
                    focus: 'series'
                },
                triggerLineEvent: true,
                data: [220, 182, 191, 234, 290, 330, 310]
            },
            {
                name: 'Video Ads',
                type: 'line',
                emphasis: {
                    focus: 'series'
                },
                triggerLineEvent: true,
                data: [150, 232, 201, 154, 190, 330, 410]
            },
            {
                name: 'Direct',
                type: 'line',
                emphasis: {
                    focus: 'series'
                },
                triggerLineEvent: true,
                data: [320, 332, 301, 334, 390, 330, 320]
            },
            {
                name: 'Search Engine',
                type: 'line',
                emphasis: {
                    focus: 'series'
                },
                triggerLineEvent: true,
                data: [820, 932, 901, 934, 1290, 1330, 1320]
            }
        ]
    }

    const getDataPerIndex = (index) => {
        debugger
        let output = []
        output = options.series.map(({ name, data }) => {
            if(legendState.current[name]) {
                if(lineHoverState.current[name]) {
                    return data[index] + 1000
                }
                return data[index]
            }
            return undefined
        })
        return output.filter(a => a)
    }

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current);
            chart.setOption(options);

            chart.on('legendselectchanged', (e) => {
                legendState.current = e.selected
                options.graphic = options.graphic.map( g => {
                    return { ...g, textContent: { ...g.textContent, style: { text: `${getDataPerIndex(g.dataIndex)} `}}}
                })
                chart.setOption(options)
            });

            chart.on('mouseover', { componentType: 'line' },(e) => {
                debugger
                lineHoverState.current[e.seriesName] = true
                options.graphic = options.graphic.map( g => {
                    return { ...g, textContent: { ...g.textContent, style: { text: `${getDataPerIndex(g.dataIndex)} `}}}
                })
                chart.setOption(options)
            })

            chart.on('mouseout', { componentType: 'line' },(e) => {

                lineHoverState.current[e.seriesName] = false
                options.graphic = options.graphic.map( g => {
                    return { ...g, textContent: { ...g.textContent, style: { text: `${getDataPerIndex(g.dataIndex)} `}}}
                })
                chart.setOption(options)
            })

            chart.on('click' , (event) => {
                if(typeof event.event?.target?.id === 'string' && event.event.target.id.startsWith('line')) {
                    let index = -1
                    options.graphic = options.graphic.map((g, i) => {
                        if (g.id === event.event.target.id ) {
                            index = i
                            g.$action = 'remove'
                        }
                        return g
                    })
                    chart.setOption(options)
                    if(index !== -1) {
                        options.graphic.splice(index, 1)
                    }
                    return
                }

                options.graphic.push({
                    id:`line${options.graphic.length}`,
                    $action: 'merge',
                    type: 'line',
                    z: 100,
                    shape: {
                        x1: event.event.offsetX,
                        y1: 0.1 * chart.getHeight(),
                        x2: event.event.offsetX,
                        y2: chart.getHeight() - (0.1 * chart.getHeight()),
                    },
                    draggable: 'horizontal',
                    style: {
                        stroke: 'grey',
                        lineWidth: 1,
                        lineDash: [4]
                    },
                    dataIndex: event.dataIndex,
                    textContent: { type: 'text', z: 101, id: `line-text${options.graphic.length}`, style: { text: `${getDataPerIndex(event.dataIndex)} `}},
                    textConfig: {
                      position: 'right',
                      layoutRect: {
                          x: event.event.offsetX,
                          y: event.event.offsetY,
                          width: 30,
                          height: 20
                      },

                    },
                    ondragstart: () => {
                        // chart.clear();
                        chart.setOption({...options, tooltip: { ...options.tooltip, show: false}})
                        // chart.dispatchAction({
                        //     type: 'hideTip'
                        // })
                    },
                    ondrag: ( e) => {
                        const delta = 900 / options.series[0].data.length
                        const index = Math.round( (e.event.offsetX - 50) / delta) - 1
                        console.log(getDataPerIndex(index))
                        const newIndex = options.graphic.findIndex((g) => g.id === e.target.id)
                        options.graphic[newIndex].textContent.style.text = getDataPerIndex(index)
                        console.log(options)
                        chart.setOption(options)
                    },
                    ondragend: (e) => {
                        // debugger;
                        chart.setOption({...options, tooltip: { ...options.tooltip, show: true}})
                    },
                })
                chart.setOption(options)
            })
        }

        if (chartRef2.current !== null) {
            const chart2 = getInstanceByDom(chartRef2.current);
            chart2.setOption(options);
        }
    }, ); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function



    return (<div style={{display: "flex", flexDirection: 'column'}}>
        <div ref={chartRef} style={{height: '500px', width: "1000px", marginBottom: '24px'}} />
        <div ref={chartRef2} style={{height: '500px', width: "1000px"}} />
    </div>)
}

export default Chart;