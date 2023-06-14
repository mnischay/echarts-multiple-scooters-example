import React, {useRef, useEffect } from "react";
import { getInstanceByDom, init, connect } from "echarts";


let numberOfElements = 0
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
                data: [820, 932, 901, 934, 1290, 1330, 1320]
            }
        ]
    }

    const getDataPerIndex = (index) => {
        // debugger
        let output = []
        output = options.series.map(({ name, data }) => {
            if(legendState.current[name]) {
                if(lineHoverState.current[name]) {
                    return ['<b>' + name + ' : ', data[index] + '</b>']
                }
                return [name + ' : ', data[index]]
            }
            return undefined
        })
        // debugger
        let a = ([options.xAxis.data[index], '\n'].concat(output.filter(a => a).reverse()).join('\n'))
        a = a.replaceAll(',', '')
        return a
    }

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current);
            chart.setOption(options);

            chart.on('legendselectchanged', (e) => {
                legendState.current = e.selected
                options.graphic = options.graphic.map( g => {

                    g.children[0].textContent.style.text = getDataPerIndex(g.dataIndex)

                    return g
                })
                chart.setOption(options)
            });

            chart.on('mouseover', { componentType: 'line' },(e) => {

                lineHoverState.current[e.seriesName] = true
                options.graphic = options.graphic.map( g => {

                    g.children[0].textContent.style.text = getDataPerIndex(g.dataIndex)

                    return g
                })
                chart.setOption(options)
            })

            chart.on('mouseout', { componentType: 'line' },(e) => {

                lineHoverState.current[e.seriesName] = false
                options.graphic = options.graphic.map( g => {

                    g.children[0].textContent.style.text = getDataPerIndex(g.dataIndex)

                    return g
                })
                chart.setOption(options)
            })

            chart.on('click' , (event) => {
                debugger
                if(typeof event.event?.target?.id === 'string' && event.event.target.id.startsWith('line')) {
                    let index = -1
                    options.graphic = options.graphic.map((g, i) => {
                        if (g.id === event.event.target.parent.id ) {
                            index = i
                            g.$action = 'remove'
                            g.children = []
                        }
                        return g
                    })

                    if(index !== -1) {
                        chart.setOption(options)
                        options.graphic.splice(index, 1)
                    }
                    return
                }

                options.graphic.push({
                    id:`group${numberOfElements}`,
                    $action: 'merge',
                    type: 'group',
                    draggable: 'horizontal',
                    dataIndex: event.dataIndex,
                    children: [
                        {
                            draggable: 'vertical',
                            type: 'rect',
                            id:`rect${numberOfElements}`,
                            z: 101,
                            shape: {
                                x: event.event.offsetX + 30,
                                y: chart.getHeight() / 4,
                                height: options.series.length * 30,
                                width: options.series.length * 40,
                                r: 10
                            },
                            style: {
                                fill: 'white',
                                opacity: 0.9
                            },
                            textConfig: {
                              position: 'inside'
                            },
                            textContent: {
                                z: 102,
                                        opacity: 0.9,

                                style: {
                                    fill: 'black',
                                    text: `${getDataPerIndex(event.dataIndex)} `,
                                    fontSize: '15px',
                                }
                            },
                        },
                        // {
                        //     type: 'text',
                        //     // draggable: 'vertical',
                        //     z: 102,
                        //     id:`text1${options.graphic.length}`,
                        //     x: event.event.offsetX + 50,
                        //     y: (chart.getHeight() / 4) + 20,
                        //     dataIndex: event.dataIndex,
                        //     style: {
                        //         text: `${getDataPerIndex(event.dataIndex)} `,
                        //         opacity: 0.9,
                        //         fontSize: 15,
                        //         // width: 100,
                        //         // textAlign: 'center',
                        //         // lineWidth: 30,
                        //     }
                        // },
                        {
                            type: 'line',
                            z: 101,
                            id:`line${numberOfElements}`,
                            shape: {
                                x1: event.event.offsetX,
                                x2: event.event.offsetX,
                                y1: 0.1 * chart.getHeight(),
                                y2: chart.getHeight() - (0.1 * chart.getHeight()),
                            },
                            style: {
                                stroke: 'grey',
                                lineWidth: 1,
                                lineDash: [4]
                            },

                            // ondragstart: () => {
                            //     chart.setOption({...options, tooltip: { ...options.tooltip, show: false}})
                            // },
                            //
                            // ondragend: (e) => {
                            //     // debugger;
                            //     chart.setOption({...options, tooltip: { ...options.tooltip, show: true}})
                            // },
                        },

                    ],
                    ondrag: ( e) => {
                        // debugger
                        const delta = 900 / (options.series[0].data.length - 1)
                        const index = Math.round( (e.event.offsetX - 50) / delta)
                        console.log(delta, index)
                        // console.log(getDataPerIndex(index))
                        // debugger
                        const newIndex = options.graphic.findIndex((g) => g.id === e.target.id )

                        if( newIndex !== -1) {
                            options.graphic[newIndex].children[0].textContent.style.text = getDataPerIndex(index)
                            options.graphic[newIndex].dataIndex = index
                            console.log(options.graphic)
                            // console.log(options)
                            chart.setOption(options)
                        }
                    },
                    ondragstart: () => {
                        chart.setOption({...options, tooltip: { ...options.tooltip, show: false}})
                    },

                    ondragend: (e) => {
                        chart.setOption({...options, tooltip: { ...options.tooltip, show: true}})
                    },
                })
                chart.setOption(options)
                numberOfElements = numberOfElements + 1
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